<!-- req/03-implementacao/testes.md -->
# Estratégia de Testes na Implementação

> Base: [./testes.md](./testes.md)
> Plano: [/docs/plans/20251025093000-evolucao-req-spec.md](/docs/plans/20251025093000-evolucao-req-spec.md)
> Changelog: [/CHANGELOG.md#2025-10-25](/CHANGELOG.md#2025-10-25)
> Referências correlatas: [Arquitetura da extensão](/req/01-arquitetura/arquitetura-da-extensao-spec.md) · [Design geral](/req/02-design/design-geral-spec.md) · [Testes end-to-end](/req/04-testes-e-validacao/testes-end-to-end-spec.md)

Esta seção orienta a instrumentação de testes unitários, integração e utilitários necessários para sustentar os requisitos UI/UX v5 durante a fase de implementação, cobrindo rastreabilidade de [REQ-001](../02-planejamento/requisitos-spec.md#req-001) a [REQ-030](../02-planejamento/requisitos-spec.md#req-030). Complementa os artefatos da disciplina 04-Testes e Validação. 【F:docs/plans/plan-ui-ux-requirements-v5.md†L150-L210】

## Escopo de Testes
- **Front-end** — validar componentes `Upload`, `ApprovalStatus`, `DashboardOverview`, `DiagnosticQueue`, `OnboardingFlow` (`OnboardingConsent`/`OnboardingPermissions`), garantindo estados e microcopy corretos para satisfazer [REQ-004](../02-planejamento/requisitos-spec.md#req-004) a [REQ-010](../02-planejamento/requisitos-spec.md#req-010). 【F:ui/src/Upload.tsx†L1-L188】【F:ui/src/components/onboarding/OnboardingFlow.tsx†L1-L200】
- **Helpers** — cobrir `UploadHelper` (fallback IndexedDB), `BrandingHelper` (persistência de tokens) e `ApprovalHelper` (fallback vs. API), reforçando privacidade e armazenamento de [REQ-011](../02-planejamento/requisitos-spec.md#req-011), [REQ-017](../02-planejamento/requisitos-spec.md#req-017) e [REQ-024](../02-planejamento/requisitos-spec.md#req-024). 【F:ui/src/UploadHelper.ts†L1-L154】【F:ui/src/BrandingHelper.ts†L1-L160】
- **API NestJS** — testes para `POST /diagnostics/submit` e `POST /diagnostics/audio`, incluindo validação de tamanho, formatos e tratamento de erros para cobrir [REQ-005](../02-planejamento/requisitos-spec.md#req-005) e [REQ-007](../02-planejamento/requisitos-spec.md#req-007). 【F:api/src/diagnostics/diagnostics.controller.ts†L33-L189】

## Testes Unitários Sugeridos (UI)
1. **UploadHelper** — deve salvar arquivos e retornar IDs exclusivos; fallback simulado retorna resumo padrão para garantir submissões de [REQ-005](../02-planejamento/requisitos-spec.md#req-005) e armazenamento de [REQ-011](../02-planejamento/requisitos-spec.md#req-011). 【F:ui/src/UploadHelper.ts†L63-L154】
2. **ApprovalHelper** — retorna `APPROVED` para usuário demo e `PENDING` por padrão; deve limpar status após `clearApprovalStatus`, cobrindo jornadas de [REQ-003](../02-planejamento/requisitos-spec.md#req-003) e [REQ-006](../02-planejamento/requisitos-spec.md#req-006). 【F:ui/src/ApprovalHelper.ts†L1-L86】
3. **DashboardOverview** — renderiza métricas e cards conforme dados mockados, respeitando tokens de cor exigidos em [REQ-008](../02-planejamento/requisitos-spec.md#req-008) e [REQ-016](../02-planejamento/requisitos-spec.md#req-016). 【F:ui/src/components/dashboard/DashboardOverview.tsx†L1-L222】
4. **DiagnosticQueue** — exibe ações corretas para cada estado e dispara callbacks de retry/compartilhar, mantendo notificações de [REQ-007](../02-planejamento/requisitos-spec.md#req-007) e agradecimentos de [REQ-009](../02-planejamento/requisitos-spec.md#req-009). 【F:ui/src/components/dashboard/DiagnosticQueue.tsx†L1-L210】

## Testes Unitários Sugeridos (API)
1. **submitDiagnostic** — rejeita arquivos >10 MB, aceita PDF válido e registra logs, atendendo limites de [REQ-005](../02-planejamento/requisitos-spec.md#req-005) e auditoria de [REQ-017](../02-planejamento/requisitos-spec.md#req-017). 【F:api/src/diagnostics/diagnostics.controller.ts†L33-L120】
2. **generateAudioFromText** — retorna URL simulada quando ElevenLabs está habilitado; falha controlada com mensagem clara, garantindo notificações previstas em [REQ-007](../02-planejamento/requisitos-spec.md#req-007) e conformidade de publicação de [REQ-030](../02-planejamento/requisitos-spec.md#req-030). 【F:api/src/diagnostics/diagnostics.controller.ts†L121-L189】
3. **resolveRequestBaseUrl** — compõe URL base a partir dos headers `x-forwarded-*`, garantindo roteamento seguro conforme [REQ-020](../02-planejamento/requisitos-spec.md#req-020) e logs de [REQ-022](../02-planejamento/requisitos-spec.md#req-022). 【F:api/src/diagnostics/diagnostics.controller.ts†L189-L260】

## Integração e Mocks
- Utilizar `msw` ou handlers customizados para simular `/diagnostics/submit` e `/config` durante testes do React, garantindo aderência a [REQ-005](../02-planejamento/requisitos-spec.md#req-005) e [REQ-006](../02-planejamento/requisitos-spec.md#req-006).
- Para NestJS, usar `@nestjs/testing` com módulos isolados e mocks de ElevenLabs, protegendo dados conforme [REQ-026](../02-planejamento/requisitos-spec.md#req-026).
- Persistência local deve ser mockada com `fake-indexeddb` para validar IndexedDB sem dependência do browser, mantendo isolamento de [REQ-011](../02-planejamento/requisitos-spec.md#req-011) e revogação de [REQ-027](../02-planejamento/requisitos-spec.md#req-027).

## Automação
- Configurar scripts `npm test` no `ui/` e `api/` integrados ao pipeline principal, sustentando [REQ-019](../02-planejamento/requisitos-spec.md#req-019) e [REQ-022](../02-planejamento/requisitos-spec.md#req-022). 【F:req/06-governanca-tecnica-e-controle-de-qualidade/revisoes-com-ia.md†L18-L110】
- Relatórios devem ser exportados para `docs/reports/` quando testes cobrirem marcos críticos (aprovação, onboarding, upload), alimentando auditorias descritas em [REQ-023](../02-planejamento/requisitos-spec.md#req-023) e cenários colaborativos de [REQ-031](../02-planejamento/requisitos-spec.md#req-031).

## Normas Arquiteturais para Testes
- **React oficial:** suites precisam cobrir hooks oficiais e impedir regressões causadas por bibliotecas alternativas; qualquer mock deve respeitar a API real do React para manter compatibilidade de [REQ-018](../02-planejamento/requisitos-spec.md#req-018). 【F:req/02-design/componentes.md†L120-L150】
- **Feature-Sliced Design:** testes devem ser organizados por fatia, garantindo isolamento entre features e refletindo a estrutura `components/<feature>`, alinhada a [REQ-010](../02-planejamento/requisitos-spec.md#req-010) e aos fluxos do side panel. 【F:req/02-design/fluxos.md†L96-L115】
- **Atomic Design:** cenários precisam validar reutilização de átomos/moléculas antes de criar fixtures novas, mantendo consistência visual e funcional em conformidade com [REQ-016](../02-planejamento/requisitos-spec.md#req-016) e [REQ-028](../02-planejamento/requisitos-spec.md#req-028). 【F:req/02-design/componentes.md†L138-L150】

## Evidências Obrigatórias
- Capturas de tela ou gravações dos fluxos críticos (aprovação, consentimento, upload, dashboard) anexadas ao PR, demonstrando cumprimento de [REQ-006](../02-planejamento/requisitos-spec.md#req-006) e [REQ-009](../02-planejamento/requisitos-spec.md#req-009).
- Logs de testes exibindo cenários executados e status (pass/fail), anexados como artefatos de [REQ-022](../02-planejamento/requisitos-spec.md#req-022).
- Relatório de auditoria 60-30-10 vinculado às telas testadas quando houver alteração visual, compartilhado com governança para atender [REQ-028](../02-planejamento/requisitos-spec.md#req-028) e sincronizar com o fluxo colaborativo de [REQ-034](../02-planejamento/requisitos-spec.md#req-034). 【F:req/06-governanca-tecnica-e-controle-de-qualidade/controle-de-qualidade.md†L53-L78】

[Voltar ao índice](README-spec.md)
