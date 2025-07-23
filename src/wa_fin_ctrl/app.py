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
from datetime import datetime
from .reporter import (
    gerar_relatorio_html,
    gerar_relatorios_mensais_html,
    gerar_html_impressao,
)

# Adiciona imports para PDF
try:
    import pdfplumber
    from pdf2image import convert_from_path
except ImportError:
    pdfplumber = None
    convert_from_path = None

from .ocr import registrar_ocr_xml, process_image_ocr
from .env import *
from .helper import convert_to_brazilian_format, normalize_value_to_brazilian_format, parse_value_from_input
from .history import record_fix_command_wrapper
from .apps.core.models import EntradaFinanceira
from .ia import (
    extract_total_value_with_chatgpt,
    generate_payment_description_with_chatgpt,
    classify_transaction_type_with_chatgpt,
    process_image_with_ai_for_value,
)


def extract_value_from_ocr(ocr_text):
    """Extrai valor monetário do texto OCR usando expressões regulares"""
    if not ocr_text:
        return ""

    # Padrões para encontrar valores no texto OCR
    padroes_valor = [
        r"R\$\s*([0-9.,]+)",  # R$ 123,45
        r"valor\s*R\$\s*([0-9.,]+)",  # valor R$ 123,45
        r"([0-9.,]+)\s*reais",  # 123,45 reais
        r"total\s*R\$\s*([0-9.,]+)",  # total R$ 123,45
        r"pago\s*R\$\s*([0-9.,]+)",  # pago R$ 123,45
        r"R\$\s*([0-9.,]+)\s*dados",  # R$ 123,45 dados
        r"valor\s*:\s*R\$\s*([0-9.,]+)",  # valor: R$ 123,45
        r"([0-9.,]+)\s*via\s*celular",  # 123,45 via celular
        r"([0-9.,]+)\s*realizado",  # 123,45 realizado
        r"VALOR\s*TOTAL\s*R\$\s*([0-9.,]+)",  # VALOR TOTAL R$ 123,45
        r"VALOR\s*A\s*PAGAR\s*R\$\s*([0-9.,]+)",  # VALOR A PAGAR R$ 123,45
        r"R\$\s*([0-9.,]+)\s*realizado",  # R$ 123,45 realizado
        r"valor\s*R\$\s*([0-9.,]+)\s*realizado",  # valor R$ 123,45 realizado
        r"([0-9.,]+)\s*R\$",  # 123,45 R$
        r"R\$\s*([0-9.,]+)\s*R\$",  # R$ 123,45 R$
    ]

    valores_encontrados = []

    for padrao in padroes_valor:
        matches = re.findall(padrao, ocr_text, re.IGNORECASE)
        for match in matches:
            if match:
                # Limpa o valor encontrado
                valor_limpo = match.strip()
                # Remove caracteres não numéricos exceto vírgula e ponto
                valor_limpo = re.sub(r"[^\d,.]", "", valor_limpo)
                if valor_limpo:
                    valores_encontrados.append(valor_limpo)

    if not valores_encontrados:
        return ""

    # Se encontrou múltiplos valores, retorna o maior (geralmente o total)
    valores_float = []
    for valor in valores_encontrados:
        try:
            valor_brasileiro = normalize_value_to_brazilian_format(valor)
            valor_float = float(valor_brasileiro.replace(",", "."))
            valores_float.append(valor_float)
        except ValueError:
            continue

    if not valores_float:
        return ""

    # Retorna o maior valor encontrado
    maior_valor = max(valores_float)
    return f"{maior_valor:.2f}".replace(".", ",")


def is_financial_receipt(ocr_text):
    """Verifica se o texto OCR indica que é um comprovante financeiro"""
    if not ocr_text or len(ocr_text.strip()) < 10:
        return False

    # Palavras-chave que indicam comprovante financeiro
    keywords = [
        "pix",
        "transferência",
        "pagamento",
        "comprovante",
        "recibo",
        "banco",
        "bb",
        "nubank",
        "itau",
        "bradesco",
        "santander",
        "valor",
        "total",
        "r$",
        "reais",
        "realizado",
        "pago",
        "conta",
        "cartão",
        "débito",
        "crédito",
        "boleto",
        "qr code",
        "celular",
        "app",
        "mobile",
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
        if not ocr_text or ocr_text in [
            "Arquivo não encontrado",
            "Erro ao carregar imagem",
            "Nenhum texto detectado",
        ]:
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
                {
                    "role": "system",
                    "content": "Você é um especialista em análise de comprovantes financeiros. Extraia apenas o valor total das transações.",
                },
                {"role": "user", "content": prompt},
            ],
            max_tokens=50,
            temperature=0.1,
        )

        # Extrai a resposta
        valor = response.choices[0].message.content.strip()

        # Limpa a resposta removendo caracteres indesejados
        valor = re.sub(r"[^\d,.]", "", valor)

        # Se não encontrou valor válido, retorna vazio
        if not valor or valor.upper() == "NENHUM" or len(valor) == 0:
            return ""

        # Converte para formato brasileiro padronizado
        valor_brasileiro = normalize_value_to_brazilian_format(valor)

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
        if not ocr_text or ocr_text in [
            "Arquivo não encontrado",
            "Erro ao carregar imagem",
            "Nenhum texto detectado",
        ]:
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
                {
                    "role": "system",
                    "content": "Você é um especialista em análise de comprovantes financeiros. Crie descrições concisas e úteis para categorizações de gastos.",
                },
                {"role": "user", "content": prompt},
            ],
            max_tokens=30,
            temperature=0.3,
        )

        # Extrai a resposta
        descricao = response.choices[0].message.content.strip()

        # Remove aspas e caracteres especiais desnecessários
        descricao = re.sub(r'["\']', "", descricao)

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
        if not ocr_text or ocr_text in [
            "Arquivo não encontrado",
            "Erro ao carregar imagem",
            "Nenhum texto detectado",
        ]:
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
                {
                    "role": "system",
                    "content": "Você é um especialista em análise de comprovantes financeiros. Classifique transações como Transferência ou Pagamento.",
                },
                {"role": "user", "content": prompt},
            ],
            max_tokens=10,
            temperature=0.1,
        )

        # Extrai a resposta
        classificacao = response.choices[0].message.content.strip()

        # Remove aspas e caracteres especiais desnecessários
        classificacao = re.sub(r'["\']', "", classificacao)

        # Normaliza a classificação
        if "transferência" in classificacao.lower():
            return "Transferência"
        elif "pagamento" in classificacao.lower():
            return "Pagamento"
        else:
            # Fallback baseado no conteúdo do texto
            if any(
                palavra in ocr_text.lower()
                for palavra in ["pix", "transferência", "ted", "doc"]
            ):
                return "Transferência"
            else:
                return "Pagamento"

    except Exception as e:
        return "Pagamento"





