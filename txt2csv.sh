#!/usr/bin/env bash
set -e

# 1. Remove e cria um novo ambiente virtual
rm -rf venv
python3 -m venv venv

# 2. Ativa o ambiente virtual e instala dependências
source venv/bin/activate
pip install --upgrade pip
pip install pandas

# 3. Executa o script
FILE=${1:-_chat.txt}
python txt2csv.py "$FILE" out.csv

# 4. Desativa o ambiente virtual
deactivate
