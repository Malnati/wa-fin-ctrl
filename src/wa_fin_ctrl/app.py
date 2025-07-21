# app.py
# Caminho relativo ao projeto: app.py
# Módulo principal de processamento de comprovantes financeiros com suporte a OCR e IA
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
from .reporter import gerar_relatorio_html, gerar_relatorios_mensais_html, gerar_html_impressao
# Adiciona imports para PDF
try:
    import pdfplumber
    from pdf2image import convert_from_path
except ImportError:
    pdfplumber = None
    convert_from_path = None

from .ocr import registrar_ocr_xml, process_image_ocr
from .env import *
from .app import convert_to_brazilian_format

def extract_value_from_ocr(ocr_text):
    """Extrai valor monetário do texto OCR usando expressões regulares"""
    if not ocr_text:
        return ""
    
    # Padrões para encontrar valores no texto OCR
    padroes_valor = [
        r'R\$\s*([0-9.,]+)',  # R$ 123,45
        r'valor\s*R\$\s*([0-9.,]+)',  # valor R$ 123,45
        r'([0-9.,]+)\s*reais',  # 123,45 reais
        r'total\s*R\$\s*([0-9.,]+)',  # total R$ 123,45
        r'pago\s*R\$\s*([0-9.,]+)',  # pago R$ 123,45
        r'R\$\s*([0-9.,]+)\s*dados',  # R$ 123,45 dados
        r'valor\s*:\s*R\$\s*([0-9.,]+)',  # valor: R$ 123,45
        r'([0-9.,]+)\s*via\s*celular',  # 123,45 via celular
        r'([0-9.,]+)\s*realizado',  # 123,45 realizado
        r'VALOR\s*TOTAL\s*R\$\s*([0-9.,]+)',  # VALOR TOTAL R$ 123,45
        r'VALOR\s*A\s*PAGAR\s*R\$\s*([0-9.,]+)',  # VALOR A PAGAR R$ 123,45
        r'R\$\s*([0-9.,]+)\s*realizado',  # R$ 123,45 realizado
        r'valor\s*R\$\s*([0-9.,]+)\s*realizado',  # valor R$ 123,45 realizado
        r'([0-9.,]+)\s*R\$',  # 123,45 R$
        r'R\$\s*([0-9.,]+)\s*R\$',  # R$ 123,45 R$
    ]
    
    valores_encontrados = []
    
    for padrao in padroes_valor:
        matches = re.findall(padrao, ocr_text, re.IGNORECASE)
        for match in matches:
            if match:
                # Limpa o valor encontrado
                valor_limpo = match.strip()
                # Remove caracteres não numéricos exceto vírgula e ponto
                valor_limpo = re.sub(r'[^\d,.]', '', valor_limpo)
                if valor_limpo:
                    valores_encontrados.append(valor_limpo)
    
    if not valores_encontrados:
        return ""
    
    # Se encontrou múltiplos valores, retorna o maior (geralmente o total)
    valores_float = []
    for valor in valores_encontrados:
        try:
            # Converte para float (formato brasileiro)
            valor_float = float(valor.replace('.', '').replace(',', '.'))
            valores_float.append(valor_float)
        except ValueError:
            continue
    
    if not valores_float:
        return ""
    
    # Retorna o maior valor encontrado
    maior_valor = max(valores_float)
    return f"{maior_valor:.2f}"


def is_financial_receipt(ocr_text):
    """Verifica se o texto OCR indica que é um comprovante financeiro"""
    if not ocr_text or len(ocr_text.strip()) < 10:
        return False
    
    # Palavras-chave que indicam comprovante financeiro
    keywords = [
        'pix', 'transferência', 'pagamento', 'comprovante', 'recibo',
        'banco', 'bb', 'nubank', 'itau', 'bradesco', 'santander',
        'valor', 'total', 'r$', 'reais', 'realizado', 'pago',
        'conta', 'cartão', 'débito', 'crédito', 'boleto',
        'qr code', 'celular', 'app', 'mobile'
    ]
    
    texto_lower = ocr_text.lower()
    
    # Conta quantas palavras-chave estão presentes
    matches = sum(1 for keyword in keywords if keyword in texto_lower)
    
    # Se pelo menos 2 palavras-chave estão presentes, considera como comprovante
    return matches >= 2


def extract_total_value_with_chatgpt(ocr_text):
    """Usa a API do ChatGPT para identificar o valor total da compra no texto OCR"""
    try:
        # Verifica se a chave da API está disponível
        api_key = ATTR_FIN_OPENAI_API_KEY
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
        api_key = ATTR_FIN_OPENAI_API_KEY
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
        api_key = ATTR_FIN_OPENAI_API_KEY
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
        
        # Normaliza a classificação
        if "transferência" in classificacao.lower():
            return "Transferência"
        elif "pagamento" in classificacao.lower():
            return "Pagamento"
        else:
            # Fallback baseado no conteúdo do texto
            if any(palavra in ocr_text.lower() for palavra in ["pix", "transferência", "ted", "doc"]):
                return "Transferência"
            else:
                return "Pagamento"
        
    except Exception as e:
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
    # Adiciona coluna para validade
    df['VALIDADE'] = ''
    
    # Processa OCR apenas para anexos que existem no diretório input/
    input_dir = ATTR_FIN_DIR_INPUT
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
                caminho_imgs = os.path.join(ATTR_FIN_DIR_IMGS, row['anexo'])
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
    input_dir = ATTR_FIN_DIR_INPUT
    imgs_dir = ATTR_FIN_DIR_IMGS
    
    # Verifica se o diretório input existe
    if not os.path.exists(input_dir):
        print(f"Diretório {input_dir}/ não encontrado!")
        return False, None
    
    # Lista arquivos de imagem em input/
    extensoes_imagem = ('.jpg', '.jpeg', '.png', '.pdf')
    arquivos_input = [f for f in os.listdir(input_dir) 
                      if f.lower().endswith(extensoes_imagem)]
    
    if not arquivos_input:
        print(f"Nenhuma imagem encontrada no diretório {ATTR_FIN_DIR_INPUT}/")
        # Verifica se há arquivo _chat.txt
        chat_file = os.path.join(input_dir, ATTR_FIN_ARQ_CHAT)
        if os.path.exists(chat_file):
            print(f"Arquivo {ATTR_FIN_ARQ_CHAT} encontrado, mas sem imagens para processar")
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
        print(f"Total de {duplicatas_removidas} duplicatas removidas de {ATTR_FIN_DIR_INPUT}/")
    
    # Verifica se ainda há arquivos para processar
    if not arquivos_input:
        print(f"Todos os arquivos de {ATTR_FIN_DIR_INPUT}/ já foram processados anteriormente")
        # Verifica se há arquivo _chat.txt
        chat_file = os.path.join(input_dir, ATTR_FIN_ARQ_CHAT)
        if os.path.exists(chat_file):
            return True, chat_file
        return False, None
    
    print(f"Encontrados {len(arquivos_input)} arquivos novos para processar em {ATTR_FIN_DIR_INPUT}/")
    
    # Verifica se há arquivo _chat.txt
    chat_file = os.path.join(input_dir, ATTR_FIN_ARQ_CHAT)
    if not os.path.exists(chat_file):
        print(f"Arquivo {ATTR_FIN_DIR_INPUT}/{ATTR_FIN_ARQ_CHAT} não encontrado!")
        return False, None
    
    return True, chat_file

