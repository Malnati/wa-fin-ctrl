# Referências

> Base: [./referencias.md](./referencias.md)
> Plano: [/docs/plans/20251025093000-evolucao-req-spec.md](/docs/plans/20251025093000-evolucao-req-spec.md)
> Changelog: [/CHANGELOG.md#2025-10-25](/CHANGELOG.md#2025-10-25)
> Referências correlatas: [Arquitetura da extensão](/req/01-arquitetura/arquitetura-da-extensao-spec.md) · [Design geral](/req/02-design/design-geral-spec.md) · [Testes end-to-end](/req/04-testes-e-validacao/testes-end-to-end-spec.md)

Este catálogo retoma as fontes herdadas do legado e aponta onde cada requisito da extensão
está respaldado por protótipos, código e normativos. A curadoria mantém a rastreabilidade entre
os anexos e os requisitos [REQ-001](../02-planejamento/requisitos-spec.md#req-001) a
[REQ-030](../02-planejamento/requisitos-spec.md#req-030), destacando conexões com a futura
capacidade colaborativa.

## Referências técnicas

| Artefato | Descrição | Requisitos |
| --- | --- | --- |
| [extension/manifest.config.ts](../../extension/manifest.config.ts) | Define permissões, side panel e compatibilidade Manifest V3. | [REQ-010](../02-planejamento/requisitos-spec.md#req-010), [REQ-013](../02-planejamento/requisitos-spec.md#req-013), [REQ-030](../02-planejamento/requisitos-spec.md#req-030) |
| [extension/src/background/index.ts](../../extension/src/background/index.ts) | Implementa interceptação de PDF, upload e sincronização de tokens. | [REQ-004](../02-planejamento/requisitos-spec.md#req-004), [REQ-005](../02-planejamento/requisitos-spec.md#req-005), [REQ-006](../02-planejamento/requisitos-spec.md#req-006), [REQ-020](../02-planejamento/requisitos-spec.md#req-020) |
| [extension/src/sidepanel/App.tsx](../../extension/src/sidepanel/App.tsx) | Painel com login, fila clínica e notificações multicanal. | [REQ-001](../02-planejamento/requisitos-spec.md#req-001), [REQ-006](../02-planejamento/requisitos-spec.md#req-006), [REQ-007](../02-planejamento/requisitos-spec.md#req-007), [REQ-008](../02-planejamento/requisitos-spec.md#req-008), [REQ-016](../02-planejamento/requisitos-spec.md#req-016), [REQ-024](../02-planejamento/requisitos-spec.md#req-024) |
| [extension/src/components/Onboarding.tsx](../../extension/src/components/Onboarding.tsx) | Fluxo de consentimento LGPD, concessão de permissões e armazenamento seguro. | [REQ-017](../02-planejamento/requisitos-spec.md#req-017), [REQ-024](../02-planejamento/requisitos-spec.md#req-024), [REQ-025](../02-planejamento/requisitos-spec.md#req-025) |
| [extension/src/storage/db.ts](../../extension/src/storage/db.ts) | Rotinas IndexedDB para JWT, tokens, configurações e consentimentos. | [REQ-002](../02-planejamento/requisitos-spec.md#req-002), [REQ-011](../02-planejamento/requisitos-spec.md#req-011), [REQ-014](../02-planejamento/requisitos-spec.md#req-014), [REQ-027](../02-planejamento/requisitos-spec.md#req-027) |
| [extension/vite.config.ts](../../extension/vite.config.ts) | Empacotamento local sem dependência de CDN, integrado ao Makefile. | [REQ-012](../02-planejamento/requisitos-spec.md#req-012), [REQ-019](../02-planejamento/requisitos-spec.md#req-019) |
| [extension/Makefile](../../extension/Makefile) | Automatiza build e empacotamento consumidos pelos pipelines CI. | [REQ-019](../02-planejamento/requisitos-spec.md#req-019), [REQ-022](../02-planejamento/requisitos-spec.md#req-022) |
| [api/src/notifications/notification.service.ts](../../api/src/notifications/notification.service.ts) | Gera mensagens de agradecimento e integra canais corporativos. | [REQ-007](../02-planejamento/requisitos-spec.md#req-007), [REQ-009](../02-planejamento/requisitos-spec.md#req-009), [REQ-026](../02-planejamento/requisitos-spec.md#req-026) |

## Referências de protótipos e UX

| Protótipo | Descrição | Requisitos |
| --- | --- | --- |
| [prototype/login.html](../../prototype/login.html) | Fluxo de login corporativo com SSO Google. | [REQ-001](../02-planejamento/requisitos-spec.md#req-001) |
| [prototype/onboarding-consentimento.html](../../prototype/onboarding-consentimento.html) | Exibe o termo LGPD antes da primeira autenticação. | [REQ-024](../02-planejamento/requisitos-spec.md#req-024), [REQ-025](../02-planejamento/requisitos-spec.md#req-025) |
| [prototype/onboarding-permissoes.html](../../prototype/onboarding-permissoes.html) | Demonstra a concessão de permissões e o salvamento do token. | [REQ-006](../02-planejamento/requisitos-spec.md#req-006), [REQ-017](../02-planejamento/requisitos-spec.md#req-017) |
| [prototype/email-aprovacao-conta.html](../../prototype/email-aprovacao-conta.html) | Template de comunicação com agradecimento e instruções de envio. | [REQ-007](../02-planejamento/requisitos-spec.md#req-007), [REQ-009](../02-planejamento/requisitos-spec.md#req-009) |
| [prototype/onboarding-boas-vindas.html](../../prototype/onboarding-boas-vindas.html) | Disponibiliza links para política de privacidade e onboarding inicial. | [REQ-010](../02-planejamento/requisitos-spec.md#req-010), [REQ-028](../02-planejamento/requisitos-spec.md#req-028) |

## Normas, governança e rastreabilidade

| Documento | Descrição | Requisitos |
| --- | --- | --- |
| [req/06-governanca-tecnica-e-controle-de-qualidade/governanca-tecnica.md](../06-governanca-tecnica-e-controle-de-qualidade/governanca-tecnica-spec.md) | Define responsabilidades, controles de dados e aderência LGPD. | [REQ-026](../02-planejamento/requisitos-spec.md#req-026), [REQ-029](../02-planejamento/requisitos-spec.md#req-029) |
| [req/06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade.md](../06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade-spec.md) | Lista relatórios automatizados, metadados e armazenamento de logs. | [REQ-022](../02-planejamento/requisitos-spec.md#req-022), [REQ-023](../02-planejamento/requisitos-spec.md#req-023) |
| [req/05-entrega-e-implantacao/ambientes-e-configuracoes.md](../05-entrega-e-implantacao/ambientes-e-configuracoes-spec.md) | Determina métricas de latência, observabilidade e SLAs. | [REQ-015](../02-planejamento/requisitos-spec.md#req-015), [REQ-030](../02-planejamento/requisitos-spec.md#req-030) |
| [req/05-entrega-e-implantacao/empacotamento-e-publicacao.md](../05-entrega-e-implantacao/empacotamento-e-publicacao.md) | Procedimentos de empacotamento e políticas da Chrome Web Store. | [REQ-019](../02-planejamento/requisitos-spec.md#req-019), [REQ-030](../02-planejamento/requisitos-spec.md#req-030) |
| [AGENTS.md](../../AGENTS.md) | Política de versionamento de modelos e operações de IA. | [REQ-021](../02-planejamento/requisitos-spec.md#req-021) |
| [req/02-planejamento/capacidade-diagnostico-colaborativo.md](../02-planejamento/capacidade-diagnostico-colaborativo-spec.md) | Plano da validação colaborativa e dependências futuras. | [REQ-006](../02-planejamento/requisitos-spec.md#req-006), [REQ-031](../02-planejamento/requisitos-spec.md#req-031) a [REQ-035](../02-planejamento/requisitos-spec.md#req-035) |

## Notas de convivência com a capacidade colaborativa

- Monitorar atualizações em [capacidade-diagnostico-colaborativo.md](../02-planejamento/capacidade-diagnostico-colaborativo-spec.md)
  antes de evoluir fluxos de token, notificações e auditoria.
- A cada incremento de requisitos [REQ-031](../02-planejamento/requisitos-spec.md#req-031) a
  [REQ-045](../02-planejamento/requisitos-spec.md#req-045), adicione referências cruzadas nos quadros
  acima para preservar a rastreabilidade histórica.

[Voltar ao índice](README-spec.md)
