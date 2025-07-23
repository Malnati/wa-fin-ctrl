# Makefile
# Caminho relativo ao projeto: Makefile

.PHONY: help

# Configuração de ambiente
VAR_FIN_OPENAI_API_KEY=${OPENAI_API_KEY}
# Diretórios de dados
VAR_FIN_DIR_DATA=data
# Diretórios de entrada e saída
VAR_FIN_DIR_INPUT=input
# Diretórios de imagens
VAR_FIN_DIR_IMGS=imgs
# Diretórios de massa
VAR_FIN_DIR_MASSA=massa
# Diretórios temporários
VAR_FIN_DIR_TMP=tmp
# Diretórios de mensagens
VAR_FIN_DIR_MENSAGENS=mensagens
# Diretórios de OCR
VAR_FIN_DIR_OCR=ocr
# Diretórios de documentos
VAR_FIN_DIR_DOCS=docs
# Diretórios de código fonte
VAR_FIN_DIR_SRC=src
# Diretórios de templates
VAR_FIN_DIR_TEMPLATES=templates
# Arquivos de cálculo
VAR_FIN_ARQ_CALCULO=mensagens/calculo.csv
# Arquivos de mensagens
VAR_FIN_ARQ_MENSAGENS=mensagens/mensagens.csv
# Arquivos de diagnóstico
VAR_FIN_ARQ_DIAGNOSTICO=diagnostico.csv
# Arquivo de banco de dados
VAR_FIN_ARQ_DB=db/db.sqlite3
# Arquivos de chat
VAR_FIN_ARQ_CHAT=_chat.txt
# Arquivos de OCR
VAR_FIN_ARQ_OCR_XML=ocr/extract.xml
# Arquivo principal
VAR_FIN_ARQ_MAIN=wa-fin.py
# Arquivos de relatórios
VAR_FIN_ARQ_REPORT_HTML=docs/report.html
VAR_FIN_ARQ_REPORT_JULY=docs/report-2025-07-Julho.html
VAR_FIN_ARQ_REPORT_JULY_EDIT=docs/report-edit-2025-07-Julho.html
# Arquivos de templates
VAR_FIN_ARQ_TEMPLATE_MONTHLY_EDITABLE=templates/monthly_report_editable.html.j2
VAR_FIN_ARQ_TEMPLATE_MONTHLY=templates/monthly_report.html.j2
VAR_FIN_ARQ_TEMPLATE_PRINT=templates/print_report.html.j2
VAR_FIN_ARQ_TEMPLATE_REPORT=templates/report.html.j2
# Arquivos de massa
VAR_FIN_ARQ_MASSA_APRIL=massa/04 WhatsApp Chat - NFs e comprovantes tia Claudia.zip
VAR_FIN_ARQ_MASSA_MAY=massa/05 WhatsApp Chat - NFs e comprovantes tia Claudia.zip
VAR_FIN_ARQ_MASSA_JUNE=massa/06 WhatsApp Chat - NFs e comprovantes tia Claudia.zip
VAR_FIN_ARQ_MASSA_JULY=massa/07 WhatsApp Chat - NFs e comprovantes tia Claudia.zip
VAR_FIN_ARQ_MASSA_AUGUST=massa/08 WhatsApp Chat - NFs e comprovantes tia Claudia.zip
VAR_FIN_ARQ_MASSA_SEPTEMBER=massa/09 WhatsApp Chat - NFs e comprovantes tia Claudia.zip
VAR_FIN_ARQ_MASSA_OCTOBER=massa/10 WhatsApp Chat - NFs e comprovantes tia Claudia.zip	