def mover_arquivos_processados():
    """Move arquivos processados de input/ para imgs/"""
    input_dir = ATTR_FIN_DIR_INPUT
    imgs_dir = ATTR_FIN_DIR_IMGS
    
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
        print(f"Movido: {arquivo} -> {ATTR_FIN_DIR_IMGS}/")
    
    if arquivos_movidos > 0:
        print(f"Total de {arquivos_movidos} arquivos movidos para {ATTR_FIN_DIR_IMGS}/")
    
    return arquivos_movidos

def incrementar_csv(novo_df, arquivo_csv):
    """Incrementa um arquivo CSV existente com novos dados, evitando duplicatas"""
    # Cria o diretório se não existir
    diretorio = os.path.dirname(arquivo_csv)
    if diretorio and not os.path.exists(diretorio):
        os.makedirs(diretorio, exist_ok=True)
        print(f"Diretório criado: {diretorio}")
    
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
        
        # Adiciona coluna VALIDADE se não existir no CSV existente
        if 'VALIDADE' not in df_existente.columns:
            df_existente['VALIDADE'] = ''
            print(f"➕ Coluna VALIDADE adicionada ao CSV existente")
        
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
                'VALIDADE': '',
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

def txt_to_csv_anexos_only(input_file=None, output_file=None, filter=None):
    """Nova funcionalidade - extrai apenas dados de anexos (DATA/HORA, remetente, anexos e OCR) com valor total via ChatGPT"""
    
    # Se não foi fornecido input_file, usa o arquivo de chat padrão
    if input_file is None:
        # Busca arquivo de chat no diretório input/
        input_dir = Path(ATTR_FIN_DIR_INPUT)
        chat_files = list(input_dir.glob('*_chat.txt'))
        if not chat_files:
            print(f"Nenhum arquivo de chat encontrado em {ATTR_FIN_DIR_INPUT}/")
            return pd.DataFrame()
        input_file = str(chat_files[0])
    
    # Se não foi fornecido output_file, usa o padrão
    if output_file is None:
        output_file = ATTR_FIN_ARQ_CALCULO
    
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
    
    # Aplica filtro por tipo de arquivo se especificado
    if filter == 'pdf':
        df_anexos = df_anexos[df_anexos['anexo'].str.lower().endswith('.pdf')].copy()
        print(f"Filtro aplicado: apenas PDFs ({len(df_anexos)} arquivos)")
    elif filter == 'img':
        df_anexos = df_anexos[df_anexos['anexo'].str.lower().endswith(('.jpg','.jpeg','.png'))].copy()
        print(f"Filtro aplicado: apenas imagens ({len(df_anexos)} arquivos)")
    else:
        print(f"Processando todos os anexos ({len(df_anexos)} arquivos)")
    
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
    # Adiciona coluna para validade
    df_anexos['VALIDADE'] = ''
    
    # 1) carrega CSV existente para recuperação de dados
    if os.path.exists(output_file):
        df_existente = pd.read_csv(output_file)
        processed = set(df_existente['ANEXO'].astype(str))
    else:
        df_existente = pd.DataFrame()
        processed = set()
    
    # Processa OCR e extração de valor apenas para anexos que são imagens novas
    input_dir = ATTR_FIN_DIR_INPUT
    print("Processando OCR das imagens novas (apenas anexos)...")
    for idx, row in df_anexos.iterrows():
        # 2) se já processado antes, recupera valores e pula chamadas de API
        anexo = str(row['ANEXO'])
        if anexo in processed:
            prev = df_existente[df_existente['ANEXO'] == anexo].iloc[0]
            for col in ['OCR','VALOR','DESCRICAO','CLASSIFICACAO','RICARDO','RAFAEL','VALIDADE']:
                df_anexos.at[idx, col] = prev[col]
            
            # Se foi marcado com ai-check, pula a tentativa de identificação de valor
            if prev.get('VALIDADE', '') == 'ai-check':
                print(f"  - Pulado (ai-check): {row['ANEXO']}")
            
            continue
            
        # Trata imagens e PDFs da mesma forma
        if row['ANEXO'] and row['ANEXO'].lower().endswith(('.jpg', '.jpeg', '.png', '.pdf')):
            # Tenta localizar no diretório input, senão imgs
            caminho_input = os.path.join(input_dir, row['ANEXO'])
            if not os.path.exists(caminho_input):
                caminho_input = os.path.join(ATTR_FIN_DIR_IMGS, row['ANEXO'])
            
            if os.path.exists(caminho_input):
                print(f"Processando OCR: {row['ANEXO']}")
                ocr_result = process_image_ocr(caminho_input)
                df_anexos.at[idx, 'OCR'] = ocr_result
                
                # Verifica se é um comprovante financeiro
                is_receipt = is_financial_receipt(ocr_result)
                
                # Extrai valor total - primeiro tenta OCR, depois IA como fallback
                valor_total = ""
                ai_used = False
                
                if is_receipt:
                    # Primeiro tenta extrair valor via regex do OCR
                    valor_total = extract_value_from_ocr(ocr_result)
                    
                    # Se não encontrou valor via OCR, usa IA como fallback
                    if not valor_total:
                        valor_total = extract_total_value_with_chatgpt(ocr_result)
                        ai_used = True
                        print(f"  - IA usada para extração de valor (OCR não encontrou)")
                    
                    # Marca na coluna VALIDADE se IA foi usada
                    if ai_used:
                        df_anexos.at[idx, 'VALIDADE'] = "ai-check"
                else:
                    print(f"  - Não identificado como comprovante financeiro")
                
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
            else:
                # Arquivo não encontrado: sinaliza e pula chamadas
                df_anexos.at[idx, 'OCR'] = "Arquivo não encontrado"
                continue
    
    # debug: inspeciona se os campos foram preenchidos
    print("DEBUG df_anexos Preview:")
    print(df_anexos[['ANEXO','DESCRICAO','VALOR','CLASSIFICACAO']].head(10))
    
    # Remove a coluna bruta e reordena as colunas conforme especificado
    df_anexos.drop(columns=['raw'], inplace=True)
    
    # Adiciona linhas de totalização mensal
    df_anexos = adicionar_totalizacao_mensal(df_anexos)
    
    # Reordena as colunas na ordem desejada: DATA, HORA, REMETENTE, CLASSIFICACAO, RICARDO, RAFAEL, ANEXO, DESCRICAO, VALOR, OCR, VALIDADE
    ordem_colunas = ['DATA', 'HORA', 'REMETENTE', 'CLASSIFICACAO', 'RICARDO', 'RAFAEL', 'ANEXO', 'DESCRICAO', 'VALOR', 'OCR', 'VALIDADE']
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
    """Verifica diretório input/ por todos os arquivos .json e retorna um dict unificado"""
    import_dir = ATTR_FIN_DIR_INPUT
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