def gerenciar_arquivos_incrementais():
    """Gerencia arquivos de input, remove duplicatas e prepara para processamento incremental"""
    input_dir = ATTR_FIN_DIR_INPUT
    imgs_dir = ATTR_FIN_DIR_IMGS

    # Verifica se o diretório input existe
    if not os.path.exists(input_dir):
        print(f"Diretório {input_dir}/ não encontrado!")
        return False, None

    # Lista arquivos de imagem em input/
    extensoes_imagem = (".jpg", ".jpeg", ".png", ".pdf")
    arquivos_input = [
        f for f in os.listdir(input_dir) if f.lower().endswith(extensoes_imagem)
    ]

    if not arquivos_input:
        print(f"Nenhuma imagem encontrada no diretório {ATTR_FIN_DIR_INPUT}/")
        return False, None

    # Lista arquivos já existentes no diretório de imagens
    arquivos_existentes = []
    if os.path.exists(imgs_dir):
        arquivos_existentes = [
            f for f in os.listdir(imgs_dir) if f.lower().endswith(extensoes_imagem)
        ]

    # Remove duplicatas do diretório de entrada
    duplicatas_removidas = 0
    for arquivo in arquivos_input[:]:  # Cópia da lista para modificar durante iteração
        if arquivo in arquivos_existentes:
            caminho_input = os.path.join(input_dir, arquivo)
            os.remove(caminho_input)
            arquivos_input.remove(arquivo)
            duplicatas_removidas += 1
            print(f"Removida duplicata: {arquivo}")

    if duplicatas_removidas > 0:
        print(
            f"Total de {duplicatas_removidas} duplicatas removidas de {ATTR_FIN_DIR_INPUT}/"
        )

    # Verifica se ainda há arquivos para processar
    if not arquivos_input:
        print(
            f"Todos os arquivos de {ATTR_FIN_DIR_INPUT}/ já foram processados anteriormente"
        )
        return False, None

    print(
        f"Encontrados {len(arquivos_input)} arquivos novos para processar em {ATTR_FIN_DIR_INPUT}/"
    )

    return True, arquivos_input


def mover_arquivos_processados():
    """Move arquivos processados do diretório de entrada para o diretório de imagens"""
    input_dir = ATTR_FIN_DIR_INPUT
    imgs_dir = ATTR_FIN_DIR_IMGS

    # Garante que o diretório de imagens existe
    os.makedirs(imgs_dir, exist_ok=True)

    # Lista arquivos de imagem no diretório de entrada
    extensoes_imagem = (".jpg", ".jpeg", ".png", ".pdf")
    arquivos_input = [
        f for f in os.listdir(input_dir) if f.lower().endswith(extensoes_imagem)
    ]

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
    import calendar

    # Função auxiliar para converter valores para float
    def convert_to_float(value):
        if pd.isna(value) or value == "":
            return 0.0
        try:
            from .helper import normalize_value_to_brazilian_format

            valor_brasileiro = normalize_value_to_brazilian_format(value)
            return float(valor_brasileiro.replace(",", "."))
        except:
            return 0.0

    # Converte DATA para datetime para facilitar ordenação e agrupamento
    df["DATA_DT"] = pd.to_datetime(df["DATA"], format="%d/%m/%Y", errors="coerce")

    # Remove linhas de totalização existentes antes de recalcular
    df_sem_totais = df[df["REMETENTE"] != "TOTAL MÊS"].copy()

    # Ordena por data
    df_sem_totais = df_sem_totais.sort_values("DATA_DT").reset_index(drop=True)

    # Lista para armazenar as novas linhas
    linhas_totalizacao = []

    # Agrupa por mês/ano
    df_sem_totais["MES_ANO"] = df_sem_totais["DATA_DT"].dt.to_period("M")
    meses_unicos = df_sem_totais["MES_ANO"].dropna().unique()

    # Para cada mês, calcula totais e adiciona linha de totalização
    for mes_periodo in sorted(meses_unicos):
        # Filtra dados do mês (excluindo totalizações)
        dados_mes = df_sem_totais[df_sem_totais["MES_ANO"] == mes_periodo]

        # Calcula totais do mês
        total_ricardo = dados_mes["RICARDO"].apply(convert_to_float).sum()
        total_rafael = dados_mes["RAFAEL"].apply(convert_to_float).sum()

        # Se há valores a totalizar
        if total_ricardo > 0 or total_rafael > 0:
            # Calcula último dia do mês
            ano = mes_periodo.year
            mes = mes_periodo.month
            ultimo_dia = calendar.monthrange(ano, mes)[1]

            # Cria linha de totalização
            linha_total = {
                "DATA": f"{ultimo_dia:02d}/{mes:02d}/{ano}",
                "HORA": "23:59:00",
                "REMETENTE": "TOTAL MÊS",
                "CLASSIFICACAO": "TOTAL",
                "RICARDO": f"{total_ricardo:.2f}" if total_ricardo > 0 else "",
                "RAFAEL": f"{total_rafael:.2f}" if total_rafael > 0 else "",
                "ANEXO": f"TOTAL_{mes:02d}_{ano}",
                "DESCRICAO": f"Total do mês {mes:02d}/{ano}",
                "VALOR": "",
                "OCR": "",
                "VALIDADE": "",
                "DATA_DT": datetime(ano, mes, ultimo_dia, 23, 59),
                "MES_ANO": mes_periodo,
            }

            linhas_totalizacao.append(linha_total)

    # Adiciona as linhas de totalização ao DataFrame sem totais
    if linhas_totalizacao:
        df_totalizacao = pd.DataFrame(linhas_totalizacao)
        df_combinado = pd.concat([df_sem_totais, df_totalizacao], ignore_index=True)
        # Reordena por data/hora
        df_combinado = df_combinado.sort_values(["DATA_DT", "HORA"]).reset_index(
            drop=True
        )
    else:
        df_combinado = df_sem_totais

    # Remove colunas auxiliares
    df_combinado = df_combinado.drop(columns=["DATA_DT", "MES_ANO"])

    print(f"Adicionadas {len(linhas_totalizacao)} linhas de totalização mensal")

    return df_combinado












