<!-- proj/03-implementacao/padroes-de-codigo-spec.md -->
# Padrões de Código — WA Fin Ctrl

> Base: [./padroes-de-codigo.md](./padroes-de-codigo.md)

## Padrões gerais
- Cabeçalho de caminho obrigatório em todos os arquivos.
- Proibir valores hardcoded dentro de funções; usar constantes em letras maiúsculas (ver `AGENTS.md`).
- Imports agrupados (externos → internos → tipos).
- Sem comentários supérfluos ou "embelezamento" não solicitado.

## Python
- Projeto gerenciado com Poetry; dependências em `pyproject.toml`.
- Seguir PEP8, utilizar type hints sempre que possível.
- Funções em `app.py` devem permanecer modulares, preferindo _pure functions_ quando viável.
- Exceções precisam ser tratadas e logadas; nunca silenciar erros críticos.
- Ao manipular arquivos, usar context managers (`with open`).

## TypeScript (cloud)
- `tsconfig` em modo `strict`.
- Componentes React devem ser funções (hooks), sem classes.
- Utilizar ESLint + Prettier alinhados, executar nos pipelines.
- Evitar estado global não controlado; preferir context ou zustand (se aprovado).
- Código de UI deve seguir diretrizes de `proj/06-ux-brand/`.

## Testes
- Python: adicionar testes unitários/mocks conforme módulos críticos são implementados.  
- TypeScript: Jest para unitários, Playwright/Puppeteer para e2e quando cloud estiver ativa.

## Versionamento e revisão
- PRs devem citar requisitos e changelog relacionados.
- Dois revisores obrigatórios quando o change impactar segurança ou compliance.
- Bloquear merges com lint/testes falhando.

[Voltar à fase de implementação](README-spec.md)