# Configuração de ambiente
# Exporta as variáveis de ambiente para o shell
export ATTR_FIN_OPENAI_API_KEY=${VAR_FIN_OPENAI_API_KEY}
export ATTR_FIN_DIR_DATA=${VAR_FIN_DIR_DATA}
export ATTR_FIN_DIR_INPUT=${VAR_FIN_DIR_INPUT}
export ATTR_FIN_DIR_IMGS=${VAR_FIN_DIR_IMGS}
export ATTR_FIN_DIR_MASSA=${VAR_FIN_DIR_MASSA}
export ATTR_FIN_DIR_TMP=${VAR_FIN_DIR_TMP}
export ATTR_FIN_DIR_MENSAGENS=${VAR_FIN_DIR_MENSAGENS}
export ATTR_FIN_DIR_OCR=${VAR_FIN_DIR_OCR}
export ATTR_FIN_DIR_DOCS=${VAR_FIN_DIR_DOCS}
export ATTR_FIN_DIR_SRC=${VAR_FIN_DIR_SRC}
export ATTR_FIN_DIR_TEMPLATES=${VAR_FIN_DIR_TEMPLATES}
export ATTR_FIN_ARQ_CALCULO=${VAR_FIN_ARQ_CALCULO}
export ATTR_FIN_ARQ_MENSAGENS=${VAR_FIN_ARQ_MENSAGENS}
export ATTR_FIN_ARQ_DIAGNOSTICO=${VAR_FIN_ARQ_DIAGNOSTICO}
export ATTR_FIN_ARQ_CHAT=${VAR_FIN_ARQ_CHAT}
export ATTR_FIN_ARQ_OCR_XML=${VAR_FIN_ARQ_OCR_XML}
export ATTR_FIN_ARQ_MAIN=${VAR_FIN_ARQ_MAIN}
export ATTR_FIN_ARQ_REPORT_HTML=${VAR_FIN_ARQ_REPORT_HTML}
export ATTR_FIN_ARQ_REPORT_JULY=${VAR_FIN_ARQ_REPORT_JULY}
export ATTR_FIN_ARQ_REPORT_JULY_EDIT=${VAR_FIN_ARQ_REPORT_JULY_EDIT}
export ATTR_FIN_ARQ_TEMPLATE_MONTHLY_EDITABLE=${VAR_FIN_ARQ_TEMPLATE_MONTHLY_EDITABLE}
export ATTR_FIN_ARQ_TEMPLATE_MONTHLY=${VAR_FIN_ARQ_TEMPLATE_MONTHLY}
export ATTR_FIN_ARQ_TEMPLATE_PRINT=${VAR_FIN_ARQ_TEMPLATE_PRINT}
export ATTR_FIN_ARQ_TEMPLATE_REPORT=${VAR_FIN_ARQ_TEMPLATE_REPORT}
export ATTR_FIN_ARQ_MASSA_APRIL=${VAR_FIN_ARQ_MASSA_APRIL}
export ATTR_FIN_ARQ_MASSA_MAY=${VAR_FIN_ARQ_MASSA_MAY}
export ATTR_FIN_ARQ_MASSA_JUNE=${VAR_FIN_ARQ_MASSA_JUNE}
export ATTR_FIN_ARQ_MASSA_JULY=${VAR_FIN_ARQ_MASSA_JULY}
export ATTR_FIN_ARQ_MASSA_AUGUST=${VAR_FIN_ARQ_MASSA_AUGUST}
export ATTR_FIN_ARQ_MASSA_SEPTEMBER=${VAR_FIN_ARQ_MASSA_SEPTEMBER}
export ATTR_FIN_ARQ_MASSA_OCTOBER=${VAR_FIN_ARQ_MASSA_OCTOBER}
export ATTR_FIN_ARQ_DB=${VAR_FIN_ARQ_DB}

# Verificar se Poetry está disponível
check_poetry_installed:
	@if ! command -v poetry &> /dev/null; then \
		echo "❌ Poetry não está instalado. Instale o Poetry primeiro:"; \
		echo "   curl -sSL https://install.python-poetry.org | python3 -"; \
		exit 1; \
	fi

# Cria os diretórios necessários
create-directories:
	@echo "Criando diretórios: ${ATTR_FIN_DIR_INPUT}, ${ATTR_FIN_DIR_IMGS}, ${ATTR_FIN_DIR_MASSA}, ${ATTR_FIN_DIR_TMP}, ${ATTR_FIN_DIR_MENSAGENS}, ${ATTR_FIN_DIR_OCR}, ${ATTR_FIN_DIR_DOCS}, ${ATTR_FIN_DIR_SRC}, ${ATTR_FIN_DIR_TEMPLATES}"
	@mkdir -pv "${ATTR_FIN_DIR_INPUT}" "${ATTR_FIN_DIR_IMGS}" "${ATTR_FIN_DIR_MASSA}" "${ATTR_FIN_DIR_TMP}" "${ATTR_FIN_DIR_MENSAGENS}" "${ATTR_FIN_DIR_OCR}" "${ATTR_FIN_DIR_DOCS}" "${ATTR_FIN_DIR_SRC}" "${ATTR_FIN_DIR_TEMPLATES}"

