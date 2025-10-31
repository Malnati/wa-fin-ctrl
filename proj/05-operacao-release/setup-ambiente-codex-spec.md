# Setup do ambiente Codex

> Base: [./setup-ambiente-codex.md](./setup-ambiente-codex.md)
> Plano: [/docs/plans/20251025093000-evolucao-req-spec.md](/docs/plans/20251025093000-evolucao-req-spec.md)
> Changelog: [/CHANGELOG.md#2025-10-25](/CHANGELOG.md#2025-10-25)
> Referências correlatas: [Arquitetura da extensão](/req/01-arquitetura/arquitetura-da-extensao-spec.md) · [Design geral](/req/02-design/design-geral-spec.md) · [Testes end-to-end](/req/04-testes-e-validacao/testes-end-to-end-spec.md)

Este roteiro consolida o procedimento oficial para restaurar o ambiente do Codex quando for necessário recriá-lo do zero. A sequência abaixo garante que as integrações com GitHub CLI e com o servidor MCP do GitHub fiquem operacionais usando os scripts mantidos neste repositório.

## Pré-requisitos

- Possuir um token pessoal do GitHub com escopos `repo`, `read:org` e `workflow`, respeitando [REQ-021](../02-planejamento/requisitos-spec.md#req-021).
- Saber o identificador completo (`owner/repo`) do repositório em que o Codex irá atuar para garantir rastreabilidade exigida por [REQ-022](../02-planejamento/requisitos-spec.md#req-022).
- Ter acesso ao terminal do ambiente Codex (container ou runner) com privilégios para instalar dependências, mantendo as práticas de [REQ-019](../02-planejamento/requisitos-spec.md#req-019).

## Variáveis de ambiente

Defina as variáveis abaixo antes de executar os scripts. Elas são consumidas diretamente por `scripts/bootstrap-gh.sh` e `scripts/mcp-github/mcp-bootstrap.sh`, preservando os controles definidos em [REQ-021](../02-planejamento/requisitos-spec.md#req-021).

```bash
export GH_TOKEN="<seu_token_github>"
export GH_REPO_SLUG="<owner>/<repo>"
export GITHUB_PERSONAL_ACCESS_TOKEN="$GH_TOKEN"
```

- `GH_TOKEN` também é utilizado como `GITHUB_TOKEN` e `GITHUB_PERSONAL_ACCESS_TOKEN`, garantindo que todas as ferramentas compartilhem as mesmas credenciais exigidas por [REQ-021](../02-planejamento/requisitos-spec.md#req-021).
- Caso seja necessário usar um host GitHub Enterprise, defina `GH_HOST` antes de rodar os scripts para preservar o monitoramento de [REQ-029](../02-planejamento/requisitos-spec.md#req-029).

## Passo a passo

1. **Carregar as variáveis:** exporte os valores mostrados acima para a sessão atual, mantendo histórico de execução conforme [REQ-022](../02-planejamento/requisitos-spec.md#req-022).
2. **Atualizar o GitHub CLI:** execute `bash scripts/bootstrap-gh.sh` para instalar/configurar o `gh`, habilitar o `gh auth setup-git` e validar o acesso ao repositório definido em `GH_REPO_SLUG`, atendendo [REQ-021](../02-planejamento/requisitos-spec.md#req-021).
3. **Provisionar o MCP:** rode `bash scripts/mcp-github/mcp-bootstrap.sh` para instalar o Go (se necessário), baixar o `github-mcp-server`, compilar o binário e iniciar o servidor no modo `stdio`. O script falha se o log não contiver a mensagem “GitHub MCP Server running on stdio”, garantindo [REQ-021](../02-planejamento/requisitos-spec.md#req-021) e preparando integrações colaborativas (REQ-031–REQ-035).
4. **Verificar o estado:** confirme a autenticação com `gh auth status` e inspecione `/tmp/github-mcp.log` para validar a inicialização do MCP, registrando evidências para [REQ-029](../02-planejamento/requisitos-spec.md#req-029).

## Setup scripts

```bash
bash scripts/bootstrap-gh.sh
bash scripts/mcp-github/mcp-bootstrap.sh
bash scripts/git-pre-commit/install-pre-commit.sh
```

- O último script instala o gancho `pre-commit` padrão do projeto, alinhando o ambiente Codex às mesmas validações locais exigidas para contribuições humanas e mantendo [REQ-019](../02-planejamento/requisitos-spec.md#req-019) e [REQ-022](../02-planejamento/requisitos-spec.md#req-022).

[Voltar para Operação e Release](README-spec.md)