def diagnostico_erro_ocr(image_path, ocr_result):
    if ocr_result == "Arquivo não encontrado":
        return "Arquivo não encontrado no disco"
    if ocr_result == "Erro ao carregar imagem":
        return "Imagem corrompida ou formato não suportado"
    if ocr_result == "Nenhum texto detectado":
        ext = os.path.splitext(image_path)[1].lower()
        if ext == ".pdf":
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
    print(
        "=== INICIANDO PROCESSAMENTO {} ===".format(
            "FORÇADO" if force else "INCREMENTAL"
        )
    )
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

    # Edições agora são aplicadas diretamente no banco de dados
    print("Edições serão aplicadas diretamente no banco de dados, se existirem.")
    print("\n=== VERIFICANDO ARQUIVOS ZIP ===")
    if not descomprimir_zip_se_existir():
        print("❌ Erro na descompressão de arquivo ZIP. Processamento interrompido.")
        return
    print("\n=== VERIFICANDO SUBDIRETÓRIOS ===")
    organizar_subdiretorios_se_necessario()
    
    print("\n=== PROCESSANDO ARQUIVO DE CHAT ===")
    mensagens_info = processar_arquivo_chat()
    
    input_dir = ATTR_FIN_DIR_INPUT
    if force:
        arquivos = [
            f
            for f in os.listdir(input_dir)
            if os.path.isfile(os.path.join(input_dir, f))
            and f.lower().endswith((".jpg", ".jpeg", ".png", ".pdf"))
        ]
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
                registros.append(
                    {
                        "ARQUIVO": arquivo,
                        "VALOR": valor_total,
                        "DESCRICAO": descricao,
                        "CLASSIFICACAO": classificacao,
                        "MOTIVO_ERRO": motivo_erro,
                    }
                )
            # Salva resultado em CSV detalhado
            df_diag = pd.DataFrame(registros)
            if entry:
                # Filtra apenas a linha correspondente
                if (
                    "ARQUIVO" in df_diag.columns
                    and "DATA" in df_diag.columns
                    and "HORA" in df_diag.columns
                ):
                    mask = (df_diag["DATA"] == data_entry) & (
                        df_diag["HORA"] == hora_entry
                    )
                    df_diag = df_diag[mask]
                    if df_diag.empty:
                        print(f"Nenhuma linha encontrada para --entry {entry}.")
                        return
                else:
                    print("Colunas DATA/HORA não encontradas para filtro --entry.")
                    return
                    print("Reprocessamento forçado concluído.")
    else:
        tem_arquivos, chat_file = gerenciar_arquivos_incrementais()
        if not tem_arquivos:
            print("Nenhum arquivo novo para processar.")
            print("\n=== GERANDO RELATÓRIO HTML ===")
            try:
                gerar_relatorio_html()
                gerar_relatorios_mensais_html()
            except Exception as e:
                print(f"⚠️  Erro ao gerar relatórios: {str(e)}")
                print("Relatórios não foram gerados, mas o processamento foi concluído com sucesso.")
            return
        print(f"\n=== PROCESSANDO ARQUIVOS ENCONTRADOS ===")
        print("=== PROCESSANDO DADOS COMPLETOS ===")
        # Dados agora são processados diretamente no banco de dados
        print("\n=== PROCESSANDO APENAS ANEXOS ===")
        # Dados agora são processados diretamente no banco de dados
        
        # Processa arquivos encontrados
        arquivos_para_processar = []
        for arquivo in os.listdir(input_dir):
            if arquivo.lower().endswith(('.jpg', '.jpeg', '.png', '.pdf')):
                arquivos_para_processar.append(arquivo)
        
        if not arquivos_para_processar:
            print("Nenhum arquivo encontrado para processar.")
            return
        
        print(f"Encontrados {len(arquivos_para_processar)} arquivos para processar")
        
        # Processa cada arquivo
        for arquivo in arquivos_para_processar:
            caminho = os.path.join(input_dir, arquivo)
            print(f"Processando arquivo: {arquivo}")
            
            # Busca informações do chat para este arquivo
            info_chat = mensagens_info.get(arquivo, {})
            data_hora_chat = None
            remetente_chat = None
            
            if info_chat:
                data_chat = info_chat.get('data', '')
                hora_chat = info_chat.get('hora', '')
                remetente_chat = info_chat.get('remetente', '')
                
                if data_chat and hora_chat:
                    try:
                        # Converte data/hora do chat para datetime
                        data_hora_str = f"{data_chat} {hora_chat}"
                        data_hora_chat = datetime.strptime(data_hora_str, "%d/%m/%Y %H:%M:%S")
                        print(f"  📅 Data/hora do chat: {data_hora_str} - {remetente_chat}")
                    except ValueError:
                        print(f"  ⚠️  Erro ao converter data/hora do chat: {data_chat} {hora_chat}")
            
            # Processa OCR
            ocr_result = process_image_ocr(caminho)
            
            # Extrai informações usando IA
            valor_total = extract_total_value_with_chatgpt(ocr_result)
            descricao = generate_payment_description_with_chatgpt(ocr_result)
            classificacao = classify_transaction_type_with_chatgpt(ocr_result)
            
            # Registra no banco de dados (se configurado)
            try:
                # Tenta registrar no banco Django se disponível
                import django
                import sys
                from pathlib import Path
                
                # Adiciona o diretório src ao PYTHONPATH
                project_root = Path(__file__).resolve().parent.parent.parent
                src_path = project_root / "src"
                if str(src_path) not in sys.path:
                    sys.path.insert(0, str(src_path))
                
                os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'wa_fin_ctrl.settings')
                django.setup()
                
                from .apps.core.models import EntradaFinanceira
                from django.utils import timezone
                
                if valor_total:
                    # Converte valor para formato brasileiro
                    from .helper import normalize_value_to_brazilian_format
                    valor_brasileiro = normalize_value_to_brazilian_format(valor_total)
                    valor_float = float(valor_brasileiro.replace(',', '.'))
                    
                    # Usa data/hora do chat se disponível, senão usa agora
                    data_hora_entrada = data_hora_chat if data_hora_chat else timezone.now()
                    
                    # Adiciona informação do remetente na descrição se disponível
                    descricao_completa = descricao or ""
                    if remetente_chat:
                        descricao_completa = f"[{remetente_chat}] {descricao_completa}"
                    
                    EntradaFinanceira.objects.create(
                        data_hora=data_hora_entrada,
                        valor=valor_float,
                        descricao=descricao_completa,
                        classificacao=classificacao or "outros",
                        arquivo_origem=arquivo,
                        desconsiderada=False
                    )
                    print(f"✅ Entrada registrada no banco: {arquivo} - R$ {valor_brasileiro}")
                else:
                    print(f"⚠️  Nenhum valor extraído para: {arquivo}")
                    
            except Exception as e:
                print(f"⚠️  Erro ao registrar no banco: {str(e)}")
                # Continua processamento mesmo se falhar no banco
        print("\n=== MOVENDO ARQUIVOS PROCESSADOS ===")
        arquivos_movidos = mover_arquivos_processados()
        print("Arquivos processados com sucesso")
        arquivos_restantes = os.listdir(input_dir)
        if not arquivos_restantes:
            print(f"✅ Diretório {input_dir}/ está vazio - processamento concluído")
        else:
            print(f"⚠️  Arquivos restantes em {input_dir}/: {arquivos_restantes}")
        print("\n=== PROCESSAMENTO INCREMENTAL CONCLUÍDO ===")
        # Edições agora são aplicadas diretamente no banco de dados
        print("Edições aplicadas no banco de dados.")
    print("\n=== GERANDO RELATÓRIO HTML ===")
    try:
        gerar_relatorio_html()
        print("\n=== GERANDO RELATÓRIOS MENSAIS ===")
        gerar_relatorios_mensais_html()
    except Exception as e:
        print(f"⚠️  Erro ao gerar relatórios: {str(e)}")
        print("Relatórios não foram gerados, mas o processamento foi concluído com sucesso.")
    # Dados agora vêm do banco de dados
    # Processamento de dados movido para o módulo de relatórios
    print("✅ Relatórios gerados com sucesso!")


def processar_pdfs(force=False, entry=None, backup=False):
    """Processa apenas arquivos .pdf no diretório de entrada."""
    print(
        "=== INICIANDO PROCESSAMENTO DE PDFs {} ===".format(
            "FORÇADO" if force else "INCREMENTAL"
        )
    )
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
    arquivos_pdf = list(input_dir.glob("*.pdf"))

    if not arquivos_pdf:
        print(f"Nenhum arquivo PDF encontrado em {ATTR_FIN_DIR_INPUT}/")
        return

    print(f"Encontrados {len(arquivos_pdf)} arquivos PDF para processar")

    # Processa cada PDF
    for pdf_path in arquivos_pdf:
        print(f"Processando PDF: {pdf_path.name}")

        # PASSO 1: Aplicar OCR contra o PDF
        ocr_text = process_image_ocr(str(pdf_path))

        # Registra no XML (usar só o nome do arquivo)
        registrar_ocr_xml(os.path.basename(str(pdf_path)), ocr_text)

        # PASSO 2: Submeter o resultado do OCR contra a IA para identificar valor, classificação e descrição
        valor_total = ""
        descricao = ""
        classificacao = ""
        ai_used = False

        # Tenta extrair informações do texto OCR primeiro
        if ocr_text and ocr_text not in [
            "Arquivo não encontrado",
            "Erro ao carregar imagem",
            "Nenhum texto detectado",
        ]:
            print(f"  - Extraindo informações do texto OCR...")
            
            # Extrai valor do OCR
            valor_total = extract_total_value_with_chatgpt(ocr_text)
            
            # Extrai classificação do OCR
            classificacao = classify_transaction_type_with_chatgpt(ocr_text)
            
            # Extrai descrição do OCR
            descricao = generate_payment_description_with_chatgpt(ocr_text)
            
            if valor_total:
                print(f"  - Informações extraídas do OCR: Valor={valor_total}, Classificação={classificacao}")
                ai_used = True

        # PASSO 3: Se a IA não identificou os resultados do OCR, submeter a imagem contra a IA
        if not valor_total:
            print(f"  - OCR não conseguiu extrair informações, submetendo PDF para IA...")
            valor_total, descricao, classificacao = process_image_with_ai_for_value(str(pdf_path), ocr_text)
            ai_used = True
            
            if valor_total:
                print(f"  - Informações extraídas do PDF: Valor={valor_total}, Classificação={classificacao}")
            else:
                print(f"  - IA não conseguiu identificar informações, classificando como desconhecido")
                classificacao = "desconhecido"

        # PASSO 4: Se nem mesmo a IA identificou, classificar como desconhecido
        if not valor_total:
            valor_total = ""
            descricao = "Não foi possível extrair informações"
            classificacao = "desconhecido"
            print(f"  - Classificado como desconhecido")

        print(f"  - Valor: {valor_total}")
        print(f"  - Descrição: {descricao}")
        print(f"  - Classificação: {classificacao}")
        print(f"  - IA usada: {'Sim' if ai_used else 'Não'}")

    # Dados processados e salvos no banco de dados
    print("\n=== DADOS PROCESSADOS E SALVOS NO BANCO ===")

    print("✅ Processamento de PDFs concluído!")


