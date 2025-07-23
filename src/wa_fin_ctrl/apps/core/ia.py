# ia.py
# Caminho relativo ao projeto: src/wa_fin_ctrl/apps/core/ia.py
# Módulo de funções de inteligência artificial para análise de comprovantes
import os
import re
from openai import OpenAI
from .helper import convert_to_brazilian_format
from .env import *

# ==== CONSTANTES ====
# Mensagens de erro OCR
ERRO_ARQUIVO_NAO_ENCONTRADO = "Arquivo não encontrado"
ERRO_CARREGAR_IMAGEM = "Erro ao carregar imagem"
ERRO_NENHUM_TEXTO = "Nenhum texto detectado"

# Modelo OpenAI
MODELO_GPT = "gpt-3.5-turbo"

# Configurações de tokens
MAX_TOKENS_VALOR = 50
MAX_TOKENS_DESCRICAO = 30
TEMPERATURA_BAIXA = 0.1
TEMPERATURA_MEDIA = 0.3

# Valores de resposta
VALOR_NENHUM = "NENHUM"
DESCRICAO_PADRAO = "Pagamento"

# Prompts do sistema
PROMPT_SISTEMA_VALOR = "Você é um especialista em análise de comprovantes financeiros. Extraia apenas o valor total das transações."
PROMPT_SISTEMA_DESCRICAO = "Você é um especialista em análise de comprovantes financeiros. Crie descrições concisas e úteis para categorizações de gastos."
PROMPT_SISTEMA_CLASSIFICACAO = "Você é um especialista em análise de comprovantes financeiros. Classifique transações como Transferência ou Pagamento."


def extract_total_value_with_chatgpt(ocr_text):
    try:
        api_key = ATTR_FIN_OPENAI_API_KEY
        if not api_key:
            return ""
        if not ocr_text or ocr_text in [
            ERRO_ARQUIVO_NAO_ENCONTRADO,
            ERRO_CARREGAR_IMAGEM,
            ERRO_NENHUM_TEXTO,
        ]:
            return ""
        client = OpenAI(api_key=api_key)
        prompt = f"""
        Analise o seguinte texto extraído de um comprovante financeiro e identifique APENAS o valor total da transação.
        Texto: {ocr_text}
        Instruções:
        - Retorne APENAS o valor numérico (ex: 29.90 ou 1533.27 ou 29,90)
        - Se houver múltiplos valores, retorne o valor da transação principal
        - Se não conseguir identificar um valor, retorne \"NENHUM\"
        - Não inclua \"R$\" ou outros símbolos
        - Não retorne explicações, apenas o número
        Valor total:
        """
        response = client.chat.completions.create(
            model=MODELO_GPT,
            messages=[
                {
                    "role": "system",
                    "content": PROMPT_SISTEMA_VALOR,
                },
                {"role": "user", "content": prompt},
            ],
            max_tokens=MAX_TOKENS_VALOR,
            temperature=TEMPERATURA_BAIXA,
        )
        valor = response.choices[0].message.content.strip()
        valor = re.sub(r"[^\d,.]", "", valor)
        if not valor or valor.upper() == VALOR_NENHUM or len(valor) == 0:
            return ""
        from .helper import normalize_value_to_brazilian_format

        valor_brasileiro = normalize_value_to_brazilian_format(valor)
        return valor_brasileiro
    except Exception as e:
        return ""


def generate_payment_description_with_chatgpt(ocr_text):
    try:
        api_key = ATTR_FIN_OPENAI_API_KEY
        if not api_key:
            return ""
        if not ocr_text or ocr_text in [
            ERRO_ARQUIVO_NAO_ENCONTRADO,
            ERRO_CARREGAR_IMAGEM,
            ERRO_NENHUM_TEXTO,
        ]:
            return ""
        client = OpenAI(api_key=api_key)
        prompt = f"""
        Analise o seguinte texto extraído de um comprovante financeiro e crie uma descrição concisa do pagamento.
        Texto: {ocr_text}
        Instruções:
        - Identifique o tipo de estabelecimento (padaria, farmácia, supermercado, etc.)
        - Identifique o nome do estabelecimento se possível
        - Identifique o tipo de transação (compra, recarga, transferência, etc.)
        - Crie uma descrição de 3-5 palavras máximo
        - Use formato: \"Tipo - Estabelecimento\" (ex: \"Compra - Padaria Bonanza\", \"Medicamentos - Drogaria\", \"Recarga celular\")
        - Se não conseguir identificar, retorne \"Pagamento\"
        Descrição:
        """
        response = client.chat.completions.create(
            model=MODELO_GPT,
            messages=[
                {
                    "role": "system",
                    "content": PROMPT_SISTEMA_DESCRICAO,
                },
                {"role": "user", "content": prompt},
            ],
            max_tokens=MAX_TOKENS_DESCRICAO,
            temperature=TEMPERATURA_MEDIA,
        )
        descricao = response.choices[0].message.content.strip()
        descricao = re.sub(r'["\']', "", descricao)
        if not descricao or len(descricao.strip()) == 0:
            return DESCRICAO_PADRAO
        return descricao.strip()
    except Exception as e:
        return DESCRICAO_PADRAO


def classify_transaction_type_with_chatgpt(ocr_text):
    try:
        api_key = ATTR_FIN_OPENAI_API_KEY
        if not api_key:
            return ""
        if not ocr_text or ocr_text in [
            ERRO_ARQUIVO_NAO_ENCONTRADO,
            ERRO_CARREGAR_IMAGEM,
            ERRO_NENHUM_TEXTO,
        ]:
            return ""
        client = OpenAI(api_key=api_key)
        prompt = f"""
        Analise o seguinte texto extraído de um comprovante financeiro e classifique o tipo de transação.
        Texto: {ocr_text}
        Instruções:
        - Se for uma transferência PIX, TED, DOC ou transferência entre contas, retorne \"Transferência\"
        - Se for um pagamento por débito, crédito, compra direta em estabelecimento comercial, retorne \"Pagamento\"
        - Retorne APENAS uma das duas opções: \"Transferência\" ou \"Pagamento\"
        - Não retorne explicações, apenas a classificação
        Classificação:
        """
        response = client.chat.completions.create(
            model=MODELO_GPT,
            messages=[
                {
                    "role": "system",
                    "content": PROMPT_SISTEMA_CLASSIFICACAO,
                },
                {"role": "user", "content": prompt},
            ],
            max_tokens=10,
            temperature=TEMPERATURA_BAIXA,
        )
        classificacao = response.choices[0].message.content.strip()
        classificacao = re.sub(r'["\']', "", classificacao)
        if "transferência" in classificacao.lower():
            return "Transferência"
        elif "pagamento" in classificacao.lower():
            return "Pagamento"
        else:
            if any(
                palavra in ocr_text.lower()
                for palavra in ["pix", "transferência", "ted", "doc"]
            ):
                return "Transferência"
            else:
                return "Pagamento"
    except Exception as e:
        if any(
            palavra in ocr_text.lower()
            for palavra in ["pix", "transferência", "ted", "doc"]
        ):
            return "Transferência"
        else:
            return "Pagamento"
