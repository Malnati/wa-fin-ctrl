<!-- req/05-entrega-e-implantacao/publicacao-e-versionamento.md -->
# Publicação e Versionamento

> Base: [./publicacao-e-versionamento.md](./publicacao-e-versionamento.md)
> Plano: [/docs/plans/20251025093000-evolucao-req-spec.md](/docs/plans/20251025093000-evolucao-req-spec.md)
> Changelog: [/CHANGELOG.md#2025-10-25](/CHANGELOG.md#2025-10-25)
> Referências correlatas: [Arquitetura da extensão](/req/01-arquitetura/arquitetura-da-extensao-spec.md) · [Design geral](/req/02-design/design-geral-spec.md) · [Testes end-to-end](/req/04-testes-e-validacao/testes-end-to-end-spec.md)

## Objetivo
Definir o processo de versionamento semântico, publicação e rastreabilidade de releases da extensão Chrome MBRA, assegurando auditoria integral entre o código-fonte, os artefatos empacotados e a disponibilização aos usuários finais conforme [REQ-019](../02-planejamento/requisitos-spec.md#req-019), [REQ-022](../02-planejamento/requisitos-spec.md#req-022), [REQ-029](../02-planejamento/requisitos-spec.md#req-029) e [REQ-030](../02-planejamento/requisitos-spec.md#req-030).

---

## Atualizações quando requisitos mudarem a estratégia de release

- Atualize `publicacao-e-versionamento.md` e este espelho sempre que um `REQ-###` ou `RNF-###` exigir novas etapas de versionamento, governança ou distribuição, mantendo alinhamento com `empacotamento.md`, `ambientes-e-configuracoes.md` e `auditoria-e-rastreabilidade.md`.
- Vincule cada mudança ao item do `CHANGELOG.md`, ao registro em `req/audit-history.md` e aos relatórios de pipeline (`docs/reports/`).
- Confirme que critérios de testes (`criterios-de-aceitacao.md`, `testes-end-to-end.md`) e métricas (`qualidade-e-metricas.md`) foram atualizados para cobrir o novo fluxo de release.

---

## Estratégia de versionamento
- Adotar o padrão SemVer (`X.Y.Z`), onde incrementos major, minor e patch refletem alterações incompatíveis, funcionalidades compatíveis e correções, respectivamente, garantindo alinhamento com [REQ-019](../02-planejamento/requisitos-spec.md#req-019).
- Atualizar o número de versão no `manifest.json` e nos artefatos de documentação sempre que um novo pacote for gerado, atendendo [REQ-020](../02-planejamento/requisitos-spec.md#req-020) e [REQ-030](../02-planejamento/requisitos-spec.md#req-030).
- Cada release deve gerar uma tag Git correspondente e atualizar o diretório `CHANGELOG/` com a lista de alterações aprovadas, cumprindo [REQ-022](../02-planejamento/requisitos-spec.md#req-022).

## Política de changelog obrigatório
- Toda entrega deve criar um arquivo em `CHANGELOG/` seguindo o padrão `YYYYMMDDHHMMSS.md` (timestamp em UTC) estabelecido em `AGENTS.md`, reforçando [REQ-022](../02-planejamento/requisitos-spec.md#req-022).
- O arquivo precisa iniciar com o comentário de caminho (`<!-- CHANGELOG/<arquivo>.md -->`) e registrar itens modificados, regras atendidas e pendências, garantindo rastreabilidade para [REQ-029](../02-planejamento/requisitos-spec.md#req-029).
- Releases sem alteração de artefatos exigem changelog justificando explicitamente a ausência de mudanças materiais, protegendo [REQ-024](../02-planejamento/requisitos-spec.md#req-024) e [REQ-029](../02-planejamento/requisitos-spec.md#req-029).
- Antes do merge, confirme via `git status` que exatamente um changelog novo acompanha o conjunto de arquivos alterados, preservando consistência prevista em [REQ-019](../02-planejamento/requisitos-spec.md#req-019).

## Pipeline de publicação
1. Merge aprovado na branch principal após revisão técnica e validações automatizadas, garantindo [REQ-015](../02-planejamento/requisitos-spec.md#req-015) e [REQ-019](../02-planejamento/requisitos-spec.md#req-019).
2. Execução do workflow de release descrito em `req/06-governanca-tecnica-e-controle-de-qualidade/revisoes-com-ia.md`, incluindo lint, build e testes, atendendo [REQ-021](../02-planejamento/requisitos-spec.md#req-021) e [REQ-022](../02-planejamento/requisitos-spec.md#req-022).
3. Empacotamento manual ou automatizado do diretório `ui/dist/` com os assets de `public/` em arquivo ZIP assinado, conforme [REQ-019](../02-planejamento/requisitos-spec.md#req-019) e [REQ-030](../02-planejamento/requisitos-spec.md#req-030).
4. Upload do pacote nos Releases do GitHub com metadados de versão e evidências de testes para cumprir [REQ-022](../02-planejamento/requisitos-spec.md#req-022) e [REQ-029](../02-planejamento/requisitos-spec.md#req-029).
5. Submissão do mesmo pacote para a Chrome Web Store no modo desenvolvedor, seguindo as diretrizes MV3, respeitando [REQ-030](../02-planejamento/requisitos-spec.md#req-030).
6. Após aprovação pela loja, publicação controlada sob responsabilidade da MBRA, assegurando conformidade com [REQ-029](../02-planejamento/requisitos-spec.md#req-029) e preparando a ativação de recursos colaborativos (REQ-031–REQ-035).

## Controle de releases
- Registrar para cada release:
  - Versão (`X.Y.Z`), alinhada a [REQ-019](../02-planejamento/requisitos-spec.md#req-019).
  - Data de publicação e responsável técnico pela liberação, cobrindo [REQ-029](../02-planejamento/requisitos-spec.md#req-029).
  - Resumo objetivo das alterações e correções incluídas, assegurando [REQ-022](../02-planejamento/requisitos-spec.md#req-022).
  - Links para o artefato ZIP, changelog e logs do pipeline correspondente, mantendo rastreabilidade exigida por [REQ-022](../02-planejamento/requisitos-spec.md#req-022).
- Preservar artefatos, evidências de testes e logs por, no mínimo, 12 meses para fins de auditoria, garantindo [REQ-029](../02-planejamento/requisitos-spec.md#req-029).
- Catalogar as ativações de feature flags colaborativas e apontar o REQ correspondente no changelog quando recursos REQ-031–REQ-035 forem habilitados.

## Rollback
- Manter a última versão estável arquivada para reinstalação imediata, suportando [REQ-015](../02-planejamento/requisitos-spec.md#req-015).
- Reverter para a tag anterior, reinstalar o pacote homologado e reexecutar os testes de regressão documentados antes de retomar a operação normal, garantindo [REQ-019](../02-planejamento/requisitos-spec.md#req-019) e [REQ-022](../02-planejamento/requisitos-spec.md#req-022).
- Registrar o rollback no `CHANGELOG/` e em `docs/reports/rollback-report.md`, vinculando a decisão a [REQ-029](../02-planejamento/requisitos-spec.md#req-029).

[Voltar ao índice](README-spec.md)