# Exibe as variáveis de ambiente
show-variables:
	@echo "VAR_FIN_OPENAI_API_KEY: ${VAR_FIN_OPENAI_API_KEY}"
	@echo "VAR_FIN_DIR_DATA: ${VAR_FIN_DIR_DATA}"
	@echo "VAR_FIN_DIR_INPUT: ${VAR_FIN_DIR_INPUT}"
	@echo "VAR_FIN_DIR_IMGS: ${VAR_FIN_DIR_IMGS}"
	@echo "VAR_FIN_DIR_MASSA: ${VAR_FIN_DIR_MASSA}"
	@echo "VAR_FIN_DIR_TMP: ${VAR_FIN_DIR_TMP}"
	@echo "VAR_FIN_DIR_MENSAGENS: ${VAR_FIN_DIR_MENSAGENS}"
	@echo "VAR_FIN_DIR_OCR: ${VAR_FIN_DIR_OCR}"
	@echo "VAR_FIN_DIR_DOCS: ${VAR_FIN_DIR_DOCS}"
	@echo "VAR_FIN_DIR_SRC: ${VAR_FIN_DIR_SRC}"
	@echo "VAR_FIN_DIR_TEMPLATES: ${VAR_FIN_DIR_TEMPLATES}"
	@echo "VAR_FIN_ARQ_CALCULO: ${VAR_FIN_ARQ_CALCULO}"
	@echo "VAR_FIN_ARQ_MENSAGENS: ${VAR_FIN_ARQ_MENSAGENS}"
	@echo "VAR_FIN_ARQ_DIAGNOSTICO: ${VAR_FIN_ARQ_DIAGNOSTICO}"
	@echo "VAR_FIN_ARQ_CHAT: ${VAR_FIN_ARQ_CHAT}"
	@echo "VAR_FIN_ARQ_OCR_XML: ${VAR_FIN_ARQ_OCR_XML}"
	@echo "VAR_FIN_ARQ_MAIN: ${VAR_FIN_ARQ_MAIN}"
	@echo "VAR_FIN_ARQ_REPORT_HTML: ${VAR_FIN_ARQ_REPORT_HTML}"
	@echo "VAR_FIN_ARQ_REPORT_JULY: ${VAR_FIN_ARQ_REPORT_JULY}"
	@echo "VAR_FIN_ARQ_REPORT_JULY_EDIT: ${VAR_FIN_ARQ_REPORT_JULY_EDIT}"
	@echo "VAR_FIN_ARQ_TEMPLATE_MONTHLY_EDITABLE: ${VAR_FIN_ARQ_TEMPLATE_MONTHLY_EDITABLE}"
	@echo "VAR_FIN_ARQ_TEMPLATE_MONTHLY: ${VAR_FIN_ARQ_TEMPLATE_MONTHLY}"
	@echo "VAR_FIN_ARQ_TEMPLATE_PRINT: ${VAR_FIN_ARQ_TEMPLATE_PRINT}"
	@echo "VAR_FIN_ARQ_TEMPLATE_REPORT: ${VAR_FIN_ARQ_TEMPLATE_REPORT}"
	@echo "VAR_FIN_ARQ_MASSA_APRIL: ${VAR_FIN_ARQ_MASSA_APRIL}"
	@echo "VAR_FIN_ARQ_MASSA_MAY: ${VAR_FIN_ARQ_MASSA_MAY}"
	@echo "VAR_FIN_ARQ_MASSA_JUNE: ${VAR_FIN_ARQ_MASSA_JUNE}"
	@echo "VAR_FIN_ARQ_MASSA_JULY: ${VAR_FIN_ARQ_MASSA_JULY}"
	@echo "VAR_FIN_ARQ_MASSA_AUGUST: ${VAR_FIN_ARQ_MASSA_AUGUST}"
	@echo "VAR_FIN_ARQ_MASSA_SEPTEMBER: ${VAR_FIN_ARQ_MASSA_SEPTEMBER}"
	@echo "VAR_FIN_ARQ_MASSA_OCTOBER: ${VAR_FIN_ARQ_MASSA_OCTOBER}"
	@echo "ATTR_FIN_OPENAI_API_KEY: ${ATTR_FIN_OPENAI_API_KEY}"
	@echo "ATTR_FIN_DIR_DATA: ${ATTR_FIN_DIR_DATA}"
	@echo "ATTR_FIN_DIR_INPUT: ${ATTR_FIN_DIR_INPUT}"
	@echo "ATTR_FIN_DIR_IMGS: ${ATTR_FIN_DIR_IMGS}"
	@echo "ATTR_FIN_DIR_MASSA: ${ATTR_FIN_DIR_MASSA}"
	@echo "ATTR_FIN_DIR_TMP: ${ATTR_FIN_DIR_TMP}"
	@echo "ATTR_FIN_DIR_MENSAGENS: ${ATTR_FIN_DIR_MENSAGENS}"
	@echo "ATTR_FIN_DIR_OCR: ${ATTR_FIN_DIR_OCR}"
	@echo "ATTR_FIN_DIR_DOCS: ${ATTR_FIN_DIR_DOCS}"
	@echo "ATTR_FIN_DIR_SRC: ${ATTR_FIN_DIR_SRC}"
	@echo "ATTR_FIN_DIR_TEMPLATES: ${ATTR_FIN_DIR_TEMPLATES}"
	@echo "ATTR_FIN_ARQ_CALCULO: ${ATTR_FIN_ARQ_CALCULO}"
	@echo "ATTR_FIN_ARQ_MENSAGENS: ${ATTR_FIN_ARQ_MENSAGENS}"
	@echo "ATTR_FIN_ARQ_DIAGNOSTICO: ${ATTR_FIN_ARQ_DIAGNOSTICO}"
	@echo "ATTR_FIN_ARQ_CHAT: ${ATTR_FIN_ARQ_CHAT}"
	@echo "ATTR_FIN_ARQ_OCR_XML: ${ATTR_FIN_ARQ_OCR_XML}"
	@echo "ATTR_FIN_ARQ_MAIN: ${ATTR_FIN_ARQ_MAIN}"
	@echo "ATTR_FIN_ARQ_REPORT_HTML: ${ATTR_FIN_ARQ_REPORT_HTML}"
	@echo "ATTR_FIN_ARQ_REPORT_JULY: ${ATTR_FIN_ARQ_REPORT_JULY}"
	@echo "ATTR_FIN_ARQ_REPORT_JULY_EDIT: ${ATTR_FIN_ARQ_REPORT_JULY_EDIT}"
	@echo "ATTR_FIN_ARQ_TEMPLATE_MONTHLY_EDITABLE: ${ATTR_FIN_ARQ_TEMPLATE_MONTHLY_EDITABLE}"
	@echo "ATTR_FIN_ARQ_TEMPLATE_MONTHLY: ${ATTR_FIN_ARQ_TEMPLATE_MONTHLY}"
	@echo "ATTR_FIN_ARQ_TEMPLATE_PRINT: ${ATTR_FIN_ARQ_TEMPLATE_PRINT}"
	@echo "ATTR_FIN_ARQ_TEMPLATE_REPORT: ${ATTR_FIN_ARQ_TEMPLATE_REPORT}"
	@echo "ATTR_FIN_ARQ_MASSA_APRIL: ${ATTR_FIN_ARQ_MASSA_APRIL}"
	@echo "ATTR_FIN_ARQ_MASSA_MAY: ${ATTR_FIN_ARQ_MASSA_MAY}"
	@echo "ATTR_FIN_ARQ_MASSA_JUNE: ${ATTR_FIN_ARQ_MASSA_JUNE}"
	@echo "ATTR_FIN_ARQ_MASSA_JULY: ${ATTR_FIN_ARQ_MASSA_JULY}"
	@echo "ATTR_FIN_ARQ_MASSA_AUGUST: ${ATTR_FIN_ARQ_MASSA_AUGUST}"
	@echo "ATTR_FIN_ARQ_MASSA_SEPTEMBER: ${ATTR_FIN_ARQ_MASSA_SEPTEMBER}"
	@echo "ATTR_FIN_ARQ_MASSA_OCTOBER: ${ATTR_FIN_ARQ_MASSA_OCTOBER}"
	@echo "ATTR_FIN_ARQ_DB: ${ATTR_FIN_ARQ_DB}"
	
