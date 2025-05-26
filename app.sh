#!/usr/bin/env bash
set -e

# Gastos Tia Claudia - Processador de comprovantes WhatsApp
# Uso: ./app.sh [processar|verificar] [arquivo_entrada] [arquivo_saida]

# 1. Remove e cria um novo ambiente virtual
rm -rf venv
python3 -m venv venv

# 2. Ativa o ambiente virtual e instala dependências se necessário
source venv/bin/activate

# Verifica se as dependências já estão instaladas
if ! python -c "import pandas, pillow, pytesseract, cv2, openai" 2>/dev/null; then
    echo "Instalando dependências..."
    pip install --upgrade pip
    pip install pandas pillow pytesseract opencv-python openai
else
    echo "Dependências já instaladas."
fi

# 3. Executa o script baseado nos parâmetros
COMANDO=${1:-processar}

if [ "$COMANDO" = "processar" ]; then
    echo "Iniciando processamento incremental..."
    echo "Suporte a arquivos ZIP: Se houver um arquivo .zip em input/, será descomprimido automaticamente"
    python app.py processar
elif [ "$COMANDO" = "verificar" ]; then
    ARQUIVO_CSV=${2:-calculo.csv}
    echo "Verificando totais do arquivo: $ARQUIVO_CSV"
    python app.py verificar "$ARQUIVO_CSV"
elif [ "$COMANDO" = "teste" ]; then
    echo "Executando testes End-to-End completos..."
    python app.py teste
else
    echo "Uso:"
    echo "  ./app.sh processar              # Processamento incremental automático"
    echo "  ./app.sh verificar [arquivo_csv]"
    echo "  ./app.sh teste                  # Executa testes E2E completos"
    echo ""
    echo "Funcionalidades:"
    echo "  • Descompressão automática de arquivos ZIP em input/"
    echo "  • Processamento incremental (evita reprocessar arquivos existentes)"
    echo "  • Extração de dados via OCR e ChatGPT"
    echo "  • Totalização mensal automática"
    echo "  • Testes automatizados E2E"
    echo ""
    echo "Exemplos:"
    echo "  ./app.sh processar              # Processa arquivos em input/ (incluindo ZIPs)"
    echo "  ./app.sh verificar calculo.csv  # Verifica totais financeiros"
    echo "  ./app.sh teste                  # Executa todos os testes do sistema"
fi

# 4. Desativa o ambiente virtual
deactivate
