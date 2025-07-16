#!/usr/bin/env bash

log() {
  echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}
set -e

# Gastos Tia Claudia - Processador de comprovantes WhatsApp
# Uso: ./app.sh [processar|verificar] [arquivo_entrada] [arquivo_saida]

# 1. Cria ambiente virtual se não existir
if [ ! -d venv ]; then
  log "Criando ambiente virtual..."
  python3 -m venv venv
else
  log "Ambiente virtual encontrado, reutilizando."
fi

# 2. Ativa o ambiente virtual
source venv/bin/activate

log "Verificando dependências Python..."
if ! python -c "import pandas, pillow, pytesseract, cv2, openai, openpyxl" 2>/dev/null; then
    log "Instalando dependências..."
    pip install --upgrade pip
    pip install pandas pillow pytesseract opencv-python openai openpyxl
else
    log "Dependências já instaladas."
fi

# 3. Executa o script com venv

COMANDO=${1:-processar}
FORCE=0
if [ "$2" = "--force" ]; then
    FORCE=1
fi

if [ "$COMANDO" = "processar" ]; then
    if [ $FORCE -eq 1 ]; then
        log "Modo FORÇADO: copiando todos os arquivos de imgs/ para input/ para reprocessamento total."
        mkdir -p input
        for f in imgs/*; do
            if [ -f "$f" ]; then
                basef=$(basename "$f")
                if [ ! -f "input/$basef" ]; then
                    cp "$f" "input/"
                fi
            fi
        done
        log "Iniciando processamento forçado de todos os arquivos."
        python app.py processar --force
    else
        log "Suporte a arquivos ZIP: Se houver um arquivo .zip em input/, será descomprimido automaticamente"
        log "Iniciando processamento incremental..."
        python app.py processar
    fi
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
