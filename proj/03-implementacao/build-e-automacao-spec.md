<!-- req/03-implementacao/build-e-automacao.md -->
# Build, Automação e Integração (referência)

> Base: [./build-e-automacao.md](./build-e-automacao.md)
> Plano: [/docs/plans/20251025093000-evolucao-req-spec.md](/docs/plans/20251025093000-evolucao-req-spec.md)
> Changelog: [/CHANGELOG.md#2025-10-25](/CHANGELOG.md#2025-10-25)
> Referências correlatas: [Arquitetura da extensão](/req/01-arquitetura/arquitetura-da-extensao-spec.md) · [Design geral](/req/02-design/design-geral-spec.md) · [Testes end-to-end](/req/04-testes-e-validacao/testes-end-to-end-spec.md)

Esta seção mantém uma visão resumida das automações utilizadas na extensão Chrome MBRA. O processo oficial de empacotamento está detalhado na fase **04-Entrega e Implantação**.

---

## Atualizações quando requisitos impactarem automação

- Sincronize `build-e-automacao.md` e este espelho sempre que um `REQ-###` ou `RNF-###` exigir novos scripts, variáveis de ambiente ou etapas de CI/CD, mantendo alinhamento com `../05-entrega-e-implantacao/` e `../06-governanca-tecnica-e-controle-de-qualidade/`.
- Documente métricas ou limites de performance derivados de RNFs, vinculando-os a `../04-qualidade-testes/qualidade-e-metricas.md` e aos workflows descritos em `revisoes-com-ia.md`.
- Registre o item correspondente no `CHANGELOG.md`, inclua referência ao log em `req/audit-history.md` e anexe evidências nos relatórios automatizados (`docs/reports/`).

---

## Princípios gerais
- Preservar os scripts `npm` definidos em `ui/package.json` (`dev`, `build`, `lint`, `preview`) para cumprir a cadeia de build prevista em [REQ-019](../02-planejamento/requisitos-spec.md#req-019).
- Executar os alvos do `ui/Makefile` para padronizar tarefas locais e em CI (`make build`, `make lint`, `make preview`), mantendo a rastreabilidade exigida por [REQ-022](../02-planejamento/requisitos-spec.md#req-022).
- Garantir que o build gere artefatos determinísticos no diretório `ui/dist/`, assegurando compatibilidade Chrome segundo [REQ-013](../02-planejamento/requisitos-spec.md#req-013).

## Convenções globais de Docker e Makefile
- Cada serviço deve possuir `Dockerfile`, `docker-compose.yml`, `docker-compose.dev.yml` e `Makefile` conforme diretrizes de `AGENTS.md`, sustentando [REQ-019](../02-planejamento/requisitos-spec.md#req-019) e [REQ-020](../02-planejamento/requisitos-spec.md#req-020).
- Targets do `Makefile` reutilizam nomenclatura padrão (`build`, `start`, `stop`, `logs`, `clean`, `monitoring`) e expõem variantes por serviço (`build-<servico>`, `start-<servico>`, etc.) utilizando `$(COMPOSE)`, garantindo rastros previstos em [REQ-022](../02-planejamento/requisitos-spec.md#req-022).
- Utilize `docker build -t $(SERVICE_NAME):latest .` como base para builds locais e de CI, mantendo cache controlado por argumentos explícitos e observando requisitos de portabilidade de [REQ-013](../02-planejamento/requisitos-spec.md#req-013).
- Os arquivos `docker-compose*.yml` não devem declarar o atributo `version` e precisam referenciar variáveis com o formato `${VAR:-default}` para compatibilidade com ambientes diversos, conforme controle de configuração descrito em [REQ-023](../02-planejamento/requisitos-spec.md#req-023).

## Cadeia de variáveis de ambiente
- Centralize valores sensíveis em arquivos `.env` segregados por ambiente (`.env.local`, `.env.hml`, `.env.prod`), nunca versionados, em conformidade com [REQ-026](../02-planejamento/requisitos-spec.md#req-026) e [REQ-027](../02-planejamento/requisitos-spec.md#req-027).
- O `docker-compose` consome essas variáveis e repassa para cada serviço via `environment` ou `env_file`, evitando duplicidade de configuração e preservando a privacidade descrita em [REQ-024](../02-planejamento/requisitos-spec.md#req-024).
- Serviços devem, por sua vez, expor variáveis necessárias via `process.env` (Node/NestJS) ou mecanismos equivalentes, documentando dependências críticas na req para cumprir [REQ-018](../02-planejamento/requisitos-spec.md#req-018).
- Toda alteração nessa cadeia `.env → docker-compose → serviço` requer revisão de segurança e atualização correspondente nas seções de Entrega e Governança, assegurando o consentimento e logging previstos em [REQ-017](../02-planejamento/requisitos-spec.md#req-017).
- Templates de ambiente (`.env.example`, `secrets.sample`, etc.) listam apenas segredos sem default definido em `docker-compose*.yml`; valores com fallback no compose não devem ser duplicados nesses arquivos, mantendo rastreabilidade exigida por [REQ-022](../02-planejamento/requisitos-spec.md#req-022).

## Integração contínua
- Workflows descritos em `req/06-governanca-tecnica-e-controle-de-qualidade/revisoes-com-ia.md` devem executar, no mínimo, instalação de dependências, lint e build antes da publicação de artefatos, seguindo [REQ-019](../02-planejamento/requisitos-spec.md#req-019) e [REQ-022](../02-planejamento/requisitos-spec.md#req-022).
- Testes automatizados (quando disponíveis) precisam ser encadeados após o build, com resultados arquivados para auditoria e integrações colaborativas previstas em [REQ-023](../02-planejamento/requisitos-spec.md#req-023) e [REQ-031](../02-planejamento/requisitos-spec.md#req-031).

## Gestão de ambientes
- Variáveis como `API_BASE`, `AUTH_PATH`, `UPLOAD_PATH`, `NOTIFY_EMAIL_PATH` e `NOTIFY_WHATSAPP_PATH` devem ser parametrizadas por ambiente, respeitando isolamento descrito em [REQ-011](../02-planejamento/requisitos-spec.md#req-011) e consentimento LGPD de [REQ-024](../02-planejamento/requisitos-spec.md#req-024).
- Segredos são injetados via mecanismos seguros (por exemplo, GitHub Secrets) e nunca versionados, garantindo conformidade com [REQ-026](../02-planejamento/requisitos-spec.md#req-026) e baseando auditoria nos mecanismos de [REQ-029](../02-planejamento/requisitos-spec.md#req-029).

Para detalhes de empacotamento e publicação consulte [Entrega e Implantação](../05-entrega-e-implantacao/README-spec.md).

[Voltar ao índice](README-spec.md)
