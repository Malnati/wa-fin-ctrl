<!-- cloud/api/README.md -->
# 🧠 Yagnostic API

![Node](https://img.shields.io/badge/Node.js-18.x-green?logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-4.x-blue?logo=typescript)
![NestJS](https://img.shields.io/badge/NestJS-10-red?logo=nestjs)
![Swagger](https://img.shields.io/badge/Swagger-UI-brightgreen?logo=swagger)
![Docker](https://img.shields.io/badge/Docker-ready-blue?logo=docker)
![Makefile](https://img.shields.io/badge/Makefile-supported-lightgrey?logo=gnu)
![Tests](https://img.shields.io/badge/Jest-tested%20✅-red?logo=jest)
![NGINX](https://img.shields.io/badge/NGINX-Rate%20Limiting-orange?logo=nginx)

---

## 📦 Tecnologias utilizadas

- **NestJS** – Framework modular para Node.js
- **TypeScript** – Tipagem estática moderna para JavaScript
- **Swagger** – Documentação automática de endpoints
- **Jest** – Testes unitários e e2e
- **Docker** – Containerização da aplicação
- **Makefile** – Comandos automatizados
- **NGINX** – Gateway reverso com rate limiting para integrações externas

---

## 🚀 Como executar a API

### ▶️ Usando npm

```bash
npm install
npm run start:dev
```

### 🐳 Usando Docker

Na raiz do repositório (arquivo `docker-compose.yml`), execute:

```bash
docker compose up --build
```

> **Credenciais do Google**  
> Monte o arquivo apontado por `GOOGLE_APPLICATION_CREDENTIALS` como volume no contêiner (por exemplo, `-v $(pwd)/clientsecret.json:/app/credentials/clientsecret.json`) e ajuste a variável de ambiente para refletir o caminho interno.

### ⚙️ Usando Makefile

```bash
make dev
```

A aplicação ficará disponível em: **http://localhost:3333**

### 📋 Comandos Disponíveis

```bash
# Desenvolvimento
make dev           # Inicia o servidor de desenvolvimento NestJS
make test          # Executa os testes
make build         # Compila o projeto
make docs          # Abre o navegador na rota Swagger

# Docker e Stack
make docker        # Executa a build e sobe o container
make docker-dev    # Executa em modo desenvolvimento
make stack         # Inicia o stack completo (NGINX + API)
make stack-dev     # Inicia o stack em modo desenvolvimento
make stack-stop    # Para o stack completo
make stack-logs    # Mostra logs do stack
make stack-status  # Status dos serviços

# Utilitários
make format        # Executa prettier
make lint          # Executa ESLint
make clean         # Remove arquivos de build e node_modules
make install       # Instala dependências
```

### ⚙️ Variáveis de Ambiente Principais

**Core e URLs**
- `PORT` — Porta interna exposta pelo NestJS (`3333`).
- `API_BASE_URL` — Base pública da API utilizada pelos clientes (`http://localhost:3333`).
- `FILES_PUBLIC_URL` — Base para gerar links de download dos uploads (`http://localhost:3333/uploads`).
- `AUTHORIZED_DOMAINS` — Lista separada por vírgula para restringir CORS (opcional).

**Mensageria e histórico**
- `MESSAGE_PREFIX` — Prefixo aplicado aos IDs de notificações mock (`MSG-`).
- `SUCCESS_MESSAGE` — Texto retornado ao concluir a simulação de envio (`Notification registered successfully`).
- `FILE_HISTORY_METADATA_FILE_NAME` — Arquivo JSON que persiste o histórico (`file-history-metadata.json`).
- `FILE_HISTORY_STORAGE_DIR` — Diretório usado para armazenar o cache (`/app/storage/file-history`).
- `FILE_HISTORY_UPLOADS_DIR` — Diretório com os arquivos enviados (`/app/storage/uploads`).
- `UPLOAD_METADATA_STORAGE_DIR` — Diretório dos metadados do serviço de upload (`/app/storage/metadata`).
- `FILE_HISTORY_CACHE_TTL` — Intervalo em milissegundos para recarregar o cache (`60000`).
- `FILE_HISTORY_DEFAULT_PAGE_SIZE` — Tamanho padrão de paginação (`10`).
- `FILE_HISTORY_MAX_PAGE_SIZE` — Limite máximo por página (`100`).

**Integrações de IA**
- `OPENAI_SERVICE_DISABLED_MESSAGE` — Mensagem exibida quando a integração OpenAI está desativada.
- `OPENROUTER_API_KEY`, `OPENROUTER_COOKIE`, `OPENROUTER_BASE_URL`, `OPENROUTER_PDF_MODEL`, `OPENROUTER_PDF_ENGINE`, `OPENROUTER_HTTP_REFERER`, `OPENROUTER_APP_TITLE` — Configuram o pipeline de OCR via OpenRouter (suportando chave de API ou cookie de sessão, além dos metadados exigidos pela plataforma).
- `OPENAI_API_KEY` — Chave da API OpenAI (opcional quando usar somente OpenRouter).

**Rate limiting e NGINX**
- `NGINX_PORT` — Porta exposta pelo gateway (`8080`).
- `NGINX_RATE_LIMIT_LLM` / `NGINX_BURST_LLM` — Limite e burst para LLM (`1r/m` e `5`).
- `NGINX_RATE_LIMIT_GENERAL` / `NGINX_BURST_GENERAL` — Limite global para demais rotas (`10r/m` e `20`).
- `OPENAI_RATE_LIMIT` — Janela de rate limit monitorada para integrações externas.

**Diagnósticos e saúde**
- `DIAGNOSTICS_API_INTERNAL_PORT` — Porta interna utilizada pelos utilitários de diagnóstico (`3334`).

**Autenticação mock**
- `JWT_SECRET_MOCK` e `TOKEN_EXPIRATION_SECONDS` — Segredo e duração dos tokens emitidos para desenvolvimento.
- `DEMO_USER_*`, `ADMIN_USER_*`, `TEST_USER_*` — Perfis pré-carregados no mock de autenticação.

---

## 🛡️ NGINX com Rate Limiting

A API agora inclui um **NGINX** como gateway reverso que implementa rate limiting para controlar o uso de APIs externas e reduzir custos.

### 🚀 Stack Completo com NGINX

```bash
# Iniciar stack completo (NGINX + API)
make stack

# Ver status dos serviços
make stack-status

# Ver logs em tempo real
make stack-logs

# Parar stack completo
make stack-stop
```

### 📊 Rate Limiting Configurável

- **LLM (OpenRouter/OpenAI)**: `1r/m` (1 requisição por minuto)
- **Geral**: `10r/m` (10 requisições por minuto)

### 🔧 Configuração via .env

```bash
# Rate Limits
NGINX_RATE_LIMIT_LLM=1r/m
NGINX_RATE_LIMIT_GENERAL=10r/m

# Porta do NGINX
NGINX_PORT=8080
```

### 🌐 Acesso

- **NGINX**: http://localhost:8080 (configurável)
- **API Direta**: http://localhost:3333 (rede interna)

### 🧪 Testar Rate Limiting

```bash
./scripts/test-rate-limiting.sh
```

**📚 Documentação completa**: [nginx/README.md](nginx/README.md)

---

## 📥 Ingestão de ZIP do WhatsApp (`POST /wa-zip`)

O endpoint `/wa-zip` recebe o arquivo ZIP exportado do WhatsApp (com histórico e mídias), extrai apenas comprovantes financeiros (PDFs + imagens), envia cada comprovante ao **OpenRouter** para OCR avançado e persiste o texto em JSON.

- Arquivos processados são movidos para `cloud/api/extracted/` (mantido fora do Git).
- Para cada comprovante são gerados `<nome-origem>.json` com `{ origem, author, extected }` e `<nome-origem>.txt` contendo apenas o autor identificado no `_chat.txt`.
- Requer `OPENROUTER_API_KEY` (ou `OPENROUTER_COOKIE`), além de `OPENROUTER_BASE_URL` (opcional), `OPENROUTER_PDF_MODEL` e `OPENROUTER_PDF_ENGINE`. Para conformidade com o OpenRouter, configure também `OPENROUTER_HTTP_REFERER` e `OPENROUTER_APP_TITLE` com os valores aprovados na conta.
- Limite atual: 50 MB por upload (configurável).

### Exemplo de requisição

```bash
curl -X POST http://localhost:3333/wa-zip \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/caminho/para/whatsapp.zip"
```

### Exemplo de resposta

```json
[
  {
    "origem": "recibo-2025-02-15.pdf",
    "author": "Ricardo",
    "jsonPath": "extracted/recibo-2025-02-15.json",
    "authorTxtPath": "extracted/recibo-2025-02-15.txt"
  },
  {
    "origem": "pix-2025-02-18.png",
    "author": "Ana",
    "jsonPath": "extracted/pix-2025-02-18.json",
    "authorTxtPath": "extracted/pix-2025-02-18.txt"
  }
]
```

Em caso de ZIP sem comprovantes válidos, a API retorna `400 Bad Request`.

---

## 🔓 Operação em ambientes HTTP

- O plano de remoção de dependências de HTTPS ([docs/plans/20241017131500-remove-https-dependency.md](../docs/plans/20241017131500-remove-https-dependency.md)) assegura que toda a stack opere em `http://` durante o desenvolvimento.
- A auditoria associada ([docs/plans/20241017131500-remove-https-dependency-audit.md](../docs/plans/20241017131500-remove-https-dependency-audit.md)) detalha as verificações executadas para cookies, CORS e placeholders.
- A API está configurada para aceitar requisições de qualquer origem (CORS liberado via `app.enableCors`), dispensando listas pré-configuradas.

## 🔐 Autenticação

A API inclui um endpoint de autenticação mock para desenvolvimento e testes, simulando integração com Google OAuth.

### 🔑 Endpoints de Autenticação

#### POST /auth
Autentica usuário usando credenciais Google OAuth (mock).

```bash
curl -X POST http://localhost:3333/auth \
  -H 'Content-Type: application/json' \
  -d '{
    "credential": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "clientId": "123456789-abcdef.apps.googleusercontent.com",
    "context": "chrome-extension"
  }'
```

**Resposta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {
    "id": "usr_demo_001",
    "email": "usuario.demo@yagnostic.local",
    "name": "Usuário Demo",
    "picture": "https://lh3.googleusercontent.com/a/default-user=s96-c",
    "email_verified": true
  },
  "success": true,
  "timestamp": "2025-10-18T22:20:12.269Z",
  "request_id": "req_123456789"
}
```

#### GET /auth/status
Verifica o status do serviço de autenticação.

```bash
curl -X GET http://localhost:3333/auth/status
```

### 👥 Usuários Mock Disponíveis

- **usuario.demo@yagnostic.local** - Usuário Demo (padrão)
- **admin@yagnostic.local** - Administrador Sistema  
- **test@example.com** - Usuário de Teste

### 🔒 Características do Mock

- ✅ **JWT Tokens**: Estrutura de JWT válida com payload decodificável
- ✅ **Validação**: Validação robusta de entrada com DTOs
- ✅ **Logs Rastreáveis**: Request IDs para auditoria completa
- ✅ **Swagger**: Documentação completa com exemplos
- ⚠️ **Desenvolvimento Only**: Não adequado para produção

## 📨 Como submeter um arquivo

A API aceita `multipart/form-data` com apenas o campo `file`. Exemplo:

```bash
curl -X POST http://localhost:3333/diagnostics/submit \
  -H 'accept: application/json' \
  -F 'file=@arquivo.pdf'
```

### Tipos de arquivo suportados

- **PDF**: Extração automática de texto com `pdf-parse`
- **Arquivos de texto**: TXT, JS, TS, HTML, CSS, etc.
- **Outros tipos**: Lidos como texto UTF-8

### Limitações

- Tamanho máximo: 10MB
- Campo obrigatório: `file`
- Formato: `multipart/form-data`
- O PDF é enviado ao OpenAI via Files API (purpose `vision`), que atualmente aceita arquivos de até ~20MB
- Requer conexão com a internet e credenciais válidas do OpenRouter (`OPENROUTER_API_KEY` ou `OPENROUTER_COOKIE`) com permissão de upload

---


## 🔑 Endpoint de autenticação (mock)

### POST /auth

Endpoint de login que retorna um JWT fictício e dados simulados do usuário. Não requer autenticação nesta fase.

**Payload:**

```json
{
  "username": "mockuser",
  "password": "senha123"
}
```

**Resposta:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mocked.jwt.token",
  "user": {
    "id": 1,
    "username": "mockuser",
    "email": "mockuser@example.com",
    "name": "Mock User",
    "roles": ["user"]
  }
}
```

**Exemplo de requisição:**

```bash
curl -X POST http://localhost:3333/auth \
  -H 'Content-Type: application/json' \
  -d '{"username": "mockuser", "password": "senha123"}'
```

---

## 📄 Retorno esperado da API

```json
{
  "status": "OK",
  "resumo": "O arquivo foi analisado com sucesso.",
          "text": "Análise gerada com base no conteúdo do arquivo.",
  "textExtracted": "...texto extraído do PDF...",
  "audioUrl": "http://localhost:3333/diagnostico-1690000000000.mp3",
  "pdfUrl": "http://localhost:3333/relatorio-1690000000000.pdf"
}
```

**Nota**: `pdfUrl` só é retornado para arquivos PDF.

---

## 🧪 Como rodar os testes

### Variáveis de Ambiente Obrigatórias

Todos os testes requerem as variáveis de ambiente definidas no `docker-compose.yml`. As variáveis podem ser configuradas de duas formas:

### Opção 1: Com Docker (Recomendado)

```bash
# Iniciar o ambiente completo
docker-compose up -d api

# Executar testes dentro do container
docker-compose exec api npm test

# Ou executar testes específicos
docker-compose exec api npm test -- --testPathPattern=auth
```

### Opção 2: Manualmente com Variáveis de Ambiente

```bash
# Definir todas as variáveis necessárias
JWT_SECRET_MOCK="mock-jwt-secret-for-development-only" \
TOKEN_EXPIRATION_SECONDS="3600" \
DEMO_USER_EMAIL="usuario.demo@yagnostic.local" \
DEMO_USER_NAME="Usuário Demo" \
DEMO_USER_PICTURE="https://via.placeholder.com/40" \
ADMIN_USER_EMAIL="admin@yagnostic.local" \
ADMIN_USER_NAME="Administrador Sistema" \
ADMIN_USER_PICTURE="https://via.placeholder.com/40" \
TEST_USER_EMAIL="test@example.com" \
TEST_USER_NAME="Usuário de Teste" \
TEST_USER_PICTURE="https://via.placeholder.com/40" \
npm test

# Ou para testes específicos
[...variáveis...] npm test -- --testPathPattern=auth
```

> **⚠️ Importante**: Todos os valores de configuração devem ser definidos no `docker-compose.yml`. 
> Não há fallbacks ou valores padrão no código - isso garante consistência entre ambientes.

### Testes E2E

```bash
npm run test:e2e
```

### Cobertura de testes

```bash
npm run test:cov
```

---

## 📄 Interface Estática

Este repositório inclui uma interface estática HTML/JavaScript localizada em `/public/index.html` que pode ser usada para testar a API localmente. A interface oferece:

- Upload de arquivos PDF
- Funcionalidades de white label
- Visualização de resultados da análise

### 🌐 Acesso à Interface

Quando o servidor estiver rodando, acesse:
- **Interface Estática**: http://localhost:3333/index.html
- **API Swagger**: http://localhost:3333/docs

---

```bash
npm run test:cov
```

---

## 📧 Notificações por E-mail (Mock)

A API inclui um endpoint mock para envio de notificações por e-mail que registra solicitações e retorna sucesso imediato.

### POST /notify/email

**URL**: `http://localhost:3333/notify/email`

#### Contrato da Requisição

```json
{
  "destinatarios": ["user@example.com", "admin@company.com"],
  "assunto": "Assunto da notificação",
  "corpo": "Corpo da mensagem de e-mail",
  "id": "optional-custom-id"
}
```

#### Contrato da Resposta

```json
{
  "sucesso": true,
  "mensagemId": "msg-1729288000123-1",
  "timestamp": "2024-10-18T22:06:10.596Z",
  "destinatariosProcessados": 2,
  "mensagem": "Notificação processada com sucesso (modo mock)"
}
```

#### Exemplo de Uso

```bash
curl -X POST http://localhost:3333/notify/email \
  -H "Content-Type: application/json" \
  -d '{
    "destinatarios": ["test@example.com"],
    "assunto": "Teste de notificação",
    "corpo": "Esta é uma mensagem de teste"
  }'
```

#### Características

- **Modo Mock**: Não integra com Gmail nesta fase
- **Logs Rastreáveis**: Registra todas as solicitações com detalhes estruturados
- **Sem Autenticação**: Não requer autenticação nesta fase
- **Resposta Imediata**: Retorna sucesso sem processar envio real
- **ID Personalizado**: Permite especificar ID customizado para rastreamento

#### Logs Estruturados

Cada solicitação gera logs detalhados para auditoria:

```json
{
  "action": "email_notification_request",
  "mensagemId": "msg-1729288000123-1",
  "timestamp": "2024-10-18T22:06:10.596Z",
  "request": {
    "destinatarios": ["test@example.com"],
    "assunto": "Teste",
    "corpoLength": 25,
    "id": null
  },
  "metadata": {
    "destinatariosCount": 1,
    "hasCustomId": false,
    "endpointUrl": "http://localhost:3333/notify/email"
  }
}
```

---

## 📚 Documentação Swagger

Acesse a interface de documentação:

**http://localhost:3333/docs**

---

## 🔧 Configuração

Crie um arquivo `.env` na raiz do projeto:

```bash
OPENROUTER_API_KEY=your_openrouter_api_key_here
# ou use cookie de sessão (copie do painel do OpenRouter)
# OPENROUTER_COOKIE=or_production_session=...

OPENROUTER_HTTP_REFERER=https://your-app-url.example
OPENROUTER_APP_TITLE=Your App Name

# Para Google OAuth2 (Gmail)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost
GOOGLE_REFRESH_TOKEN=your_google_refresh_token_here

OCR_PROVIDER=tesseract
```

> **Nota**: a integração de Text-to-Speech foi desativada. O parâmetro `generateAudio`
> segue aceito pelas APIs apenas por compatibilidade, mas nenhum provedor TTS é carregado.

`OCR_PROVIDER` define o mecanismo de OCR para PDFs escaneados:

- `tesseract` – usa Tesseract.js (padrão)
- `paddle` – usa PaddleOCR (instale `pip install paddleocr` e garanta o comando `paddleocr` no PATH; internamente executa `paddleocr --image_path` para cada página)

Ao iniciar, a API valida se as credenciais do OpenRouter (`OPENROUTER_API_KEY` ou `OPENROUTER_COOKIE`) e demais variáveis obrigatórias estão definidas. Caso algo falte, a aplicação será encerrada exibindo uma mensagem de erro.

Obtenha suas credenciais em:
- OpenAI/OpenRouter: https://openrouter.ai
- Google OAuth: https://console.cloud.google.com/apis/credentials

---

## 🌐 Endpoint: Lista de Domínios Corporativos Autorizados

### `GET /domain`

Retorna a lista de domínios corporativos autorizados para uso com a extensão Chrome e integrações.

#### Exemplo de resposta

```json
{
  "domains": [
    {
      "domain": "millennium.com.br",
      "name": "Millennium Brasil",
      "description": "Domínio corporativo principal da Millennium Brasil",
      "active": true,
      "type": "corporate"
    },
    {
      "domain": "mbra.com.br",
      "name": "MBRA",
      "description": "Domínio alternativo da Millennium Brasil",
      "active": true,
      "type": "corporate"
    },
    {
      "domain": "localhost",
      "name": "Desenvolvimento Local",
      "description": "Ambiente de desenvolvimento local",
      "active": true,
      "type": "development"
    },
    {
      "domain": "127.0.0.1",
      "name": "Localhost IP",
      "description": "Endereço IP local para desenvolvimento",
      "active": true,
      "type": "development"
    }
  ],
  "total": 4,
  "timestamp": "2025-10-18T12:00:00.000Z"
}
```

#### Estrutura do payload

- `domains`: array de objetos de domínio autorizado
  - `domain` (string): domínio autorizado
  - `name` (string): nome amigável do domínio
  - `description` (string): descrição do domínio
  - `active` (boolean): se o domínio está ativo
  - `type` (string): tipo do domínio (`corporate`, `development`, `test`)
- `total` (number): total de domínios retornados
- `timestamp` (string): data/hora da consulta (ISO8601)

#### Observações
- Não requer autenticação JWT nesta fase.
- Os dados são configurados via arquivo estático em `src/config/domains.config.ts`.
- O contrato é documentado via Swagger/OpenAPI e neste README.

---

## 📋 Fluxo de funcionamento

1. **Upload do arquivo** via `multipart/form-data`
2. **Extração de texto** (PDF com `pdf-parse`, outros como UTF-8)
3. **Análise com IA** usando OpenRouter
4. *(Depreciado)* **Geração de áudio** — recurso removido; respostas retornam apenas texto
5. **Geração de PDF** com relatório completo (apenas para arquivos PDF)
6. **Retorno completo** com análise e metadados

---

Projeto desenvolvido para integrar a extensão Diagnostics Chrome com IA e persistência de análises.
