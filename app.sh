#!/usr/bin/env bash

# === VARIÁVEIS DE AMBIENTE PARA ARQUIVOS/DIRETÓRIOS FINANCEIROS ===
export ATTR_FIN_DIR_INPUT="input"
export ATTR_FIN_DIR_IMGS="imgs"
export ATTR_FIN_DIR_MASSA="massa"
export ATTR_FIN_DIR_TMP="tmp"
export ATTR_FIN_ARQ_CALCULO="mensagens/calculo.csv"
export ATTR_FIN_ARQ_MENSAGENS="mensagens/mensagens.csv"
export ATTR_FIN_ARQ_DIAGNOSTICO="mensagens/diagnostico.csv"
export ATTR_FIN_ARQ_CHAT="_chat.txt"
export ATTR_FIN_OCR="ocr/extract.xml"

log() {
  echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}
set -e

# Gastos Tia Claudia - Processador de comprovantes WhatsApp
# Uso: ./app.sh [processar|verificar] [arquivo_entrada] [arquivo_saida]

# 1. Verifica se Poetry está instalado
if ! command -v poetry &>/dev/null; then
  echo "Poetry não encontrado. Instale com: pip install poetry"
  exit 1
fi

# 2. Instala/atualiza dependências do projeto (só instala o que falta)
log "Verificando e instalando dependências do projeto via Poetry..."
poetry install --no-interaction --no-root

# 3. Executa o app via Poetry
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
        poetry run python app.py processar --force
    else
        log "Suporte a arquivos ZIP: Se houver um arquivo .zip em input/, será descomprimido automaticamente"
        log "Iniciando processamento incremental..."
        poetry run python app.py processar
    fi
elif [ "$COMANDO" = "verificar" ]; then
    ARQUIVO_CSV=${2:-mensagens/calculo.csv}
    echo "Verificando totais do arquivo: $ARQUIVO_CSV"
    poetry run python app.py verificar "$ARQUIVO_CSV"
elif [ "$COMANDO" = "teste" ]; then
    echo "Executando testes End-to-End completos..."
    poetry run python app.py teste
elif [ "$COMANDO" = "server" ]; then
    echo "Iniciando servidor HTTP local na porta 8000..."
    poetry run python -m http.server 8000
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
    echo "  ./app.sh verificar mensagens/calculo.csv  # Verifica totais financeiros"
    echo "  ./app.sh teste                  # Executa todos os testes do sistema"
fi
