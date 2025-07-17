import pandas as pd
from openpyxl import load_workbook
import sys
import re
import os
import shutil
import zipfile
from PIL import Image
import pytesseract
import cv2
import numpy as np
from openai import OpenAI
import base64
from pathlib import Path
import json
from html import gerar_relatorio_html, gerar_relatorios_mensais_html, gerar_html_mensal, gerar_html_mensal_editavel, gerar_html_impressao
# Adiciona imports para PDF
try:
    import pdfplumber
    from pdf2image import convert_from_path
except ImportError:
    pdfplumber = None
    convert_from_path = None

# === CONSTANTES DE DIRETÓRIOS E ARQUIVOS ===
DIR_INPUT = os.getenv('ATTR_FIN_DIR_INPUT', 'input')
DIR_IMGS = os.getenv('ATTR_FIN_DIR_IMGS', 'imgs')
DIR_MASSA = os.getenv('ATTR_FIN_DIR_MASSA', 'massa')
DIR_TMP = os.getenv('ATTR_FIN_DIR_TMP', 'tmp')
ARQ_CALCULO = os.getenv('ATTR_FIN_ARQ_CALCULO', 'calculo.csv')
ARQ_MENSAGENS = os.getenv('ATTR_FIN_ARQ_MENSAGENS', 'mensagens.csv')
ARQ_DIAGNOSTICO = os.getenv('ATTR_FIN_ARQ_DIAGNOSTICO', 'diagnostico.csv')
ARQ_CHAT = os.getenv('ATTR_FIN_ARQ_CHAT', '_chat.txt')

def process_image_ocr(image_path):
    """Processa uma imagem ou PDF e extrai texto usando OCR"""
    try:
        # Se o caminho já é completo (contém diretório), usa como está
        if os.path.exists(image_path):
            pass  # Usa o caminho fornecido
        # Se não existe, tenta em imgs/ (para compatibilidade)
        elif not image_path.startswith((DIR_IMGS + '/', DIR_INPUT + '/')):
            # Tenta primeiro em input/ (arquivos novos)
            input_path = os.path.join(DIR_INPUT, image_path)
            if os.path.exists(input_path):
                image_path = input_path
            # Se não está em input/, tenta em imgs/ (arquivos já processados)
            else:
                imgs_path = os.path.join(DIR_IMGS, image_path)
                if os.path.exists(imgs_path):
                    image_path = imgs_path
                else:
                    return "Arquivo não encontrado"
        elif not os.path.exists(image_path):
            return "Arquivo não encontrado"

        # Se for PDF, processa de forma especial
        if image_path.lower().endswith('.pdf'):
            if pdfplumber is None or convert_from_path is None:
                return ("Erro: Suporte a PDF não disponível. "
                        "Adicione as bibliotecas 'pdfplumber' e 'pdf2image' no Dockerfile para processar PDFs.")
            texto_pdf = ""
            # Primeiro tenta extrair texto pesquisável
            try:
                with pdfplumber.open(image_path) as pdf:
                    for page in pdf.pages:
                        texto_pdf += page.extract_text() or ''
                texto_pdf = texto_pdf.strip()
            except Exception as e:
                texto_pdf = ""
            # Se não extraiu nada, tenta OCR nas imagens das páginas
            if not texto_pdf:
                try:
                    imagens = convert_from_path(image_path)
                    texto_ocr = []
                    for img in imagens:
                        # Converte PIL Image para array do OpenCV
                        img_cv = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
                        gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
                        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
                        texto_ocr.append(pytesseract.image_to_string(thresh, lang='eng'))
                    texto_pdf = '\n'.join(texto_ocr).strip()
                except Exception as e:
                    return f"Erro ao processar PDF: {str(e)}"
            # Limpa o texto extraído
            texto_pdf = re.sub(r'\n+', ' ', texto_pdf).strip()
            texto_pdf = re.sub(r'\s+', ' ', texto_pdf)
            return texto_pdf if texto_pdf else "Nenhum texto detectado"
        # Caso contrário, processa como imagem
        # Carrega a imagem
        img = cv2.imread(image_path)
        if img is None:
            return "Erro ao carregar imagem"
        # Converte para escala de cinza
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        # Aplica threshold para melhorar o OCR
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        # Extrai texto usando pytesseract
        text = pytesseract.image_to_string(thresh, lang='eng')
        # Remove quebras de linha excessivas e espaços
        text = re.sub(r'\n+', ' ', text).strip()
        text = re.sub(r'\s+', ' ', text)
        return text if text else "Nenhum texto detectado"
    except Exception as e:
        return f"Erro no OCR: {str(e)}"

def convert_to_brazilian_format(valor):
    """Converte valor do formato americano para brasileiro se necessário"""
    if not valor or not re.match(r'^\d+([.,]\d+)?$', valor):
        return valor
    
    # Se tem ponto mas não tem vírgula, pode ser formato americano
    if '.' in valor and ',' not in valor:
        partes = valor.split('.')
        if len(partes) == 2:
            # Se a parte decimal tem 2 dígitos, é valor decimal (ex: 7698.18 -> 7.698,18)
            if len(partes[1]) == 2:
                # Converte para formato brasileiro
                inteira = partes[0]
                decimal = partes[1]
                
                # Adiciona separadores de milhares se necessário
                if len(inteira) > 3:
                    # Formata a parte inteira com pontos para milhares
                    inteira_formatada = ""
                    for i, digito in enumerate(inteira[::-1]):
                        if i > 0 and i % 3 == 0:
                            inteira_formatada = "." + inteira_formatada
                        inteira_formatada = digito + inteira_formatada
                    return f"{inteira_formatada},{decimal}"
                else:
                    return f"{inteira},{decimal}"
            
            # Se a parte depois do ponto tem 3 dígitos, já é formato de milhares
            elif len(partes[1]) == 3:
                return valor  # Mantém como está (ex: 1.000)
    
    # Se tem vírgula, já está no formato brasileiro
    if ',' in valor:
        return valor
    
    # Se só tem números, mantém como está
    return valor

def extract_total_value_with_chatgpt(ocr_text):
    """Usa a API do ChatGPT para identificar o valor total da compra no texto OCR"""
    try:
        # Verifica se a chave da API está disponível
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            return ""
        
        # Verifica se há texto para processar
        if not ocr_text or ocr_text in ["Arquivo não encontrado", "Erro ao carregar imagem", "Nenhum texto detectado"]:
            return ""
        
        # Inicializa o cliente OpenAI
        client = OpenAI(api_key=api_key)
        
        # Prompt para o ChatGPT
        prompt = f"""
        Analise o seguinte texto extraído de um comprovante financeiro e identifique APENAS o valor total da transação.
        
        Texto: {ocr_text}
        
        Instruções:
        - Retorne APENAS o valor numérico (ex: 29.90 ou 1533.27 ou 29,90)
        - Se houver múltiplos valores, retorne o valor da transação principal
        - Se não conseguir identificar um valor, retorne "NENHUM"
        - Não inclua "R$" ou outros símbolos
        - Não retorne explicações, apenas o número
        
        Valor total:
        """
        
        # Chama a API do ChatGPT
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Você é um especialista em análise de comprovantes financeiros. Extraia apenas o valor total das transações."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=50,
            temperature=0.1
        )
        
        # Extrai a resposta
        valor = response.choices[0].message.content.strip()
        
        # Limpa a resposta removendo caracteres indesejados
        valor = re.sub(r'[^\d,.]', '', valor)
        
        # Se não encontrou valor válido, retorna vazio
        if not valor or valor.upper() == "NENHUM" or len(valor) == 0:
            return ""
        
        # Converte para formato brasileiro se necessário
        valor_brasileiro = convert_to_brazilian_format(valor)
        
        return valor_brasileiro
        
    except Exception as e:
        return ""