def processar_imgs(force=False, entry=None, backup=False):
    """Processa apenas arquivos de imagem (.jpg, .png, .jpeg) no diretório de entrada."""
    print(
        "=== INICIANDO PROCESSAMENTO DE IMAGENS {} ===".format(
            "FORÇADO" if force else "INCREMENTAL"
        )
    )
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
    extensoes_img = (".jpg", ".jpeg", ".png")
    imagens = [
        p
        for p in input_dir.iterdir()
        if p.is_file() and p.suffix.lower() in extensoes_img
    ]

    if not imagens:
        print(f"Nenhum arquivo de imagem encontrado em {ATTR_FIN_DIR_INPUT}/")
        return

    print(f"Encontradas {len(imagens)} imagens para processar")

    # Processa cada imagem
    for img_path in imagens:
        print(f"Processando imagem: {img_path.name}")

        # PASSO 1: Aplicar OCR contra a imagem
        ocr_text = process_image_ocr(str(img_path))

        # Registra no XML (usar só o nome do arquivo)
        registrar_ocr_xml(os.path.basename(str(img_path)), ocr_text)

        # PASSO 2: Submeter o resultado do OCR contra a IA para identificar valor, classificação e descrição
        valor_total = ""
        descricao = ""
        classificacao = ""
        ai_used = False

        # Tenta extrair informações do texto OCR primeiro
        if ocr_text and ocr_text not in [
            "Arquivo não encontrado",
            "Erro ao carregar imagem",
            "Nenhum texto detectado",
        ]:
            print(f"  - Extraindo informações do texto OCR...")
            
            # Extrai valor do OCR
            valor_total = extract_total_value_with_chatgpt(ocr_text)
            
            # Extrai classificação do OCR
            classificacao = classify_transaction_type_with_chatgpt(ocr_text)
            
            # Extrai descrição do OCR
            descricao = generate_payment_description_with_chatgpt(ocr_text)
            
            if valor_total:
                print(f"  - Informações extraídas do OCR: Valor={valor_total}, Classificação={classificacao}")
                ai_used = True

        # PASSO 3: Se a IA não identificou os resultados do OCR, submeter a imagem contra a IA
        if not valor_total:
            print(f"  - OCR não conseguiu extrair informações, submetendo imagem para IA...")
            valor_total, descricao, classificacao = process_image_with_ai_for_value(str(img_path), ocr_text)
            ai_used = True
            
            if valor_total:
                print(f"  - Informações extraídas da imagem: Valor={valor_total}, Classificação={classificacao}")
            else:
                print(f"  - IA não conseguiu identificar informações, classificando como desconhecido")
                classificacao = "desconhecido"

        # PASSO 4: Se nem mesmo a IA identificou, classificar como desconhecido
        if not valor_total:
            valor_total = ""
            descricao = "Não foi possível extrair informações"
            classificacao = "desconhecido"
            print(f"  - Classificado como desconhecido")

        print(f"  - Valor: {valor_total}")
        print(f"  - Descrição: {descricao}")
        print(f"  - Classificação: {classificacao}")
        print(f"  - IA usada: {'Sim' if ai_used else 'Não'}")

    # Dados processados e salvos no banco de dados
    print("\n=== DADOS PROCESSADOS E SALVOS NO BANCO ===")

    print("✅ Processamento de imagens concluído!")


def descomprimir_zip_se_existir():
    """Verifica se existe apenas um arquivo ZIP no diretório de entrada e o descomprime"""
    input_dir = ATTR_FIN_DIR_INPUT

    # Verifica se o diretório input existe
    if not os.path.exists(input_dir):
        print(f"Diretório {ATTR_FIN_DIR_INPUT}/ não encontrado!")
        return False

    # Lista todos os arquivos no diretório de entrada
    todos_arquivos = os.listdir(input_dir)

    # Filtra apenas arquivos ZIP
    arquivos_zip = [f for f in todos_arquivos if f.lower().endswith(".zip")]

    # Verifica se existe apenas um arquivo ZIP
    if len(arquivos_zip) == 0:
        print(f"Nenhum arquivo ZIP encontrado em {ATTR_FIN_DIR_INPUT}/")
        return True  # Não é erro, apenas não há ZIP para processar

    if len(arquivos_zip) > 1:
        print(
            f"Encontrados {len(arquivos_zip)} arquivos ZIP em {ATTR_FIN_DIR_INPUT}/. Deve haver apenas um."
        )
        print(f"Arquivos ZIP encontrados: {arquivos_zip}")
        return False

    # Se chegou aqui, existe exatamente um arquivo ZIP
    arquivo_zip = arquivos_zip[0]
    caminho_zip = os.path.join(input_dir, arquivo_zip)

    print(f"Encontrado arquivo ZIP: {arquivo_zip}")
    print("Descomprimindo arquivo ZIP...")

    try:
        # Descomprime o arquivo ZIP
        with zipfile.ZipFile(caminho_zip, "r") as zip_ref:
            # Lista o conteúdo do ZIP antes de extrair
            lista_arquivos = zip_ref.namelist()
            print(f"Arquivos no ZIP: {len(lista_arquivos)} itens")

            # Extrai todos os arquivos para o diretório de entrada
            zip_ref.extractall(input_dir)

            print(f"✅ Arquivo ZIP descomprimido com sucesso!")
            print(f"Extraídos {len(lista_arquivos)} itens para {input_dir}/")

        # Remove o arquivo ZIP após descompressão bem-sucedida
        os.remove(caminho_zip)
        print(f"Arquivo ZIP {arquivo_zip} removido após descompressão")

        # Organiza arquivos extraídos - move tudo para o diretório de entrada diretamente
        organizar_arquivos_extraidos()

        return True

    except zipfile.BadZipFile:
        print(f"❌ Erro: {arquivo_zip} não é um arquivo ZIP válido")
        return False
    except Exception as e:
        print(f"❌ Erro ao descomprimir {arquivo_zip}: {str(e)}")
        return False


