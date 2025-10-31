<!-- req/02-planejamento/wbs.md -->
# Work Breakdown Structure (WBS)

> Base: [./wbs.md](./wbs.md)
> Plano: [/docs/plans/20251025093000-evolucao-req-spec.md](/docs/plans/20251025093000-evolucao-req-spec.md)
> Changelog: [/CHANGELOG.md#2025-10-25](/CHANGELOG.md#2025-10-25)
> Referências correlatas: [Arquitetura da extensão](/req/01-arquitetura/arquitetura-da-extensao-spec.md) · [Design geral](/req/02-design/design-geral-spec.md) · [Testes end-to-end](/req/04-testes-e-validacao/testes-end-to-end-spec.md)

A WBS consolida os pacotes legados (REQ-001 a REQ-030) e a capacidade de diagnóstico colaborativo (REQ-031 a REQ-045), preservando o alinhamento com protótipos, código base e compromissos regulatórios descritos no plano oficial. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L14-L388】【F:req/02-planejamento/requisitos.md†L12-L140】

## Pacotes Legados (REQ-001 a REQ-030)

### 1. Aprovação Administrativa
- **1.1 Telas de bloqueio e triagem** — Implementar `ApprovalStatus` (PENDING/REJECTED/APPROVED) com fallback local e textos aprovados.
  - Nota: o bloqueio deve liberar os fluxos colaborativos somente após a validação prevista em [REQ-031](requisitos-spec.md#req-031), mantendo o controle de acesso inicial.
  - Referências:
    - 【F:ui/src/components/approval/ApprovalStatus.tsx†L1-L173】
    - 【F:docs/prototype/aguardando-aprovacao.html†L1-L80】
    - ([REQ-001](requisitos-spec.md#req-001), [REQ-010](requisitos-spec.md#req-010))
- **1.2 Auditoria e relatórios** — Documentar tentativas de acesso, gerar logs e checklist UX Writing. Nota: sincronizar os registros com os indicadores do dashboard colaborativo definido em [REQ-034](requisitos-spec.md#req-034). 【F:REPORTS.md†L24-L74】 ([REQ-022](requisitos-spec.md#req-022), [REQ-023](requisitos-spec.md#req-023))

### 2. Onboarding e Consentimento
- **2.1 Consentimento LGPD** — Construir fluxo `ConsentScreen` e armazenar versão/timestamp no IndexedDB. Nota: os consentimentos precisam habilitar o compartilhamento entre especialistas conforme [REQ-031](requisitos-spec.md#req-031). 【F:ui/src/components/onboarding/ConsentScreen.tsx†L1-L120】 ([REQ-024](requisitos-spec.md#req-024), [REQ-025](requisitos-spec.md#req-025), [REQ-028](requisitos-spec.md#req-028))
- **2.2 Permissões clínicas** — Adaptar protótipo `onboarding-permissoes.html` para estados multi-etapas e validação de campos obrigatórios.
- **2.3 Revisão de microcopy** — Validar textos com compliance e registrar “Conforme UX Writing”. Nota: alinhar o vocabulário com o painel clínico colaborativo descrito em [REQ-033](requisitos-spec.md#req-033). 【F:AGENTS.md†L200-L333】 ([REQ-016](requisitos-spec.md#req-016), [REQ-028](requisitos-spec.md#req-028))

### 3. Upload e Diagnósticos
- **3.1 Componente de upload** — Implementar drag-and-drop, barra de progresso, mensagens de confidencialidade.
  Nota: reutilizar o fluxo para anexos validados pelos médicos, garantindo rastreabilidade em [REQ-033](requisitos-spec.md#req-033).
  Referências: 【F:ui/src/Upload.tsx†L1-L188】【F:docs/prototype/dashboard-visao-geral.html†L20-L120】
  Requisitos: ([REQ-004](requisitos-spec.md#req-004), [REQ-005](requisitos-spec.md#req-005))
- **3.2 Fallback IndexedDB (`wl-db`)** — Configurar stores, retries e limpeza de itens expirados. Nota: assegurar compatibilidade com o banco clínico particionado previsto em [REQ-042](requisitos-spec.md#req-042). 【F:ui/src/UploadHelper.ts†L1-L154】 ([REQ-011](requisitos-spec.md#req-011), [REQ-027](requisitos-spec.md#req-027))
- **3.3 Integração NestJS** — Garantir contrato `/diagnostics/submit` e `/diagnostics/audio` com DTOs tipados.
  Nota: manter contrato compatível com as integrações HIS/LIS descritas em [REQ-035](requisitos-spec.md#req-035).
  【F:api/src/diagnostics/diagnostics.controller.ts†L33-L189】
  ([REQ-005](requisitos-spec.md#req-005), [REQ-020](requisitos-spec.md#req-020))

### 4. Dashboard e Fila
- **4.1 DashboardOverview** — Renderizar métricas, ações rápidas, insights multimodais. Nota: as métricas precisam alimentar o painel clínico colaborativo indicado em [REQ-034](requisitos-spec.md#req-034). 【F:ui/src/components/dashboard/DashboardOverview.tsx†L1-L222】 ([REQ-010](requisitos-spec.md#req-010), [REQ-015](requisitos-spec.md#req-015))
- **4.2 DiagnosticQueue** — Listar fila com estados e ações de retry/compartilhar/baixar. Nota: alinhar estados e prioridades ao roteamento colaborativo de [REQ-032](requisitos-spec.md#req-032). 【F:ui/src/components/dashboard/DiagnosticQueue.tsx†L1-L210】 ([REQ-006](requisitos-spec.md#req-006), [REQ-007](requisitos-spec.md#req-007))
- **4.3 Estado vazio e erros** — Criar placeholders e banners conforme protótipo `dashboard-fila.html`. Nota: seguir as diretrizes de acessibilidade e telemetria definidas em [REQ-037](requisitos-spec.md#req-037). 【F:docs/prototype/dashboard-fila.html†L120-L248】 ([REQ-016](requisitos-spec.md#req-016), [REQ-017](requisitos-spec.md#req-017))

### 5. Comunicação e Relatórios
- **5.1 Compartilhamento** — Campos validados, máscaras e confirmações para e-mail/WhatsApp. Nota: permitir encaminhamento rápido para médicos validadores descritos em [REQ-033](requisitos-spec.md#req-033). 【F:docs/prototype/diagnostico-operacao.html†L68-L120】 ([REQ-007](requisitos-spec.md#req-007), [REQ-008](requisitos-spec.md#req-008), [REQ-009](requisitos-spec.md#req-009))
- **5.2 Templates transacionais** — Atualizar e-mails de aprovação e progresso com links para consentimento. Nota: manter alinhamento regulatório com [REQ-040](requisitos-spec.md#req-040) para notificações clínicas. 【F:docs/prototype/email-aprovacao-conta.html†L1-L120】 ([REQ-028](requisitos-spec.md#req-028), [REQ-029](requisitos-spec.md#req-029), [REQ-030](requisitos-spec.md#req-030))
- **5.3 Rastreamento operacional** — Registrar envios em relatórios (`docs/reports/`) com responsável e data. Nota: cruzar auditorias com o tracing avançado previsto em [REQ-044](requisitos-spec.md#req-044). 【F:REPORTS.md†L24-L74】 ([REQ-022](requisitos-spec.md#req-022), [REQ-023](requisitos-spec.md#req-023))

### 6. Branding e Identidade
- **6.1 Tokens e variáveis** — Sincronizar `branding.js` com `BrandingHelper.ts` e validar regra 60-30-10. Nota: replicar o mesmo tema na interface colaborativa estabelecida em [REQ-033](requisitos-spec.md#req-033). 【F:docs/prototype/branding.js†L1-L132】【F:ui/src/BrandingHelper.ts†L1-L160】 ([REQ-016](requisitos-spec.md#req-016), [REQ-018](requisitos-spec.md#req-018))
- **6.2 Menu e avatar** — Implementar `UserMenu.tsx` com estados responsivos. Nota: exibir estados que indiquem participação no fluxo colaborativo especificado em [REQ-031](requisitos-spec.md#req-031). 【F:ui/src/UserMenu.tsx†L1-L158】 ([REQ-010](requisitos-spec.md#req-010), [REQ-016](requisitos-spec.md#req-016))
- **6.3 Auditoria cromática** — Executar checklist `Controle de Qualidade` e anexar resultados. Nota: manter compatibilidade com monitoramentos descritos em [REQ-034](requisitos-spec.md#req-034). 【F:docs/wiki/06-governanca-tecnica-e-controle-de-qualidade/controle-de-qualidade.md†L33-L78】 ([REQ-022](requisitos-spec.md#req-022), [REQ-023](requisitos-spec.md#req-023))

### 7. Governança e QA
- **7.1 Plano de testes** — Atualizar `wiki/04-testes-e-validacao/` com cenários E2E. Nota: contemplar verificações para o workflow colaborativo descrito em [REQ-036](requisitos-spec.md#req-036). 【F:docs/wiki/04-testes-e-validacao/testes-end-to-end.md†L1-L160】 ([REQ-019](requisitos-spec.md#req-019), [REQ-022](requisitos-spec.md#req-022))
- **7.2 Pipelines e auditoria** — Garantir execução dos workflows e registro em `REPORTS.md`. Nota: incluir etapas de tracing e deploy contínuo conforme [REQ-044](requisitos-spec.md#req-044) e [REQ-045](requisitos-spec.md#req-045). 【F:PIPELINE.md†L12-L84】【F:REPORTS.md†L24-L74】 ([REQ-019](requisitos-spec.md#req-019), [REQ-021](requisitos-spec.md#req-021), [REQ-022](requisitos-spec.md#req-022))
- **7.3 Changelog e PRs** — Registrar incrementos por milestone, obedecendo às regras do `AGENTS.md`. Nota: vincular aprovações ao comitê de validação descrito em [REQ-033](requisitos-spec.md#req-033). 【F:CHANGELOG/20251020143759.md†L1-L120】【F:AGENTS.md†L200-L333】 ([REQ-019](requisitos-spec.md#req-019), [REQ-022](requisitos-spec.md#req-022), [REQ-023](requisitos-spec.md#req-023))

## Capacidade de Diagnóstico Colaborativo (REQ-031 a REQ-045)

### MVP — Validação de Conceito
> **Atualização 2025-10-24 (Issues #257-#261):** Restauração dos pacotes de trabalho da extensão base (REQ-001 a REQ-030) e correção das âncoras para o catálogo RUP após perda de rastreabilidade causada por inconsistências durante a migração de requisitos e atualização de referências cruzadas, conforme plano [`20251024203001-reconstruir-req-de-ref`](../../docs/plans/20251024203001-reconstruir-req-de-ref.md) e auditoria associada [`20251024203001-reconstruir-req-de-ref-audit`](../../docs/plans/20251024203001-reconstruir-req-de-ref-audit.md). 【F:docs/plans/20251024203001-reconstruir-req-de-ref.md†L9-L56】

### Registro de restauração 2025-10-24
- Reintrodução dos pacotes WBS legados alinhados aos requisitos funcionais `REQ-001` a `REQ-010` e legais `REQ-024` a `REQ-030`, preservando referências aos protótipos oficiais. 【F:req/02-planejamento/requisitos.md†L24-L33】【F:req/02-planejamento/requisitos.md†L86-L92】【F:.ref/docs/wiki/02-planejamento/wbs.md†L6-L33】
- Ajuste das âncoras internas para apontar diretamente aos IDs do catálogo de requisitos (`#req-00x`), mitigando apontamentos quebrados identificados na auditoria. 【F:req/02-planejamento/requisitos.md†L24-L92】【F:docs/plans/20251024203001-reconstruir-req-de-ref-audit.md†L33-L60】

## 0. Extensão Base — Jornada Original
- **0.1 Autenticação e Gatekeeping (`REQ-001` a `REQ-010`)** — Reforçar login SSO, bloqueios administrativos e navegação no side panel conforme `ApprovalStatus` e protótipos de espera. 【F:req/02-planejamento/requisitos.md†L24-L33】【F:.ref/docs/wiki/02-planejamento/wbs.md†L6-L18】
- **0.2 Onboarding e Consentimento (`REQ-024` a `REQ-027`)** — Restaurar fluxo LGPD com versionamento de consentimento, permissões clínicas e checklist de microcopy. 【F:req/02-planejamento/requisitos.md†L86-L89】【F:.ref/docs/wiki/02-planejamento/wbs.md†L20-L28】
- **0.3 Upload Clínico e Áudio (`REQ-003`, `REQ-005`, `REQ-006`, `REQ-017`)** — Manter drag-and-drop, fallback IndexedDB (`wl-db`) e contratos `/diagnostics/submit`. 【F:req/02-planejamento/requisitos.md†L26-L33】【F:req/02-planejamento/requisitos.md†L53-L57】【F:.ref/docs/wiki/02-planejamento/wbs.md†L30-L38】
- **0.4 Dashboard Operacional (`REQ-007` a `REQ-009`, `REQ-015`, `REQ-016`)** — Garantir métricas, ações rápidas e estados vazios conforme protótipos `dashboard-visao-geral.html` e `dashboard-fila.html`. 【F:req/02-planejamento/requisitos.md†L30-L33】【F:req/02-planejamento/requisitos.md†L51-L53】【F:.ref/docs/wiki/02-planejamento/wbs.md†L30-L38】
- **0.5 Comunicação e Branding (`REQ-007` a `REQ-009`, `REQ-028` a `REQ-030`)** — Restaurar templates transacionais, máscaras e auditorias cromáticas documentadas. 【F:req/02-planejamento/requisitos.md†L30-L33】【F:req/02-planejamento/requisitos.md†L90-L92】【F:.ref/docs/wiki/02-planejamento/wbs.md†L30-L38】

## 1. MVP — Validação de Conceito
- **1.1 Arquitetura do Workflow** — Detalhar serviços de validação, notificações e métricas iniciais (RT-031/RT-034), documentando diagramas e contratos. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L192-L226】
- **1.2 Interface de Validação** — Prototipar e implementar a UI lado a lado para médicos, incluindo anotações e assinatura digital (RF-033). 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L119-L130】
- **1.3 Gestão da Fila Clínica** — Construir submissão de diagnósticos, priorização e SLA de 4 horas para especialistas (RF-031/RN-032). 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L90-L117】【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L248-L252】
- **1.4 Notificações Médicas** — Integrar canais de email/mobile e registrar auditoria de convites para validadores (Integração 2). 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L332-L362】
- **1.5 Governança Piloto** — Definir critérios de aceite, microcopy clínico e plano de mitigação para resistência médica. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L236-L246】【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L300-L308】

### Sistema Completo
- **2.1 Sistema de Especialidades** — Cadastrar médicos, roteamento inteligente, escalonamento e limites de carga (RF-032/RN-031). 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L107-L117】【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L242-L248】
- **2.2 Métricas e Qualidade** — Implementar dashboards, alertas e relatórios regulatórios para gestores (RF-034). 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L132-L142】
- **2.3 Integrações HIS/LIS** — Desenvolver conectores HL7 FHIR, sincronização bidirecional e rollback (RF-035/RT-033). 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L144-L154】【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L212-L218】
- **2.4 Observabilidade Avançada** — Configurar logs estruturados, métricas customizadas e tracing distribuído (RT-034). 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L220-L226】
- **2.5 Compliance e Auditoria** — Formalizar trilha completa, políticas legais e relatórios de risco para o comitê. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L300-L326】
- **2.6 Experiência do Médico Solicitante** — Criar histórico clínico, notificações e feedback para solicitantes (História 4). 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L316-L324】

### Produção e Expansão
- **3.1 Infraestrutura Cloud-Native** — Provisionar Kubernetes multi-AZ, GitOps e políticas de autoescalonamento (RT-035). 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L228-L234】
- **3.2 Onboarding Hospitalar** — Orquestrar treinamento, checklists de integração e suporte 24/7 para hospitais piloto. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L284-L296】【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L380-L388】
- **3.3 Portal do Paciente** — Garantir entrega segura, linguagem acessível e áudio para acessibilidade (História 5). 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L344-L354】
- **3.4 Performance e Disponibilidade** — Validar metas de 99,9% de uptime, testes de carga e escalabilidade a 10.000 validações (RNF-031/RNF-034). 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L158-L182】
- **3.5 Governança Contínua** — Estabelecer ciclo de auditoria, consentimento contínuo e plano de expansão nacional. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L266-L270】【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L380-L388】

## 4. WBS Herdada — Extensão Clínica V5
- **4.1 Telas de Bloqueio e Triagem** — Implementar `ApprovalStatus` com estados `PENDING`/`REJECTED`/`APPROVED`, fallbacks locais e microcopy alinhada ao protótipo. 【F:.ref/docs/wiki/02-planejamento/wbs.md†L6-L13】【F:prototype/aguardando-aprovacao.html†L1-L80】【F:ui/src/components/approval/ApprovalStatus.tsx†L1-L173】
- **4.2 Auditoria de Aprovação** — Registrar tentativas de acesso, logs e checklist “Conforme UX Writing” para bloqueios administrativos. 【F:.ref/docs/wiki/02-planejamento/wbs.md†L6-L13】【F:.ref/REPORTS.md†L24-L74】
- **4.3 Consentimento LGPD** — Construir `ConsentScreen` armazenando versão/timestamp em IndexedDB, com revisões de compliance registradas. 【F:.ref/docs/wiki/02-planejamento/wbs.md†L10-L18】【F:ui/src/components/onboarding/ConsentScreen.tsx†L1-L120】
- **4.4 Permissões Clínicas** — Adaptar `onboarding-permissoes.html` para múltiplas etapas, validação obrigatória e mensagens orientativas. 【F:.ref/docs/wiki/02-planejamento/wbs.md†L10-L18】【F:prototype/onboarding-permissoes.html†L1-L88】
- **4.5 Upload Clínico** — Garantir drag-and-drop, barra de progresso e confidencialidade, sincronizando `Upload.tsx` e `UploadHelper.ts`. 【F:.ref/docs/wiki/02-planejamento/wbs.md†L15-L23】【F:ui/src/Upload.tsx†L1-L188】【F:ui/src/UploadHelper.ts†L1-L154】
- **4.6 Integração NestJS** — Manter contratos `/diagnostics/submit` e `/diagnostics/audio` tipados com DTOs e testes correspondentes. 【F:.ref/docs/wiki/02-planejamento/wbs.md†L15-L23】【F:api/src/diagnostics/diagnostics.controller.ts†L33-L189】
- **4.7 Dashboard e Fila** — Reproduzir `DashboardOverview` e `DiagnosticQueue` conforme protótipos, com estados vazios e erros documentados. 【F:.ref/docs/wiki/02-planejamento/wbs.md†L20-L24】【F:prototype/dashboard-visao-geral.html†L1-L220】【F:prototype/dashboard-fila.html†L120-L248】
- **4.8 Comunicação e Relatórios** — Validar campos de compartilhamento, templates transacionais e rastreamento operacional em `docs/reports/`. 【F:.ref/docs/wiki/02-planejamento/wbs.md†L25-L29】【F:prototype/diagnostico-operacao.html†L68-L120】【F:.ref/REPORTS.md†L24-L74】
- **4.9 Branding e Identidade** — Sincronizar `branding.js` e `BrandingHelper.ts`, garantir auditoria cromática 60-30-10 e menu responsivo. 【F:.ref/docs/wiki/02-planejamento/wbs.md†L30-L33】【F:prototype/branding.js†L1-L132】【F:req/06-governanca-tecnica-e-controle-de-qualidade/controle-de-qualidade.md†L53-L78】
- **4.10 Governança e QA** — Atualizar planos de teste, pipelines e changelog conforme políticas do `AGENTS.md`. 【F:.ref/docs/wiki/02-planejamento/wbs.md†L34-L38】【F:AGENTS.md†L200-L333】

## Padrões Normativos para Pacotes de Trabalho
- **Design System** — Referenciar protótipos oficiais e componentes React conforme regras de Atomic Design e Feature-Sliced. 【F:req/02-design/componentes.md†L138-L150】【F:req/02-design/fluxos.md†L96-L115】
- **Documentação de Requisitos** — Atualizar `especificacao-de-requisitos.md` e changelogs com IDs `REQ-031` a `REQ-045`. 【F:req/02-planejamento/especificacao-de-requisitos.md†L1-L220】
- **Auditoria de Execução** — Registrar métricas, riscos e decisões no comitê de governança médica. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L300-L326】

[Voltar ao índice](README-spec.md)