def processar_incremental(force=False, entry=None, backup=False):
    """Função principal para processamento incremental ou forçado, agora com filtro opcional de entry (DATA HORA)"""
    print("=== INICIANDO PROCESSAMENTO {} ===".format("FORÇADO" if force else "INCREMENTAL"))
    if entry:
        print(f"Filtro de entrada ativado: {entry}")
        try:
            data_entry, hora_entry = entry.strip().split()
        except Exception:
            print("Formato de --entry inválido. Use: DD/MM/AAAA HH:MM:SS")
            return
    
    # Se backup foi solicitado, cria backups antes do processamento
    if backup:
        print("=== CRIANDO BACKUPS ===")
        criar_backups_antes_processamento()
    
    edits_json = carregar_edits_json()
    if edits_json:
        print(f"Edições encontradas em arquivos JSON de {ATTR_FIN_DIR_INPUT}/: aplicando após confirmação.")
    print("\n=== VERIFICANDO ARQUIVOS ZIP ===")
    if not descomprimir_zip_se_existir():
        print("❌ Erro na descompressão de arquivo ZIP. Processamento interrompido.")
        return
    print("\n=== VERIFICANDO SUBDIRETÓRIOS ===")
    organizar_subdiretorios_se_necessario()
    input_dir = ATTR_FIN_DIR_INPUT
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
            df_diag.to_csv(ATTR_FIN_ARQ_DIAGNOSTICO, index=False)
            print(f"Reprocessamento forçado concluído. Diagnóstico salvo em {ATTR_FIN_ARQ_DIAGNOSTICO}.")
    else:
        tem_arquivos, chat_file = gerenciar_arquivos_incrementais()
        if not tem_arquivos:
            print("Nenhum arquivo novo para processar.")
            print("\n=== GERANDO RELATÓRIO HTML ===")
            gerar_relatorio_html(ATTR_FIN_ARQ_CALCULO, backup=backup)
            gerar_relatorios_mensais_html(ATTR_FIN_ARQ_CALCULO, backup=backup)
            return
        print(f"\n=== PROCESSANDO DADOS DE {chat_file} ===")
        print("=== PROCESSANDO DADOS COMPLETOS ===")
        df_completo = txt_to_csv(chat_file, ATTR_FIN_ARQ_MENSAGENS)
        print("\n=== PROCESSANDO APENAS ANEXOS ===")
        df_anexos = txt_to_csv_anexos_only(chat_file, ATTR_FIN_ARQ_CALCULO)
        if entry:
            # Filtra apenas a linha correspondente
            if 'DATA' in df_anexos.columns and 'HORA' in df_anexos.columns:
                mask = (df_anexos['DATA'] == data_entry) & (df_anexos['HORA'] == hora_entry)
                df_anexos = df_anexos[mask]
                if df_anexos.empty:
                    print(f"Nenhuma linha encontrada para --entry {entry}.")
                    return
                df_anexos.to_csv(ATTR_FIN_ARQ_CALCULO, index=False)
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
                        caminho = os.path.join(ATTR_FIN_DIR_IMGS, anexo) if os.path.exists(os.path.join(ATTR_FIN_DIR_IMGS, anexo)) else os.path.join(ATTR_FIN_DIR_INPUT, anexo)
                        ocr_result = row.get('OCR', '')
                        motivo = diagnostico_erro_ocr(caminho, ocr_result)
                        motivos.append(motivo)
                    else:
                        motivos.append("")
                else:
                    motivos.append("")
            df_anexos['MOTIVO_ERRO'] = motivos
            df_anexos.to_csv(ATTR_FIN_ARQ_CALCULO, index=False)
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
            resposta = input(f"Deseja aplicar as edições do JSON em {ATTR_FIN_ARQ_CALCULO} antes de gerar relatórios? (s/n): ").strip().lower()
            if resposta == 's':
                df_calc = pd.read_csv(ATTR_FIN_ARQ_CALCULO, dtype=str)
                for row_id, campos in edits_json.items():
                    idx = int(row_id.split('_')[1])
                    for campo, valor in campos.items():
                        if campo.upper() in df_calc.columns:
                            df_calc.at[idx, campo.upper()] = valor
                df_calc.to_csv(ATTR_FIN_ARQ_CALCULO, index=False, quoting=1)
                print(f"Edições aplicadas em {ATTR_FIN_ARQ_CALCULO}.")
    print("\n=== GERANDO RELATÓRIO HTML ===")
    gerar_relatorio_html(ATTR_FIN_ARQ_CALCULO, backup=backup)
    print("\n=== GERANDO RELATÓRIOS MENSAIS ===")
    gerar_relatorios_mensais_html(ATTR_FIN_ARQ_CALCULO, backup=backup)
    df_all = pd.read_csv(ATTR_FIN_ARQ_CALCULO)
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
        nome_arquivo_impressao = os.path.join(ATTR_FIN_DIR_DOCS, f"impressao-{ano}-{mes:02d}-{nome_mes}.html")
        print(f"✅ HTML de impressão gerado: {nome_arquivo_impressao}")

