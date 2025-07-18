# Makefile
# Caminho relativo ao projeto: Makefile

.PHONY: help

VAR_FIN_OPENAI_API_KEY=${OPENAI_API_KEY}
VAR_FIN_DIR_INPUT=input
VAR_FIN_DIR_IMGS=imgs
VAR_FIN_DIR_MASSA=massa
VAR_FIN_DIR_TMP=tmp
VAR_FIN_ARQ_CALCULO=mensagens/calculo.csv
VAR_FIN_ARQ_MENSAGENS=mensagens/mensagens.csv
VAR_FIN_ARQ_DIAGNOSTICO=diagnostico.csv
VAR_FIN_ARQ_CHAT=_chat.txt
VAR_FIN_ARQ_OCR_XML=ocr/extract.xml

# Configuração de ambiente
export ATTR_FIN_OPENAI_API_KEY=${VAR_FIN_OPENAI_API_KEY}
export ATTR_FIN_DIR_INPUT=${VAR_FIN_DIR_INPUT}
export ATTR_FIN_DIR_IMGS=${VAR_FIN_DIR_IMGS}
export ATTR_FIN_DIR_MASSA=${VAR_FIN_DIR_MASSA}
export ATTR_FIN_DIR_TMP=${VAR_FIN_DIR_TMP}
export ATTR_FIN_ARQ_CALCULO=${VAR_FIN_ARQ_CALCULO}
export ATTR_FIN_ARQ_MENSAGENS=${VAR_FIN_ARQ_MENSAGENS}
export ATTR_FIN_ARQ_DIAGNOSTICO=${VAR_FIN_ARQ_DIAGNOSTICO}
export ATTR_FIN_ARQ_CHAT=${VAR_FIN_ARQ_CHAT}
export ATTR_FIN_ARQ_OCR_XML=${VAR_FIN_ARQ_OCR_XML}

show-variables:
	@echo "VAR_FIN_OPENAI_API_KEY: ${VAR_FIN_OPENAI_API_KEY}"
	@echo "VAR_FIN_DIR_INPUT: ${VAR_FIN_DIR_INPUT}"
	@echo "VAR_FIN_DIR_IMGS: ${VAR_FIN_DIR_IMGS}"
	@echo "VAR_FIN_DIR_MASSA: ${VAR_FIN_DIR_MASSA}"
	@echo "VAR_FIN_DIR_TMP: ${VAR_FIN_DIR_TMP}"
	@echo "VAR_FIN_ARQ_CALCULO: ${VAR_FIN_ARQ_CALCULO}"
	@echo "VAR_FIN_ARQ_MENSAGENS: ${VAR_FIN_ARQ_MENSAGENS}"
	@echo "VAR_FIN_ARQ_DIAGNOSTICO: ${VAR_FIN_ARQ_DIAGNOSTICO}"
	@echo "VAR_FIN_ARQ_CHAT: ${VAR_FIN_ARQ_CHAT}"
	@echo "VAR_FIN_ARQ_OCR_XML: ${VAR_FIN_ARQ_OCR_XML}"
	@echo "ATTR_FIN_OPENAI_API_KEY: ${ATTR_FIN_OPENAI_API_KEY}"
	@echo "ATTR_FIN_DIR_INPUT: ${ATTR_FIN_DIR_INPUT}"
	@echo "ATTR_FIN_DIR_IMGS: ${ATTR_FIN_DIR_IMGS}"
	@echo "ATTR_FIN_DIR_MASSA: ${ATTR_FIN_DIR_MASSA}"
	@echo "ATTR_FIN_DIR_TMP: ${ATTR_FIN_DIR_TMP}"
	@echo "ATTR_FIN_ARQ_CALCULO: ${ATTR_FIN_ARQ_CALCULO}"
	@echo "ATTR_FIN_ARQ_MENSAGENS: ${ATTR_FIN_ARQ_MENSAGENS}"

