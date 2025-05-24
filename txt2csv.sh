#!/usr/bin/env bash
set -e

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

# 3. Executa o script
FILE=${1:-_chat.txt}
python txt2csv.py "$FILE" mensagens.csv

# 4. Desativa o ambiente virtual
deactivate
