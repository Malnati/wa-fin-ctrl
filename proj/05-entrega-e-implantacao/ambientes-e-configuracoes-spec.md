<!-- proj/05-entrega-e-implantacao/ambientes-e-configuracoes-spec.md -->
# Ambientes e Configurações — WA Fin Ctrl

> Base: [./ambientes-e-configuracoes.md](./ambientes-e-configuracoes.md)

## Ambiente local
- **Stack:** Poetry, FastAPI, Uvicorn, Tesseract, Poppler.
- **Comando:** `make docker-up` (para API) ou `poetry run uvicorn ...` manual.
- **Portas:** 8000 (API), 8000/ws (WebSocket).
- **Variáveis principais:**
  - `OPENAI_API_KEY` — opcional, uso de IA.
  - `ATTR_FIN_DIR_*` — diretórios de dados (default conforme `env.py`).
  - `API_AUTH_TOKEN` (planejado) — proteção extra ao `/fix`.

## Ambiente cloud (DEV/HML/PRD)
- **Stack:** Docker Compose (NestJS API + React UI + NGINX).
- **Configuração:**
  - `NGINX_RATE_LIMIT_TTS`, `NGINX_RATE_LIMIT_LLM`, `NGINX_RATE_LIMIT_GENERAL`.
  - `JWT_SECRET`, `REFRESH_SECRET`, `SMTP_*`, `STORAGE_*`.
  - `VITE_COMPANY_*` (branding), `VITE_API_BASE_URL`.
  - `OPENROUTER_API_KEY`, `OPENROUTER_BASE_URL`, `OPENROUTER_PDF_MODEL`, `OPENROUTER_PDF_ENGINE` (extração do `/wa-zip`).
- **Portas padrão:** 3333 (API), 3000 (UI), 8080 (NGINX).
- **Secrets:** armazenar em vault/secret manager; nunca commitar.

## Cadeia `.env`
1. Adicionar placeholder em `.env.example`.
2. Referenciar no `docker-compose.yml`/`Makefile`.
3. Consumir explicitamente no código (Python/TS).
4. Atualizar documentação (`proj/`), checklists e changelog.

## Segurança
- HTTPS obrigatório em cloud (certificados válidos).  
- Rotacionar segredos trimestralmente.  
- Logging centralizado com máscara de dados sensíveis.  
- Monitoramento de CPU/Memória/Disco para contêineres críticos.

[Voltar à entrega](README-spec.md)
