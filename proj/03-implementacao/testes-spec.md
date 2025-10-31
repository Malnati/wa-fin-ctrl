<!-- proj/03-implementacao/testes-spec.md -->
# Testes na Implementação — WA Fin Ctrl

> Base: [./testes.md](./testes.md)

## Camadas de teste
- **Python unitário:** validar funções de OCR, parsing, normalização de valores e geração de relatórios.
- **Python integração:** executar `wa-fin.py teste` com massa controlada (`massa/*.zip`).
- **API local:** testes FastAPI usando `TestClient` para `/api/status`, `/fix`, WebSocket.
- **TypeScript unitário:** Jest para serviços, DTOs e componentes isolados.
- **TypeScript integração:** supertest para endpoints NestJS; testing-library para componentes React.
- **E2E (planejado):** Puppeteer/Playwright simulando revisão web + correção via API.

## Estratégia
1. Executar testes locais via `make test` (Python) e `npm run test` (cloud).  
2. Incluir dados de exemplo em `massa/` e fixtures para garantir reprodutibilidade.  
3. Armazenar relatórios em `docs/reports/` (JUnit, coverage).  
4. Automatizar execução em pipelines CI/CD.

## Cobertura mínima
- 80% nas funções críticas (`app.py`, `reporter.py`).  
- 70% nos módulos TypeScript quando estiverem refatorados.  
- 100% de execução dos testes e2e antes de releases oficiais.

## Critérios de aceitação
- Nenhum teste falhando antes de sincronizar com cloud.  
- Falhas devem abrir incidentes e gerar changelog.  
- Testes e2e precisam validar requisitos de ponta a ponta (ingestão → correção → relatório → auditoria).

[Voltar à fase de implementação](README-spec.md)
