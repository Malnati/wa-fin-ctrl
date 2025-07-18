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
	@mkdir -p ocr
	@cat app.py cli.py helper.py ia.py \
	ocr.py \
	app.sh \
	env.py \
	template.py \
	reporter.py \
	check.py \
	templates/monthly_report_editable.html.j2 \
	templates/monthly_report.html.j2 \
	report-2025-07-Julho.html > tmp/copy2chatgpt.txt
	@echo "<!-- ocr/extract.xml -->" >> tmp/copy2chatgpt.txt
	@cat ocr/extract.xml >> tmp/copy2chatgpt.txt
	@pbcopy < tmp/copy2chatgpt.txt
	@echo "✅ Conteúdo copiado para a área de transferência"

.PHONY: help install run server copy