<!-- req/02-planejamento/cronograma.md -->
# Cronograma

> Base: [./cronograma.md](./cronograma.md)
> Plano: [/docs/plans/20251025093000-evolucao-req-spec.md](/docs/plans/20251025093000-evolucao-req-spec.md)
> Changelog: [/CHANGELOG.md#2025-10-25](/CHANGELOG.md#2025-10-25)
> Referências correlatas: [Arquitetura da extensão](/req/01-arquitetura/arquitetura-da-extensao-spec.md) · [Design geral](/req/02-design/design-geral-spec.md) · [Testes end-to-end](/req/04-testes-e-validacao/testes-end-to-end-spec.md)

Este arquivo reunirá o plano temporal das atividades do projeto, com janelas de execução e dependências identificadas.
Servirá de base para acompanhamento de prazos e ajustes de capacidade.

---

## Atualizações quando requisitos forem criados ou alterados

- Atualize simultaneamente `cronograma.md` e `cronograma-spec.md` sempre que novos `REQ-###` ou `RNF-###` forem adicionados ao catálogo (`requisitos.md`/`requisitos-spec.md`).
- Registre impactos em milestones, capacidade e dependências, cruzando com `riscos-e-mitigacoes.md`, `especificacao-de-requisitos.md` e `capacidade-diagnostico-colaborativo.md`.
- Aponte o item correspondente no `CHANGELOG.md`, inclua referência ao registro em `req/audit-history.md` e valide se governança (`../06-governanca-tecnica-e-controle-de-qualidade/`) recebeu atualização coerente.

---

## Linha do Tempo Restabelecida (REQ-001 a REQ-030)

A sequência abaixo recupera os blocos herdados da extensão clínica V5, preservando nomes, entregas e evidências exigidas pelo catálogo original. Cada janela indica atividades obrigatórias e o relacionamento com os requisitos colaborativos recém-introduzidos.

### Semanas −4 a 4 — Aprovação Administrativa (M1)
- **Atividades principais**: publicar telas `ApprovalStatus` (`PENDING/REJECTED/APPROVED`), bloquear o dashboard até aprovação e registrar tentativas de acesso. 【F:ui/src/components/approval/ApprovalStatus.tsx†L1-L173】【F:prototype/aguardando-aprovacao.html†L1-L80】
- **Critérios de aceite herdados**: mensagens de contato e SLA visíveis, fallback documentado até API real. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L8-L18】
- **Requisitos relacionados**: [REQ-001](requisitos-spec.md#req-001), [REQ-002](requisitos-spec.md#req-002), [REQ-010](requisitos-spec.md#req-010), [REQ-017](requisitos-spec.md#req-017).
- **Nota de convivência colaborativa**: liberar os fluxos médicos apenas após a validação de gatekeeping, mantendo o bloqueio descrito em [REQ-031](requisitos-spec.md#req-031) para convites de especialistas.

### Semanas 5 a 8 — Onboarding LGPD e Consentimento (M2)
- **Atividades principais**: implementar fluxo `ConsentScreen`, versionar termos LGPD, configurar permissões clínicas multi-etapas e revisar microcopy com compliance. 【F:ui/src/components/onboarding/ConsentScreen.tsx†L1-L120】【F:prototype/onboarding-permissoes.html†L1-L88】
- **Critérios de aceite herdados**: guardar versão/timestamp, bloquear uploads sem consentimento válido e produzir relatório “Conforme UX Writing”. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L15-L22】
- **Requisitos relacionados**: [REQ-003](requisitos-spec.md#req-003), [REQ-024](requisitos-spec.md#req-024), [REQ-025](requisitos-spec.md#req-025), [REQ-027](requisitos-spec.md#req-027), [REQ-028](requisitos-spec.md#req-028).
- **Nota de convivência colaborativa**: disponibilizar consentimentos no painel clínico compartilhado descrito em [REQ-033](requisitos-spec.md#req-033) sem remover o bloqueio inicial herdado.

### Semanas 9 a 12 — Upload Clínico e Áudio (M3)
- **Atividades principais**: publicar componente de upload com drag-and-drop, fallback `UploadHelper` para `wl-db` e integração NestJS `/diagnostics/submit` e `/diagnostics/audio`. 【F:ui/src/Upload.tsx†L1-L188】【F:ui/src/UploadHelper.ts†L1-L154】【F:api/src/diagnostics/diagnostics.controller.ts†L33-L189】
- **Critérios de aceite herdados**: aceitar arquivos até 10 MB, exibir barra de progresso e mensagens de confidencialidade; gerar player de áudio ou mensagem de indisponibilidade. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L24-L31】
- **Requisitos relacionados**: [REQ-004](requisitos-spec.md#req-004), [REQ-005](requisitos-spec.md#req-005), [REQ-011](requisitos-spec.md#req-011), [REQ-015](requisitos-spec.md#req-015).
- **Nota de convivência colaborativa**: compartilhar fila de uploads com o roteamento de especialistas previsto em [REQ-032](requisitos-spec.md#req-032), mantendo a mesma telemetria herdada para consentimentos e retries.

### Semanas 13 a 16 — Dashboard e Fila Operacional (M4)
- **Atividades principais**: entregar `DashboardOverview`, `DiagnosticQueue`, estados vazios/erro e tokens de branding 60-30-10 alinhados aos protótipos. 【F:ui/src/components/dashboard/DashboardOverview.tsx†L1-L222】【F:ui/src/components/dashboard/DiagnosticQueue.tsx†L1-L210】【F:prototype/dashboard-visao-geral.html†L1-L220】
- **Critérios de aceite herdados**: KPIs atualizados, ações contextuais (retry/compartilhar/baixar) e auditoria cromática documentada. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L33-L40】
- **Requisitos relacionados**: [REQ-006](requisitos-spec.md#req-006), [REQ-007](requisitos-spec.md#req-007), [REQ-008](requisitos-spec.md#req-008), [REQ-010](requisitos-spec.md#req-010), [REQ-016](requisitos-spec.md#req-016).
- **Nota de convivência colaborativa**: reutilizar métricas e estados vazios no dashboard clínico expandido ([REQ-034](requisitos-spec.md#req-034)) sem alterar a hierarquia original.

### Semanas 17 a 20 — Comunicação e Relatórios Clínicos (M5)
- **Atividades principais**: validar fluxos de compartilhamento (e-mail/WhatsApp), publicar templates transacionais e registrar logs em `docs/reports/`. 【F:prototype/diagnostico-operacao.html†L68-L120】【F:prototype/email-aprovacao-conta.html†L1-L120】【F:REPORTS.md†L24-L74】
- **Critérios de aceite herdados**: confirmações claras, links de consentimento e rastreabilidade de envios por operador. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L42-L49】
- **Requisitos relacionados**: [REQ-006](requisitos-spec.md#req-006), [REQ-007](requisitos-spec.md#req-007), [REQ-009](requisitos-spec.md#req-009), [REQ-028](requisitos-spec.md#req-028), [REQ-030](requisitos-spec.md#req-030).
- **Nota de convivência colaborativa**: anexar comunicações às auditorias de cooperação médica ([REQ-044](requisitos-spec.md#req-044)) mantendo a rastreabilidade LGPD legada.

## Integração com Capacidade de Diagnóstico Colaborativo (REQ-031 a REQ-045)

- Alinhar início do MVP colaborativo apenas após o término das atividades de M1–M3 para garantir consentimentos e uploads consistentes. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L90-L152】
- Reutilizar métricas e filas herdadas como base das dashboards clínicas estendidas, evitando duplicidade de indicadores. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L132-L142】
- Registrar em changelog quando requisitos colaborativos alterarem qualquer entrega legada, apontando ambos os IDs (`REQ-00x` + `REQ-03x`). 【F:CHANGELOG/20251020143759.md†L1-L120】

[Voltar ao índice](README-spec.md)
