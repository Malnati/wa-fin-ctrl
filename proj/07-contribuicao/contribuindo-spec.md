<!-- req/07-contribuicao/contribuindo.md -->
# Contribuindo

> Base: [./contribuindo.md](./contribuindo.md)
> Plano: [/docs/plans/20251025093000-evolucao-req-spec.md](/docs/plans/20251025093000-evolucao-req-spec.md)
> Changelog: [/CHANGELOG.md#2025-10-25](/CHANGELOG.md#2025-10-25)
> Referências correlatas: [Arquitetura da extensão](/req/01-arquitetura/arquitetura-da-extensao-spec.md) · [Design geral](/req/02-design/design-geral-spec.md) · [Testes end-to-end](/req/04-testes-e-validacao/testes-end-to-end-spec.md)

Este guia descreve como preparar o ambiente, preservar os fluxos legados (`REQ-001` a `REQ-030`) e registrar evidências que comprovem a convivência com a capacidade colaborativa (`REQ-031` a `REQ-035`). Use-o como checklist durante onboarding, desenvolvimento e revisão.

[Voltar ao índice](README-spec.md)

## 1. Onboarding rápido
- Leia o [`extension/README.md`](../../extension/README.md) e execute `make install && make dev` para validar autenticação, storage e notificações antes de qualquer alteração. ([REQ-001](../02-planejamento/requisitos-spec.md#req-001), [REQ-002](../02-planejamento/requisitos-spec.md#req-002), [REQ-010](../02-planejamento/requisitos-spec.md#req-010))
- Sincronize os protótipos base (`prototype/login.html`, `prototype/dashboard-visao-geral.html`) com os componentes React em `ui/src/Login.tsx` e `ui/src/Dashboard.tsx`, garantindo equivalência funcional e visual. ([REQ-001](../02-planejamento/requisitos-spec.md#req-001), [REQ-010](../02-planejamento/requisitos-spec.md#req-010), [REQ-016](../02-planejamento/requisitos-spec.md#req-016))
- Configure variáveis `.env` alinhadas ao manifesto (`extension/manifest.config.ts`) para manter compatibilidade com Manifest V3 e políticas de publicação. ([REQ-012](../02-planejamento/requisitos-spec.md#req-012), [REQ-018](../02-planejamento/requisitos-spec.md#req-018), [REQ-030](../02-planejamento/requisitos-spec.md#req-030))
- **Nota colaborativa:** ao habilitar mocks de APIs ou pipelines para testes, isole credenciais do fluxo médico e documente a compatibilidade com `REQ-031`–`REQ-035` em comentários ou notas de PR.

## 2. Mapa de requisitos legados e referências de contribuição
| Requisito | O que validar ao contribuir | Protótipo / Código de apoio | Nota colaborativa |
| --- | --- | --- | --- |
| [REQ-001](../02-planejamento/requisitos-spec.md#req-001) | Login Google SSO ativo, sem regressão de consentimento. | [`prototype/login.html`](../../prototype/login.html), [`ui/src/Login.tsx`](../../ui/src/Login.tsx) | Sincronizar convites de especialistas apenas após gatekeeping de `REQ-031`. |
| [REQ-002](../02-planejamento/requisitos-spec.md#req-002) | JWT salvo em IndexedDB com expiração válida. | [`extension/src/storage/db.ts`](../../extension/src/storage/db.ts), [`extension/src/api/client.ts`](../../extension/src/api/client.ts) | Informar médicos validadores se o token for reaproveitado pelo fluxo colaborativo (`REQ-033`). |
| [REQ-003](../02-planejamento/requisitos-spec.md#req-003) | Consulta a `/domain` e cache de domínios autorizados. | [`extension/src/api/client.ts`](../../extension/src/api/client.ts), [`extension/src/background/index.ts`](../../extension/src/background/index.ts) | Compartilhar lista com roteamento clínico (`REQ-032`) sem remover hosts legados. |
| [REQ-004](../02-planejamento/requisitos-spec.md#req-004) | Interceptação de PDFs apenas dos domínios permitidos. | [`extension/src/background/index.ts`](../../extension/src/background/index.ts) | Registrar interceptações que alimentam fila colaborativa (`REQ-032`). |
| [REQ-005](../02-planejamento/requisitos-spec.md#req-005) | Upload automático após bloqueio do download. | [`extension/src/background/index.ts`](../../extension/src/background/index.ts), [`extension/src/api/client.ts`](../../extension/src/api/client.ts) | Garantir que o mesmo token alimente workflow médico (`REQ-031`). |
| [REQ-006](../02-planejamento/requisitos-spec.md#req-006) | Exibição do token e instruções de compartilhamento. | [`ui/src/components/dashboard/DiagnosticQueue.tsx`](../../ui/src/components/dashboard/DiagnosticQueue.tsx) | Expor status compatíveis com painel clínico (`REQ-033`). |
| [REQ-007](../02-planejamento/requisitos-spec.md#req-007) | Envio por e-mail/WhatsApp com validação de campos. | [`extension/src/background/index.ts`](../../extension/src/background/index.ts) | Reutilizar histórico de convites para auditar validações médicas (`REQ-034`). |
| [REQ-008](../02-planejamento/requisitos-spec.md#req-008) | Inclusão de múltiplos destinatários antes do envio. | [`prototype/dashboard-visao-geral.html`](../../prototype/dashboard-visao-geral.html), [`extension/src/background/index.ts`](../../extension/src/background/index.ts) | Mapear destinatários médicos para fila colaborativa (`REQ-032`). |
| [REQ-009](../02-planejamento/requisitos-spec.md#req-009) | Mensagem de agradecimento após envio. | [`prototype/dashboard-visao-geral.html`](../../prototype/dashboard-visao-geral.html), [`ui/src/components/dashboard/DashboardOverview.tsx`](../../ui/src/components/dashboard/DashboardOverview.tsx) | Acrescentar call-to-action para revisão colaborativa quando aplicável. |
| [REQ-010](../02-planejamento/requisitos-spec.md#req-010) | Side panel com navegação completa (login → dashboard). | [`extension/sidepanel.html`](../../extension/sidepanel.html), [`extension/src/sidepanel`](../../extension/src/sidepanel) | Garantir espaço para módulos de validação compartilhados (`REQ-033`). |
| [REQ-011](../02-planejamento/requisitos-spec.md#req-011) | IndexedDB isolado por domínio. | [`extension/src/storage/db.ts`](../../extension/src/storage/db.ts) | Validar partições extras solicitadas pelos médicos (`REQ-032`). |
| [REQ-012](../02-planejamento/requisitos-spec.md#req-012) | Build sem dependências de CDN externas. | [`extension/vite.config.ts`](../../extension/vite.config.ts) | Replicar configuração no front colaborativo (`REQ-033`). |
| [REQ-013](../02-planejamento/requisitos-spec.md#req-013) | Compatibilidade Chrome Desktop/Mobile. | [`extension/manifest.config.ts`](../../extension/manifest.config.ts), [`prototype/frames.html`](../../prototype/frames.html) | Testar responsividade também para dashboards colaborativos (`REQ-034`). |
| [REQ-014](../02-planejamento/requisitos-spec.md#req-014) | Expiração automática do JWT conforme TTL da API. | [`extension/src/api/client.ts`](../../extension/src/api/client.ts), [`extension/src/background/index.ts`](../../extension/src/background/index.ts) | Alertar workflow clínico quando a sessão expirar para não perder validações em curso. |
| [REQ-015](../02-planejamento/requisitos-spec.md#req-015) | Tempo de resposta <3s nas chamadas principais. | Logs gerados via `make dev`, [`docs/reports/`](../../docs/reports) | Monitorar métricas compartilhadas com painéis médicos (`REQ-034`). |
| [REQ-016](../02-planejamento/requisitos-spec.md#req-016) | UI responsiva no painel lateral. | [`prototype/styles.css`](../../prototype/styles.css), [`ui/src/index.css`](../../ui/src/index.css) | Harmonizar componentes com telas colaborativas (`REQ-033`). |
| [REQ-017](../02-planejamento/requisitos-spec.md#req-017) | Logs respeitando consentimento LGPD. | [`extension/src/components/Onboarding.tsx`](../../extension/src/components/Onboarding.tsx), [`extension/src/storage/db.ts`](../../extension/src/storage/db.ts) | Anotar execuções clínicas no mesmo padrão de consentimento. |
| [REQ-018](../02-planejamento/requisitos-spec.md#req-018) | Stack TypeScript + React + Manifest V3. | Estrutura `extension/`, `ui/`, [`package.json`](../../package.json) | Reaproveitar mesmas versões no módulo clínico para evitar divergências. |
| [REQ-019](../02-planejamento/requisitos-spec.md#req-019) | Build automatizado com Makefile e GitHub Actions. | [`extension/Makefile`](../../extension/Makefile), [`scripts/`](../../scripts) | Adicionar jobs colaborativos como etapas adicionais, nunca substituindo os legados. |
| [REQ-020](../02-planejamento/requisitos-spec.md#req-020) | Uso exclusivo de APIs oficiais do Chrome. | [`extension/src/background/index.ts`](../../extension/src/background/index.ts) | Documentar chamadas extras exigidas pelo diagnóstico colaborativo antes de ativá-las. |
| [REQ-021](../02-planejamento/requisitos-spec.md#req-021) | Versionamento de modelos IA via OpenRouter/Codex. | [`AGENTS.md`](../../AGENTS.md), [`scripts/mcp-github/`](../../scripts/mcp-github) | Registrar novos modelos médicos sem alterar baseline legada. |
| [REQ-022](../02-planejamento/requisitos-spec.md#req-022) | Artefatos armazenados em `/docs/reports/`. | [`docs/reports/`](../../docs/reports), workflows CI | Acrescentar logs colaborativos mantendo o mesmo diretório. |
| [REQ-023](../02-planejamento/requisitos-spec.md#req-023) | Metadados de execuções IA (run_id, commit, timestamp). | [`docs/reports/audit-report.md`](../../docs/reports/audit-report.md) | Incluir `collaboration_id` quando envolver REQ-031–REQ-035. |
| [REQ-024](../02-planejamento/requisitos-spec.md#req-024) | Consentimento explícito antes do uso. | [`prototype/onboarding-consentimento.html`](../../prototype/onboarding-consentimento.html), [`extension/src/components/onboarding`](../../extension/src/components/onboarding) | Espelhar consentimento no portal clínico colaborativo. |
| [REQ-025](../02-planejamento/requisitos-spec.md#req-025) | Termo LGPD antes da primeira autenticação. | [`prototype/onboarding-boas-vindas.html`](../../prototype/onboarding-boas-vindas.html) | Garantir assinatura também para especialistas convidados. |
| [REQ-026](../02-planejamento/requisitos-spec.md#req-026) | Proibição de envio de dados sem autorização. | [`extension/src/background/index.ts`](../../extension/src/background/index.ts), [`extension/src/messaging`](../../extension/src/messaging) | Validar compartilhamento manual com fluxo clínico antes de ampliar acesso. |
| [REQ-027](../02-planejamento/requisitos-spec.md#req-027) | Revogação imediata de dados locais. | [`extension/src/storage/db.ts`](../../extension/src/storage/db.ts), [`prototype/dashboard-visao-geral.html`](../../prototype/dashboard-visao-geral.html) | Documentar como a revogação afeta históricos médicos. |
| [REQ-028](../02-planejamento/requisitos-spec.md#req-028) | Política de privacidade visível no side panel. | [`extension/src/sidepanel`](../../extension/src/sidepanel) | Adicionar link equivalente no painel colaborativo. |
| [REQ-029](../02-planejamento/requisitos-spec.md#req-029) | Responsabilidade MBRA pelo tratamento dos dados. | [`CHANGELOG/`](../../CHANGELOG), [`docs/reports/`](../../docs/reports) | Registrar decisões conjuntas com comitê médico no changelog. |
| [REQ-030](../02-planejamento/requisitos-spec.md#req-030) | Conformidade com políticas Chrome Manifest V3. | [`extension/manifest.config.ts`](../../extension/manifest.config.ts), [`extension/README.md`](../../extension/README.md) | Revisar permissões adicionais solicitadas por módulos clínicos antes de publicar. |

## 3. Rotina de revisão e suporte
- Use `npm run lint` e `npm run typecheck` dentro de `extension/` e `ui/` antes de abrir PRs, anexando logs aos relatórios (`REQ-019`, `REQ-022`).
- Documente evidências (screenshots, gravações ou logs) na pasta `docs/reports/YYYYMMDD/`, vinculando-as ao requisito atendido e à issue correspondente (`REQ-009`, `REQ-029`).
- Registre decisões de UX Writing seguindo `AGENTS.md`, incluindo notas de convivência com dashboards colaborativos (`REQ-016`, `REQ-028`, `REQ-034`).

## 4. Integração com a capacidade colaborativa
- Qualquer alteração que alimente filas, dashboards ou notificações deve declarar explícita compatibilidade com `REQ-031`–`REQ-035` na descrição do commit/PR.
- Se adicionar endpoints, mocks ou scripts novos, referencie o impacto esperado nos marcos colaborativos descritos em [`req/02-planejamento/capacidade-diagnostico-colaborativo.md`](../02-planejamento/capacidade-diagnostico-colaborativo-spec.md) e mantenha os legados como padrão.
- Atualize a matriz de riscos quando o fluxo colaborativo exigir exceções aos requisitos legados, anexando o ID de risco correspondente ao PR (`REQ-026`, `REQ-029`).

[Voltar ao índice](README-spec.md)