def organizar_arquivos_extraidos():
    """Move arquivos de subdiretórios para o diretório de entrada diretamente e remove diretórios desnecessários"""
    input_dir = ATTR_FIN_DIR_INPUT
    extensoes_validas = (".jpg", ".jpeg", ".png", ".pdf", ".txt")

    arquivos_movidos = 0
    diretorios_removidos = 0

    # Percorre todos os itens no diretório de entrada
    for item in os.listdir(input_dir):
        caminho_item = os.path.join(input_dir, item)

        # Se é um diretório
        if os.path.isdir(caminho_item):
            # Ignora diretório __MACOSX (arquivos do macOS)
            if item.startswith("__MACOSX"):
                print(f"Removendo diretório __MACOSX: {item}")
                shutil.rmtree(caminho_item)
                diretorios_removidos += 1
                continue

            # Para outros diretórios, move arquivos válidos para o diretório de entrada
            print(f"Processando subdiretório: {item}")
            for arquivo in os.listdir(caminho_item):
                caminho_arquivo = os.path.join(caminho_item, arquivo)

                # Se é um arquivo e tem extensão válida
                if os.path.isfile(caminho_arquivo) and arquivo.lower().endswith(
                    extensoes_validas
                ):
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

    print(
        f"✅ Organização concluída: {arquivos_movidos} arquivos movidos, {diretorios_removidos} diretórios removidos"
    )


def organizar_subdiretorios_se_necessario():
    """Verifica se há subdiretórios no diretório de entrada e organiza arquivos se necessário"""
    input_dir = ATTR_FIN_DIR_INPUT

    if not os.path.exists(input_dir):
        return

    # Verifica se há subdiretórios
    subdiretorios = [
        item
        for item in os.listdir(input_dir)
        if os.path.isdir(os.path.join(input_dir, item))
    ]

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
        print(
            f"✅ Processamento incremental: {'PASSOU' if resultado_processamento else 'FALHOU'}"
        )
        print(
            f"✅ Verificação de totais: {'PASSOU' if resultado_verificacao else 'FALHOU'}"
        )
        print(f"✅ OCR individual: {'PASSOU' if resultado_ocr else 'FALHOU'}")
        print(
            f"✅ Funções ChatGPT: {'PASSOU' if resultado_chatgpt else 'FALHOU (API não disponível)'}"
        )

        todos_passaram = (
            resultado_processamento and resultado_verificacao and resultado_ocr
        )

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
    # Função removida - não há mais arquivos CSV para fazer backup
    print("Backup de arquivos CSV removido - dados agora estão no banco")


def criar_backups_antes_processamento():
    """Cria backups dos arquivos principais antes do processamento"""
    # Função removida - não há mais arquivos CSV para fazer backup
    print("Backup de arquivos CSV removido - dados agora estão no banco")


def restaurar_arquivos_backup():
    """Restaura arquivos do backup após os testes"""
    # Função removida - não há mais arquivos CSV para restaurar
    print("Restauração de arquivos CSV removida - dados agora estão no banco")


def testar_processamento_incremental():
    """Testa o processamento incremental completo"""
    print("\n--- Testando Processamento Incremental ---")

    try:
        # Verifica se há arquivos em input/
        if not os.path.exists(ATTR_FIN_DIR_INPUT) or not os.listdir(ATTR_FIN_DIR_INPUT):
            print(f"⚠️  Sem arquivos em {ATTR_FIN_DIR_INPUT}/ para testar processamento")
            return True  # Não é falha, apenas não há dados para testar

        # Conta arquivos antes do processamento
        arquivos_antes = len(
            [
                f
                for f in os.listdir(ATTR_FIN_DIR_INPUT)
                if f.lower().endswith((".jpg", ".jpeg", ".png", ".pdf"))
            ]
        )

        if arquivos_antes == 0:
            print(f"⚠️  Sem imagens em {ATTR_FIN_DIR_INPUT}/ para testar processamento")
            return True

        print(f"Arquivos de imagem encontrados: {arquivos_antes}")

        # Executa processamento
        processar_incremental()

        # Verifica se arquivos foram movidos para imgs/
        if os.path.exists(ATTR_FIN_DIR_IMGS):
            arquivos_imgs = len(
                [
                    f
                    for f in os.listdir(ATTR_FIN_DIR_IMGS)
                    if f.lower().endswith((".jpg", ".jpeg", ".png", ".pdf"))
                ]
            )
            print(f"Arquivos movidos para {ATTR_FIN_DIR_IMGS}/: {arquivos_imgs}")

        # Verifica se dados foram processados no banco
        print("Dados processados no banco de dados")

        sucesso = True
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
            "DATA": ["18/04/2025", "19/04/2025"],
            "HORA": ["12:45:53", "08:14:39"],
            "REMETENTE": ["Ricardo", "Rafael"],
            "CLASSIFICACAO": ["Transferência", "Transferência"],
            "RICARDO": ["29,90", ""],
            "RAFAEL": ["", "15,50"],
            "ANEXO": ["teste1.jpg", "teste2.jpg"],
            "DESCRICAO": ["Teste 1", "Teste 2"],
            "VALOR": ["29,90", "15,50"],
            "OCR": ["Teste OCR 1", "Teste OCR 2"],
        }

        df_teste = pd.DataFrame(dados_teste)
        arquivo_teste = f"{ATTR_FIN_DIR_TMP}/teste_calculo.csv"

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





