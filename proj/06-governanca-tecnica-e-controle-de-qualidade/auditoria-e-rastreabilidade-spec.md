<!-- req/06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade.md -->
# Auditoria e Rastreabilidade

> Base: [./auditoria-e-rastreabilidade.md](./auditoria-e-rastreabilidade.md)
> Plano: [/docs/plans/20251025093000-evolucao-req-spec.md](/docs/plans/20251025093000-evolucao-req-spec.md)
> Changelog: [/CHANGELOG.md#2025-10-25](/CHANGELOG.md#2025-10-25)
> Referências correlatas: [Arquitetura da extensão](/req/01-arquitetura/arquitetura-da-extensao-spec.md) · [Design geral](/req/02-design/design-geral-spec.md) · [Testes end-to-end](/req/04-testes-e-validacao/testes-end-to-end-spec.md)

## Objetivo
Garantir rastreabilidade integral entre requisitos, código, testes e entregas da extensão Chrome MBRA (Yagnostic), permitindo auditoria contínua do cumprimento das obrigações técnicas, legais e operacionais.

---

## Atualizações quando requisitos gerarem auditoria

- Atualize `auditoria-e-rastreabilidade.md` e este espelho sempre que novos `REQ-###` ou `RNF-###` exigirem controles adicionais, assegurando que os links de rastreabilidade cubram catálogo (`../02-planejamento/requisitos.md`), arquitetura, design, testes, métricas, entrega e governança.
- Registre o ciclo completo no `CHANGELOG.md`, `req/audit-history.md` e nos relatórios automatizados (`docs/reports/`), citando o `GITHUB_RUN_ID` e o checklist de encerramento executado.
- Verifique que `revisoes-com-ia.md`, `controle-de-qualidade.md` e `audit-history.md` foram atualizados no mesmo PR para manter consistência com `instrucoes-evolucao-requisitos.md`.

### Checklist de encerramento (referência)
1. Requisito documentado no catálogo e nos pares base/spec das fases impactadas.
2. Evidências de arquitetura, design, implementação, testes, métricas, entrega e governança anexadas e interligadas.
3. Item correspondente no `CHANGELOG.md` e relatórios arquivados em `docs/reports/`.
4. Registro em `req/audit-history.md` com comentário publicado no PR.

---

## Princípios de rastreabilidade
- Cada requisito deve possuir identificador único no padrão `REQ-XXX`, mantido no backlog oficial e referenciado na documentação.
- Commits e Pull Requests precisam citar explicitamente os requisitos atendidos e anexar evidências correspondentes.
- Testes automatizados ou manuais devem apontar para o requisito validado, permitindo reconstrução da matriz requisito-teste.
- **Requisitos associados:** REQ-019 (integração dos pipelines), REQ-022 (armazenamento de artefatos em `/docs/reports/`), REQ-023 (metadados de execuções IA) e REQ-029 (responsabilidade sobre tratamento de dados).
- **Nota colaborativa:** manter vinculação direta com os fluxos de validação médica descritos em REQ-031 a REQ-035, garantindo que cada etapa colaborativa herde os mesmos identificadores e checkpoints de auditoria.

## Ferramentas e mecanismos
- GitHub Issues e Pull Requests como fonte única de registro de demandas, discussões e histórico de mudanças.
- Workflows descritos em `req/06-governanca-tecnica-e-controle-de-qualidade/revisoes-com-ia.md` para validar automaticamente lint, build, testes e auditoria IA.
- Logs de auditoria gerados pelo workflow `audit` e armazenados em `/docs/reports/`, com metadados sobre agentes, modelos e execuções.

## Metadados obrigatórios de auditoria
- Toda execução de agente deve registrar `AGENT_ID`, `GITHUB_RUN_ID`, `MODEL_NAME`, `TIMESTAMP`, `PROMPT_FILE`, `RESULT_FILE` e `REVIEW_STATUS`, conforme `AGENTS.md`.
- Metadados adicionais (como branch, commit e responsável humano) são recomendados para complementar a trilha de decisão.
- Ao término de cada execução, exporte o registro consolidado para `docs/reports/audit-report.md`, garantindo versionamento e consulta posterior.
- Auditorias manuais precisam anexar evidências dessas exportações nos relatórios mensais da MBRA.
- **Requisitos associados:** REQ-022, REQ-023 e REQ-030 (conformidade com políticas do Chrome Manifest V3 para registros de auditoria).
- **Nota colaborativa:** execuções da capacidade colaborativa (REQ-031–REQ-035) devem registrar, além do `run_id`, o `collaboration_id` utilizado nos relatórios médicos para possibilitar reconciliação clínica.

## Auditoria periódica
- Conduzida pela MBRA com apoio do Audit Agent, revisando integridade de versões, cobertura de requisitos e resultados de testes.
- Inclui verificação cruzada entre matrizes de rastreabilidade, relatórios de pipeline e evidências anexadas nos PRs.
- **Requisitos associados:** REQ-015 (desempenho monitorado nos relatórios), REQ-017 (logs condicionados a consentimento), REQ-019, REQ-022 e REQ-029.
- **Nota colaborativa:** alinhar as agendas de auditoria com os ciclos HOOP da governança colaborativa para validar indicadores clínicos definidos em REQ-034.

## Relatório final
- Exportado em Markdown e anexado ao diretório `/docs/reports/`, mantendo histórico versionado e de fácil consulta.
- Cada relatório registra conclusões, não conformidades e planos de ação, além de referenciar os requisitos e commits auditados.
- **Requisitos associados:** REQ-022, REQ-023, REQ-024 (consentimento explícito) e REQ-028 (política de privacidade visível aos revisores).
- **Nota colaborativa:** documentar explicitamente quando um achado impactar validações multiusuário (REQ-031–REQ-035), descrevendo ações conjuntas entre IA e validadores humanos.

## Catálogo de relatórios automatizados
Cada relatório gerado pelos pipelines GitHub Actions segue o modelo de metadados padronizados abaixo, garantindo rastreabilidade por `run_id` (identificador lógico da execução do agente) e `pipeline_run_id` (identificador do GitHub Actions). Todos os artefatos residem em `/docs/reports/`.

### `audit-report.md`
- **Pipeline**: `audit.yml`
- **Responsável**: Audit Agent
- **Gatilhos**: execuções agendadas do `audit.yml` e disparos automáticos após merges aprovados ou releases publicados.
- **Campos mínimos**: `timestamp`, `agent_id`, `run_id`, `pipeline_run_id`, `status`, `checked_controls`, `hash`.

### `release-report.md`
- **Pipeline**: `release.yml`
- **Responsável**: Semantic Versioning Agent
- **Gatilhos**: conclusão bem-sucedida do `audit.yml` ou acionamento manual da release.
- **Campos mínimos**: `timestamp`, `agent_id`, `run_id`, `pipeline_run_id`, `version`, `commits_included`, `hash`.

### `test-report.md`
- **Pipeline**: `test.yml`
- **Responsável**: Test Agent
- **Gatilhos**: `push` para branches monitoradas e `pull_request` abertos contra `main`.
- **Campos mínimos**: `timestamp`, `agent_id`, `run_id`, `pipeline_run_id`, `suite`, `tests_executed`, `passed`, `failed`, `coverage`.

### `agent-report.md`
- **Pipeline**: `build.yml` e `review.yml`
- **Responsável**: Agentes IA que executaram tarefas automatizadas
- **Gatilhos**: término de cada execução de agente dentro dos pipelines `build.yml` ou `review.yml`.
- **Campos mínimos**: `timestamp`, `agent_id`, `run_id`, `pipeline_run_id`, `model`, `execution_time`, `status`, `review_status`.

### `coverage-report.md`
- **Pipeline**: `test.yml`
- **Responsável**: Coverage Agent
- **Gatilhos**: etapas de cobertura acionadas pelo `test.yml` durante `pull_request` ou `push` para branches protegidas.
- **Campos mínimos**: `timestamp`, `agent_id`, `run_id`, `pipeline_run_id`, `coverage.statements`, `coverage.branches`, `coverage.functions`, `hash`.

### `risk-summary.md`
- **Pipeline**: `audit.yml`
- **Responsável**: Audit Agent
- **Gatilhos**: execução mensal do `audit.yml` e varreduras extraordinárias solicitadas pela governança.
- **Campos mínimos**: `timestamp`, `agent_id`, `run_id`, `pipeline_run_id`, `total_risks`, `critical`, `medium`, `low`, `mitigated`, `new_since_last_audit`.

### `governance-summary.md`
- **Pipeline**: `governance.yml`
- **Responsável**: Governance Agent
- **Gatilhos**: execução mensal agendada do `governance.yml` ou revisões extraordinárias determinadas pela MBRA.
- **Campos mínimos**: `timestamp`, `agent_id`, `run_id`, `pipeline_run_id`, `month`, `audits_passed`, `open_findings`, `ethics_score`, `technical_score`.

### Frequência e automação

| Relatório | Frequência | Ação Automática |
| --- | --- | --- |
| `audit-report.md` | Semanal e pós-merge | Valida requisitos, riscos e conformidade LGPD. |
| `release-report.md` | A cada release | Atualiza `CHANGELOG/` e publica versão semântica. |
| `test-report.md` | Em cada commit monitorado | Atualiza histórico de testes e cobertura. |
| `agent-report.md` | Ao final de cada execução IA | Registra metadados de execução e revisão. |
| `coverage-report.md` | Em `pull_request` ou `push` protegido | Calcula métricas de qualidade e cobertura. |
| `risk-summary.md` | Mensal | Consolida riscos abertos, mitigados e recém-identificados. |
| `governance-summary.md` | Mensal | Compila auditorias, ética e indicadores de governança. |

### Rastreabilidade complementar
- [`requisitos.md`](../02-planejamento/requisitos-spec.md): catálogo tabular oficial dos requisitos auditados.
- [`riscos-e-mitigacoes.md`](../02-planejamento/riscos-e-mitigacoes-spec.md): base para relatórios de mitigação.
- [`revisoes-com-ia.md`](revisoes-com-ia-spec.md): define gatilhos e dependências entre pipelines.
- [`../../AGENTS.md`](../../AGENTS.md): identifica agentes responsáveis por cada artefato.
- `CHANGELOG/`: correlaciona versões, releases e auditorias aprovadas.

### Armazenamento e governança
- Versionamento contínuo em `/docs/reports/`, com arquivamento trimestral em `/docs/reports/archive/`.
- Metadados obrigatórios (`timestamp`, `agent_id`, `run_id`, `pipeline_run_id`, `hash`) em todos os relatórios.
- Registros de exceção devem citar o plano de ação correspondente e referências cruzadas no changelog.

### Responsabilidade técnica
**Responsável:** Ricardo Malnati — Engenheiro de Software  \
**Organização:** Millennium Brasil (MBRA)  \
**Documento:** Auditoria e Rastreabilidade — req RUP  \
**Status:** Ativo e sob revisão contínua

## Atualizações de 2025-10-25
- Consolidação do padrão Base/Spec conforme [`20251025093000-evolucao-req-spec.md`](../../docs/plans/20251025093000-evolucao-req-spec.md) e auditoria irmã.
- Registro correspondente no [`CHANGELOG.md#2025-10-25`](/CHANGELOG.md#2025-10-25) garantindo rastro com pipelines de revisão.
- Validação automatizada habilitada via `npm run req:validate`, exigida antes da aprovação de novos incrementos evolutivos.

## Fluxo de sincronização review → audit → release
1. **Revisão (`review.yml`)**: gera o `review-report.md` com `run_id` exclusivo do agente revisor e o `pipeline_run_id` emitido pelo GitHub Actions. Os campos compartilhados incluem `commit_sha`, `artifact_links` e `review_findings`.
2. **Auditoria (`audit.yml`)**: consome o `run_id` do review como `review_run_id`, cria um novo `run_id` para a auditoria e registra ambos, além do mesmo `pipeline_run_id` quando disparado via `workflow_run`. O `audit-report.md` atualiza `checked_controls`, `audit_findings` e vincula o `review_run_id` correspondente.
3. **Release (`release.yml`)**: aguarda a conclusão do `audit.yml`, reutiliza o `audit_run_id` e o `pipeline_run_id` herdado para compor o `release-report.md`. Também anexa os `run_id` dos estágios anteriores ao changelog (`CHANGELOG/<timestamp>.md`), garantindo rastreabilidade bidirecional.

Esse encadeamento assegura que cada alteração seja rastreada do parecer inicial à publicação final, permitindo reconstruir o histórico completo com base nos campos `run_id`, `pipeline_run_id`, `commit_sha` e `hash` registrados em todos os relatórios.
- **Requisitos associados:** REQ-019, REQ-022, REQ-023, REQ-030 e REQ-034.
- **Nota colaborativa:** ao publicar releases que habilitem etapas colaborativas (REQ-031–REQ-035), incluir nos relatórios o status dos validadores humanos e métricas compartilhadas no `governance-summary.md`.

[Voltar ao índice](README-spec.md)
