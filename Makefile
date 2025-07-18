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
	@echo "Copiando os arquivos ocr.py, app.py, env.py, template.py, reporter.py, check.py para analise. " > tmp/copy2chatgpt.txt
	@cat app.py cli.py helper.py ia.py \
	ocr.py \
	app.sh \
	env.py \
	template.py \
	reporter.py \
	check.py >> tmp/copy2chatgpt.txt
	@pbcopy < tmp/copy2chatgpt.txt
	@echo "✅ Conteúdo copiado para a área de transferência"

copy-july-report:
	@mkdir -p tmp
	@echo "Copiando o relatório de Julho..." > tmp/copy2chatgpt.txt
	@cat report-2025-07-Julho.html >> tmp/copy2chatgpt.txt
	@echo "Copiando o relatório editavel..." >> tmp/copy2chatgpt.txt
	@cat report-edit-2025-07-Julho.html >> tmp/copy2chatgpt.txt
	@pbcopy < tmp/copy2chatgpt.txt
	@echo "✅ Conteúdo do relatório de Julho copiado para a área de transferência"

copy-report:
	@mkdir -p tmp
	@echo "Copiando o relatório report.html para analise..." > tmp/copy2chatgpt.txt
	@cat report.html >> tmp/copy2chatgpt.txt
	@pbcopy < tmp/copy2chatgpt.txt
	@echo "✅ Conteúdo do relatório report.html copiado para a área de transferência"

copy-templates:
	@mkdir -p tmp
	@echo "Copiando os templates dos relatórios para analise. " > tmp/copy2chatgpt.txt
	@cat templates/monthly_report_editable.html.j2 >> tmp/copy2chatgpt.txt
	@cat templates/monthly_report.html.j2 >> tmp/copy2chatgpt.txt
	@cat templates/print_report.html.j2 >> tmp/copy2chatgpt.txt
	@cat templates/report.html.j2 >> tmp/copy2chatgpt.txt
	@pbcopy < tmp/copy2chatgpt.txt
	@echo "✅ Conteúdo dos templates copiado para a área de transferência"

copy-ocr:
	@mkdir -p ocr
	@echo "<!-- ocr/extract.xml -->" > tmp/copy2chatgpt.txt
	@cat ocr/extract.xml >> tmp/copy2chatgpt.txt
	@pbcopy < tmp/copy2chatgpt.txt
	@echo "✅ Conteúdo do OCR copiado para a área de transferência"

.PHONY: help install run server copy