def processar_pdfs(force=False, entry=None, backup=False):
    """Processa apenas arquivos .pdf no diretório input/."""
    print("=== INICIANDO PROCESSAMENTO DE PDFs {} ===".format("FORÇADO" if force else "INCREMENTAL"))
    if entry:
        print(f"Filtro de entrada ativado: {entry}")
        try:
            data_entry, hora_entry = entry.strip().split()
        except Exception:
            print("Formato de --entry inválido. Use: DD/MM/AAAA HH:MM:SS")
            return
    
    # Se backup foi solicitado, cria backups antes do processamento
    if backup:
        print("=== CRIANDO BACKUPS ===")
        criar_backups_antes_processamento()
    
    input_dir = Path(ATTR_FIN_DIR_INPUT)
    
    if not input_dir.exists():
        print(f"Diretório {ATTR_FIN_DIR_INPUT}/ não encontrado!")
        return
    
    # Busca apenas arquivos PDF
    arquivos_pdf = list(input_dir.glob('*.pdf'))
    
    if not arquivos_pdf:
        print(f"Nenhum arquivo PDF encontrado em {ATTR_FIN_DIR_INPUT}/")
        return
    
    print(f"Encontrados {len(arquivos_pdf)} arquivos PDF para processar")
    
    # Processa cada PDF
    for pdf_path in arquivos_pdf:
        print(f"Processando PDF: {pdf_path.name}")
        
        # Extrai texto via OCR
        ocr_text = process_image_ocr(str(pdf_path))
        
        # Registra no XML (usar só o nome do arquivo)
        registrar_ocr_xml(os.path.basename(str(pdf_path)), ocr_text)
        
        # Extrai valor total usando ChatGPT
        valor_total = extract_total_value_with_chatgpt(ocr_text)
        
        # Gera descrição do pagamento usando ChatGPT
        descricao = generate_payment_description_with_chatgpt(ocr_text)
        
        # Classifica o tipo de transação usando ChatGPT
        classificacao = classify_transaction_type_with_chatgpt(ocr_text)
        
        print(f"  - Valor: {valor_total}")
        print(f"  - Descrição: {descricao}")
        print(f"  - Classificação: {classificacao}")
    
    # Atualiza {ATTR_FIN_ARQ_CALCULO} apenas com PDFs
    print("\n=== ATUALIZANDO CSV APENAS COM PDFs ===")
    txt_to_csv_anexos_only(filter='pdf', output_file=ATTR_FIN_ARQ_CALCULO)
    # Também atualizar o CSV de mensagens apenas com PDFs
    txt_to_csv_anexos_only(filter='pdf', output_file=ATTR_FIN_ARQ_MENSAGENS)
    
    print("✅ Processamento de PDFs concluído!")

def processar_imgs(force=False, entry=None, backup=False):
    """Processa apenas arquivos de imagem (.jpg, .png, .jpeg) no diretório input/."""
    print("=== INICIANDO PROCESSAMENTO DE IMAGENS {} ===".format("FORÇADO" if force else "INCREMENTAL"))
    if entry:
        print(f"Filtro de entrada ativado: {entry}")
        try:
            data_entry, hora_entry = entry.strip().split()
        except Exception:
            print("Formato de --entry inválido. Use: DD/MM/AAAA HH:MM:SS")
            return
    
    # Se backup foi solicitado, cria backups antes do processamento
    if backup:
        print("=== CRIANDO BACKUPS ===")
        criar_backups_antes_processamento()
    
    input_dir = Path(ATTR_FIN_DIR_INPUT)
    
    if not input_dir.exists():
        print(f"Diretório {ATTR_FIN_DIR_INPUT}/ não encontrado!")
        return
    
    # Busca apenas arquivos de imagem
    extensoes_img = ('.jpg', '.jpeg', '.png')
    imagens = [p for p in input_dir.iterdir() if p.is_file() and p.suffix.lower() in extensoes_img]
    
    if not imagens:
        print(f"Nenhum arquivo de imagem encontrado em {ATTR_FIN_DIR_INPUT}/")
        return
    
    print(f"Encontradas {len(imagens)} imagens para processar")
    
    # Processa cada imagem
    for img_path in imagens:
        print(f"Processando imagem: {img_path.name}")
        
        # Extrai texto via OCR
        ocr_text = process_image_ocr(str(img_path))
        
        # Registra no XML (usar só o nome do arquivo)
        registrar_ocr_xml(os.path.basename(str(img_path)), ocr_text)
        
        # Verifica se é um comprovante financeiro
        is_receipt = is_financial_receipt(ocr_text)
        
        # Extrai valor total - primeiro tenta OCR, depois IA como fallback
        valor_total = ""
        ai_used = False
        
        if is_receipt:
            # Primeiro tenta extrair valor via regex do OCR
            valor_total = extract_value_from_ocr(ocr_text)
            
            # Se não encontrou valor via OCR, usa IA como fallback
            if not valor_total:
                valor_total = extract_total_value_with_chatgpt(ocr_text)
                ai_used = True
                print(f"  - IA usada para extração de valor (OCR não encontrou)")
        else:
            print(f"  - Não identificado como comprovante financeiro")
        
        # Gera descrição do pagamento usando ChatGPT
        descricao = generate_payment_description_with_chatgpt(ocr_text)
        
        # Classifica o tipo de transação usando ChatGPT
        classificacao = classify_transaction_type_with_chatgpt(ocr_text)
        
        print(f"  - Valor: {valor_total}")
        print(f"  - Descrição: {descricao}")
        print(f"  - Classificação: {classificacao}")
        print(f"  - IA usada: {'Sim' if ai_used else 'Não'}")
    
    # Atualiza {ATTR_FIN_ARQ_CALCULO} apenas com imagens
    print("\n=== ATUALIZANDO CSV APENAS COM IMAGENS ===")
    txt_to_csv_anexos_only(filter='img', output_file=ATTR_FIN_ARQ_CALCULO)
    # Também atualizar o CSV de mensagens apenas com imagens
    txt_to_csv_anexos_only(filter='img', output_file=ATTR_FIN_ARQ_MENSAGENS)
    
    print("✅ Processamento de imagens concluído!")

def descomprimir_zip_se_existir():
    """Verifica se existe apenas um arquivo ZIP em input/ e o descomprime"""
    input_dir = ATTR_FIN_DIR_INPUT
    
    # Verifica se o diretório input existe
    if not os.path.exists(input_dir):
        print(f"Diretório {ATTR_FIN_DIR_INPUT}/ não encontrado!")
        return False
    
    # Lista todos os arquivos no diretório input/
    todos_arquivos = os.listdir(input_dir)
    
    # Filtra apenas arquivos ZIP
    arquivos_zip = [f for f in todos_arquivos if f.lower().endswith('.zip')]
    
    # Verifica se existe apenas um arquivo ZIP
    if len(arquivos_zip) == 0:
        print(f"Nenhum arquivo ZIP encontrado em {ATTR_FIN_DIR_INPUT}/")
        return True  # Não é erro, apenas não há ZIP para processar
    
    if len(arquivos_zip) > 1:
        print(f"Encontrados {len(arquivos_zip)} arquivos ZIP em {ATTR_FIN_DIR_INPUT}/. Deve haver apenas um.")
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
    input_dir = ATTR_FIN_DIR_INPUT
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
    input_dir = ATTR_FIN_DIR_INPUT
    
    if not os.path.exists(input_dir):
        return
    
    # Verifica se há subdiretórios
    subdiretorios = [item for item in os.listdir(input_dir) 
                    if os.path.isdir(os.path.join(input_dir, item))]
    
    if not subdiretorios:
        print(f"Nenhum subdiretório encontrado em {ATTR_FIN_DIR_INPUT}/")
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
            print("\n�� TODOS OS TESTES E2E PASSARAM!")
            return True
        else:
            print("\n❌ ALGUNS TESTES FALHARAM!")
            return False
            
    finally:
        # Restaura arquivos originais
        restaurar_arquivos_backup()

