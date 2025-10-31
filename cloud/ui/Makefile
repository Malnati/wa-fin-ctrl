# ui/Makefile
# Makefile para automação do projeto yagnostic-react
# Seguindo as regras definidas em .cursor/rules

.PHONY: help dev build lint preview clean install start stop logs

# Comando padrão
help:
	@echo "Comandos disponíveis:"
	@echo "  dev      - Inicia o servidor de desenvolvimento"
	@echo "  build    - Constrói o projeto para produção"
	@echo "  lint     - Executa o linter"
	@echo "  preview  - Gera o build e executa o servidor de pré-visualização"
	@echo "  clean    - Limpa cache e arquivos temporários"
	@echo "  install  - Instala dependências"
	@echo "  start    - Inicia o serviço Platform via docker-compose"
	@echo "  stop     - Para o serviço Platform"
	@echo "  logs     - Mostra logs do serviço Platform"

# Desenvolvimento
dev:
	npm run dev

# Build
build:
	npm run build

# Linting
lint:
	npm run lint

# Preview
preview:
	npm run preview

# Limpeza
clean:
	rm -rf node_modules/.vite
	rm -rf dist
	rm -rf node_modules/.tmp

# Instalação
install:
	npm install

# Docker orchestration targets (AGENTS.md compliance)
COMPOSE_ROOT = ../docker-compose.yml
COMPOSE_CMD = docker compose -f $(COMPOSE_ROOT)

start:
	$(COMPOSE_CMD) up -d platform

stop:
	$(COMPOSE_CMD) stop platform

logs:
	$(COMPOSE_CMD) logs -f platform
