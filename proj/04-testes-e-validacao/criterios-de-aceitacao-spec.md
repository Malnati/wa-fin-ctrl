<!-- req/04-testes-e-validacao/criterios-de-aceitacao.md -->
# Critérios de Aceitação e Homologação

> Base: [./criterios-de-aceitacao.md](./criterios-de-aceitacao.md)
> Plano: [/docs/plans/20251025093000-evolucao-req-spec.md](/docs/plans/20251025093000-evolucao-req-spec.md)
> Changelog: [/CHANGELOG.md#2025-10-25](/CHANGELOG.md#2025-10-25)
> Referências correlatas: [Arquitetura da extensão](/req/01-arquitetura/arquitetura-da-extensao-spec.md) · [Design geral](/req/02-design/design-geral-spec.md) · [Testes end-to-end](/req/04-testes-e-validacao/testes-end-to-end-spec.md)

## Objetivo
Definir critérios mensuráveis para aprovar entregas da plataforma Yagnostic v5 antes da liberação para produção. Cobrem aspectos funcionais, não funcionais e de conformidade clínica/LGPD. 【F:docs/plans/plan-ui-ux-requirements-v5.md†L210-L260】

---

## Atualizações quando requisitos forem adicionados

- Registre os novos critérios em `criterios-de-aceitacao.md`/`criterios-de-aceitacao-spec.md` sempre que um `REQ-###` ou `RNF-###` for criado, alinhando com cenários em `testes-end-to-end.md` e métricas em `../04-qualidade-testes/qualidade-e-metricas.md`.
- Certifique-se de que arquitetura, design e implementação já foram atualizados (conforme `instrucoes-evolucao-requisitos.md`) antes de homologar o requisito.
- Documente o resultado no `CHANGELOG.md`, registre a execução em `req/audit-history.md` e anexe evidências nos relatórios automatizados (`docs/reports/`).

---

## Critérios Funcionais
- **Aprovação Administrativa** — telas `PENDING/REJECTED/APPROVED` exibem instruções corretas e bloqueiam acesso ao dashboard até liberação. 【F:ui/src/components/approval/ApprovalStatus.tsx†L1-L173】
  - **Requisitos:** [REQ-001](../02-planejamento/requisitos-spec.md#req-001), [REQ-010](../02-planejamento/requisitos-spec.md#req-010), [REQ-017](../02-planejamento/requisitos-spec.md#req-017).
  - **Integração colaborativa:** mantém bloqueios prévios ao workflow multi-especialistas descrito em [REQ-031](../02-planejamento/requisitos-spec.md#req-031).
- **Onboarding LGPD** — consentimento registra versão, timestamp e operador; revogação impede upload. 【F:ui/src/components/onboarding/OnboardingConsent.tsx†L1-L160】
  - **Requisitos:** [REQ-024](../02-planejamento/requisitos-spec.md#req-024), [REQ-025](../02-planejamento/requisitos-spec.md#req-025), [REQ-027](../02-planejamento/requisitos-spec.md#req-027).
  - **Integração colaborativa:** garante rastreabilidade para a trilha clínica de [REQ-033](../02-planejamento/requisitos-spec.md#req-033).
- **Upload e Áudio** — `/diagnostics/submit` aceita arquivos válidos, mostra progresso e retorna laudo/áudio conforme protótipo. 【F:ui/src/Upload.tsx†L1-L188】【F:api/src/diagnostics/diagnostics.controller.ts†L33-L189】
  - **Requisitos:** [REQ-004](../02-planejamento/requisitos-spec.md#req-004), [REQ-005](../02-planejamento/requisitos-spec.md#req-005), [REQ-006](../02-planejamento/requisitos-spec.md#req-006), [REQ-015](../02-planejamento/requisitos-spec.md#req-015).
- **Dashboard/Fila** — métricas, estados e ações (retry, compartilhar, baixar) reproduzem `dashboard-visao-geral.html` e `dashboard-fila.html`. 【F:ui/src/components/dashboard/DashboardOverview.tsx†L1-L222】【F:prototype/dashboard-fila.html†L120-L248】
  - **Requisitos:** [REQ-006](../02-planejamento/requisitos-spec.md#req-006), [REQ-007](../02-planejamento/requisitos-spec.md#req-007), [REQ-016](../02-planejamento/requisitos-spec.md#req-016).
  - **Integração colaborativa:** indicadores permanecem compatíveis com o painel de qualidade de [REQ-034](../02-planejamento/requisitos-spec.md#req-034) e com logs correlacionados de [REQ-044](../02-planejamento/requisitos-spec.md#req-044).
- **Compartilhamento** — envio por e-mail/WhatsApp valida formato e registra log. 【F:prototype/diagnostico-operacao.html†L68-L120】【F:req/06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade.md†L31-L104】
  - **Requisitos:** [REQ-006](../02-planejamento/requisitos-spec.md#req-006), [REQ-007](../02-planejamento/requisitos-spec.md#req-007), [REQ-008](../02-planejamento/requisitos-spec.md#req-008), [REQ-009](../02-planejamento/requisitos-spec.md#req-009), [REQ-017](../02-planejamento/requisitos-spec.md#req-017).
  - **Integração colaborativa:** logs alimentam o prontuário compartilhado descrito em [REQ-033](../02-planejamento/requisitos-spec.md#req-033).

## Critérios Não Funcionais
- **Desempenho** — upload de 10 MB processado em ≤ 30 s; UI responsiva durante operação. 【F:ui/src/UploadHelper.ts†L63-L154】【F:api/src/diagnostics/diagnostics.controller.ts†L69-L189】
  - **Requisitos:** [REQ-015](../02-planejamento/requisitos-spec.md#req-015).
- **Acessibilidade** — contraste AA, foco visível, navegação por teclado e player de áudio acessível. 【F:prototype/dashboard-visao-geral.html†L1-L220】
  - **Requisitos:** [REQ-016](../02-planejamento/requisitos-spec.md#req-016), [REQ-028](../02-planejamento/requisitos-spec.md#req-028).
- **Governança Visual** — relatório 60-30-10 aprovado para telas impactadas. 【F:req/06-governanca-tecnica-e-controle-de-qualidade/controle-de-qualidade.md†L53-L78】
  - **Requisitos:** [REQ-016](../02-planejamento/requisitos-spec.md#req-016), [REQ-028](../02-planejamento/requisitos-spec.md#req-028).
- **Resiliência** — fallback IndexedDB mantém arquivos e permite retry manual sem perda de dados. 【F:ui/src/UploadHelper.ts†L63-L154】
  - **Requisitos:** [REQ-006](../02-planejamento/requisitos-spec.md#req-006), [REQ-017](../02-planejamento/requisitos-spec.md#req-017).

## Critérios de Segurança e LGPD
- Rejeição de credenciais malformadas, payloads oversized e formatos inválidos em 100% dos testes. 【F:req/04-testes-e-validacao/testes-seguranca-e2e.md†L93-L120】
  - **Requisitos:** [REQ-001](../02-planejamento/requisitos-spec.md#req-001), [REQ-014](../02-planejamento/requisitos-spec.md#req-014), [REQ-017](../02-planejamento/requisitos-spec.md#req-017).
- Consentimento e aprovação registrados antes de liberar acesso às funcionalidades clínicas. 【F:prototype/consentimento-completo.html†L1-L92】
  - **Requisitos:** [REQ-024](../02-planejamento/requisitos-spec.md#req-024), [REQ-025](../02-planejamento/requisitos-spec.md#req-025), [REQ-027](../02-planejamento/requisitos-spec.md#req-027).
- Dados sensíveis armazenados apenas em IndexedDB e endpoints seguros; logs não expõem informações clínicas. 【F:ui/src/UploadHelper.ts†L63-L154】【F:api/src/diagnostics/diagnostics.controller.ts†L69-L189】
  - **Requisitos:** [REQ-006](../02-planejamento/requisitos-spec.md#req-006), [REQ-017](../02-planejamento/requisitos-spec.md#req-017), [REQ-024](../02-planejamento/requisitos-spec.md#req-024).
  - **Integração colaborativa:** garante sigilo para auditorias médicas previstas em [REQ-033](../02-planejamento/requisitos-spec.md#req-033).

## Critérios Operacionais
- Pipelines descritos em `req/06-governanca-tecnica-e-controle-de-qualidade/revisoes-com-ia.md` executados sem falhas (lint, build, testes, auditoria). 【F:req/06-governanca-tecnica-e-controle-de-qualidade/revisoes-com-ia.md†L18-L110】
  - **Requisitos:** [REQ-019](../02-planejamento/requisitos-spec.md#req-019), [REQ-022](../02-planejamento/requisitos-spec.md#req-022).
- Evidências (prints, vídeos, relatórios) anexadas em `docs/reports/` e referenciadas no PR/Changelog. 【F:req/06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade.md†L31-L104】【F:CHANGELOG/20251020143759.md†L1-L120】
  - **Requisitos:** [REQ-017](../02-planejamento/requisitos-spec.md#req-017), [REQ-022](../02-planejamento/requisitos-spec.md#req-022), [REQ-023](../02-planejamento/requisitos-spec.md#req-023).
- Checklist de UX Writing concluído e aprovado pela governança. 【F:AGENTS.md†L200-L333】
  - **Requisitos:** [REQ-016](../02-planejamento/requisitos-spec.md#req-016), [REQ-028](../02-planejamento/requisitos-spec.md#req-028).

## Normas de Aceitação para Arquitetura de UI
- **React oficial:** releases só são aceitas se comprovarem que os componentes avaliados utilizam APIs oficiais sem wrappers proprietários. 【F:req/02-design/componentes.md†L120-L150】
- **Feature-Sliced Design:** critérios devem apontar explicitamente a fatia (`components/<feature>`) avaliada, garantindo rastreabilidade por domínio. 【F:req/02-design/fluxos.md†L96-L115】
- **Atomic Design:** relatórios de aceite precisam listar átomos/moléculas envolvidos, documentando reutilização ou criação de novos componentes. 【F:req/02-design/componentes.md†L138-L150】
- **Requisitos associados:** [REQ-016](../02-planejamento/requisitos-spec.md#req-016), [REQ-018](../02-planejamento/requisitos-spec.md#req-018), [REQ-020](../02-planejamento/requisitos-spec.md#req-020).
- **Integração colaborativa:** mantenha compatibilidade com componentes clínicos compartilhados previstos em [REQ-034](../02-planejamento/requisitos-spec.md#req-034).

## Encerramento da Homologação
A entrega é considerada aprovada quando todos os critérios acima estão verdes, o plano de requisitos v5 é atualizado e a governança técnica confirma dupla revisão (técnica + UX). Qualquer pendência bloqueia release até registro de correções com nova rodada de validação. 【F:docs/plans/plan-ui-ux-requirements-v5.md†L210-L260】
- **Requisitos associados:** [REQ-019](../02-planejamento/requisitos-spec.md#req-019), [REQ-022](../02-planejamento/requisitos-spec.md#req-022), [REQ-034](../02-planejamento/requisitos-spec.md#req-034).
- **Integração colaborativa:** sincronize o status final com os marcos médicos descritos em [REQ-031](../02-planejamento/requisitos-spec.md#req-031) e com a governança de consentimento em [REQ-033](../02-planejamento/requisitos-spec.md#req-033).

[Voltar ao índice](README-spec.md)
