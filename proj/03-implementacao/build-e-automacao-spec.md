<!-- proj/03-implementacao/build-e-automacao-spec.md -->
# Build e Automação — WA Fin Ctrl

> Base: [./build-e-automacao.md](./build-e-automacao.md)

## Objetivos
- Padronizar comandos de build, testes e deploy.  
- Garantir reprodutibilidade entre ambientes local e cloud.  
- Evitar scripts shell adicionais (Makefile é a orquestração oficial).

## Automação local (Python)
- `make help` — exibe comandos disponíveis.
- `make process` *(alias para `wa-fin.py processar`)* — processa novos arquivos.
- `make fix` — corrige entrada via CLI (valida parâmetros obrigatórios).
- `make pdf` / `make img` — reprocessa tipos específicos.
- `make test` — executa `wa-fin.py teste`.
- `make docker-up` — sobe FastAPI com reload automático.
- `make docker-down` — encerra contêiner e limpa recursos.

Todos os comandos exportam variáveis `ATTR_FIN_*` para garantir consistência. Qualquer novo alvo deve seguir o padrão existente e ser documentado.

## Automação cloud (TypeScript)
- `npm run dev` / `make dev` — iniciar API ou UI em modo desenvolvimento.
- `make stack` — iniciar NGINX + API (rate limiting configurado via `.env`).
- `npm run lint`, `npm run test`, `npm run build` — tarefas padrão com ESLint/Jest/Vite.
- `docker compose up --build` — empacotamento containerizado.

## Pipelines CI/CD (backlog)
- Executar lint + testes + build para Python e TypeScript.  
- Gerar artefatos (relatórios de testes, coverage, builds Docker).  
- Verificar cabeçalhos de caminho e dependências não utilizadas.  
- Publicar releases com base no changelog e nos checklists selecionados.

## Requisitos de automação
- Nenhuma automação deve modificar arquivos fora da cadeia documentada.  
- Logs de execução dos agentes IA devem ser guardados em `docs/reports/`.  
- Falhas devem retornar código ≠ 0, bloqueando pipelines.  
- Automação que acessar dados sensíveis precisa de aprovação explícita.

[Voltar à fase de implementação](README-spec.md)