create-directories:
	@echo "Criando diretórios: ${ATTR_TEST} ${ATTR_FIN_DIR_INPUT}, ${ATTR_FIN_DIR_IMGS}, ${ATTR_FIN_DIR_MASSA}, ${ATTR_FIN_DIR_TMP}"
	@mkdir -p "${ATTR_FIN_DIR_INPUT}" "${ATTR_FIN_DIR_IMGS}" "${ATTR_FIN_DIR_MASSA}" "${ATTR_FIN_DIR_TMP}" || { echo "Erro ao criar diretórios"; exit 1; }

# Verificar se Poetry está disponível
check_poetry_installed:
	@if ! command -v poetry &> /dev/null; then \
		echo "❌ Poetry não está instalado. Instale o Poetry primeiro:"; \
		echo "   curl -sSL https://install.python-poetry.org | python3 -"; \
		exit 1; \
	fi

# Adicionando a verificação de Poetry como dependência para todos os alvos
install: check_poetry_installed create-directories
run: check_poetry_installed install
process: check_poetry_installed install
force: check_poetry_installed install
server: check_poetry_installed install
copy: check_poetry_installed install
copy-july-report: check_poetry_installed install
copy-report: check_poetry_installed

help:
	@echo "Uso: make <target>"
	@echo "Targets disponíveis:"
	@echo "  help: Exibe esta mensagem de ajuda"
	@echo "  install: Instala as dependências do projeto"
	@echo "  run: Executa o script principal"
	@echo "  process: Processa arquivos incrementalmente"
	@echo "  force: Processa todos os arquivos (força reprocessamento)"
	@echo "  dismiss: Marca uma entrada como desconsiderada"
	@echo "    Exemplo: make dismiss arg=\"21/04/2025 18:33:54\""
	@echo "  server: Inicia o servidor HTTP local"
	@echo "  copy: Copia a estrutura do projeto para a área de transferência"

install:
	poetry install --no-interaction --no-root

run:
	poetry run python cli.py

process:
	poetry run python cli.py processar || echo "Erro ao executar o comando 'processar'. Verifique os logs para mais detalhes."

force:
	poetry run python cli.py processar --force
	
dismiss:
	poetry run python cli.py dismiss "$(arg)"

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

remove-reports:
	@rm -rf *.html

remove-baks:
	@rm -rf *.bak

remove-ocr:
	@rm -rf ocr/extract.xml

remove-mensagens:
	@rm -rf mensagens/*

remove-imgs:
	@rm -rf imgs/*

remove-tmp:
	@rm -rf tmp/*

remove-input:
	@rm -rf input/*

remove-all:
	@$(MAKE) remove-reports
	@$(MAKE) remove-baks
	@$(MAKE) remove-ocr
	@$(MAKE) remove-mensagens
	@$(MAKE) remove-imgs
	@$(MAKE) remove-tmp
	@$(MAKE) remove-input


copy-april:
	@cp -v "massa/04 WhatsApp Chat - NFs e comprovantes tia Claudia.zip" input

copy-may:
	@cp -v "massa/05 WhatsApp Chat - NFs e comprovantes tia Claudia.zip" input

copy-june:
	@cp -v "massa/06 WhatsApp Chat - NFs e comprovantes tia Claudia.zip" input

copy-july:
	@cp -v "massa/07 WhatsApp Chat - NFs e comprovantes tia Claudia.zip" input

copy-august:
	@cp -v "massa/08 WhatsApp Chat - NFs e comprovantes tia Claudia.zip" input

copy-september:
	@cp -v "massa/09 WhatsApp Chat - NFs e comprovantes tia Claudia.zip" input

copy-october:
	@cp -v "massa/10 WhatsApp Chat - NFs e comprovantes tia Claudia.zip" input

.PHONY: help install run server copy remove-reports remove-baks remove-ocr remove-mensagens remove-imgs remove-tmp remove-input remove-all show-variables copy-april copy-may copy-june copy-july copy-august copy-september copy-october