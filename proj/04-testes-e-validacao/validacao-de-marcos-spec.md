<!-- req/04-testes-e-validacao/validacao-de-marcos.md -->
# Validação de Marcos

> Base: [./validacao-de-marcos.md](./validacao-de-marcos.md)
> Plano: [/docs/plans/20251025093000-evolucao-req-spec.md](/docs/plans/20251025093000-evolucao-req-spec.md)
> Changelog: [/CHANGELOG.md#2025-10-25](/CHANGELOG.md#2025-10-25)
> Referências correlatas: [Arquitetura da extensão](/req/01-arquitetura/arquitetura-da-extensao-spec.md) · [Design geral](/req/02-design/design-geral-spec.md) · [Testes end-to-end](/req/04-testes-e-validacao/testes-end-to-end-spec.md)

Esta seção descreve os checkpoints de validação para cada milestone da versão 5, garantindo que critérios técnicos, visuais e regulatórios sejam verificados antes da homologação. 【F:req/02-planejamento/milestones.md†L1-L160】

## M1 — Aprovação Administrativa Conectada
**Critérios de Aceite**
- [ ] Login com usuário não aprovado exibe tela `PENDING` com tempo médio e contatos. 【F:ui/src/components/approval/ApprovalStatus.tsx†L1-L173】
- [ ] Estado `REJECTED` apresenta instruções para suporte e botão de contato. 【F:prototype/aguardando-aprovacao.html†L1-L80】
- [ ] Logs registram tentativas bloqueadas com timestamp e e-mail ofuscado. 【F:req/06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade.md†L31-L104】
**Requisitos:** [REQ-001](../02-planejamento/requisitos-spec.md#req-001), [REQ-010](../02-planejamento/requisitos-spec.md#req-010), [REQ-017](../02-planejamento/requisitos-spec.md#req-017).  
**Integração colaborativa:** mantém o bloqueio prévio aos convites multi-especialistas definidos em [REQ-031](../02-planejamento/requisitos-spec.md#req-031).

**Procedimentos**
1. Simular acesso com conta pendente e capturar tela.
2. Validar fallback do `ApprovalHelper` alterando status no localStorage.
3. Registrar evidência no relatório de auditoria.

## M2 — Onboarding LGPD com Consentimento Versionado
**Critérios de Aceite**
- [ ] OnboardingFlow conduz termo atualizado, coleta aceite via `OnboardingConsent` e registra versão. 【F:ui/src/components/onboarding/OnboardingFlow.tsx†L1-L200】
- [ ] Permissões obrigatórias marcadas antes de liberar dashboard. 【F:prototype/onboarding-permissoes.html†L1-L88】
- [ ] IndexedDB armazena consentimento com timestamp e operador autenticado. 【F:ui/src/UploadHelper.ts†L1-L63】
**Requisitos:** [REQ-024](../02-planejamento/requisitos-spec.md#req-024), [REQ-025](../02-planejamento/requisitos-spec.md#req-025), [REQ-027](../02-planejamento/requisitos-spec.md#req-027).  
**Integração colaborativa:** garante rastreabilidade compartilhada com o prontuário médico descrito em [REQ-033](../02-planejamento/requisitos-spec.md#req-033).

**Procedimentos**
1. Executar fluxo completo com usuário aprovado.
2. Inspecionar `wl-db` via DevTools e exportar registro.
3. Anexar checklist de UX Writing aprovado.

## M3 — Upload Clínico e Geração de Áudio
**Critérios de Aceite**
- [ ] Upload aceita PDF até 10 MB e exibe barra de progresso. 【F:ui/src/Upload.tsx†L1-L188】
- [ ] API retorna `SubmitResponse` com laudo e opcionalmente `audioUrl`. 【F:api/src/diagnostics/diagnostics.controller.ts†L33-L189】
- [ ] Fallback local marca item como `pending` e permite retry. 【F:ui/src/UploadHelper.ts†L63-L154】
**Requisitos:** [REQ-004](../02-planejamento/requisitos-spec.md#req-004), [REQ-005](../02-planejamento/requisitos-spec.md#req-005), [REQ-006](../02-planejamento/requisitos-spec.md#req-006), [REQ-015](../02-planejamento/requisitos-spec.md#req-015).  
**Integração colaborativa:** assegura que artefatos estejam prontos para roteamento clínico previsto em [REQ-032](../02-planejamento/requisitos-spec.md#req-032) e dashboards de [REQ-034](../02-planejamento/requisitos-spec.md#req-034).

**Procedimentos**
1. Enviar arquivo real e capturar resposta da API.
2. Desabilitar API para validar fallback e posterior retry.
3. Registrar tempo total (de upload à resposta) e anexar nos relatórios.

## M4 — Dashboard e Fila Operacional
**Critérios de Aceite**
- [ ] DashboardOverview exibe KPIs, status do sistema e ações rápidas conforme protótipo. 【F:ui/src/components/dashboard/DashboardOverview.tsx†L1-L222】
- [ ] DiagnosticQueue apresenta estados `processing`, `success`, `error`, `pending` com ações adequadas. 【F:ui/src/components/dashboard/DiagnosticQueue.tsx†L1-L210】
- [ ] Auditoria cromática 60-30-10 registrada como “Conforme” ou “Não conforme”. 【F:req/06-governanca-tecnica-e-controle-de-qualidade/controle-de-qualidade.md†L53-L78】
**Requisitos:** [REQ-006](../02-planejamento/requisitos-spec.md#req-006), [REQ-007](../02-planejamento/requisitos-spec.md#req-007), [REQ-016](../02-planejamento/requisitos-spec.md#req-016).  
**Integração colaborativa:** mantém métricas compatíveis com o monitoramento clínico de [REQ-034](../02-planejamento/requisitos-spec.md#req-034) e logs correlacionados de [REQ-044](../02-planejamento/requisitos-spec.md#req-044).

**Procedimentos**
1. Gerar dados mockados ou API real para preencher fila.
2. Capturar screenshots das seções principais.
3. Executar medição cromática e anexar relatório em `docs/reports/`.

## M5 — Comunicação e Relatórios Clínicos
**Critérios de Aceite**
- [ ] Campos de compartilhamento validam formatos de e-mail/telefone e exibem feedback. 【F:prototype/diagnostico-operacao.html†L68-L120】
- [ ] Templates de e-mail mostram status de aprovação e links de consentimento. 【F:prototype/email-aprovacao-conta.html†L1-L120】
- [ ] Logs de envios armazenados com operador, canal, timestamp e link para laudo. 【F:req/06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade.md†L31-L104】
**Requisitos:** [REQ-006](../02-planejamento/requisitos-spec.md#req-006), [REQ-007](../02-planejamento/requisitos-spec.md#req-007), [REQ-008](../02-planejamento/requisitos-spec.md#req-008), [REQ-009](../02-planejamento/requisitos-spec.md#req-009), [REQ-017](../02-planejamento/requisitos-spec.md#req-017).  
**Integração colaborativa:** garante disponibilidade dos registros nos relatórios clínicos previstos em [REQ-033](../02-planejamento/requisitos-spec.md#req-033) e [REQ-034](../02-planejamento/requisitos-spec.md#req-034).

**Procedimentos**
1. Executar envio por e-mail e WhatsApp (ambiente de teste) e capturar resposta.
2. Registrar evidência do log correspondente.
3. Validar textos com governança UX/compliance.

## Normas Arquiteturais para Validação
- **React oficial:** checklists devem confirmar que a implementação auditada utiliza componentes React oficiais; desvios são bloqueadores. 【F:req/02-design/componentes.md†L120-L150】
- **Feature-Sliced Design:** validação deve identificar a fatia (`components/<feature>`) do componente avaliado e garantir que os critérios cubram dependências internas. 【F:req/02-design/fluxos.md†L96-L115】
- **Atomic Design:** inspeções precisam indicar se átomos/moléculas reutilizadas permanecem conformes após o ajuste, documentando eventuais novos organismos. 【F:req/02-design/componentes.md†L138-L150】

## Governança Final
- Checklist de QA (acessibilidade, performance, segurança) concluído e anexado.
- Changelog atualizado com referência ao plano v5 e Issue #241. 【F:CHANGELOG/20251020143759.md†L1-L120】
- Relatório consolidado arquivado em `docs/reports/` com status “Aprovado” e assinaturas responsáveis. 【F:req/06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade.md†L31-L104】
**Requisitos associados:** [REQ-015](../02-planejamento/requisitos-spec.md#req-015), [REQ-019](../02-planejamento/requisitos-spec.md#req-019), [REQ-022](../02-planejamento/requisitos-spec.md#req-022), [REQ-034](../02-planejamento/requisitos-spec.md#req-034).  
**Integração colaborativa:** sincronize evidências com os marcos médicos descritos em [REQ-031](../02-planejamento/requisitos-spec.md#req-031) e com a trilha de auditoria de [REQ-033](../02-planejamento/requisitos-spec.md#req-033).

[Voltar ao índice](README-spec.md)
