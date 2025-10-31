<!-- proj/03-implementacao/estrutura-de-projeto-spec.md -->
# Estrutura de Projeto — WA Fin Ctrl

> Base: [./estrutura-de-projeto.md](./estrutura-de-projeto.md)

## Diretórios principais
| Caminho | Descrição |
| --- | --- |
| `local/` | Aplicação Python/FastAPI (pipeline local, CLI, relatórios). |
| `cloud/api/` | API NestJS (refatoração em andamento). |
| `cloud/ui/` | UI React/Vite (dashboards). |
| `proj/` | Documentação RUP. |
| `docs/` | Relatórios gerados e materiais de referência. |
| `AGENTS.md` | Políticas para agentes/automação. |
| `docker-compose.yml` | Orquestra `cloud-api` e `cloud-ui` com variáveis `${VAR:-default}` e volumes de extração. |

## Estrutura `local/`
- `wa-fin.py` — entrypoint CLI.  
- `Makefile` — automações (process, fix, docker, testes).  
- `docker-compose.yml` — sobe FastAPI com volumes montados.  
- `src/wa_fin_ctrl/` — módulos Python (app, api, cli, history, ocr, reporter, ia).  
- `docs/`, `mensagens/`, `ocr/`, `imgs/`, `input/`, `massa/` — artefatos de dados.  
- `templates/`, `static/` — recursos HTML/CSS.

## Estrutura `cloud/`
- `api/` — projeto NestJS (src/, test/, Dockerfile, Makefile).  
  - `src/modules/whatsapp/` — módulo `/wa-zip` com integração OpenRouter, extração de autores do `_chat.txt`, geração de TXT e JSON persistidos em `extracted/`.  
  - `extracted/` — diretório (ignorado no Git) para JSONs `{origem, author, extected}`, TXT com autores e comprovantes processados.  
- `ui/` — projeto React/Vite com ESLint, TypeScript `strict`, módulos focados em relatórios (`src/components/reports`, `src/hooks/useReports.ts`).  
- `AGENTS.md` (cloud) — instruções específicas para automação desse ambiente.

## Convenções
- Cabeçalhos de caminho obrigatórios em todos os arquivos.  
- Variáveis de ambiente seguidas conforme cadeia `.env` → Compose/Makefile → código.  
- Nenhum novo script shell; usar Makefile.  
- TypeScript com `strict: true`, ESLint e Prettier alinhados.  
- Python com Poetry, versões fixadas em `pyproject.toml`.

## Artefatos derivados
- Builds e pacotes gerados devem ser ignorados pelo `.gitignore` local e global.  
- Logs, arquivos temporários e dados sensíveis permanecem fora do versionamento.  
- Documentação atualizada em paralelo com mudanças estruturais.

[Voltar à fase de implementação](README-spec.md)