# Dependências dos comandos principais
install: check_poetry_installed create-directories
run: check_poetry_installed install
process: check_poetry_installed install
force: check_poetry_installed install
server: check_poetry_installed install
copy: check_poetry_installed install
copy-july-report: check_poetry_installed install
copy-report: check_poetry_installed

# =============================================================================
# COMANDOS PRINCIPAIS (ORDEM ALFABÉTICA)
# =============================================================================

# Copia o arquivo de massa de Abril
copy-april:
	@cp -v "${ATTR_FIN_ARQ_MASSA_APRIL}" ${ATTR_FIN_DIR_INPUT}

# Copia o arquivo de massa de Agosto
copy-august:
	@cp -v "${ATTR_FIN_ARQ_MASSA_AUGUST}" ${ATTR_FIN_DIR_INPUT}

# Copia o arquivo de massa de Junho
copy-june:
	@cp -v "${ATTR_FIN_ARQ_MASSA_JUNE}" ${ATTR_FIN_DIR_INPUT}

# Copia o arquivo de massa de Julho
copy-july:
	@cp -v "${ATTR_FIN_ARQ_MASSA_JULY}" ${ATTR_FIN_DIR_INPUT}

# Copia o arquivo de massa de Maio
copy-may:
	@cp -v "${ATTR_FIN_ARQ_MASSA_MAY}" ${ATTR_FIN_DIR_INPUT}