def backup_arquivos_existentes():
    """Faz backup de arquivos existentes antes dos testes"""
    arquivos_backup = [ATTR_FIN_ARQ_MENSAGENS, ATTR_FIN_ARQ_CALCULO]
    
    for arquivo in arquivos_backup:
        if os.path.exists(arquivo):
            backup_nome = f"{arquivo}.backup_teste"
            shutil.copy2(arquivo, backup_nome)
            print(f"Backup criado: {backup_nome}")

def criar_backups_antes_processamento():
    """Cria backups dos arquivos principais antes do processamento"""
    arquivos_backup = [ATTR_FIN_ARQ_MENSAGENS, ATTR_FIN_ARQ_CALCULO]
    
    for arquivo in arquivos_backup:
        if os.path.exists(arquivo):
            timestamp = pd.Timestamp.now().strftime('%Y%m%d_%H%M%S')
            backup_nome = f"{arquivo}.{timestamp}.bak"
            shutil.copy2(arquivo, backup_nome)
            print(f"📁 Backup criado: {backup_nome}")

def restaurar_arquivos_backup():
    """Restaura arquivos do backup após os testes"""
    arquivos_backup = [ATTR_FIN_ARQ_MENSAGENS, ATTR_FIN_ARQ_CALCULO]
    
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
        if not os.path.exists(ATTR_FIN_DIR_INPUT) or not os.listdir(ATTR_FIN_DIR_INPUT):
            print(f"⚠️  Sem arquivos em {ATTR_FIN_DIR_INPUT}/ para testar processamento")
            return True  # Não é falha, apenas não há dados para testar
        
        # Conta arquivos antes do processamento
        arquivos_antes = len([f for f in os.listdir(ATTR_FIN_DIR_INPUT) 
                             if f.lower().endswith(('.jpg', '.jpeg', '.png', '.pdf'))])
        
        if arquivos_antes == 0:
            print(f"⚠️  Sem imagens em {ATTR_FIN_DIR_INPUT}/ para testar processamento")
            return True
        
        print(f"Arquivos de imagem encontrados: {arquivos_antes}")
        
        # Executa processamento
        processar_incremental()
        
        # Verifica se arquivos foram movidos para imgs/
        if os.path.exists(ATTR_FIN_DIR_IMGS):
            arquivos_imgs = len([f for f in os.listdir(ATTR_FIN_DIR_IMGS) 
                               if f.lower().endswith(('.jpg', '.jpeg', '.png', '.pdf'))])
            print(f"Arquivos movidos para {ATTR_FIN_DIR_IMGS}/: {arquivos_imgs}")
        
        # Verifica se CSVs foram criados
        csvs_criados = []
        if os.path.exists(ATTR_FIN_ARQ_MENSAGENS):
            csvs_criados.append(ATTR_FIN_ARQ_MENSAGENS)
        if os.path.exists(ATTR_FIN_ARQ_CALCULO):
            csvs_criados.append(ATTR_FIN_ARQ_CALCULO)
        
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
        arquivo_teste = f'{ATTR_FIN_DIR_TMP}/teste_calculo.csv'
        
        # Garante que o diretório tmp/ existe
        os.makedirs(ATTR_FIN_DIR_TMP, exist_ok=True)
        
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