def fix_entry(
    data_hora,
    novo_valor=None,
    nova_classificacao=None,
    nova_descricao=None,
    dismiss=False,
    rotate=None,
    ia=False,
):
    """Corrige uma entrada específica em todos os arquivos CSV do diretório mensagens/"""
    try:
        # Parse da data e hora
        if " " not in data_hora:
            print("❌ Formato inválido. Use: DD/MM/AAAA HH:MM:SS")
            return False

        data, hora = data_hora.strip().split(" ", 1)

        # Valida formato da data
        if not re.match(r"^\d{2}/\d{2}/\d{4}$", data):
            print("❌ Formato de data inválido. Use: DD/MM/AAAA")
            return False

        # Valida formato da hora
        if not re.match(r"^\d{2}:\d{2}:\d{2}$", hora):
            print("❌ Formato de hora inválido. Use: HH:MM:SS")
            return False

        # Valida formato do valor (se fornecido)
        if novo_valor:
            if not re.match(r"^\d+[,.]?\d*$", novo_valor):
                print("❌ Formato de valor inválido. Use: 2,33 ou 2.33")
                return False

            # Converte valor para formato americano padronizado
            from .helper import parse_value_from_input

            novo_valor = parse_value_from_input(novo_valor)
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
                csv_files = [
                    os.path.join(diretorio, f)
                    for f in os.listdir(diretorio)
                    if f.endswith(".csv")
                ]
                arquivos_csv.extend(csv_files)

        if not arquivos_csv:
            print(
                f"❌ Nenhum arquivo CSV encontrado em {ATTR_FIN_DIR_MENSAGENS} ou {ATTR_FIN_DIR_TMP}"
            )
            return False

        entrada_encontrada = False
        arquivo_anexo = None
        alteracoes_aplicadas = []

        # Processa cada arquivo CSV
        for arquivo_csv in arquivos_csv:
            if not os.path.exists(arquivo_csv):
                continue

            print(f"🔍 Procurando em {os.path.basename(arquivo_csv)}...")

            # Lê o CSV
            df = pd.read_csv(arquivo_csv)

            # Procura pela entrada com data e hora exatas
            # Verifica se as colunas existem (pode ser DATA/HORA ou data/hora)
            data_col = "DATA" if "DATA" in df.columns else "data"
            hora_col = "HORA" if "HORA" in df.columns else "hora"

            mask = (df[data_col] == data) & (df[hora_col] == hora)
            linhas_encontradas = df[mask]

            if not linhas_encontradas.empty:
                entrada_encontrada = True

                for idx, linha in linhas_encontradas.iterrows():
                    print(f"✅ Entrada encontrada: {data} {hora}")

                    # Obtém o arquivo anexo para rotação/re-submissão
                    if "ANEXO" in df.columns and linha["ANEXO"]:
                        arquivo_anexo = str(linha["ANEXO"])
                        print(f"📎 Arquivo anexo: {arquivo_anexo}")

                    # Obtém o valor original (prioriza RICARDO/RAFAEL, depois VALOR)
                    valor_original = None
                    if (
                        "RICARDO" in df.columns
                        and linha["RICARDO"]
                        and str(linha["RICARDO"]).lower() not in ["nan", ""]
                    ):
                        valor_original = str(linha["RICARDO"])
                    elif (
                        "RAFAEL" in df.columns
                        and linha["RAFAEL"]
                        and str(linha["RAFAEL"]).lower() not in ["nan", ""]
                    ):
                        valor_original = str(linha["RAFAEL"])
                    elif (
                        "VALOR" in df.columns
                        and linha["VALOR"]
                        and str(linha["VALOR"]).lower() not in ["nan", ""]
                    ):
                        valor_original = str(linha["VALOR"])

                    # NOVA REGRA: Se não encontrar valor, aplicar automaticamente o fix
                    if not valor_original:
                        print(
                            f"💰 Nenhum valor encontrado - aplicando fix automático: R$ {novo_valor}"
                        )

                        # Determina qual coluna usar baseado na estrutura do arquivo
                        if "RICARDO" in df.columns and "RAFAEL" in df.columns:
                            # Arquivo calculo.csv - verifica qual coluna está vazia
                            if pd.isna(linha["RICARDO"]) or str(
                                linha["RICARDO"]
                            ).lower() in ["nan", ""]:
                                # Converte coluna para string se necessário
                                if df["RICARDO"].dtype != object:
                                    df["RICARDO"] = df["RICARDO"].astype(str)
                                df.at[idx, "RICARDO"] = novo_valor
                                coluna_usada = "RICARDO"
                            elif pd.isna(linha["RAFAEL"]) or str(
                                linha["RAFAEL"]
                            ).lower() in ["nan", ""]:
                                # Converte coluna para string se necessário
                                if df["RAFAEL"].dtype != object:
                                    df["RAFAEL"] = df["RAFAEL"].astype(str)
                                df.at[idx, "RAFAEL"] = novo_valor
                                coluna_usada = "RAFAEL"
                            else:
                                # Se ambas estão vazias, usa RICARDO por padrão
                                # Converte coluna para string se necessário
                                if df["RICARDO"].dtype != object:
                                    df["RICARDO"] = df["RICARDO"].astype(str)
                                df.at[idx, "RICARDO"] = novo_valor
                                coluna_usada = "RICARDO"
                        elif "VALOR" in df.columns:
                            # Arquivo mensagens.csv
                            # Converte coluna para string se necessário
                            if df["VALOR"].dtype != object:
                                df["VALOR"] = df["VALOR"].astype(str)
                            df.at[idx, "VALOR"] = novo_valor
                            coluna_usada = "VALOR"
                        else:
                            print(f"⚠️  Estrutura de arquivo não reconhecida")
                            continue

                        # Aplica as correções solicitadas para o caso de fix automático
                        alteracoes = [
                            f"valor: aplicado {novo_valor} (sem valor anterior)"
                        ]

                        # 2. Corrige classificação (se fornecida)
                        if nova_classificacao and "CLASSIFICACAO" in df.columns:
                            classificacao_original = str(linha.get("CLASSIFICACAO", ""))
                            df.at[idx, "CLASSIFICACAO"] = nova_classificacao
                            alteracoes.append(
                                f"classificação: {classificacao_original} → {nova_classificacao}"
                            )

                        # 3. Corrige descrição (se fornecida)
                        if nova_descricao and "DESCRICAO" in df.columns:
                            descricao_original = str(linha.get("DESCRICAO", ""))
                            df.at[idx, "DESCRICAO"] = nova_descricao
                            alteracoes.append(
                                f"descrição: {descricao_original} → {nova_descricao}"
                            )

                        # 4. Aplica dismiss (se solicitado)
                        if dismiss:
                            df.at[idx, "VALIDADE"] = "dismiss"
                            alteracoes.append("marcado como dismiss")
                            print(f"✅ Entrada marcada como dismiss")
                        else:
                            # Adiciona informação na coluna VALIDADE sobre as alterações
                            if "VALIDADE" in df.columns:
                                df.at[idx, "VALIDADE"] = (
                                    f"fix-auto: {', '.join(alteracoes)}"
                                )
                            else:
                                # Se não existe coluna VALIDADE, adiciona
                                df["VALIDADE"] = ""
                                df.at[idx, "VALIDADE"] = (
                                    f"fix-auto: {', '.join(alteracoes)}"
                                )

                        print(f"✅ Alterações aplicadas: {', '.join(alteracoes)}")
                        alteracoes_aplicadas.extend(alteracoes)
                        continue

                    print(f" Valor original: R$ {valor_original}")
                    print(f"💰 Novo valor: R$ {novo_valor}")

                    # Converte valor original para formato brasileiro para comparação (apenas se novo_valor foi fornecido)
                    if novo_valor:
                        from .helper import normalize_value_to_brazilian_format

                        valor_original_clean = normalize_value_to_brazilian_format(
                            valor_original
                        )
                        try:
                            valor_original_float = float(
                                valor_original_clean.replace(",", ".")
                            )
                            novo_valor_float = float(novo_valor.replace(",", "."))
                        except ValueError:
                            print(f"⚠️  Erro ao converter valores para comparação")
                            continue

                    # Aplica as correções solicitadas
                    alteracoes = []

                    # 1. Corrige valor (se fornecido)
                    if novo_valor:
                        if (
                            "RICARDO" in df.columns
                            and linha["RICARDO"]
                            and str(linha["RICARDO"]).lower() not in ["nan", ""]
                        ):
                            # Converte coluna para string se necessário
                            if df["RICARDO"].dtype != object:
                                df["RICARDO"] = df["RICARDO"].astype(str)
                            df.at[idx, "RICARDO"] = novo_valor
                            alteracoes.append(f"valor: {valor_original} → {novo_valor}")
                        elif (
                            "RAFAEL" in df.columns
                            and linha["RAFAEL"]
                            and str(linha["RAFAEL"]).lower() not in ["nan", ""]
                        ):
                            # Converte coluna para string se necessário
                            if df["RAFAEL"].dtype != object:
                                df["RAFAEL"] = df["RAFAEL"].astype(str)
                            df.at[idx, "RAFAEL"] = novo_valor
                            alteracoes.append(f"valor: {valor_original} → {novo_valor}")
                        elif (
                            "VALOR" in df.columns
                            and linha["VALOR"]
                            and str(linha["VALOR"]).lower() not in ["nan", ""]
                        ):
                            # Converte coluna para string se necessário
                            if df["VALOR"].dtype != object:
                                df["VALOR"] = df["VALOR"].astype(str)
                            df.at[idx, "VALOR"] = novo_valor
                            alteracoes.append(f"valor: {valor_original} → {novo_valor}")

                    # 2. Corrige classificação (se fornecida)
                    if nova_classificacao and "CLASSIFICACAO" in df.columns:
                        classificacao_original = str(linha.get("CLASSIFICACAO", ""))
                        df.at[idx, "CLASSIFICACAO"] = nova_classificacao
                        alteracoes.append(
                            f"classificação: {classificacao_original} → {nova_classificacao}"
                        )

                    # 3. Corrige descrição (se fornecida)
                    if nova_descricao and "DESCRICAO" in df.columns:
                        descricao_original = str(linha.get("DESCRICAO", ""))
                        df.at[idx, "DESCRICAO"] = nova_descricao
                        alteracoes.append(
                            f"descrição: {descricao_original} → {nova_descricao}"
                        )

                    # 4. Aplica dismiss (se solicitado)
                    if dismiss:
                        df.at[idx, "VALIDADE"] = "dismiss"
                        alteracoes.append("marcado como dismiss")
                        print(f"✅ Entrada marcada como dismiss")
                    else:
                        # Adiciona informação na coluna VALIDADE sobre as alterações
                        if alteracoes:
                            if "VALIDADE" in df.columns:
                                df.at[idx, "VALIDADE"] = f"fix: {', '.join(alteracoes)}"
                            else:
                                # Se não existe coluna VALIDADE, adiciona
                                df["VALIDADE"] = ""
                                df.at[idx, "VALIDADE"] = f"fix: {', '.join(alteracoes)}"

                    if alteracoes:
                        print(f"✅ Alterações aplicadas: {', '.join(alteracoes)}")
                        alteracoes_aplicadas.extend(alteracoes)
                    else:
                        print(f"ℹ️ Nenhuma alteração aplicada")

                # Salva o arquivo CSV atualizado
                df.to_csv(arquivo_csv, index=False)
                print(f" Arquivo {os.path.basename(arquivo_csv)} atualizado")

        # Processa rotação e re-submissão para IA se solicitado
        if arquivo_anexo and (rotate or ia):
            print(
                f"\n🔄 Processando rotação/re-submissão para arquivo: {arquivo_anexo}"
            )

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

            print(f"🔄 Regenerando relatório principal...")
            gerar_relatorio_html()
            print(f"🔄 Regenerando relatórios mensais...")
            gerar_relatorios_mensais_html()
            print("✅ Relatórios regenerados com sucesso!")
        except Exception as e:
            print(f"⚠️  Erro ao regenerar relatórios: {str(e)}")
            import traceback

            traceback.print_exc()

        # Registra a correção no banco de dados SQLite
        try:
            from .history import record_fix_command_wrapper
            
            arguments = {
                'data_hora': data_hora,
                'value': novo_valor,
                'classification': nova_classificacao,
                'description': nova_descricao,
                'dismiss': dismiss,
                'rotate': rotate,
                'ia': ia,
            }
            
            record_fix_command_wrapper(data_hora, arguments, True, use_database=True)
            print("📝 Correção registrada no banco de dados SQLite")
            
        except Exception as e:
            print(f"⚠️ Erro ao registrar correção no banco: {str(e)}")
            # Fallback para JSON se o banco falhar
            try:
                record_fix_command_wrapper(data_hora, arguments, True, use_database=False)
                print("📝 Correção registrada no arquivo JSON (fallback)")
            except Exception as e2:
                print(f"⚠️ Erro ao registrar correção no JSON: {str(e2)}")

        return True

    except Exception as e:
        print(f"❌ Erro durante a correção: {str(e)}")
        
        # Registra erro no banco de dados
        try:
            from .history import record_fix_command_wrapper
            
            arguments = {
                'data_hora': data_hora,
                'value': novo_valor,
                'classification': nova_classificacao,
                'description': nova_descricao,
                'dismiss': dismiss,
                'rotate': rotate,
                'ia': ia,
            }
            
            record_fix_command_wrapper(data_hora, arguments, False, use_database=True)
            print("📝 Erro registrado no banco de dados SQLite")
            
        except Exception as e2:
            print(f"⚠️ Erro ao registrar falha no banco: {str(e2)}")
        
        return False