# Copia o arquivo de massa de Outubro
copy-october:
	@cp -v "${ATTR_FIN_ARQ_MASSA_OCTOBER}" ${ATTR_FIN_DIR_INPUT}

# Copia o arquivo de massa de Setembro
copy-september:
	@cp -v "${ATTR_FIN_ARQ_MASSA_SEPTEMBER}" ${ATTR_FIN_DIR_INPUT}

# Copia os arquivos do módulo wa_fin_ctrl para analise
copy:
	@mkdir -pv ${ATTR_FIN_DIR_TMP}
	@echo "Copiando os arquivos do módulo wa_fin_ctrl para analise. " > ${ATTR_FIN_DIR_TMP}/copy2chatgpt.txt
	@cat ${ATTR_FIN_DIR_SRC}/wa_fin_ctrl/app.py ${ATTR_FIN_DIR_SRC}/wa_fin_ctrl/cli.py ${ATTR_FIN_DIR_SRC}/wa_fin_ctrl/helper.py ${ATTR_FIN_DIR_SRC}/wa_fin_ctrl/ia.py \
	${ATTR_FIN_DIR_SRC}/wa_fin_ctrl/ocr.py \
	${ATTR_FIN_DIR_SRC}/wa_fin_ctrl/env.py \
	${ATTR_FIN_DIR_SRC}/wa_fin_ctrl/template.py \
	${ATTR_FIN_DIR_SRC}/wa_fin_ctrl/reporter.py \
	${ATTR_FIN_DIR_SRC}/wa_fin_ctrl/check.py >> ${ATTR_FIN_DIR_TMP}/copy2chatgpt.txt
	@pbcopy < ${ATTR_FIN_DIR_TMP}/copy2chatgpt.txt
	@echo "✅ Conteúdo copiado para a área de transferência"

# Copia o OCR para analise
copy-ocr:
	@mkdir -pv ${ATTR_FIN_DIR_OCR}
	@echo "<!-- ${ATTR_FIN_ARQ_OCR_XML} -->" > ${ATTR_FIN_DIR_TMP}/copy2chatgpt.txt
	@cat ${ATTR_FIN_ARQ_OCR_XML} >> ${ATTR_FIN_DIR_TMP}/copy2chatgpt.txt
	@pbcopy < ${ATTR_FIN_DIR_TMP}/copy2chatgpt.txt
	@echo "✅ Conteúdo do OCR copiado para a área de transferência"

# Copia o relatório report.html para analise
copy-report:
	@mkdir -pv ${ATTR_FIN_DIR_TMP}
	@echo "Copiando o relatório report.html para analise..." > ${ATTR_FIN_DIR_TMP}/copy2chatgpt.txt
	@cat ${ATTR_FIN_ARQ_REPORT_HTML} >> ${ATTR_FIN_DIR_TMP}/copy2chatgpt.txt
	@pbcopy < ${ATTR_FIN_DIR_TMP}/copy2chatgpt.txt
	@echo "✅ Conteúdo do relatório report.html copiado para a área de transferência"