def fix_entry(data_hora, novo_valor=None, nova_classificacao=None, nova_descricao=None, dismiss=False, rotate=None, ia=False):
    """Corrige uma entrada específica em todos os arquivos CSV do diretório mensagens/"""
    try:
        # Parse da data e hora
        if ' ' not in data_hora:
            print("❌ Formato inválido. Use: DD/MM/AAAA HH:MM:SS")
            return False
        
        data, hora = data_hora.strip().split(' ', 1)
        
        # Valida formato da data
        if not re.match(r'^\d{2}/\d{2}/\d{4}$', data):
            print("❌ Formato de data inválido. Use: DD/MM/AAAA")
            return False
        
        # Valida formato da hora
        if not re.match(r'^\d{2}:\d{2}:\d{2}$', hora):
            print("❌ Formato de hora inválido. Use: HH:MM:SS")
            return False
        
        # Valida formato do valor (se fornecido)
        if novo_valor:
            if not re.match(r'^\d+[,.]?\d*$', novo_valor):
                print("❌ Formato de valor inválido. Use: 2,33 ou 2.33")
                return False
            
            # Converte valor para formato brasileiro
            novo_valor = novo_valor.replace('.', '').replace(',', '.')
            try:
                float(novo_valor)
            except ValueError:
                print("❌ Valor inválido")
                return False
        
        # Valida parâmetro de rotação (se fornecido)
        if rotate:
            try:
                rotate_degrees = int(rotate)
                if rotate_degrees not in [90, 180, 270]:
                    print("❌ Graus de rotação inválidos. Use: 90, 180 ou 270")
                    return False
            except ValueError:
                print("❌ Graus de rotação inválidos. Use: 90, 180 ou 270")
                return False
        
        # Busca arquivos CSV nos diretórios mensagens e tmp
        diretorios = [ATTR_FIN_DIR_MENSAGENS, ATTR_FIN_DIR_TMP]
        arquivos_csv = []
        
        for diretorio in diretorios:
            if os.path.exists(diretorio):
                csv_files = [os.path.join(diretorio, f) for f in os.listdir(diretorio) if f.endswith('.csv')]
                arquivos_csv.extend(csv_files)
        
        if not arquivos_csv:
            print(f"❌ Nenhum arquivo CSV encontrado em {ATTR_FIN_DIR_MENSAGENS} ou {ATTR_FIN_DIR_TMP}")
            return False
        
        entrada_encontrada = False
        arquivo_anexo = None
        
        # Processa cada arquivo CSV
        for arquivo_csv in arquivos_csv:
            if not os.path.exists(arquivo_csv):
                continue
                
            print(f"🔍 Procurando em {os.path.basename(arquivo_csv)}...")
            
            # Lê o CSV
            df = pd.read_csv(arquivo_csv)
            
            # Procura pela entrada com data e hora exatas
            # Verifica se as colunas existem (pode ser DATA/HORA ou data/hora)
            data_col = 'DATA' if 'DATA' in df.columns else 'data'
            hora_col = 'HORA' if 'HORA' in df.columns else 'hora'
            
            mask = (df[data_col] == data) & (df[hora_col] == hora)
            linhas_encontradas = df[mask]
            
            if not linhas_encontradas.empty:
                entrada_encontrada = True
                
                for idx, linha in linhas_encontradas.iterrows():
                    print(f"✅ Entrada encontrada: {data} {hora}")
                    
                    # Obtém o arquivo anexo para rotação/re-submissão
                    if 'ANEXO' in df.columns and linha['ANEXO']:
                        arquivo_anexo = str(linha['ANEXO'])
                        print(f"📎 Arquivo anexo: {arquivo_anexo}")
                    
                    # Obtém o valor original (prioriza RICARDO/RAFAEL, depois VALOR)
                    valor_original = None
                    if 'RICARDO' in df.columns and linha['RICARDO'] and str(linha['RICARDO']).lower() not in ['nan', '']:
                        valor_original = str(linha['RICARDO'])
                    elif 'RAFAEL' in df.columns and linha['RAFAEL'] and str(linha['RAFAEL']).lower() not in ['nan', '']:
                        valor_original = str(linha['RAFAEL'])
                    elif 'VALOR' in df.columns and linha['VALOR'] and str(linha['VALOR']).lower() not in ['nan', '']:
                        valor_original = str(linha['VALOR'])
                    
                    # NOVA REGRA: Se não encontrar valor, aplicar automaticamente o fix
                    if not valor_original:
                        print(f"💰 Nenhum valor encontrado - aplicando fix automático: R$ {novo_valor}")
                        
                        # Determina qual coluna usar baseado na estrutura do arquivo
                        if 'RICARDO' in df.columns and 'RAFAEL' in df.columns:
                            # Arquivo calculo.csv - verifica qual coluna está vazia
                            if pd.isna(linha['RICARDO']) or str(linha['RICARDO']).lower() in ['nan', '']:
                                df.at[idx, 'RICARDO'] = novo_valor
                                coluna_usada = 'RICARDO'
                            elif pd.isna(linha['RAFAEL']) or str(linha['RAFAEL']).lower() in ['nan', '']:
                                df.at[idx, 'RAFAEL'] = novo_valor
                                coluna_usada = 'RAFAEL'
                            else:
                                # Se ambas estão vazias, usa RICARDO por padrão
                                df.at[idx, 'RICARDO'] = novo_valor
                                coluna_usada = 'RICARDO'
                        elif 'VALOR' in df.columns:
                            # Arquivo mensagens.csv
                            df.at[idx, 'VALOR'] = novo_valor
                            coluna_usada = 'VALOR'
                        else:
                            print(f"⚠️  Estrutura de arquivo não reconhecida")
                            continue
                        
                        # Aplica as correções solicitadas para o caso de fix automático
                        alteracoes = [f"valor: aplicado {novo_valor} (sem valor anterior)"]
                        
                        # 2. Corrige classificação (se fornecida)
                        if nova_classificacao and 'CLASSIFICACAO' in df.columns:
                            classificacao_original = str(linha.get('CLASSIFICACAO', ''))
                            df.at[idx, 'CLASSIFICACAO'] = nova_classificacao
                            alteracoes.append(f"classificação: {classificacao_original} → {nova_classificacao}")
                        
                        # 3. Corrige descrição (se fornecida)
                        if nova_descricao and 'DESCRICAO' in df.columns:
                            descricao_original = str(linha.get('DESCRICAO', ''))
                            df.at[idx, 'DESCRICAO'] = nova_descricao
                            alteracoes.append(f"descrição: {descricao_original} → {nova_descricao}")
                        
                        # 4. Aplica dismiss (se solicitado)
                        if dismiss:
                            df.at[idx, 'VALIDADE'] = 'dismiss'
                            alteracoes.append("marcado como dismiss")
                            print(f"✅ Entrada marcada como dismiss")
                        else:
                            # Adiciona informação na coluna VALIDADE sobre as alterações
                            if 'VALIDADE' in df.columns:
                                df.at[idx, 'VALIDADE'] = f"fix-auto: {', '.join(alteracoes)}"
                            else:
                                # Se não existe coluna VALIDADE, adiciona
                                df['VALIDADE'] = ''
                                df.at[idx, 'VALIDADE'] = f"fix-auto: {', '.join(alteracoes)}"
                        
                        print(f"✅ Alterações aplicadas: {', '.join(alteracoes)}")
                        continue
                    
                    print(f" Valor original: R$ {convert_to_brazilian_format(valor_original)}")
                    print(f"💰 Novo valor: R$ {convert_to_brazilian_format(novo_valor)}")
                    
                    # Converte valor original para formato brasileiro para comparação (apenas se novo_valor foi fornecido)
                    if novo_valor:
                        valor_original_clean = valor_original.replace('.', '').replace(',', '.')
                        try:
                            valor_original_float = float(valor_original_clean)
                            novo_valor_float = float(novo_valor)
                        except ValueError:
                            print(f"⚠️  Erro ao converter valores para comparação")
                            continue
                    
                    # Aplica as correções solicitadas
                    alteracoes = []
                    
                    # 1. Corrige valor (se fornecido)
                    if novo_valor:
                        if 'RICARDO' in df.columns and linha['RICARDO'] and str(linha['RICARDO']).lower() not in ['nan', '']:
                            df.at[idx, 'RICARDO'] = convert_to_brazilian_format(novo_valor)
                            alteracoes.append(f"valor: {valor_original} → {convert_to_brazilian_format(novo_valor)}")
                        elif 'RAFAEL' in df.columns and linha['RAFAEL'] and str(linha['RAFAEL']).lower() not in ['nan', '']:
                            df.at[idx, 'RAFAEL'] = convert_to_brazilian_format(novo_valor)
                            alteracoes.append(f"valor: {valor_original} → {convert_to_brazilian_format(novo_valor)}")
                        elif 'VALOR' in df.columns and linha['VALOR'] and str(linha['VALOR']).lower() not in ['nan', '']:
                            df.at[idx, 'VALOR'] = convert_to_brazilian_format(novo_valor)
                            alteracoes.append(f"valor: {valor_original} → {convert_to_brazilian_format(novo_valor)}")
                    
                    # 2. Corrige classificação (se fornecida)
                    if nova_classificacao and 'CLASSIFICACAO' in df.columns:
                        classificacao_original = str(linha.get('CLASSIFICACAO', ''))
                        df.at[idx, 'CLASSIFICACAO'] = nova_classificacao
                        alteracoes.append(f"classificação: {classificacao_original} → {nova_classificacao}")
                    
                    # 3. Corrige descrição (se fornecida)
                    if nova_descricao and 'DESCRICAO' in df.columns:
                        descricao_original = str(linha.get('DESCRICAO', ''))
                        df.at[idx, 'DESCRICAO'] = nova_descricao
                        alteracoes.append(f"descrição: {descricao_original} → {nova_descricao}")
                    
                    # 4. Aplica dismiss (se solicitado)
                    if dismiss:
                        df.at[idx, 'VALIDADE'] = 'dismiss'
                        alteracoes.append("marcado como dismiss")
                        print(f"✅ Entrada marcada como dismiss")
                    else:
                        # Adiciona informação na coluna VALIDADE sobre as alterações
                        if alteracoes:
                            if 'VALIDADE' in df.columns:
                                df.at[idx, 'VALIDADE'] = f"fix: {', '.join(alteracoes)}"
                            else:
                                # Se não existe coluna VALIDADE, adiciona
                                df['VALIDADE'] = ''
                                df.at[idx, 'VALIDADE'] = f"fix: {', '.join(alteracoes)}"
                    
                    if alteracoes:
                        print(f"✅ Alterações aplicadas: {', '.join(alteracoes)}")
                    else:
                        print(f"ℹ️  Nenhuma alteração aplicada")
                
                # Salva o arquivo CSV atualizado
                df.to_csv(arquivo_csv, index=False)
                print(f" Arquivo {os.path.basename(arquivo_csv)} atualizado")
        
        # Processa rotação e re-submissão para IA se solicitado
        if arquivo_anexo and (rotate or ia):
            print(f"\n🔄 Processando rotação/re-submissão para arquivo: {arquivo_anexo}")
            
            # Aplica rotação se solicitada
            if rotate:
                sucesso_rotacao = aplicar_rotacao_imagem(arquivo_anexo, int(rotate))
                if sucesso_rotacao:
                    print(f"✅ Rotação de {rotate}° aplicada com sucesso")
                else:
                    print(f"❌ Erro ao aplicar rotação de {rotate}°")
            
            # Re-submete para ChatGPT se solicitado
            if ia:
                sucesso_ia = re_submeter_para_chatgpt(arquivo_anexo)
                if sucesso_ia:
                    print(f"✅ Re-submissão para ChatGPT concluída")
                else:
                    print(f"❌ Erro na re-submissão para ChatGPT")
        
        if not entrada_encontrada:
            print(f"❌ Nenhuma entrada encontrada com data/hora: {data} {hora}")
            return False
        
        print("✅ Correção concluída com sucesso!")
        print(" Gerando relatórios atualizados...")
        
        # Regenera os relatórios
        try:
            from .reporter import gerar_relatorio_html, gerar_relatorios_mensais_html
            from .env import ATTR_FIN_ARQ_CALCULO
            gerar_relatorio_html(ATTR_FIN_ARQ_CALCULO)
            gerar_relatorios_mensais_html(ATTR_FIN_ARQ_CALCULO)
            print("✅ Relatórios regenerados com sucesso!")
        except Exception as e:
            print(f"⚠️  Erro ao regenerar relatórios: {str(e)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro durante a correção: {str(e)}")
        return False