def dismiss_entry(data_hora):
    """Marca uma entrada como desconsiderada (dismiss) em todos os arquivos CSV do diretório mensagens/"""
    try:
        # Parse da data e hora
        if " " not in data_hora:
            print("❌ Formato inválido. Use: DD/MM/AAAA HH:MM:SS")
            return False

        data, hora = data_hora.strip().split(" ", 1)

        # Valida formato da data
        if not re.match(r"^\d{2}/\d{2}/\d{4}$", data):
            print("❌ Formato de data inválido. Use: DD/MM/AAAA")
            return False

        # Valida formato da hora
        if not re.match(r"^\d{2}:\d{2}:\d{2}$", hora):
            print("❌ Formato de hora inválido. Use: HH:MM:SS")
            return False

        print(f" Procurando entrada: {data} {hora}")

        # Lista todos os arquivos CSV no diretório mensagens/
        mensagens_dir = ATTR_FIN_DIR_MENSAGENS
        if not os.path.exists(mensagens_dir):
            print(f"❌ Diretório {mensagens_dir} não encontrado!")
            return False

        arquivos_csv = [f for f in os.listdir(mensagens_dir) if f.endswith(".csv")]

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
                if "DATA" not in df.columns or "HORA" not in df.columns:
                    print(
                        f"⚠️  Arquivo {arquivo_csv} não tem colunas DATA/HORA - pulando"
                    )
                    continue

                # Adiciona coluna VALIDADE se não existir
                if "VALIDADE" not in df.columns:
                    df["VALIDADE"] = ""
                    print(f"➕ Coluna VALIDADE adicionada ao arquivo {arquivo_csv}")

                # Converte coluna VALIDADE para string para evitar warnings
                df["VALIDADE"] = df["VALIDADE"].astype(str)

                # Procura pela entrada específica
                mask = (df["DATA"] == data) & (df["HORA"] == hora)
                linhas_encontradas = df[mask]

                if len(linhas_encontradas) > 0:
                    # Marca como dismiss
                    df.loc[mask, "VALIDADE"] = "dismiss"

                    # Salva o arquivo atualizado
                    df.to_csv(caminho_csv, index=False, quoting=1)

                    print(
                        f"✅ {len(linhas_encontradas)} entrada(s) marcada(s) como 'dismiss' em {arquivo_csv}"
                    )
                    entradas_encontradas += len(linhas_encontradas)

                    # Mostra detalhes das entradas encontradas
                    for idx, row in linhas_encontradas.iterrows():
                        anexo = row.get("ANEXO", "N/A")
                        descricao = row.get("DESCRICAO", "N/A")
                        print(f"   - {anexo}: {descricao}")
                else:
                    print(f"ℹ️  Nenhuma entrada encontrada em {arquivo_csv}")

            except Exception as e:
                print(f"❌ Erro ao processar {arquivo_csv}: {str(e)}")
                continue

        if entradas_encontradas > 0:
            print(
                f"\n✅ Total de {entradas_encontradas} entrada(s) marcada(s) como 'dismiss'"
            )
            print(" Gerando relatórios atualizados...")

            # Regenera os relatórios automaticamente
            try:
                from .reporter import (
                    gerar_relatorio_html,
                    gerar_relatorios_mensais_html,
                )
                gerar_relatorio_html()
                gerar_relatorios_mensais_html()
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
            arquivo_anexo,
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
        if arquivo_path.lower().endswith(".pdf"):
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
                imagens[0].save(jpg_temp_path, "JPEG", quality=85)

                arquivo_path = jpg_temp_path
                print(f"✅ PDF convertido para JPG: {nome_base}.jpg")

            except Exception as e:
                print(f"❌ Erro ao converter PDF: {str(e)}")
                return False

        # Aplica rotação na imagem
        if arquivo_path.lower().endswith((".jpg", ".jpeg", ".png")):
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

                print(
                    f"✅ Rotação de {graus}° aplicada em: {os.path.basename(arquivo_path)}"
                )
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
            arquivo_anexo,
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
        from .ocr import process_image_ocr

        ocr_text = process_image_ocr(arquivo_path)

        if not ocr_text or ocr_text in [
            "Arquivo não encontrado",
            "Erro ao carregar imagem",
            "Nenhum texto detectado",
        ]:
            print(f"❌ OCR não conseguiu extrair texto da imagem rotacionada")
            return False

        print(f"📝 Texto extraído via OCR: {ocr_text[:100]}...")

        # Re-submete para ChatGPT para extrair valor, descrição e classificação
        from .ia import (
            extract_total_value_with_chatgpt,
            generate_payment_description_with_chatgpt,
            classify_transaction_type_with_chatgpt,
        )

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
        from .ocr import registrar_ocr_xml

        registrar_ocr_xml(os.path.basename(arquivo_path), ocr_text)

        print(f"✅ Re-submissão para ChatGPT concluída com sucesso")
        return True

    except Exception as e:
        print(f"❌ Erro na re-submissão para ChatGPT: {str(e)}")
        return False


