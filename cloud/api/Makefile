# api/Makefile

.PHONY: help dev test docs docker docker-dev format lint clean install build stack stack-dev stack-stop stack-logs stack-status stack-restart validate-nginx start stop logs

# Variáveis
APP_NAME = yagnostic-api
PORT = 3333
DOCKER_IMAGE = $(APP_NAME):latest
NGINX_PORT = 8080
ROOT_COMPOSE = ../docker-compose.yml
COMPOSE_CMD = docker compose -f $(ROOT_COMPOSE)

# Comando padrão
help:
	@echo "Comandos disponíveis:"
	@echo "  dev           - Inicia o servidor de desenvolvimento NestJS"
	@echo "  test          - Executa os testes"
	@echo "  docs          - Abre o navegador na rota Swagger"
	@echo "  docker        - Executa a build e sobe o container"
	@echo "  docker-dev    - Executa em modo desenvolvimento"
	@echo "  format        - Executa prettier com padrão do projeto"
	@echo "  lint          - Executa ESLint"
	@echo "  clean         - Remove arquivos de build e node_modules"
	@echo "  install       - Instala dependências"
	@echo "  build         - Compila o projeto"
	@echo "  start         - Inicia o serviço API via docker-compose"
	@echo "  stop          - Para o serviço API"
	@echo "  logs          - Mostra logs do serviço API"
	@echo ""
	@echo "🐳 Stack Docker com NGINX (Rate Limiting):"
	@echo "  stack         - Inicia o stack completo (NGINX + API)"
	@echo "  stack-dev     - Inicia o stack em modo desenvolvimento"
	@echo "  stack-stop    - Para o stack completo"
	@echo "  stack-logs    - Mostra logs do stack"
	@echo "  stack-status  - Status dos serviços"
	@echo "  stack-restart - Reinicia o stack completo"
	@echo "  validate-nginx- Valida configurações do NGINX"

# Desenvolvimento local
dev:
	@echo "🔧 Iniciando desenvolvimento NestJS..."
	npm run start:dev

# Testes
test:
	npm run test

# Documentação Swagger
docs:
	open http://localhost:3333/docs

# Docker produção
docker:
	$(COMPOSE_CMD) up --build --watch

# Docker desenvolvimento
docker-dev:
	@echo "🐳 Iniciando container de desenvolvimento..."
	$(COMPOSE_CMD) --profile dev up --build -d api-dev
	@echo "✅ Container de desenvolvimento iniciado! Acesse: http://localhost:$(PORT)"

# Build do projeto
build:
	npm run build
	@echo "✅ Build concluído!"

# Comando para desenvolvimento completo
dev-setup: install format lint test
	@echo "✅ Setup de desenvolvimento concluído!"

# Comando para verificar status
status:
	@echo "📊 Status do projeto:"
	@echo "  - Porta: $(PORT)"
	@echo "  - Nome: $(APP_NAME)"
	@echo "  - Docker: $(DOCKER_IMAGE)"
	@if docker ps | grep -q $(APP_NAME); then \
		echo "  - Container: ✅ Rodando"; \
	else \
		echo "  - Container: ❌ Parado"; \
	fi

# Docker orchestration targets (AGENTS.md compliance)
start:
	$(COMPOSE_CMD) up -d api

stop:
	$(COMPOSE_CMD) stop api

logs:
	$(COMPOSE_CMD) logs -f api

clean:
	@echo "🧹 Limpando artefatos..."
	rm -rf dist/
	rm -rf node_modules/.cache
	$(COMPOSE_CMD) down -v --rmi local --remove-orphans
	@echo "✅ Limpeza concluída!" 
