# ia.py
# Caminho relativo ao projeto: ia.py
# Módulo de funções de inteligência artificial para análise de comprovantes
import os
import re
from openai import OpenAI
from helper import convert_to_brazilian_format

# ==== CONSTANTES DE AMBIENTE ====
ATTR_FIN_OPENAI_API_KEY = os.getenv('ATTR_FIN_OPENAI_API_KEY', None)

def extract_total_value_with_chatgpt(ocr_text):
    try:
        api_key = ATTR_FIN_OPENAI_API_KEY
        if not api_key:
            return ""
        if not ocr_text or ocr_text in ["Arquivo não encontrado", "Erro ao carregar imagem", "Nenhum texto detectado"]:
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
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Você é um especialista em análise de comprovantes financeiros. Extraia apenas o valor total das transações."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=50,
            temperature=0.1
        )
        valor = response.choices[0].message.content.strip()
        valor = re.sub(r'[^\d,.]', '', valor)
        if not valor or valor.upper() == "NENHUM" or len(valor) == 0:
            return ""
        valor_brasileiro = convert_to_brazilian_format(valor)
        return valor_brasileiro
    except Exception as e:
        return ""

def generate_payment_description_with_chatgpt(ocr_text):
    try:
        api_key = ATTR_FIN_OPENAI_API_KEY
        if not api_key:
            return ""
        if not ocr_text or ocr_text in ["Arquivo não encontrado", "Erro ao carregar imagem", "Nenhum texto detectado"]:
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
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Você é um especialista em análise de comprovantes financeiros. Crie descrições concisas e úteis para categorizações de gastos."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=30,
            temperature=0.3
        )
        descricao = response.choices[0].message.content.strip()
        descricao = re.sub(r'["\']', '', descricao)
        if not descricao or len(descricao.strip()) == 0:
            return "Pagamento"
        return descricao.strip()
    except Exception as e:
        return "Pagamento"

def classify_transaction_type_with_chatgpt(ocr_text):
    try:
        api_key = ATTR_FIN_OPENAI_API_KEY
        if not api_key:
            return ""
        if not ocr_text or ocr_text in ["Arquivo não encontrado", "Erro ao carregar imagem", "Nenhum texto detectado"]:
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
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Você é um especialista em análise de comprovantes financeiros. Classifique transações como Transferência ou Pagamento."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=10,
            temperature=0.1
        )
        classificacao = response.choices[0].message.content.strip()
        classificacao = re.sub(r'["\']', '', classificacao)
        if "transferência" in classificacao.lower():
            return "Transferência"
        elif "pagamento" in classificacao.lower():
            return "Pagamento"
        else:
            if any(palavra in ocr_text.lower() for palavra in ["pix", "transferência", "ted", "doc"]):
                return "Transferência"
            else:
                return "Pagamento"
    except Exception as e:
        if any(palavra in ocr_text.lower() for palavra in ["pix", "transferência", "ted", "doc"]):
            return "Transferência"
        else:
            return "Pagamento"