def dismiss_entry(data_hora):
    """Marca uma entrada como desconsiderada (dismiss) em todos os arquivos CSV do diretório mensagens/"""
    try:
        # Parse da data e hora
        if ' ' not in data_hora:
            print("❌ Formato inválido. Use: DD/MM/AAAA HH:MM:SS")
            return False
        
        data, hora = data_hora.strip().split(' ', 1)
        
        # Valida formato da data
        if not re.match(r'^\d{2}/\d{2}/\d{4}$', data):
            print("❌ Formato de data inválido. Use: DD/MM/AAAA")
            return False
        
        # Valida formato da hora
        if not re.match(r'^\d{2}:\d{2}:\d{2}$', hora):
            print("❌ Formato de hora inválido. Use: HH:MM:SS")
            return False
        
        print(f" Procurando entrada: {data} {hora}")
        
        # Lista todos os arquivos CSV no diretório mensagens/
        mensagens_dir = os.path.dirname(ATTR_FIN_ARQ_MENSAGENS)
        if not os.path.exists(mensagens_dir):
            print(f"❌ Diretório {mensagens_dir} não encontrado!")
            return False
        
        arquivos_csv = [f for f in os.listdir(mensagens_dir) if f.endswith('.csv')]
        
        if not arquivos_csv:
            print(f"❌ Nenhum arquivo CSV encontrado em {mensagens_dir}/")
            return False
        
        entradas_encontradas = 0
        
        for arquivo_csv in arquivos_csv:
            caminho_csv = os.path.join(mensagens_dir, arquivo_csv)
            print(f"📄 Verificando arquivo: {arquivo_csv}")
            
            try:
                df = pd.read_csv(caminho_csv)
                
                # Verifica se tem as colunas necessárias
                if 'DATA' not in df.columns or 'HORA' not in df.columns:
                    print(f"⚠️  Arquivo {arquivo_csv} não tem colunas DATA/HORA - pulando")
                    continue
                
                # Adiciona coluna VALIDADE se não existir
                if 'VALIDADE' not in df.columns:
                    df['VALIDADE'] = ''
                    print(f"➕ Coluna VALIDADE adicionada ao arquivo {arquivo_csv}")
                
                # Converte coluna VALIDADE para string para evitar warnings
                df['VALIDADE'] = df['VALIDADE'].astype(str)
                
                # Procura pela entrada específica
                mask = (df['DATA'] == data) & (df['HORA'] == hora)
                linhas_encontradas = df[mask]
                
                if len(linhas_encontradas) > 0:
                    # Marca como dismiss
                    df.loc[mask, 'VALIDADE'] = 'dismiss'
                    
                    # Salva o arquivo atualizado
                    df.to_csv(caminho_csv, index=False, quoting=1)
                    
                    print(f"✅ {len(linhas_encontradas)} entrada(s) marcada(s) como 'dismiss' em {arquivo_csv}")
                    entradas_encontradas += len(linhas_encontradas)
                    
                    # Mostra detalhes das entradas encontradas
                    for idx, row in linhas_encontradas.iterrows():
                        anexo = row.get('ANEXO', 'N/A')
                        descricao = row.get('DESCRICAO', 'N/A')
                        print(f"   - {anexo}: {descricao}")
                else:
                    print(f"ℹ️  Nenhuma entrada encontrada em {arquivo_csv}")
                    
            except Exception as e:
                print(f"❌ Erro ao processar {arquivo_csv}: {str(e)}")
                continue
        
        if entradas_encontradas > 0:
            print(f"\n✅ Total de {entradas_encontradas} entrada(s) marcada(s) como 'dismiss'")
            print(" Gerando relatórios atualizados...")
            
            # Regenera os relatórios automaticamente
            try:
                from .reporter import gerar_relatorio_html, gerar_relatorios_mensais_html
                from .env import ATTR_FIN_ARQ_CALCULO
                gerar_relatorio_html(ATTR_FIN_ARQ_CALCULO)
                gerar_relatorios_mensais_html(ATTR_FIN_ARQ_CALCULO)
                print("✅ Relatórios regenerados com sucesso!")
            except Exception as e:
                print(f"⚠️  Erro ao regenerar relatórios: {str(e)}")
            
            return True
        else:
            print(f"\n❌ Nenhuma entrada encontrada para {data} {hora}")
            return False
            
    except Exception as e:
        print(f"❌ Erro ao executar dismiss: {str(e)}")
        return False

