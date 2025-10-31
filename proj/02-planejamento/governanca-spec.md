<!-- req/02-planejamento/governanca.md -->
# Governança

> Base: [./governanca.md](./governanca.md)
> Plano: [/docs/plans/20251025093000-evolucao-req-spec.md](/docs/plans/20251025093000-evolucao-req-spec.md)
> Changelog: [/CHANGELOG.md#2025-10-25](/CHANGELOG.md#2025-10-25)
> Referências correlatas: [Arquitetura da extensão](/req/01-arquitetura/arquitetura-da-extensao-spec.md) · [Design geral](/req/02-design/design-geral-spec.md) · [Testes end-to-end](/req/04-testes-e-validacao/testes-end-to-end-spec.md)

Este arquivo descreverá a estrutura de governança do projeto, incluindo fóruns, papéis decisórios e cadências de acompanhamento.
Também abordará mecanismos de escalonamento e critérios para revisão de planejamento.

## Fóruns Legados (REQ-001 a REQ-030)

### Comitê de Aprovação Administrativa (M1)
- **Escopo**: liberar contas, validar tokens e desbloquear o side panel somente após auditoria de logs. 【F:ui/src/components/approval/ApprovalStatus.tsx†L1-L173】【F:prototype/administracao-liberacao.html†L1-L120】
- **Reuniões**: stand-up diário até estabilização do fluxo, seguido de checkpoint semanal documentado em `docs/reports/`. 【F:REPORTS.md†L24-L74】
- **Requisitos monitorados**: [REQ-001](requisitos-spec.md#req-001), [REQ-002](requisitos-spec.md#req-002), [REQ-010](requisitos-spec.md#req-010), [REQ-017](requisitos-spec.md#req-017).
- **Integração colaborativa**: o comitê habilita convites de especialistas apenas quando o gatekeeping cumprir [REQ-031](requisitos-spec.md#req-031), evitando que fluxos colaborativos contornem bloqueios legados.

### Comitê LGPD e Consentimento (M2)
- **Escopo**: revisar versões do termo LGPD, aprovar microcopy e validar permissões clínicas multi-etapas. 【F:prototype/onboarding-consentimento.html†L1-L80】【F:prototype/onboarding-permissoes.html†L1-L88】
- **Reuniões**: cadência quinzenal com representantes jurídicos e UX para homologar revisões; atas arquivadas junto ao checklist “Conforme UX Writing”. 【F:AGENTS.md†L200-L333】
- **Requisitos monitorados**: [REQ-024](requisitos-spec.md#req-024), [REQ-025](requisitos-spec.md#req-025), [REQ-027](requisitos-spec.md#req-027), [REQ-028](requisitos-spec.md#req-028).
- **Integração colaborativa**: garantir que consentimentos versionados sejam compartilhados com o painel clínico ([REQ-033](requisitos-spec.md#req-033)) sem flexibilizar o bloqueio inicial do onboarding.

### Comitê de Upload e Diagnóstico (M3)
- **Escopo**: supervisionar limites de 10 MB, fallback IndexedDB (`wl-db`) e geração de áudio opcional. 【F:ui/src/Upload.tsx†L1-L188】【F:ui/src/UploadHelper.ts†L1-L154】【F:api/src/diagnostics/diagnostics.controller.ts†L33-L189】
- **Reuniões**: revisão semanal de métricas de tempo de upload e falhas registradas no dashboard. Relatórios anexados às rotinas de observabilidade. 【F:req/02-planejamento/riscos-e-mitigacoes.md†L99-L116】
- **Requisitos monitorados**: [REQ-004](requisitos-spec.md#req-004), [REQ-005](requisitos-spec.md#req-005), [REQ-011](requisitos-spec.md#req-011), [REQ-015](requisitos-spec.md#req-015).
- **Integração colaborativa**: compartilhar filas e métricas com o workflow médico ([REQ-032](requisitos-spec.md#req-032)) mantendo os alertas herdados de performance.

### Comitê de Operações e Dashboard (M4)
- **Escopo**: validar métricas, estados vazios, ações contextuais e tokens de branding 60-30-10 em linha com os protótipos oficiais. 【F:prototype/dashboard-visao-geral.html†L1-L220】【F:prototype/dashboard-fila.html†L120-L248】
- **Reuniões**: checkpoints semanais com engenharia + UX para revisar KPIs e auditoria cromática. Resultados ficam registrados no `Controle de Qualidade`. 【F:req/06-governanca-tecnica-e-controle-de-qualidade/controle-de-qualidade.md†L33-L78】
- **Requisitos monitorados**: [REQ-006](requisitos-spec.md#req-006), [REQ-007](requisitos-spec.md#req-007), [REQ-008](requisitos-spec.md#req-008), [REQ-010](requisitos-spec.md#req-010), [REQ-016](requisitos-spec.md#req-016).
- **Integração colaborativa**: utilizar o mesmo painel de governança para alimentar métricas do diagnóstico colaborativo ([REQ-034](requisitos-spec.md#req-034)) sem perder o contexto operacional legado.

### Comitê de Comunicação e Branding (M5)
- **Escopo**: aprovar templates transacionais, fluxos multicanal e rastreamento operacional dos envios. 【F:prototype/diagnostico-operacao.html†L68-L120】【F:prototype/email-aprovacao-conta.html†L1-L120】
- **Reuniões**: cadência quinzenal para revisar logs, consentimentos anexos e políticas da Chrome Web Store. Evidências publicadas em `docs/reports/`. 【F:REPORTS.md†L24-L74】
- **Requisitos monitorados**: [REQ-006](requisitos-spec.md#req-006), [REQ-007](requisitos-spec.md#req-007), [REQ-009](requisitos-spec.md#req-009), [REQ-028](requisitos-spec.md#req-028), [REQ-030](requisitos-spec.md#req-030).
- **Integração colaborativa**: enviar relatórios consolidados ao comitê clínico de validação ([REQ-044](requisitos-spec.md#req-044)) para manter rastreabilidade ponta a ponta.

## Cadências e Escalonamento Compartilhados

| Cadência | Participantes | Entregáveis | Referências |
| --- | --- | --- | --- |
| Diário (Aprovação) | Eng. Front-end, Suporte Operacional | Logs de acesso e status de aprovação. | 【F:.ref/docs/wiki/02-planejamento/milestones.md†L8-L18】 |
| Quinzenal (LGPD) | Jurídico, UX Writing, Produto | Versão do termo, checklist “Conforme UX Writing”. | 【F:AGENTS.md†L200-L333】 |
| Semanal (Upload/Dashboard) | Engenharia, Infra, QA | Relatório de performance, auditoria cromática. | 【F:req/02-planejamento/riscos-e-mitigacoes.md†L99-L116】【F:req/06-governanca-tecnica-e-controle-de-qualidade/controle-de-qualidade.md†L33-L78】 |
| Mensal (Comunicação) | Marketing, Compliance, Produto | Logs de envios, templates homologados. | 【F:REPORTS.md†L24-L74】 |

Escalonamentos seguem a cadeia abaixo:
1. **Nível Operacional** → líder de squad resolve incidentes em até 24 h.
2. **Nível Comitê** → comitês legados avaliam impacto e acionam governança colaborativa quando envolver [REQ-031](requisitos-spec.md#req-031) a [REQ-045](requisitos-spec.md#req-045).
3. **Nível Diretoria MBRA** → ativa plano de contingência descrito em [`../06-governanca-tecnica-e-controle-de-qualidade/governanca-tecnica.md`](../06-governanca-tecnica-e-controle-de-qualidade/governanca-tecnica-spec.md) caso risco seja classificado como 🟥.

## Convergência com a Capacidade de Diagnóstico Colaborativo

- Atualizar atas dos comitês legados sempre que novos requisitos colaborativos alterarem escopos herdados, apontando os IDs de ambos os catálogos. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L300-L326】
- Coordenar revisões de métricas e consentimentos compartilhando dashboards e relatórios em comum, evitando duplicidade de auditorias. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L132-L142】
- Garantir que qualquer exceção aprovada pelos comitês legados seja replicada no plano colaborativo e registrada no changelog. 【F:CHANGELOG/20251020143759.md†L1-L120】

[Voltar ao índice](README-spec.md)
