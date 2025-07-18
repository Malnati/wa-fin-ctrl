# Makefile
# Caminho relativo ao projeto: Makefile

.PHONY: help

help:
	@echo "Uso: make <target>"
	@echo "Targets disponíveis:"
	@echo "  help: Exibe esta mensagem de ajuda"
	@echo "  install: Instala as dependências do projeto"
	@echo "  run: Executa o script principal"
	@echo "  server: Inicia o servidor HTTP local"
	@echo "  copy: Copia a estrutura do projeto para a área de transferência"

install:
	poetry install --no-interaction --no-root

run:
	poetry run python cli.py

server:
	poetry run python -m http.server 8000

copy:
	@mkdir -p tmp
	cat app.py cli.py helper.py ia.py ocr.py app.sh env.py Makefile > tmp/copy2chatgpt.txt
	pbcopy < tmp/copy2chatgpt.txt

.PHONY: help install run server copy