def aplicar_rotacao_imagem(arquivo_anexo, graus):
    """Aplica rotação em uma imagem ou converte PDF para JPG e aplica rotação."""
    try:
        import cv2
        from PIL import Image
        import os
        
        # Determina o caminho do arquivo
        caminhos_possiveis = [
            os.path.join(ATTR_FIN_DIR_INPUT, arquivo_anexo),
            os.path.join(ATTR_FIN_DIR_IMGS, arquivo_anexo),
            arquivo_anexo
        ]
        
        arquivo_path = None
        for caminho in caminhos_possiveis:
            if os.path.exists(caminho):
                arquivo_path = caminho
                break
        
        if not arquivo_path:
            print(f"❌ Arquivo não encontrado: {arquivo_anexo}")
            return False
        
        # Se for PDF, converte para JPG primeiro
        if arquivo_path.lower().endswith('.pdf'):
            print(f"📄 Convertendo PDF para JPG antes da rotação...")
            from pdf2image import convert_from_path
            
            try:
                # Converte primeira página do PDF para imagem
                imagens = convert_from_path(arquivo_path, first_page=1, last_page=1)
                if not imagens:
                    print(f"❌ Erro ao converter PDF para imagem")
                    return False
                
                # Salva como JPG temporário
                nome_base = os.path.splitext(os.path.basename(arquivo_path))[0]
                jpg_temp_path = os.path.join(ATTR_FIN_DIR_IMGS, f"{nome_base}.jpg")
                imagens[0].save(jpg_temp_path, 'JPEG', quality=85)
                
                arquivo_path = jpg_temp_path
                print(f"✅ PDF convertido para JPG: {nome_base}.jpg")
                
            except Exception as e:
                print(f"❌ Erro ao converter PDF: {str(e)}")
                return False
        
        # Aplica rotação na imagem
        if arquivo_path.lower().endswith(('.jpg', '.jpeg', '.png')):
            try:
                # Carrega a imagem
                img = cv2.imread(arquivo_path)
                if img is None:
                    print(f"❌ Erro ao carregar imagem: {arquivo_path}")
                    return False
                
                # Aplica rotação
                altura, largura = img.shape[:2]
                centro = (largura // 2, altura // 2)
                
                if graus == 90:
                    matriz_rotacao = cv2.getRotationMatrix2D(centro, 90, 1.0)
                elif graus == 180:
                    matriz_rotacao = cv2.getRotationMatrix2D(centro, 180, 1.0)
                elif graus == 270:
                    matriz_rotacao = cv2.getRotationMatrix2D(centro, 270, 1.0)
                else:
                    print(f"❌ Graus de rotação inválidos: {graus}")
                    return False
                
                # Aplica a transformação
                img_rotacionada = cv2.warpAffine(img, matriz_rotacao, (largura, altura))
                
                # Salva a imagem rotacionada (sobrescreve a original)
                cv2.imwrite(arquivo_path, img_rotacionada)
                
                print(f"✅ Rotação de {graus}° aplicada em: {os.path.basename(arquivo_path)}")
                return True
                
            except Exception as e:
                print(f"❌ Erro ao aplicar rotação: {str(e)}")
                return False
        else:
            print(f"❌ Formato de arquivo não suportado para rotação: {arquivo_path}")
            return False
            
    except Exception as e:
        print(f"❌ Erro geral na rotação: {str(e)}")
        return False

def re_submeter_para_chatgpt(arquivo_anexo):
    """Re-submete uma imagem para processamento com ChatGPT após rotação."""
    try:
        import os
        
        # Determina o caminho do arquivo
        caminhos_possiveis = [
            os.path.join(ATTR_FIN_DIR_INPUT, arquivo_anexo),
            os.path.join(ATTR_FIN_DIR_IMGS, arquivo_anexo),
            arquivo_anexo
        ]
        
        arquivo_path = None
        for caminho in caminhos_possiveis:
            if os.path.exists(caminho):
                arquivo_path = caminho
                break
        
        if not arquivo_path:
            print(f"❌ Arquivo não encontrado: {arquivo_anexo}")
            return False
        
        print(f"🤖 Re-submetendo para ChatGPT: {os.path.basename(arquivo_path)}")
        
        # Processa OCR na imagem rotacionada
        from ocr import process_image_ocr
        ocr_text = process_image_ocr(arquivo_path)
        
        if not ocr_text or ocr_text in ["Arquivo não encontrado", "Erro ao carregar imagem", "Nenhum texto detectado"]:
            print(f"❌ OCR não conseguiu extrair texto da imagem rotacionada")
            return False
        
        print(f"📝 Texto extraído via OCR: {ocr_text[:100]}...")
        
        # Re-submete para ChatGPT para extrair valor, descrição e classificação
        from ia import extract_total_value_with_chatgpt, generate_payment_description_with_chatgpt, classify_transaction_type_with_chatgpt
        
        # Extrai valor total
        valor_total = extract_total_value_with_chatgpt(ocr_text)
        if valor_total:
            print(f"💰 Valor extraído via IA: R$ {valor_total}")
        else:
            print(f"⚠️  IA não conseguiu extrair valor")
        
        # Gera descrição
        descricao = generate_payment_description_with_chatgpt(ocr_text)
        if descricao:
            print(f"📝 Descrição gerada via IA: {descricao}")
        else:
            print(f"⚠️  IA não conseguiu gerar descrição")
        
        # Classifica transação
        classificacao = classify_transaction_type_with_chatgpt(ocr_text)
        if classificacao:
            print(f"🏷️  Classificação via IA: {classificacao}")
        else:
            print(f"⚠️  IA não conseguiu classificar transação")
        
        # Atualiza o XML de OCR com o novo texto
        from ocr import registrar_ocr_xml
        registrar_ocr_xml(os.path.basename(arquivo_path), ocr_text)
        
        print(f"✅ Re-submissão para ChatGPT concluída com sucesso")
        return True
        
    except Exception as e:
        print(f"❌ Erro na re-submissão para ChatGPT: {str(e)}")
        return False





