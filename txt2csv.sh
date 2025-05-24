#!/usr/bin/env bash
set -e

# 1. Inicializa o projeto Poetry (se ainda não existir pyproject.toml)
if [ ! -f pyproject.toml ]; then
  poetry init --no-interaction \
    --name gastos_tia_claudia \
    --dependency pandas \
    --dependency pillow \
    --dependency pytesseract \
    --dependency opencv-python
fi

# 2. Instala as dependências declaradas em pyproject.toml
poetry install --no-root

# 3. Executa o seu script passando o arquivo de chat
FILE=${1:-_chat.txt}
poetry run python txt2csv.py "$FILE" gastos_tia_claudia.csv