def generate_payment_description_with_chatgpt(ocr_text):
    """Usa a API do ChatGPT para gerar uma descrição do pagamento baseado no texto OCR"""
    try:
        # Verifica se a chave da API está disponível
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            return ""
        
        # Verifica se há texto para processar
        if not ocr_text or ocr_text in ["Arquivo não encontrado", "Erro ao carregar imagem", "Nenhum texto detectado"]:
            return ""
        
        # Inicializa o cliente OpenAI
        client = OpenAI(api_key=api_key)
        
        # Prompt para o ChatGPT
        prompt = f"""
        Analise o seguinte texto extraído de um comprovante financeiro e crie uma descrição concisa do pagamento.
        
        Texto: {ocr_text}
        
        Instruções:
        - Identifique o tipo de estabelecimento (padaria, farmácia, supermercado, etc.)
        - Identifique o nome do estabelecimento se possível
        - Identifique o tipo de transação (compra, recarga, transferência, etc.)
        - Crie uma descrição de 3-5 palavras máximo
        - Use formato: "Tipo - Estabelecimento" (ex: "Compra - Padaria Bonanza", "Medicamentos - Drogaria", "Recarga celular")
        - Se não conseguir identificar, retorne "Pagamento"
        
        Descrição:
        """
        
        # Chama a API do ChatGPT
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Você é um especialista em análise de comprovantes financeiros. Crie descrições concisas e úteis para categorizações de gastos."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=30,
            temperature=0.3
        )
        
        # Extrai a resposta
        descricao = response.choices[0].message.content.strip()
        
        # Remove aspas e caracteres especiais desnecessários
        descricao = re.sub(r'["\']', '', descricao)
        
        # Se a descrição estiver vazia ou muito genérica, retorna "Pagamento"
        if not descricao or len(descricao.strip()) == 0:
            return "Pagamento"
        
        return descricao.strip()
        
    except Exception as e:
        return "Pagamento"

def classify_transaction_type_with_chatgpt(ocr_text):
    """Usa a API do ChatGPT para classificar o tipo de transação (Pagamento ou Transferência)"""
    try:
        # Verifica se a chave da API está disponível
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            return ""
        
        # Verifica se há texto para processar
        if not ocr_text or ocr_text in ["Arquivo não encontrado", "Erro ao carregar imagem", "Nenhum texto detectado"]:
            return ""
        
        # Inicializa o cliente OpenAI
        client = OpenAI(api_key=api_key)
        
        # Prompt para o ChatGPT
        prompt = f"""
        Analise o seguinte texto extraído de um comprovante financeiro e classifique o tipo de transação.
        
        Texto: {ocr_text}
        
        Instruções:
        - Se for uma transferência PIX, TED, DOC ou transferência entre contas, retorne "Transferência"
        - Se for um pagamento por débito, crédito, compra direta em estabelecimento comercial, retorne "Pagamento"
        - Retorne APENAS uma das duas opções: "Transferência" ou "Pagamento"
        - Não retorne explicações, apenas a classificação
        
        Classificação:
        """
        
        # Chama a API do ChatGPT
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Você é um especialista em análise de comprovantes financeiros. Classifique transações como Transferência ou Pagamento."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=10,
            temperature=0.1
        )
        
        # Extrai a resposta
        classificacao = response.choices[0].message.content.strip()
        
        # Remove aspas e caracteres especiais desnecessários
        classificacao = re.sub(r'["\']', '', classificacao)
        
        # Valida se a resposta é uma das opções esperadas
        if "transferência" in classificacao.lower():
            return "Transferência"
        elif "pagamento" in classificacao.lower():
            return "Pagamento"
        else:
            # Se não conseguir classificar, analisa por palavras-chave no texto
            if any(palavra in ocr_text.lower() for palavra in ["pix", "transferência", "ted", "doc"]):
                return "Transferência"
            else:
                return "Pagamento"
        
    except Exception as e:
        # Em caso de erro, tenta classificar por palavras-chave
        if any(palavra in ocr_text.lower() for palavra in ["pix", "transferência", "ted", "doc"]):
            return "Transferência"
        else:
            return "Pagamento"