# Copia o relatório de Julho para analise
copy-july-report:
	@mkdir -pv ${ATTR_FIN_DIR_TMP}
	@echo "Copiando o relatório de Julho..." > ${ATTR_FIN_DIR_TMP}/copy2chatgpt.txt
	@cat ${ATTR_FIN_ARQ_REPORT_JULY} >> ${ATTR_FIN_DIR_TMP}/copy2chatgpt.txt
	@echo "Copiando o relatório editavel..." >> ${ATTR_FIN_DIR_TMP}/copy2chatgpt.txt
	@cat ${ATTR_FIN_ARQ_REPORT_JULY_EDIT} >> ${ATTR_FIN_DIR_TMP}/copy2chatgpt.txt
	@pbcopy < ${ATTR_FIN_DIR_TMP}/copy2chatgpt.txt
	@echo "✅ Conteúdo do relatório de Julho copiado para a área de transferência"

# Copia os templates dos relatórios para analise
copy-templates:
	@mkdir -pv ${ATTR_FIN_DIR_TMP}
	@echo "Copiando os templates dos relatórios para analise. " > ${ATTR_FIN_DIR_TMP}/copy2chatgpt.txt
	@cat ${ATTR_FIN_ARQ_TEMPLATE_MONTHLY_EDITABLE} >> ${ATTR_FIN_DIR_TMP}/copy2chatgpt.txt
	@cat ${ATTR_FIN_ARQ_TEMPLATE_MONTHLY} >> ${ATTR_FIN_DIR_TMP}/copy2chatgpt.txt
	@cat ${ATTR_FIN_ARQ_TEMPLATE_PRINT} >> ${ATTR_FIN_DIR_TMP}/copy2chatgpt.txt
	@cat ${ATTR_FIN_ARQ_TEMPLATE_REPORT} >> ${ATTR_FIN_DIR_TMP}/copy2chatgpt.txt
	@pbcopy < ${ATTR_FIN_DIR_TMP}/copy2chatgpt.txt
	@echo "✅ Conteúdo dos templates copiado para a área de transferência"

# Marca uma entrada como desconsiderada
dismiss:
	poetry run python ${ATTR_FIN_ARQ_MAIN} dismiss "$(find)" 

# Corrige uma entrada específica
fix:
	poetry run python ${ATTR_FIN_ARQ_MAIN} fix "$(find)" --value "$(value)" --class "$(class)" --desc "$(desc)" 

# Corrige uma entrada específica e marca como desconsiderada
fix-dismiss:
	poetry run python ${ATTR_FIN_ARQ_MAIN} fix "$(find)" --value "$(value)" --class "$(class)" --desc "$(desc)" --dismiss 

# Corrige uma entrada específica e rotaciona
fix-rotate:
	poetry run python ${ATTR_FIN_ARQ_MAIN} fix "$(find)" --rotate "$(rotate)" 

# Corrige uma entrada específica e rotaciona e usa IA
fix-rotate-ia:
	poetry run python ${ATTR_FIN_ARQ_MAIN} fix "$(find)" --rotate "$(rotate)" --ia 

# Corrige uma entrada usando arquivo JSON (legado)
fix-json:
	poetry run python ${ATTR_FIN_ARQ_MAIN} fix "$(find)" --value "$(value)" --class "$(class)" --desc "$(desc)" --use-json

# Gerencia histórico de comandos
history:
	poetry run python ${ATTR_FIN_ARQ_MAIN} history

# Mostra estatísticas do histórico
history-stats:
	poetry run python ${ATTR_FIN_ARQ_MAIN} history --stats

# Mostra comandos recentes
history-recent:
	poetry run python ${ATTR_FIN_ARQ_MAIN} history --recent 24

# Limpa histórico
history-clear:
	poetry run python ${ATTR_FIN_ARQ_MAIN} history --clear

# Migra dados do JSON para o banco
history-migrate:
	poetry run python ${ATTR_FIN_ARQ_MAIN} history --migrate

# Mostra histórico em formato JSON
history-json:
	poetry run python ${ATTR_FIN_ARQ_MAIN} history --json

# Processa todos os arquivos (força reprocessamento, sem backup)
force:
	poetry run python ${ATTR_FIN_ARQ_MAIN} processar --force 
	
# Processa todos os arquivos (força reprocessamento, com backup)
force-backup:
	poetry run python ${ATTR_FIN_ARQ_MAIN} processar --force --backup

