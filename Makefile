# Makefile
# Caminho relativo ao projeto: Makefile

.PHONY: help

# Configuração de ambiente
export ATTR_FIN_OPENAI_API_KEY="${OPENAI_API_KEY:-}"
export ATTR_FIN_DIR_INPUT="input"
export ATTR_FIN_DIR_IMGS="imgs"
export ATTR_FIN_DIR_MASSA="massa"
export ATTR_FIN_DIR_TMP="tmp"
export ATTR_FIN_ARQ_CALCULO="mensagens/calculo.csv"
export ATTR_FIN_ARQ_MENSAGENS="mensagens/mensagens.csv"
export ATTR_FIN_ARQ_DIAGNOSTICO="diagnostico.csv"
export ATTR_FIN_ARQ_CHAT="_chat.txt"
export ATTR_FIN_ARQ_OCR_XML="ocr/extract.xml"

# Verificar se Poetry está disponível
check_poetry_installed:
	@if ! command -v poetry &> /dev/null; then \
		echo "❌ Poetry não está instalado. Instale o Poetry primeiro:"; \
		echo "   curl -sSL https://install.python-poetry.org | python3 -"; \
		exit 1; \
	fi

# Adicionando a verificação de Poetry como dependência para todos os alvos
install: check_poetry_installed
run: check_poetry_installed
process: check_poetry_installed
force: check_poetry_installed
server: check_poetry_installed
copy: check_poetry_installed
copy-july-report: check_poetry_installed
copy-report: check_poetry_installed

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

process:
	poetry run python cli.py processar

force:
	poetry run python cli.py processar --force

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