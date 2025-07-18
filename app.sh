#!/bin/bash
# app.sh
# Caminho relativo ao projeto: app.sh
# Script principal para execução do processador de comprovantes
# Atualizado para usar cli.py com click

# Configuração de ambiente
export ATTR_FIN_DIR_INPUT="input"
export ATTR_FIN_DIR_IMGS="imgs"
export ATTR_FIN_DIR_MASSA="massa"
export ATTR_FIN_DIR_TMP="tmp"
export ATTR_FIN_ARQ_CALCULO="mensagens/calculo.csv"
export ATTR_FIN_ARQ_MENSAGENS="mensagens/mensagens.csv"
export ATTR_FIN_ARQ_DIAGNOSTICO="diagnostico.csv"
export ATTR_FIN_ARQ_CHAT="_chat.txt"
export ATTR_FIN_OCR="ocr/extract.xml"

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Verificar se Poetry está disponível
if ! command -v poetry &> /dev/null; then
    echo "❌ Poetry não está instalado. Instale o Poetry primeiro:"
    echo "   curl -sSL https://install.python-poetry.org | python3 -"
    exit 1
fi

# Verificar e instalar dependências
log "Verificando e instalando dependências do projeto via Poetry..."
poetry install --no-interaction --no-root

if [ "$1" = "server" ]; then
    echo "Iniciando servidor HTTP local na porta 8000..."
    poetry run python -m http.server 8000
    exit 0
else
    log "Executando comando via CLI..."
    poetry run python cli.py "$@"
    exit 0
fi