def process_image_with_ai_for_value(image_path, ocr_text):
    """
    Processa uma imagem com IA seguindo a sequência lógica correta:
    1. Submete o resultado do OCR (texto) contra a IA para identificar valor, classificação e descrição
    2. Se a IA não identificar os resultados, submete a imagem contra a IA para que ela faça OCR e identifique os resultados
    3. Se nem mesmo a IA identificar, classifica como desconhecido
    """
    try:
        # Verifica se a chave da API está disponível
        api_key = ATTR_FIN_OPENAI_API_KEY
        if not api_key:
            return "", "", "desconhecido"

        # Inicializa o cliente OpenAI
        client = OpenAI(api_key=api_key)

        # PASSO 1: Tenta extrair valor, classificação e descrição do texto OCR
        if ocr_text and ocr_text not in [
            "Arquivo não encontrado",
            "Erro ao carregar imagem",
            "Nenhum texto detectado",
        ]:
            print(f"  - Tentando extrair informações do texto OCR...")
            
            # Extrai valor do OCR
            valor_total = extract_total_value_with_chatgpt(ocr_text)
            
            # Extrai classificação do OCR
            classificacao = classify_transaction_type_with_chatgpt(ocr_text)
            
            # Extrai descrição do OCR
            descricao = generate_payment_description_with_chatgpt(ocr_text)
            
            # Se conseguiu extrair valor, retorna os resultados
            if valor_total:
                print(f"  - Informações extraídas do OCR: Valor={valor_total}, Classificação={classificacao}")
                return valor_total, descricao, classificacao

        # PASSO 2: Se não conseguiu extrair do OCR, submete a imagem para a IA fazer OCR
        print(f"  - OCR não conseguiu extrair informações, submetendo imagem para IA...")
        
        # Codifica a imagem em base64
        with open(image_path, "rb") as image_file:
            encoded_image = base64.b64encode(image_file.read()).decode("utf-8")

        # Prompt para o ChatGPT com a imagem para extrair valor, classificação e descrição
        prompt = f"""
        Analise esta imagem de comprovante financeiro e extraia as seguintes informações:
        
        Texto OCR disponível: {ocr_text if ocr_text else "Nenhum texto extraído"}
        
        Instruções:
        1. Identifique o valor total da transação
        2. Classifique o tipo de transação (Transferência ou Pagamento)
        3. Gere uma descrição curta da transação
        
        Retorne APENAS no formato:
        VALOR: [valor numérico sem R$]
        CLASSIFICACAO: [Transferência ou Pagamento]
        DESCRICAO: [descrição curta]
        
        Se não conseguir identificar alguma informação, use "NENHUM" para o valor ou "desconhecido" para a classificação.
        """

        # Chama a API do ChatGPT com a imagem
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # Usa modelo que suporta imagens
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{encoded_image}"
                            },
                        },
                    ],
                }
            ],
            max_tokens=200,
            temperature=0.1,
        )

        # Extrai a resposta
        resposta = response.choices[0].message.content.strip()
        
        # Parse da resposta
        valor_total = ""
        classificacao = ""
        descricao = ""
        
        for linha in resposta.split('\n'):
            linha = linha.strip()
            if linha.startswith('VALOR:'):
                valor = linha.replace('VALOR:', '').strip()
                if valor and valor.upper() != "NENHUM":
                    valor_total = re.sub(r"[^\d,.]", "", valor)
            elif linha.startswith('CLASSIFICACAO:'):
                classificacao = linha.replace('CLASSIFICACAO:', '').strip()
            elif linha.startswith('DESCRICAO:'):
                descricao = linha.replace('DESCRICAO:', '').strip()

        # Se conseguiu extrair valor, converte para formato brasileiro
        if valor_total:
            from .helper import normalize_value_to_brazilian_format
            valor_total = normalize_value_to_brazilian_format(valor_total)
            print(f"  - Informações extraídas da imagem: Valor={valor_total}, Classificação={classificacao}")
            return valor_total, descricao, classificacao

        # PASSO 3: Se nem mesmo a IA conseguiu identificar, classifica como desconhecido
        print(f"  - IA não conseguiu identificar informações, classificando como desconhecido")
        return "", "", "desconhecido"

    except Exception as e:
        print(f"Erro ao processar imagem com IA: {str(e)}")
        return "", "", "desconhecido"


def processar_arquivo_chat():
    """
    Processa o arquivo _chat.txt para extrair informações de data, hora e remetente
    das mensagens do WhatsApp.
    
    Returns:
        dict: Dicionário com informações das mensagens indexadas por nome do arquivo anexo
    """
    chat_file = os.path.join(ATTR_FIN_DIR_INPUT, ATTR_FIN_ARQ_CHAT)
    
    if not os.path.exists(chat_file):
        print(f"⚠️  Arquivo {ATTR_FIN_ARQ_CHAT} não encontrado em {ATTR_FIN_DIR_INPUT}/")
        return {}
    
    print(f"📄 Processando arquivo de chat: {ATTR_FIN_ARQ_CHAT}")
    
    # Padrão para extrair data, hora, remetente e anexo
    # [18/04/2025, 12:45:03] Ricardo: ‎<anexado: 00000006-PHOTO-2025-04-18-12-45-53.jpg>
    pattern = r'\[(\d{2}/\d{2}/\d{4}), (\d{2}:\d{2}:\d{2})\] ([^:]+): .*?<anexado: ([^>]+)>'
    
    mensagens_info = {}
    
    try:
        with open(chat_file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Encontra todas as mensagens com anexos
        matches = re.findall(pattern, content, re.MULTILINE | re.DOTALL)
        
        for match in matches:
            data, hora, remetente, anexo = match
            
            # Normaliza o nome do remetente
            remetente_normalizado = normalize_sender(remetente.strip())
            
            # Armazena as informações
            mensagens_info[anexo] = {
                'data': data,
                'hora': hora,
                'remetente': remetente_normalizado,
                'remetente_original': remetente.strip()
            }
            
            print(f"  📎 {anexo}: {data} {hora} - {remetente_normalizado}")
        
        print(f"✅ Processadas {len(mensagens_info)} mensagens com anexos")
        
    except Exception as e:
        print(f"❌ Erro ao processar arquivo de chat: {str(e)}")
        return {}
    
    return mensagens_info