# Exibe a mensagem de ajuda
help:
	@echo "Uso: make <target>"
	@echo "Targets disponíveis:"
	@echo "  help: Exibe esta mensagem de ajuda"
	@echo "  install: Instala as dependências do projeto"
	@echo "  run: Executa o script principal"
	@echo "  process: Processa arquivos incrementalmente (sem backup)"
	@echo "  process-backup: Processa arquivos incrementalmente (com backup)"
	@echo "  force: Processa todos os arquivos (força reprocessamento, sem backup)"
	@echo "  force-backup: Processa todos os arquivos (força reprocessamento, com backup)"
	@echo "  pdf: Processa apenas PDFs (sem backup)"
	@echo "  pdf-backup: Processa apenas PDFs (com backup)"
	@echo "  img: Processa apenas imagens (sem backup)"
	@echo "  img-backup: Processa apenas imagens (com backup)"
	@echo "  dismiss: Marca uma entrada como desconsiderada"
	@echo "    Exemplo: make dismiss find=\"21/04/2025 18:33:54\""
	@echo "  fix: Corrige uma entrada específica (banco de dados)"
	@echo "    Exemplo: make fix find=\"24/04/2025 11:57:45\" value=\"39,47\" class=\"transferência\" desc=\"PIX para padaria\""
	@echo "    Exemplo com dismiss: make fix find=\"24/04/2025 11:57:45\" dismiss=1"
	@echo "    Exemplo com rotação: make fix find=\"24/04/2025 11:57:45\" rotate=\"90\""
	@echo "    Exemplo com rotação e IA: make fix find=\"24/04/2025 11:57:45\" rotate=\"90\" ia=1"
	@echo "  fix-json: Corrige uma entrada usando arquivo JSON (legado)"
	@echo "    Exemplo: make fix-json find=\"24/04/2025 11:57:45\" value=\"39,47\""
	@echo "  History (Banco de Dados):"
	@echo "    history: Mostra histórico de comandos"
	@echo "    history-stats: Mostra estatísticas do histórico"
	@echo "    history-recent: Mostra comandos das últimas 24h"
	@echo "    history-clear: Limpa todo o histórico"
	@echo "    history-migrate: Migra dados do JSON para o banco"
	@echo "    history-json: Mostra histórico em formato JSON"
	@echo "  Django:"
	@echo "    migrate: Executa migrações do banco de dados"
	@echo "    makemigrations: Cria novas migrações"
	@echo "    collectstatic: Coleta arquivos estáticos"
	@echo "    server: Inicia o servidor Django (localhost:8000)"
	@echo "    api: Inicia a API REST Django (localhost:8000)"
	@echo "  Frontend:"
	@echo "    front: Inicia o frontend React (localhost:4779)"
	@echo "    front-clean: Limpa e reinstala dependências do frontend"
	@echo "    front-fresh: Inicia frontend com limpeza prévia"
	@echo "    kill-front: Encerra o frontend"
	@echo "    reload-front: Recarrega o frontend"
	@echo "  Desenvolvimento:"
	@echo "    dev: Inicia API e frontend juntos (recomendado)"
	@echo "    dev-fresh: Inicia API e frontend com limpeza prévia"
	@echo "    api: Inicia apenas a API Django"
	@echo "    front: Inicia apenas o frontend React"
	@echo "  Processos:"
	@echo "    ps-api: Mostra processos da API"
	@echo "    ps-front: Mostra processos do frontend"
	@echo "    ps-all: Mostra todos os processos"
	@echo "    kill-all: Encerra todos os processos"
	@echo "  copy: Copia a estrutura do projeto para a área de transferência"

# Processa apenas imagens (sem backup)
img:
	poetry run python ${ATTR_FIN_ARQ_MAIN} img

# Processa apenas imagens (com backup)
img-backup:
	poetry run python ${ATTR_FIN_ARQ_MAIN} img --backup

# Instala as dependências do projeto
install:
	poetry install --no-interaction --no-root

# Processa apenas PDFs (sem backup)
pdf:
	poetry run python ${ATTR_FIN_ARQ_MAIN} pdf

# Processa apenas PDFs (com backup)
pdf-backup:
	poetry run python ${ATTR_FIN_ARQ_MAIN} pdf --backup

# Processa arquivos incrementalmente (sem backup)
process:
	poetry run python ${ATTR_FIN_ARQ_MAIN} processar 

# Processa arquivos incrementalmente (com backup)
process-backup:
	poetry run python ${ATTR_FIN_ARQ_MAIN} processar --backup