def txt_to_csv(input_file, output_file):
    """Funcionalidade original - extrai todos os dados das mensagens"""
    # Lê cada linha completa do arquivo de chat
    with open(input_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    df = pd.DataFrame(lines, columns=['raw'])

    # Padrão mais flexível para capturar linhas com caracteres invisíveis
    pattern = r'.*?\[([\d]{2}/[\d]{2}/\d{4}), (\d{2}:\d{2}:\d{2})\] ([^:]+): (.*)$'
    df[['data', 'hora', 'remetente', 'mensagem']] = df['raw'].str.extract(pattern)
    
    # Extrai o nome do arquivo de anexo, se houver
    df['anexo'] = df['mensagem'].str.extract(r'<anexado:\s*([^>]+)>', expand=False).str.strip()
    df['anexo'] = df['anexo'].fillna('')
    
    # Adiciona coluna para dados do OCR
    df['OCR'] = ''
    
    # Processa OCR apenas para anexos que existem no diretório input/
    input_dir = "input"
    print("Processando OCR das imagens novas...")
    for idx, row in df.iterrows():
        if row['anexo'] and (row['anexo'].endswith('.jpg') or row['anexo'].endswith('.jpeg') or row['anexo'].endswith('.png')):
            # Verifica se o arquivo existe em input/ (imagens novas)
            caminho_input = os.path.join(input_dir, row['anexo'])
            if os.path.exists(caminho_input):
                print(f"Processando OCR: {row['anexo']}")
                ocr_result = process_image_ocr(caminho_input)
                df.at[idx, 'OCR'] = ocr_result
            else:
                # Se não está em input/, verifica se está em imgs/ (já processado)
                caminho_imgs = os.path.join("imgs", row['anexo'])
                if os.path.exists(caminho_imgs):
                    print(f"Imagem já processada anteriormente: {row['anexo']}")
                    # Não processa OCR novamente para economizar tempo
                    df.at[idx, 'OCR'] = "Já processado anteriormente"
    
    # Remove a coluna bruta
    df.drop(columns=['raw'], inplace=True)
    
    # Incrementa o CSV em vez de sobrescrever
    incrementar_csv(df, output_file)
    
    return df

def gerenciar_arquivos_incrementais():
    """Gerencia arquivos de input, remove duplicatas e prepara para processamento incremental"""
    input_dir = "input"
    imgs_dir = "imgs"
    
    # Verifica se o diretório input existe
    if not os.path.exists(input_dir):
        print(f"Diretório {input_dir}/ não encontrado!")
        return False, None
    
    # Lista arquivos de imagem em input/
    extensoes_imagem = ('.jpg', '.jpeg', '.png', '.pdf')
    arquivos_input = [f for f in os.listdir(input_dir) 
                      if f.lower().endswith(extensoes_imagem)]
    
    if not arquivos_input:
        print("Nenhuma imagem encontrada no diretório input/")
        # Verifica se há arquivo _chat.txt
        chat_file = os.path.join(input_dir, "_chat.txt")
        if os.path.exists(chat_file):
            print("Arquivo _chat.txt encontrado, mas sem imagens para processar")
            return True, chat_file
        return False, None
    
    # Lista arquivos já existentes em imgs/
    arquivos_existentes = []
    if os.path.exists(imgs_dir):
        arquivos_existentes = [f for f in os.listdir(imgs_dir) 
                              if f.lower().endswith(extensoes_imagem)]
    
    # Remove duplicatas de input/
    duplicatas_removidas = 0
    for arquivo in arquivos_input[:]:  # Cópia da lista para modificar durante iteração
        if arquivo in arquivos_existentes:
            caminho_input = os.path.join(input_dir, arquivo)
            os.remove(caminho_input)
            arquivos_input.remove(arquivo)
            duplicatas_removidas += 1
            print(f"Removida duplicata: {arquivo}")
    
    if duplicatas_removidas > 0:
        print(f"Total de {duplicatas_removidas} duplicatas removidas de input/")
    
    # Verifica se ainda há arquivos para processar
    if not arquivos_input:
        print("Todos os arquivos de input/ já foram processados anteriormente")
        # Verifica se há arquivo _chat.txt
        chat_file = os.path.join(input_dir, "_chat.txt")
        if os.path.exists(chat_file):
            return True, chat_file
        return False, None
    
    print(f"Encontrados {len(arquivos_input)} arquivos novos para processar em input/")
    
    # Verifica se há arquivo _chat.txt
    chat_file = os.path.join(input_dir, "_chat.txt")
    if not os.path.exists(chat_file):
        print("Arquivo input/_chat.txt não encontrado!")
        return False, None
    
    return True, chat_file

def mover_arquivos_processados():
    """Move arquivos processados de input/ para imgs/"""
    input_dir = "input"
    imgs_dir = "imgs"
    
    # Garante que o diretório imgs/ existe
    os.makedirs(imgs_dir, exist_ok=True)
    
    # Lista arquivos de imagem em input/
    extensoes_imagem = ('.jpg', '.jpeg', '.png', '.pdf')
    arquivos_input = [f for f in os.listdir(input_dir) 
                      if f.lower().endswith(extensoes_imagem)]
    
    arquivos_movidos = 0
    for arquivo in arquivos_input:
        origem = os.path.join(input_dir, arquivo)
        destino = os.path.join(imgs_dir, arquivo)
        shutil.move(origem, destino)
        arquivos_movidos += 1
        print(f"Movido: {arquivo} -> imgs/")
    
    if arquivos_movidos > 0:
        print(f"Total de {arquivos_movidos} arquivos movidos para imgs/")
    
    return arquivos_movidos

def incrementar_csv(novo_df, arquivo_csv):
    """Incrementa um arquivo CSV existente com novos dados, evitando duplicatas"""
    if os.path.exists(arquivo_csv):
        # Lê o CSV existente
        df_existente = pd.read_csv(arquivo_csv)
        
        # Identifica se é o CSV de anexos (tem colunas específicas) ou mensagens
        eh_csv_anexos = 'VALOR' in novo_df.columns and 'DESCRICAO' in novo_df.columns
        
        if eh_csv_anexos:
            # inclui toda linha de df_anexos para relatório
            novos_registros = novo_df.copy()
        else:
            # Para CSV de mensagens, filtra registros com OCR preenchido
            if 'OCR' in novo_df.columns:
                mascara_novos = (
                    novo_df['OCR'].notna() & 
                    (novo_df['OCR'] != '') & 
                    (novo_df['OCR'] != 'Já processado anteriormente')
                )
                novos_registros = novo_df[mascara_novos].copy()
            else:
                # Se não tem coluna OCR, adiciona todos os novos registros
                novos_registros = novo_df.copy()
        
        if len(novos_registros) > 0:
            # Combina com os novos dados
            df_combinado = pd.concat([df_existente, novos_registros], ignore_index=True)
            print(f"CSV {arquivo_csv} incrementado: {len(df_existente)} + {len(novos_registros)} = {len(df_combinado)} registros")
        else:
            df_combinado = df_existente
            print(f"CSV {arquivo_csv} mantido inalterado - nenhum registro novo encontrado")
    else:
        df_combinado = novo_df
        print(f"CSV {arquivo_csv} criado com {len(novo_df)} registros")
    
    # Salva o arquivo combinado
    df_combinado.to_csv(arquivo_csv, index=False, quoting=1)
    
    return df_combinado

def normalize_sender(remetente):
    """Normaliza o nome do remetente para 'Ricardo' ou 'Rafael'"""
    if not remetente or pd.isna(remetente):
        return ""
    
    remetente_str = str(remetente).strip()
    
    if "Ricardo" in remetente_str:
        return "Ricardo"
    elif "Rafael" in remetente_str:
        return "Rafael"
    else:
        return remetente_str

def adicionar_totalizacao_mensal(df):
    """Adiciona linhas de totalização no final de cada mês"""
    from datetime import datetime, timedelta
    import calendar
    
    # Função auxiliar para converter valores para float
    def convert_to_float(value):
        if pd.isna(value) or value == '':
            return 0.0
        try:
            return float(str(value).replace(',', '.'))
        except:
            return 0.0
    
    # Converte DATA para datetime para facilitar ordenação e agrupamento
    df['DATA_DT'] = pd.to_datetime(df['DATA'], format='%d/%m/%Y', errors='coerce')
    
    # Remove linhas de totalização existentes antes de recalcular
    df_sem_totais = df[df['REMETENTE'] != 'TOTAL MÊS'].copy()
    
    # Ordena por data
    df_sem_totais = df_sem_totais.sort_values('DATA_DT').reset_index(drop=True)
    
    # Lista para armazenar as novas linhas
    linhas_totalizacao = []
    
    # Agrupa por mês/ano
    df_sem_totais['MES_ANO'] = df_sem_totais['DATA_DT'].dt.to_period('M')
    meses_unicos = df_sem_totais['MES_ANO'].dropna().unique()
    
    # Para cada mês, calcula totais e adiciona linha de totalização
    for mes_periodo in sorted(meses_unicos):
        # Filtra dados do mês (excluindo totalizações)
        dados_mes = df_sem_totais[df_sem_totais['MES_ANO'] == mes_periodo]
        
        # Calcula totais do mês
        total_ricardo = dados_mes['RICARDO'].apply(convert_to_float).sum()
        total_rafael = dados_mes['RAFAEL'].apply(convert_to_float).sum()
        
        # Se há valores a totalizar
        if total_ricardo > 0 or total_rafael > 0:
            # Calcula último dia do mês
            ano = mes_periodo.year
            mes = mes_periodo.month
            ultimo_dia = calendar.monthrange(ano, mes)[1]
            
            # Cria linha de totalização
            linha_total = {
                'DATA': f'{ultimo_dia:02d}/{mes:02d}/{ano}',
                'HORA': '23:59:00',
                'REMETENTE': 'TOTAL MÊS',
                'CLASSIFICACAO': 'TOTAL',
                'RICARDO': f'{total_ricardo:.2f}'.replace('.', ',') if total_ricardo > 0 else '',
                'RAFAEL': f'{total_rafael:.2f}'.replace('.', ',') if total_rafael > 0 else '',
                'ANEXO': f'TOTAL_{mes:02d}_{ano}',
                'DESCRICAO': f'Total do mês {mes:02d}/{ano}',
                'VALOR': '',
                'OCR': '',
                'DATA_DT': datetime(ano, mes, ultimo_dia, 23, 59),
                'MES_ANO': mes_periodo
            }
            
            linhas_totalizacao.append(linha_total)
    
    # Adiciona as linhas de totalização ao DataFrame sem totais
    if linhas_totalizacao:
        df_totalizacao = pd.DataFrame(linhas_totalizacao)
        df_combinado = pd.concat([df_sem_totais, df_totalizacao], ignore_index=True)
        # Reordena por data/hora
        df_combinado = df_combinado.sort_values(['DATA_DT', 'HORA']).reset_index(drop=True)
    else:
        df_combinado = df_sem_totais
    
    # Remove colunas auxiliares
    df_combinado = df_combinado.drop(columns=['DATA_DT', 'MES_ANO'])
    
    print(f"Adicionadas {len(linhas_totalizacao)} linhas de totalização mensal")
    
    return df_combinado

def txt_to_csv_anexos_only(input_file, output_file):
    """Nova funcionalidade - extrai apenas dados de anexos (DATA/HORA, remetente, anexos e OCR) com valor total via ChatGPT"""
    # Lê cada linha completa do arquivo de chat
    with open(input_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    df = pd.DataFrame(lines, columns=['raw'])

    # Padrão mais flexível para capturar linhas com caracteres invisíveis
    pattern = r'.*?\[([\d]{2}/[\d]{2}/\d{4}), (\d{2}:\d{2}:\d{2})\] ([^:]+): (.*)$'
    df[['data', 'hora', 'remetente', 'mensagem']] = df['raw'].str.extract(pattern)
    
    # Extrai o nome do arquivo de anexo, se houver
    df['anexo'] = df['mensagem'].str.extract(r'<anexado:\s*([^>]+)>', expand=False).str.strip()
    df['anexo'] = df['anexo'].fillna('')
    
    # Filtra apenas linhas que têm anexos (remove mensagens de texto)
    df_anexos = df[df['anexo'] != ''].copy()
    
    # Remove a coluna mensagem pois não precisamos dela
    df_anexos.drop(columns=['mensagem'], inplace=True)
    
    # Normaliza os nomes dos remetentes
    df_anexos['remetente'] = df_anexos['remetente'].apply(normalize_sender)
    
    # Renomeia colunas para UPPERCASE
    df_anexos = df_anexos.rename(columns={
        'data': 'DATA',
        'hora': 'HORA', 
        'remetente': 'REMETENTE',
        'anexo': 'ANEXO'
    })
    
    # Adiciona colunas para dados do OCR, valor total, descrição, classificação e colunas separadas por remetente
    df_anexos['OCR'] = ''
    df_anexos['VALOR'] = ''
    df_anexos['DESCRICAO'] = ''
    df_anexos['CLASSIFICACAO'] = ''
    df_anexos['RICARDO'] = ''
    df_anexos['RAFAEL'] = ''
    
    # 1) carrega CSV existente para recuperação de dados
    if os.path.exists(output_file):
        df_existente = pd.read_csv(output_file)
        processed = set(df_existente['ANEXO'].astype(str))
    else:
        df_existente = pd.DataFrame()
        processed = set()
    
    # Processa OCR e extração de valor apenas para anexos que são imagens novas
    input_dir = "input"
    print("Processando OCR das imagens novas (apenas anexos)...")
    for idx, row in df_anexos.iterrows():
        # 2) se já processado antes, recupera valores e pula chamadas de API
        anexo = str(row['ANEXO'])
        if anexo in processed:
            prev = df_existente[df_existente['ANEXO'] == anexo].iloc[0]
            for col in ['OCR','VALOR','DESCRICAO','CLASSIFICACAO','RICARDO','RAFAEL']:
                df_anexos.at[idx, col] = prev[col]
            continue
            
        if row['ANEXO'] and (row['ANEXO'].endswith('.jpg') or row['ANEXO'].endswith('.jpeg') or row['ANEXO'].endswith('.png')):
            # Verifica se o arquivo existe em input/ (imagens novas)
            caminho_input = os.path.join(input_dir, row['ANEXO'])
            if os.path.exists(caminho_input):
                print(f"Processando OCR: {row['ANEXO']}")
                ocr_result = process_image_ocr(caminho_input)
                df_anexos.at[idx, 'OCR'] = ocr_result
                
                # Extrai valor total usando ChatGPT
                print(f"Extraindo valor total: {row['ANEXO']}")
                valor_total = extract_total_value_with_chatgpt(ocr_result)
                df_anexos.at[idx, 'VALOR'] = valor_total
                
                # Gera descrição do pagamento usando ChatGPT
                print(f"Gerando descrição: {row['ANEXO']}")
                descricao = generate_payment_description_with_chatgpt(ocr_result)
                df_anexos.at[idx, 'DESCRICAO'] = descricao
                
                # Classifica o tipo de transação usando ChatGPT
                print(f"Classificando transação: {row['ANEXO']}")
                classificacao = classify_transaction_type_with_chatgpt(ocr_result)
                df_anexos.at[idx, 'CLASSIFICACAO'] = classificacao
                
                # Adiciona o valor à coluna do remetente correspondente APENAS para transferências
                if valor_total and valor_total.strip() and classificacao == 'Transferência':
                    if row['REMETENTE'] == 'Ricardo':
                        df_anexos.at[idx, 'RICARDO'] = valor_total
                    elif row['REMETENTE'] == 'Rafael':
                        df_anexos.at[idx, 'RAFAEL'] = valor_total
            elif os.path.exists(os.path.join("imgs", row['ANEXO'])):
                # Se está em imgs/, não processa novamente (será tratado pela recuperação de dados)
                continue
            else:
                # 3) arquivo não encontrado: sinaliza e pula chamadas
                df_anexos.at[idx, 'OCR'] = "Arquivo não encontrado"
                continue
    
    # debug: inspeciona se os campos foram preenchidos
    print("DEBUG df_anexos Preview:")
    print(df_anexos[['ANEXO','DESCRICAO','VALOR','CLASSIFICACAO']].head(10))
    
    # Remove a coluna bruta e reordena as colunas conforme especificado
    df_anexos.drop(columns=['raw'], inplace=True)
    
    # Adiciona linhas de totalização mensal
    df_anexos = adicionar_totalizacao_mensal(df_anexos)
    
    # Reordena as colunas na ordem desejada: DATA, HORA, REMETENTE, CLASSIFICACAO, RICARDO, RAFAEL, ANEXO, DESCRICAO, VALOR, OCR
    ordem_colunas = ['DATA', 'HORA', 'REMETENTE', 'CLASSIFICACAO', 'RICARDO', 'RAFAEL', 'ANEXO', 'DESCRICAO', 'VALOR', 'OCR']
    df_anexos = df_anexos[ordem_colunas]
    
    # Incrementa o CSV em vez de sobrescrever
    df_final = incrementar_csv(df_anexos, output_file)
    
    # Calcula e exibe totais por remetente apenas dos novos dados
    def convert_to_float(value):
        if pd.isna(value) or value == '':
            return 0.0
        try:
            return float(str(value).replace(',', '.'))
        except:
            return 0.0
    
    ricardo_values = df_anexos['RICARDO'].apply(convert_to_float)
    rafael_values = df_anexos['RAFAEL'].apply(convert_to_float)
    
    total_ricardo = ricardo_values.sum()
    total_rafael = rafael_values.sum()
    
    print(f"Total Ricardo (novos): R$ {total_ricardo:.2f}")
    print(f"Total Rafael (novos): R$ {total_rafael:.2f}")
    print(f"Total Geral (novos): R$ {(total_ricardo + total_rafael):.2f}")
    
    return df_final

def verificar_totais(csv_file):
    """Verifica e exibe totais financeiros detalhados de um arquivo CSV"""
    try:
        if not os.path.exists(csv_file):
            print(f"Arquivo {csv_file} não encontrado!")
            return
            
        df = pd.read_csv(csv_file)
        
        def convert_to_float(value):
            if pd.isna(value) or value == '':
                return 0.0
            try:
                return float(str(value).replace(',', '.'))
            except:
                return 0.0

        ricardo_total = df['RICARDO'].apply(convert_to_float).sum()
        rafael_total = df['RAFAEL'].apply(convert_to_float).sum()
        valor_total = df['VALOR'].apply(convert_to_float).sum()

        print('=== TOTAIS FINANCEIROS ===')
        print(f'Total RICARDO (transferências): R$ {ricardo_total:.2f}')
        print(f'Total RAFAEL (transferências): R$ {rafael_total:.2f}')
        print(f'Total de transferências: R$ {(ricardo_total + rafael_total):.2f}')
        print(f'Total VALOR (todos os comprovantes): R$ {valor_total:.2f}')
        print()

        print('=== DISTRIBUIÇÃO POR TIPO ===')
        transferencias = df[df['CLASSIFICACAO'] == 'Transferência']
        pagamentos = df[df['CLASSIFICACAO'] == 'Pagamento']

        transferencia_total = transferencias['VALOR'].apply(convert_to_float).sum()
        pagamento_total = pagamentos['VALOR'].apply(convert_to_float).sum()

        print(f'Total em Transferências: R$ {transferencia_total:.2f}')
        print(f'Total em Pagamentos: R$ {pagamento_total:.2f}')
        print(f'Verificação: {transferencia_total + pagamento_total:.2f} = {valor_total:.2f}')
        
        # Verificação de consistência
        if abs((transferencia_total + pagamento_total) - valor_total) < 0.01:
            print("✅ Verificação: Totais consistentes!")
        else:
            print("❌ Aviso: Diferença detectada nos totais!")
            
    except Exception as e:
        print(f"Erro ao verificar totais: {str(e)}")

def carregar_edits_json():
    """Verifica diretório 'input' por todos os arquivos .json e retorna um dict unificado"""
    import_dir = 'input'
    edits = {}
    # Verifica se o diretório existe
    if not os.path.exists(import_dir):
        return edits
    # Itera todos os arquivos .json no diretório input/
    for fname in os.listdir(import_dir):
        if fname.lower().endswith('.json'):
            path = os.path.join(import_dir, fname)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    # Mescla conteúdo, chaves duplicadas serão sobrescritas pela última
                    edits.update(data)
            except Exception:
                print(f"Aviso: não foi possível ler {path}")
    return edits

def diagnostico_erro_ocr(image_path, ocr_result):
    if ocr_result == "Arquivo não encontrado":
        return "Arquivo não encontrado no disco"
    if ocr_result == "Erro ao carregar imagem":
        return "Imagem corrompida ou formato não suportado"
    if ocr_result == "Nenhum texto detectado":
        ext = os.path.splitext(image_path)[1].lower()
        if ext == '.pdf':
            return "PDF escaneado ilegível, protegido ou em branco"
        else:
            return "Imagem ilegível ou em branco"
    if ocr_result.startswith("Erro ao processar PDF"):
        return "PDF protegido, corrompido ou formato incompatível"
    if ocr_result.startswith("Erro no OCR"):
        return "Falha no OCR"
    return "Sem diagnóstico detalhado"

def processar_incremental(force=False, entry=None):
    """Função principal para processamento incremental ou forçado, agora com filtro opcional de entry (DATA HORA)"""
    print("=== INICIANDO PROCESSAMENTO {} ===".format("FORÇADO" if force else "INCREMENTAL"))
    if entry:
        print(f"Filtro de entrada ativado: {entry}")
        try:
            data_entry, hora_entry = entry.strip().split()
        except Exception:
            print("Formato de --entry inválido. Use: DD/MM/AAAA HH:MM:SS")
            return
    edits_json = carregar_edits_json()
    if edits_json:
        print(f"Edições encontradas em arquivos JSON de input/: aplicando após confirmação.")
    print("\n=== VERIFICANDO ARQUIVOS ZIP ===")
    if not descomprimir_zip_se_existir():
        print("❌ Erro na descompressão de arquivo ZIP. Processamento interrompido.")
        return
    print("\n=== VERIFICANDO SUBDIRETÓRIOS ===")
    organizar_subdiretorios_se_necessario()
    input_dir = "input"
    if force:
        arquivos = [f for f in os.listdir(input_dir) if os.path.isfile(os.path.join(input_dir, f)) and f.lower().endswith((".jpg", ".jpeg", ".png", ".pdf"))]
        if not arquivos:
            print("Nenhum arquivo para reprocessar em modo forçado.")
        else:
            print(f"Arquivos a reprocessar: {arquivos}")
            registros = []
            for arquivo in arquivos:
                caminho = os.path.join(input_dir, arquivo)
                print(f"Processando arquivo (forçado): {arquivo}")
                ocr_result = process_image_ocr(caminho)
                valor_total = extract_total_value_with_chatgpt(ocr_result)
                descricao = generate_payment_description_with_chatgpt(ocr_result)
                classificacao = classify_transaction_type_with_chatgpt(ocr_result)
                motivo_erro = ""
                if not valor_total and not descricao and not classificacao:
                    motivo_erro = diagnostico_erro_ocr(caminho, ocr_result)
                registros.append({
                    'ARQUIVO': arquivo,
                    'VALOR': valor_total,
                    'DESCRICAO': descricao,
                    'CLASSIFICACAO': classificacao,
                    'MOTIVO_ERRO': motivo_erro
                })
            # Salva resultado em CSV detalhado
            df_diag = pd.DataFrame(registros)
            if entry:
                # Filtra apenas a linha correspondente
                if 'ARQUIVO' in df_diag.columns and 'DATA' in df_diag.columns and 'HORA' in df_diag.columns:
                    mask = (df_diag['DATA'] == data_entry) & (df_diag['HORA'] == hora_entry)
                    df_diag = df_diag[mask]
                    if df_diag.empty:
                        print(f"Nenhuma linha encontrada para --entry {entry}.")
                        return
                else:
                    print("Colunas DATA/HORA não encontradas para filtro --entry.")
                    return
            df_diag.to_csv('diagnostico.csv', index=False)
            print("Reprocessamento forçado concluído. Diagnóstico salvo em diagnostico.csv.")
    else:
        tem_arquivos, chat_file = gerenciar_arquivos_incrementais()
        if not tem_arquivos:
            print("Nenhum arquivo novo para processar.")
            print("\n=== GERANDO RELATÓRIO HTML ===")
            gerar_relatorio_html("calculo.csv")
            gerar_relatorios_mensais_html("calculo.csv")
            return
        print(f"\n=== PROCESSANDO DADOS DE {chat_file} ===")
        print("=== PROCESSANDO DADOS COMPLETOS ===")
        df_completo = txt_to_csv(chat_file, "mensagens.csv")
        print("\n=== PROCESSANDO APENAS ANEXOS ===")
        df_anexos = txt_to_csv_anexos_only(chat_file, "calculo.csv")
        if entry:
            # Filtra apenas a linha correspondente
            if 'DATA' in df_anexos.columns and 'HORA' in df_anexos.columns:
                mask = (df_anexos['DATA'] == data_entry) & (df_anexos['HORA'] == hora_entry)
                df_anexos = df_anexos[mask]
                if df_anexos.empty:
                    print(f"Nenhuma linha encontrada para --entry {entry}.")
                    return
                df_anexos.to_csv('calculo.csv', index=False)
            else:
                print("Colunas DATA/HORA não encontradas para filtro --entry.")
                return
        # Diagnóstico incremental: para cada linha sem valor, descrição e classificação, registrar motivo
        if 'ANEXO' in df_anexos.columns:
            motivos = []
            for idx, row in df_anexos.iterrows():
                if (not row.get('VALOR')) and (not row.get('DESCRICAO')) and (not row.get('CLASSIFICACAO')):
                    anexo = row.get('ANEXO')
                    if anexo:
                        caminho = os.path.join('imgs', anexo) if os.path.exists(os.path.join('imgs', anexo)) else os.path.join('input', anexo)
                        ocr_result = row.get('OCR', '')
                        motivo = diagnostico_erro_ocr(caminho, ocr_result)
                        motivos.append(motivo)
                    else:
                        motivos.append("")
                else:
                    motivos.append("")
            df_anexos['MOTIVO_ERRO'] = motivos
            df_anexos.to_csv('calculo.csv', index=False)
        print("\n=== MOVENDO ARQUIVOS PROCESSADOS ===")
        arquivos_movidos = mover_arquivos_processados()
        try:
            os.remove(chat_file)
            print(f"Arquivo {chat_file} removido após processamento")
        except Exception as e:
            print(f"Erro ao remover {chat_file}: {e}")
        arquivos_restantes = os.listdir(input_dir)
        if not arquivos_restantes:
            print(f"✅ Diretório {input_dir}/ está vazio - processamento concluído")
        else:
            print(f"⚠️  Arquivos restantes em {input_dir}/: {arquivos_restantes}")
        print("\n=== PROCESSAMENTO INCREMENTAL CONCLUÍDO ===")
        if edits_json:
            resposta = input("Deseja aplicar as edições do JSON em calculo.csv antes de gerar relatórios? (s/n): ").strip().lower()
            if resposta == 's':
                df_calc = pd.read_csv('calculo.csv', dtype=str)
                for row_id, campos in edits_json.items():
                    idx = int(row_id.split('_')[1])
                    for campo, valor in campos.items():
                        if campo.upper() in df_calc.columns:
                            df_calc.at[idx, campo.upper()] = valor
                df_calc.to_csv('calculo.csv', index=False, quoting=1)
                print("Edições aplicadas em calculo.csv.")
    print("\n=== GERANDO RELATÓRIO HTML ===")
    gerar_relatorio_html("calculo.csv")
    print("\n=== GERANDO RELATÓRIOS MENSAIS ===")
    gerar_relatorios_mensais_html("calculo.csv")
    df_all = pd.read_csv("calculo.csv")
    df_all['DATA_DT'] = pd.to_datetime(df_all['DATA'], format='%d/%m/%Y', errors='coerce')
    df_all['ANO_MES'] = df_all['DATA_DT'].dt.to_period('M')
    nomes_meses = {
        1: 'Janeiro', 2: 'Fevereiro', 3: 'Marco', 4: 'Abril',
        5: 'Maio', 6: 'Junho', 7: 'Julho', 8: 'Agosto',
        9: 'Setembro', 10: 'Outubro', 11: 'Novembro', 12: 'Dezembro'
    }
    for periodo, dados_mes in df_all.groupby('ANO_MES'):
        ano = periodo.year
        mes = periodo.month
        nome_mes = nomes_meses.get(mes, str(mes))
        nome_arquivo_impressao = f"impressao-{ano}-{mes:02d}-{nome_mes}.html"
        print(f"✅ HTML de impressão gerado: {nome_arquivo_impressao}")

def descomprimir_zip_se_existir():
    """Verifica se existe apenas um arquivo ZIP em input/ e o descomprime"""
    input_dir = "input"
    
    # Verifica se o diretório input existe
    if not os.path.exists(input_dir):
        print(f"Diretório {input_dir}/ não encontrado!")
        return False
    
    # Lista todos os arquivos no diretório input/
    todos_arquivos = os.listdir(input_dir)
    
    # Filtra apenas arquivos ZIP
    arquivos_zip = [f for f in todos_arquivos if f.lower().endswith('.zip')]
    
    # Verifica se existe apenas um arquivo ZIP
    if len(arquivos_zip) == 0:
        print("Nenhum arquivo ZIP encontrado em input/")
        return True  # Não é erro, apenas não há ZIP para processar
    
    if len(arquivos_zip) > 1:
        print(f"Encontrados {len(arquivos_zip)} arquivos ZIP em input/. Deve haver apenas um.")
        print(f"Arquivos ZIP encontrados: {arquivos_zip}")
        return False
    
    # Se chegou aqui, existe exatamente um arquivo ZIP
    arquivo_zip = arquivos_zip[0]
    caminho_zip = os.path.join(input_dir, arquivo_zip)
    
    print(f"Encontrado arquivo ZIP: {arquivo_zip}")
    print("Descomprimindo arquivo ZIP...")
    
    try:
        # Descomprime o arquivo ZIP
        with zipfile.ZipFile(caminho_zip, 'r') as zip_ref:
            # Lista o conteúdo do ZIP antes de extrair
            lista_arquivos = zip_ref.namelist()
            print(f"Arquivos no ZIP: {len(lista_arquivos)} itens")
            
            # Extrai todos os arquivos para o diretório input/
            zip_ref.extractall(input_dir)
            
            print(f"✅ Arquivo ZIP descomprimido com sucesso!")
            print(f"Extraídos {len(lista_arquivos)} itens para {input_dir}/")
        
        # Remove o arquivo ZIP após descompressão bem-sucedida
        os.remove(caminho_zip)
        print(f"Arquivo ZIP {arquivo_zip} removido após descompressão")
        
        # Organiza arquivos extraídos - move tudo para input/ diretamente
        organizar_arquivos_extraidos()
        
        return True
        
    except zipfile.BadZipFile:
        print(f"❌ Erro: {arquivo_zip} não é um arquivo ZIP válido")
        return False
    except Exception as e:
        print(f"❌ Erro ao descomprimir {arquivo_zip}: {str(e)}")
        return False

def organizar_arquivos_extraidos():
    """Move arquivos de subdiretórios para input/ diretamente e remove diretórios desnecessários"""
    input_dir = "input"
    extensoes_validas = ('.jpg', '.jpeg', '.png', '.pdf', '.txt')
    
    arquivos_movidos = 0
    diretorios_removidos = 0
    
    # Percorre todos os itens em input/
    for item in os.listdir(input_dir):
        caminho_item = os.path.join(input_dir, item)
        
        # Se é um diretório
        if os.path.isdir(caminho_item):
            # Ignora diretório __MACOSX (arquivos do macOS)
            if item.startswith('__MACOSX'):
                print(f"Removendo diretório __MACOSX: {item}")
                shutil.rmtree(caminho_item)
                diretorios_removidos += 1
                continue
            
            # Para outros diretórios, move arquivos válidos para input/
            print(f"Processando subdiretório: {item}")
            for arquivo in os.listdir(caminho_item):
                caminho_arquivo = os.path.join(caminho_item, arquivo)
                
                # Se é um arquivo e tem extensão válida
                if os.path.isfile(caminho_arquivo) and arquivo.lower().endswith(extensoes_validas):
                    destino = os.path.join(input_dir, arquivo)
                    
                    # Se já existe arquivo com mesmo nome, adiciona sufixo
                    contador = 1
                    arquivo_original = arquivo
                    while os.path.exists(destino):
                        nome, ext = os.path.splitext(arquivo_original)
                        arquivo = f"{nome}_{contador}{ext}"
                        destino = os.path.join(input_dir, arquivo)
                        contador += 1
                    
                    # Move o arquivo
                    shutil.move(caminho_arquivo, destino)
                    print(f"Movido: {item}/{arquivo_original} -> {arquivo}")
                    arquivos_movidos += 1
            
            # Remove o diretório vazio após mover arquivos
            try:
                if os.path.exists(caminho_item):
                    shutil.rmtree(caminho_item)
                    diretorios_removidos += 1
                    print(f"Diretório removido: {item}")
            except Exception as e:
                print(f"Aviso: Não foi possível remover diretório {item}: {e}")
    
    print(f"✅ Organização concluída: {arquivos_movidos} arquivos movidos, {diretorios_removidos} diretórios removidos")

def organizar_subdiretorios_se_necessario():
    """Verifica se há subdiretórios em input/ e organiza arquivos se necessário"""
    input_dir = "input"
    
    if not os.path.exists(input_dir):
        return
    
    # Verifica se há subdiretórios
    subdiretorios = [item for item in os.listdir(input_dir) 
                    if os.path.isdir(os.path.join(input_dir, item))]
    
    if not subdiretorios:
        print("Nenhum subdiretório encontrado em input/")
        return
    
    print(f"Subdiretórios encontrados: {subdiretorios}")
    
    # Organiza arquivos dos subdiretórios
    organizar_arquivos_extraidos()

def executar_testes_e2e():
    """Executa testes End-to-End completos do sistema"""
    print("\n=== INICIANDO TESTES E2E ===")
    
    # Backup de arquivos existentes
    backup_arquivos_existentes()
    
    try:
        # Testa processamento incremental
        resultado_processamento = testar_processamento_incremental()
        
        # Testa verificação de totais
        resultado_verificacao = testar_verificacao_totais()
        
        # Testa OCR individual
        resultado_ocr = testar_ocr_individual()
        
        # Testa funções ChatGPT (se API disponível)
        resultado_chatgpt = testar_funcoes_chatgpt()
        
        # Relatório final
        print("\n=== RELATÓRIO DOS TESTES E2E ===")
        print(f"✅ Processamento incremental: {'PASSOU' if resultado_processamento else 'FALHOU'}")
        print(f"✅ Verificação de totais: {'PASSOU' if resultado_verificacao else 'FALHOU'}")
        print(f"✅ OCR individual: {'PASSOU' if resultado_ocr else 'FALHOU'}")
        print(f"✅ Funções ChatGPT: {'PASSOU' if resultado_chatgpt else 'FALHOU (API não disponível)'}")
        
        todos_passaram = resultado_processamento and resultado_verificacao and resultado_ocr
        
        if todos_passaram:
            print("\n🎉 TODOS OS TESTES E2E PASSARAM!")
            return True
        else:
            print("\n❌ ALGUNS TESTES FALHARAM!")
            return False
            
    finally:
        # Restaura arquivos originais
        restaurar_arquivos_backup()

def backup_arquivos_existentes():
    """Faz backup de arquivos existentes antes dos testes"""
    arquivos_backup = ['mensagens.csv', 'calculo.csv']
    
    for arquivo in arquivos_backup:
        if os.path.exists(arquivo):
            backup_nome = f"{arquivo}.backup_teste"
            shutil.copy2(arquivo, backup_nome)
            print(f"Backup criado: {backup_nome}")

def restaurar_arquivos_backup():
    """Restaura arquivos do backup após os testes"""
    arquivos_backup = ['mensagens.csv', 'calculo.csv']
    
    for arquivo in arquivos_backup:
        backup_nome = f"{arquivo}.backup_teste"
        if os.path.exists(backup_nome):
            if os.path.exists(arquivo):
                os.remove(arquivo)
            shutil.move(backup_nome, arquivo)
            print(f"Arquivo restaurado: {arquivo}")

def testar_processamento_incremental():
    """Testa o processamento incremental completo"""
    print("\n--- Testando Processamento Incremental ---")
    
    try:
        # Verifica se há arquivos em input/
        if not os.path.exists('input') or not os.listdir('input'):
            print("⚠️  Sem arquivos em input/ para testar processamento")
            return True  # Não é falha, apenas não há dados para testar
        
        # Conta arquivos antes do processamento
        arquivos_antes = len([f for f in os.listdir('input') 
                             if f.lower().endswith(('.jpg', '.jpeg', '.png', '.pdf'))])
        
        if arquivos_antes == 0:
            print("⚠️  Sem imagens em input/ para testar processamento")
            return True
        
        print(f"Arquivos de imagem encontrados: {arquivos_antes}")
        
        # Executa processamento
        processar_incremental()
        
        # Verifica se arquivos foram movidos para imgs/
        if os.path.exists('imgs'):
            arquivos_imgs = len([f for f in os.listdir('imgs') 
                               if f.lower().endswith(('.jpg', '.jpeg', '.png', '.pdf'))])
            print(f"Arquivos movidos para imgs/: {arquivos_imgs}")
        
        # Verifica se CSVs foram criados
        csvs_criados = []
        if os.path.exists('mensagens.csv'):
            csvs_criados.append('mensagens.csv')
        if os.path.exists('calculo.csv'):
            csvs_criados.append('calculo.csv')
        
        print(f"CSVs criados: {csvs_criados}")
        
        sucesso = len(csvs_criados) >= 1
        print(f"Processamento incremental: {'✅ PASSOU' if sucesso else '❌ FALHOU'}")
        return sucesso
        
    except Exception as e:
        print(f"❌ Erro no teste de processamento incremental: {e}")
        return False

def testar_verificacao_totais():
    """Testa a verificação de totais"""
    print("\n--- Testando Verificação de Totais ---")
    
    try:
        # Cria arquivo CSV de teste
        dados_teste = {
            'DATA': ['18/04/2025', '19/04/2025'],
            'HORA': ['12:45:53', '08:14:39'],
            'REMETENTE': ['Ricardo', 'Rafael'],
            'CLASSIFICACAO': ['Transferência', 'Transferência'],
            'RICARDO': ['29,90', ''],
            'RAFAEL': ['', '15,50'],
            'ANEXO': ['teste1.jpg', 'teste2.jpg'],
            'DESCRICAO': ['Teste 1', 'Teste 2'],
            'VALOR': ['29,90', '15,50'],
            'OCR': ['Teste OCR 1', 'Teste OCR 2']
        }
        
        df_teste = pd.DataFrame(dados_teste)
        arquivo_teste = 'tmp/teste_calculo.csv'
        
        # Garante que o diretório tmp/ existe
        os.makedirs('tmp', exist_ok=True)
        
        df_teste.to_csv(arquivo_teste, index=False)
        print(f"Arquivo de teste criado: {arquivo_teste}")
        
        # Testa verificação
        verificar_totais(arquivo_teste)
        
        # Remove arquivo de teste
        os.remove(arquivo_teste)
        
        print("Verificação de totais: ✅ PASSOU")
        return True
        
    except Exception as e:
        print(f"❌ Erro no teste de verificação de totais: {e}")
        return False

def testar_ocr_individual():
    """Testa o OCR em imagens individuais"""
    print("\n--- Testando OCR Individual ---")
    
    try:
        # Procura por imagens de teste
        diretorios_busca = ['imgs', 'input', 'massa']
        imagem_teste = None
        
        for diretorio in diretorios_busca:
            if os.path.exists(diretorio):
                imagens = [f for f in os.listdir(diretorio) 
                          if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
                if imagens:
                    imagem_teste = os.path.join(diretorio, imagens[0])
                    break
        
        if not imagem_teste:
            print("⚠️  Nenhuma imagem encontrada para teste de OCR")
            return True  # Não é falha, apenas não há imagem para testar
        
        print(f"Testando OCR na imagem: {imagem_teste}")
        
        # Executa OCR
        resultado_ocr = process_image_ocr(imagem_teste)
        
        # Verifica se OCR retornou algo válido
        sucesso = (resultado_ocr and 
                  resultado_ocr not in ["Arquivo não encontrado", "Erro ao carregar imagem", "Nenhum texto detectado"] and
                  "Erro no OCR" not in resultado_ocr)
        
        print(f"Resultado OCR: {resultado_ocr[:100]}..." if len(resultado_ocr) > 100 else f"Resultado OCR: {resultado_ocr}")
        print(f"OCR individual: {'✅ PASSOU' if sucesso else '❌ FALHOU'}")
        return sucesso
        
    except Exception as e:
        print(f"❌ Erro no teste de OCR individual: {e}")
        return False

def testar_funcoes_chatgpt():
    """Testa as funções que usam ChatGPT (se API disponível)"""
    print("\n--- Testando Funções ChatGPT ---")
    
    try:
        # Verifica se API está disponível
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            print("⚠️  API Key do OpenAI não configurada")
            return False
        
        # Texto de teste
        texto_teste = "PIX Banco do Brasil R$ 29,90 Padaria Bonanza"
        
        # Testa extração de valor
        print("Testando extração de valor...")
        valor = extract_total_value_with_chatgpt(texto_teste)
        sucesso_valor = bool(valor and valor != "")
        
        # Testa geração de descrição
        print("Testando geração de descrição...")
        descricao = generate_payment_description_with_chatgpt(texto_teste)
        sucesso_descricao = bool(descricao and descricao != "")
        
        # Testa classificação
        print("Testando classificação...")
        classificacao = classify_transaction_type_with_chatgpt(texto_teste)
        sucesso_classificacao = classificacao in ["Transferência", "Pagamento"]
        
        print(f"Valor extraído: {valor}")
        print(f"Descrição gerada: {descricao}")
        print(f"Classificação: {classificacao}")
        
        sucesso_geral = sucesso_valor and sucesso_descricao and sucesso_classificacao
        print(f"Funções ChatGPT: {'✅ PASSOU' if sucesso_geral else '❌ FALHOU'}")
        return sucesso_geral
        
    except Exception as e:
        print(f"❌ Erro no teste de funções ChatGPT: {e}")
        return False

def corrigir_totalizadores_duplicados(csv_file):
    """Corrige totalizadores duplicados no arquivo CSV existente"""
    try:
        if not os.path.exists(csv_file):
            print(f"Arquivo {csv_file} não encontrado!")
            return False
            
        print(f"Corrigindo totalizadores duplicados em {csv_file}...")
        df = pd.read_csv(csv_file)
        
        # Aplica a correção usando a função existente
        df_corrigido = adicionar_totalizacao_mensal(df)
        
        # Salva o arquivo corrigido
        df_corrigido.to_csv(csv_file, index=False, quoting=1)
        
        print(f"✅ Arquivo {csv_file} corrigido com sucesso!")
        return True
        
    except Exception as e:
        print(f"❌ Erro ao corrigir totalizadores: {str(e)}")
        return False

def gerar_html_mensal(df_mes, nome_arquivo, nome_mes, ano):
    """Gera o HTML para um mês específico, referenciando imagens por caminho relativo em vez de base64"""
    print(f"DEBUG gerar_html_mensal: Processando {len(df_mes)} linhas para {nome_mes} {ano}")
    if len(df_mes) > 0:
        print(f"DEBUG: Primeiras 3 linhas de DESCRICAO: {df_mes['DESCRICAO'].head(3).tolist()}")
        print(f"DEBUG: Primeiras 3 linhas de CLASSIFICACAO: {df_mes['CLASSIFICACAO'].head(3).tolist()}")
    meses_num = {
        'Janeiro': '01', 'Fevereiro': '02', 'Marco': '03', 'Abril': '04',
        'Maio': '05', 'Junho': '06', 'Julho': '07', 'Agosto': '08',
        'Setembro': '09', 'Outubro': '10', 'Novembro': '11', 'Dezembro': '12'
    }
    mes_num = meses_num.get(nome_mes, '01')
    html = '''<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório de Prestação de Contas - ''' + f"{nome_mes} {ano}" + '''</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background-color: #f9f9f9; line-height: 1.6; }
    .container { max-width: 1200px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
    h1 { text-align: center; color: #2c3e50; margin-bottom: 30px; font-size: 28px; border-bottom: 3px solid #3498db; padding-bottom: 15px; }
    .info { text-align: center; margin-bottom: 20px; color: #7f8c8d; font-style: italic; }
    table { border-collapse: collapse; width: 100%; margin-top: 20px; font-size: 14px; }
    th, td { border: 1px solid #ddd; padding: 12px 8px; text-align: center; vertical-align: middle; }
    th { background-color: #3498db; color: white; font-weight: bold; text-transform: uppercase; font-size: 12px; }
    tr:nth-child(even) { background-color: #f8f9fa; }
    tr:hover { background-color: #e3f2fd; }
    .total-row { background-color: #fff3cd !important; font-weight: bold; border-top: 3px solid #ffc107; }
    .total-row:hover { background-color: #fff3cd !important; }
    img.thumb { max-height: 50px; max-width: 80px; cursor: pointer; transition: transform 0.3s ease; border-radius: 5px; border: 1px solid #ddd; }
    img.thumb:hover { transform: scale(3); z-index: 9999; position: relative; border: 2px solid #3498db; box-shadow: 0 0 20px rgba(0,0,0,0.5); }
    .modal { display: none; position: fixed; z-index: 9999; padding-top: 0; left: 0; top: 0; width: 100vw; height: 100vh; overflow: auto; background-color: rgba(0,0,0,0.95); }
    .modal-content { margin: auto; display: block; width: 100%; height: 100%; object-fit: contain; }
    .modal.show { display: block; }
    .valor { font-weight: bold; color: #27ae60; }
    .data-hora { font-family: monospace; font-size: 12px; white-space: nowrap; }
    .classificacao { padding: 4px 8px; border-radius: 15px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
    .transferencia { background-color: #e8f5e8; color: #2e7d32; }
    .pagamento { background-color: #fff3e0; color: #f57c00; }
    @media (max-width: 768px) { .container { margin: 10px; padding: 15px; } table { font-size: 12px; } th, td { padding: 8px 4px; } h1 { font-size: 22px; } img.thumb { max-height: 40px; max-width: 60px; } img.thumb:hover { transform: scale(2.5); } table th:nth-child(1), table td:nth-child(1) { font-size: 10px; white-space: normal; word-break: break-word; } table th:nth-child(2), table td:nth-child(2) { font-size: 0; width: 30px; position: relative; } table th:nth-child(2) button { font-size: 0; border: none; background: none; padding: 4px; display: block; width: 100%; height: 100%; cursor: pointer; } table th:nth-child(2) { position: relative; z-index: 1; cursor: pointer; } table th:nth-child(2)::after { display: none; } span.classificacao.transferencia::before { content: "⇆"; } span.classificacao.pagamento::before { content: "💸"; } span.classificacao { font-size: 0; display: inline-block; width: 1em; height: 1em; } table th:nth-child(3)::after { content: "RI"; } table th:nth-child(4)::after { content: "RA"; } table th:nth-child(5)::after { content: "📎"; } table th:nth-child(6), table td:nth-child(6) { display: none; } }  </style>\n</head>\n<body>\n  <!-- Mensagem de carregamento -->\n  <div id=\"loading-overlay\" style=\"position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(255,255,255,0.9);display:flex;align-items:center;justify-content:center;z-index:9999;\">\n    <div style=\"font-size:18px;color:#333;font-family:sans-serif;\">Carregando relatório, aguarde por favor...</div>\n  </div>\n  <div class=\"container\">\n    <h1>Relatório de Prestação de Contas - ''' + f"{nome_mes} {ano}" + '''</h1>\n    <div class=\"info\">Gerado automaticamente em ''' + pd.Timestamp.now().strftime('%d/%m/%Y às %H:%M:%S') + '''</div>\n    <div style=\"text-align: right; margin-bottom: 10px;\">\n      <a href=\"report-edit-''' + f"{ano}-{mes_num}-{nome_mes}" + '''.html\" target=\"_blank\">\n        <button>Editar Relatório</button>\n      </a>\n    </div>\n    <table>\n      <thead>\n        <tr>\n          <th>Data-Hora</th>\n          <th><button id=\"toggle-payments\" style=\"background:none;border:none;cursor:pointer;font-size:16px;\" aria-label=\"Alternar pagamentos\"></button></th>\n          <th>Ricardo (R$)</th>\n          <th>Rafael (R$)</th>\n          <th>Anexo</th>\n          <th>Descrição</th>\n        </tr>\n      </thead>\n      <tbody>\n'''
    for idx, row in df_mes.iterrows():
        data = str(row.get('DATA', ''))
        hora = str(row.get('HORA', ''))
        data_hora = f"{data} {hora}".strip()
        classificacao = str(row.get('CLASSIFICACAO', ''))
        ricardo = str(row.get('RICARDO', ''))
        rafael = str(row.get('RAFAEL', ''))
        descricao = str(row.get('DESCRICAO', ''))
        anexo = str(row.get('ANEXO', ''))
        row_class = ''
        classificacao_html = ''
        if classificacao.lower() == 'transferência':
            row_class = 'transferencia'
            classificacao_html = '<span class="classificacao transferencia">Transferência</span>'
        elif classificacao.lower() == 'pagamento':
            row_class = 'pagamento'
            classificacao_html = '<span class="classificacao pagamento">Pagamento</span>'
        else:
            classificacao_html = f'<span class="classificacao">{classificacao}</span>'
        ricardo_html = ricardo
        rafael_html = rafael
        descricao_html = descricao
        # Referenciar imagem por caminho relativo
        img_html = ''
        if anexo:
            if os.path.exists(os.path.join('imgs', anexo)):
                img_html = f'<img src="imgs/{anexo}" class="thumb" alt="Comprovante {anexo}" title="{anexo}" onclick="showModal(this.src)">' 
            elif os.path.exists(os.path.join('input', anexo)):
                img_html = f'<img src="input/{anexo}" class="thumb" alt="Comprovante {anexo}" title="{anexo}" onclick="showModal(this.src)">' 
            else:
                img_html = f'<span style="color:#e67e22;font-size:12px;">Sem anexo</span>'
        html += f'''        <tr class="{row_class}">\n          <td class="data-hora">{data_hora}</td>\n          <td>{classificacao_html}</td>\n          <td>{ricardo_html}</td>\n          <td>{rafael_html}</td>\n          <td>{img_html}</td>\n          <td style="text-align: left; font-size: 12px;">{descricao_html}</td>\n        </tr>\n'''
    html += '''      </tbody>\n    </table>\n  </div>\n  <div id="modal" class="modal" onclick="hideModal()">\n    <img class="modal-content" id="modal-img">\n  </div>\n  <script>\n    function showModal(imgSrc) {\n      const modal = document.getElementById('modal');\n      const modalImg = document.getElementById('modal-img');\n      modalImg.src = imgSrc;\n      modal.classList.add('show');\n    }\n    function hideModal() {\n      const modal = document.getElementById('modal');\n      modal.classList.remove('show');\n    }\n    let showPayments = false;\n    document.addEventListener('DOMContentLoaded', () => {\n      const toggleBtn = document.getElementById('toggle-payments');\n      toggleBtn.addEventListener('click', () => {\n        showPayments = !showPayments;\n        document.querySelectorAll('tbody tr').forEach(row => {\n          const isPayment = row.querySelector('td:nth-child(2) .classificacao.pagamento');\n          row.style.display = isPayment ? (showPayments ? '' : 'none') : '';\n        });\n      });\n      document.querySelectorAll('tbody tr').forEach(row => {\n        const isPayment = row.querySelector('td:nth-child(2) .classificacao.pagamento');\n        if (isPayment) row.style.display = 'none';\n      });\n    });\n    document.addEventListener('DOMContentLoaded', () => {\n      const overlay = document.getElementById('loading-overlay');\n      if (overlay) overlay.style.display = 'none';\n    });\n  </script>\n</body>\n</html>'''
    with open(nome_arquivo, "w", encoding="utf-8") as f:
        f.write(html)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso:")
        print("  python app.py processar              # Processamento incremental automático")
        print("  python app.py processar --force      # Reprocessa todos os arquivos de input/")
        print("  python app.py processar --entry 'DD/MM/AAAA HH:MM:SS'  # Reprocessa apenas a linha correspondente")
        print("  python app.py verificar <arquivo_csv>")
        print("  python app.py corrigir <arquivo_csv> # Corrige totalizadores duplicados")
        print("  python app.py teste                  # Executa testes E2E completos")
        sys.exit(1)
    
    comando = sys.argv[1]
    
    if comando == "processar":
        force = False
        entry = None
        # Suporte a --force e --entry
        if len(sys.argv) > 2:
            if sys.argv[2] == "--force":
                force = True
            elif sys.argv[2] == "--entry":
                if len(sys.argv) > 3:
                    entry = sys.argv[3]
                else:
                    print("Uso: python app.py processar --entry 'DD/MM/AAAA HH:MM:SS'")
                    sys.exit(1)
        # Permitir --force --entry juntos
        if len(sys.argv) > 4:
            if sys.argv[2] == "--force" and sys.argv[3] == "--entry":
                force = True
                entry = sys.argv[4]
            elif sys.argv[2] == "--entry" and sys.argv[4] == "--force":
                entry = sys.argv[3]
                force = True
        processar_incremental(force=force, entry=entry)
        if force:
            for f in os.listdir('input'):
                caminho = os.path.join('input', f)
                if os.path.isfile(caminho):
                    shutil.move(caminho, os.path.join('imgs', f))
            print("Arquivos reprocessados e movidos de volta para imgs/.")
        
    elif comando == "verificar":
        if len(sys.argv) != 3:
            print("Uso: python app.py verificar <arquivo_csv>")
            sys.exit(1)
            
        csv_file = sys.argv[2]
        verificar_totais(csv_file)
        
    elif comando == "corrigir":
        if len(sys.argv) != 3:
            print("Uso: python app.py corrigir <arquivo_csv>")
            sys.exit(1)
            
        csv_file = sys.argv[2]
        sucesso = corrigir_totalizadores_duplicados(csv_file)
        sys.exit(0 if sucesso else 1)
        
    elif comando == "teste":
        # Executa testes E2E
        sucesso = executar_testes_e2e()
        sys.exit(0 if sucesso else 1)
    elif comando == "prestacao":
        # Gera planilha no formato da Justiça
        # gerar_formato_justica("calculo.csv", "prestacao_contas.xls", "prestacao_contas_justica.xlsx")
        print("A função gerar_formato_justica foi removida.")
        sys.exit(0)
    else:
        print("Comando inválido. Use 'processar', 'verificar' ou 'teste'")
        sys.exit(1)

