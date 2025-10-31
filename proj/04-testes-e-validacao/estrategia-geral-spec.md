<!-- proj/04-testes-e-validacao/estrategia-geral-spec.md -->
# Estratégia Geral de Testes — WA Fin Ctrl

> Base: [./estrategia-geral.md](./estrategia-geral.md)

## Objetivos
- Garantir que pipeline local, API e futuros componentes cloud atendam aos requisitos funcionais e RNFs.
- Fornecer evidências de conformidade para auditorias internas e MPDFT.

## Abordagem
1. **Testes unitários** — validar funções críticas (OCR, parsing, normalização, DTOs).  
2. **Testes de integração** — verificar fluxo completo do pipeline local, endpoints FastAPI e sincronização cloud (quando disponível).  
3. **Testes end-to-end** — executar cenários que simulam o trabalho do curador do início ao fim.  
4. **Testes de segurança** — avaliar autenticação, autorização, exposição de dados e uso da IA.  
5. **Testes exploratórios** — curadoria analisa relatórios e UI em busca de problemas de usabilidade.

## Ambientes de teste
- **Local:** contêiner Docker com FastAPI e massas de dados em `massa/`.  
- **Cloud DEV:** instância NestJS/React com dados sintéticos.  
- **Cloud HML:** espelho de produção com controles de acesso, usado para validação final.

## Ferramentas
- Python: `pytest`, `unittest`, `fastapi.testclient`.  
- TypeScript: `jest`, `@testing-library/react`, `supertest`.  
- E2E: `playwright` ou `puppeteer`.  
- Cobertura: `coverage.py`, `c8`/`nyc`.

## Critérios de saída
- Todos os testes automatizados verdes.  
- Bugs críticos resolvidos ou com plano aprovado.  
- Relatórios de execução anexados em `docs/reports/`.  
- Checklists de validação assinados (segurança, LGPD, UX).

[Voltar aos testes](README-spec.md)