# Processa arquivos em paralelo (recomendado)
process-parallel:
	poetry run python ${ATTR_FIN_ARQ_MAIN} processar --parallel --max-workers 4

# Processa arquivos em paralelo com backup
process-parallel-backup:
	poetry run python ${ATTR_FIN_ARQ_MAIN} processar --parallel --max-workers 4 --backup



# Remove todos os arquivos
remove-all:
	@$(MAKE) remove-reports
	@$(MAKE) remove-baks
	@$(MAKE) remove-imgs
	@$(MAKE) remove-tmp
	@$(MAKE) remove-input
	@$(MAKE) remove-data

# Remove os backups
remove-baks:
	@rm -fv *.bak

# Remove os data
remove-data:
	@rm -rfv ${ATTR_FIN_DIR_DATA}/*

# Remove as imagens
remove-imgs:
	@rm -rfv ${ATTR_FIN_DIR_IMGS}/*





# Remove os relatórios
remove-reports:
	@rm -rfv ${ATTR_FIN_DIR_DOCS}/*.html

# Remove o diretório de entrada
remove-input:
	@rm -rfv ${ATTR_FIN_DIR_INPUT}/*

# Remove os temporários
remove-tmp:
	@rm -rfv ${ATTR_FIN_DIR_TMP}/*

# Executa o script principal
run:
	poetry run python ${ATTR_FIN_ARQ_MAIN} --help 

# Comandos Django
migrate:
	poetry run python manage.py migrate

makemigrations:
	poetry run python manage.py makemigrations

collectstatic:
	poetry run python manage.py collectstatic --noinput

# Inicia o servidor Django
server:
	poetry run python manage.py runserver 0.0.0.0:8000

# Inicia a API REST (Django)
api:
	poetry run python manage.py runserver 0.0.0.0:8000 &

front:
	@echo "Iniciando frontend..."
	@cd frontend && npm install --silent
	@cd frontend && npm run dev &
	@echo "Frontend iniciado em background"

rebuild: remove-all copy-july process api

reload: process api

# Inicia API e frontend juntos
dev:
	@echo "Iniciando ambiente de desenvolvimento..."
	@$(MAKE) kill-all 2>/dev/null || true
	@$(MAKE) api
	@sleep 3
	@$(MAKE) front
	@echo "✅ Ambiente de desenvolvimento iniciado!"
	@echo "🌐 API: http://localhost:8000"
	@echo "⚛️  Frontend: http://localhost:4779"

# Inicia API e frontend com limpeza prévia
dev-fresh: api front-fresh

kill-api:
	@echo "Verificando processos na porta 8000..."
	@PID=$$(lsof -ti:8000 2>/dev/null); \
	if [ -n "$$PID" ]; then \
		echo "Encerrando processo na porta 8000 (PID=$$PID)"; \
		kill -9 $$PID; \
		echo "Processo encerrado."; \
	else \
		echo "Nenhum processo encontrado na porta 8000."; \
	fi

kill-front:
	@echo "Verificando processos do frontend..."
	@PID=$$(lsof -ti:4779 2>/dev/null); \
	if [ -n "$$PID" ]; then \
		echo "Encerrando frontend na porta 4779 (PID=$$PID)"; \
		kill -9 $$PID; \
		echo "Frontend encerrado."; \
	else \
		echo "Nenhum processo encontrado na porta 4779."; \
	fi

kill-all: kill-api kill-front

ps-api:
	@lsof -ti:8000 2>/dev/null | xargs ps -p 2>/dev/null || echo "Nenhum processo encontrado na porta 8000"

ps-front:
	@lsof -ti:4779 2>/dev/null | xargs ps -p 2>/dev/null || echo "Nenhum processo encontrado na porta 4779"

ps-all: ps-api ps-front

reload-api: kill-api process api

reload-front: kill-front front

# Limpa e reinstala dependências do frontend
front-clean:
	@echo "Limpando dependências do frontend..."
	@cd frontend && rm -rf node_modules package-lock.json || true
	@cd frontend && npm install || true
	@echo "Dependências do frontend reinstaladas"

# Inicia frontend com limpeza prévia
front-fresh: front-clean front

.PHONY: help install run server api copy remove-reports remove-baks remove-ocr remove-mensagens remove-imgs remove-tmp remove-input remove-all show-variables copy-april copy-may copy-june copy-july copy-august copy-september copy-october fix-rotate fix-rotate-ia dev front api
