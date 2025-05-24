import pandas as pd
import sys
import re
import os
from PIL import Image
import pytesseract
import cv2
import numpy as np
from openai import OpenAI

def process_image_ocr(image_path):
    """Processa uma imagem e extrai texto usando OCR"""
    try:
        # Adiciona o prefixo imgs/ se o arquivo não começar com imgs/
        if not image_path.startswith('imgs/'):
            image_path = os.path.join('imgs', image_path)
            
        if not os.path.exists(image_path):
            return "Arquivo não encontrado"
        
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
    
    # Processa OCR para cada anexo que é uma imagem
    print("Processando OCR das imagens...")
    for idx, row in df.iterrows():
        if row['anexo'] and (row['anexo'].endswith('.jpg') or row['anexo'].endswith('.jpeg') or row['anexo'].endswith('.png')):
            print(f"Processando OCR: {row['anexo']}")
            ocr_result = process_image_ocr(row['anexo'])
            df.at[idx, 'OCR'] = ocr_result
    
    # Remove a coluna bruta e salva o CSV
    df.drop(columns=['raw'], inplace=True)
    df.to_csv(output_file, index=False)
    print(f"CSV completo salvo: {output_file}")

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
    
    # Ordena por data
    df = df.sort_values('DATA_DT').reset_index(drop=True)
    
    # Lista para armazenar as novas linhas
    linhas_totalizacao = []
    
    # Agrupa por mês/ano
    df['MES_ANO'] = df['DATA_DT'].dt.to_period('M')
    meses_unicos = df['MES_ANO'].dropna().unique()
    
    # Para cada mês, calcula totais e adiciona linha de totalização
    for mes_periodo in sorted(meses_unicos):
        # Filtra dados do mês
        dados_mes = df[df['MES_ANO'] == mes_periodo]
        
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
    
    # Adiciona as linhas de totalização ao DataFrame
    if linhas_totalizacao:
        df_totalizacao = pd.DataFrame(linhas_totalizacao)
        df_combinado = pd.concat([df, df_totalizacao], ignore_index=True)
        # Reordena por data/hora
        df_combinado = df_combinado.sort_values(['DATA_DT', 'HORA']).reset_index(drop=True)
    else:
        df_combinado = df
    
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
    
    # Processa OCR e extração de valor para cada anexo que é uma imagem
    print("Processando OCR das imagens (apenas anexos)...")
    for idx, row in df_anexos.iterrows():
        if row['ANEXO'] and (row['ANEXO'].endswith('.jpg') or row['ANEXO'].endswith('.jpeg') or row['ANEXO'].endswith('.png')):
            print(f"Processando OCR: {row['ANEXO']}")
            ocr_result = process_image_ocr(row['ANEXO'])
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
    
    # Remove a coluna bruta e reordena as colunas conforme especificado
    df_anexos.drop(columns=['raw'], inplace=True)
    
    # Adiciona linhas de totalização mensal
    df_anexos = adicionar_totalizacao_mensal(df_anexos)
    
    # Reordena as colunas na ordem desejada: DATA, HORA, REMETENTE, CLASSIFICACAO, RICARDO, RAFAEL, ANEXO, DESCRICAO, VALOR, OCR
    ordem_colunas = ['DATA', 'HORA', 'REMETENTE', 'CLASSIFICACAO', 'RICARDO', 'RAFAEL', 'ANEXO', 'DESCRICAO', 'VALOR', 'OCR']
    df_anexos = df_anexos[ordem_colunas]
    
    df_anexos.to_csv(output_file, index=False, quoting=1)  # quoting=1 (QUOTE_ALL) garante que strings com vírgulas sejam tratadas corretamente
    print(f"CSV apenas anexos salvo: {output_file}")
    print(f"Total de anexos processados: {len(df_anexos)}")
    
    # Calcula e exibe totais por remetente
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
    
    print(f"Total Ricardo: R$ {total_ricardo:.2f}")
    print(f"Total Rafael: R$ {total_rafael:.2f}")
    print(f"Total Geral: R$ {(total_ricardo + total_rafael):.2f}")

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

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso:")
        print("  python app.py processar <arquivo_entrada.txt> <arquivo_saida.csv>")
        print("  python app.py verificar <arquivo_csv>")
        sys.exit(1)
    
    comando = sys.argv[1]
    
    if comando == "processar":
        if len(sys.argv) != 4:
            print("Uso: python app.py processar <arquivo_entrada.txt> <arquivo_saida.csv>")
            sys.exit(1)
            
        input_file = sys.argv[2]
        output_file = sys.argv[3]
        
        # Executa a funcionalidade original (completa)
        print("=== PROCESSANDO DADOS COMPLETOS ===")
        txt_to_csv(input_file, output_file)
        
        # Executa a nova funcionalidade (apenas anexos)
        print("\n=== PROCESSANDO APENAS ANEXOS ===")
        calculo_file = "calculo.csv"
        txt_to_csv_anexos_only(input_file, calculo_file)
        
    elif comando == "verificar":
        if len(sys.argv) != 3:
            print("Uso: python app.py verificar <arquivo_csv>")
            sys.exit(1)
            
        csv_file = sys.argv[2]
        verificar_totais(csv_file)
        
    else:
        print("Comando inválido. Use 'processar' ou 'verificar'")
        sys.exit(1)

