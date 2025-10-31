<!-- req/06-governanca-tecnica-e-controle-de-qualidade/governanca-tecnica.md -->
# Governança Técnica

> Base: [./governanca-tecnica.md](./governanca-tecnica.md)
> Plano: [/docs/plans/20251025093000-evolucao-req-spec.md](/docs/plans/20251025093000-evolucao-req-spec.md)
> Changelog: [/CHANGELOG.md#2025-10-25](/CHANGELOG.md#2025-10-25)
> Referências correlatas: [Arquitetura da extensão](/req/01-arquitetura/arquitetura-da-extensao-spec.md) · [Design geral](/req/02-design/design-geral-spec.md) · [Testes end-to-end](/req/04-testes-e-validacao/testes-end-to-end-spec.md)

## Objetivo
Definir a estrutura de decisão técnica para a plataforma Yagnostic v5, assegurando que cada incremento atenda aos requisitos clínicos, de segurança e de UX definidos pela MBRA. 【F:docs/plans/plan-ui-ux-requirements-v5.md†L260-L320】

## Papéis e Responsabilidades
- **MBRA (Comitê Clínico e Compliance)** — aprova requisitos, avalia prompts médicos e valida auditorias de segurança/UX.
- **Equipe de Engenharia** — executa desenvolvimento, mantém documentação RUP atualizada e coordena releases.
- **Agentes de QA/UX** — descritos em `AGENTS.md`, responsáveis por revisões automatizadas e validação cruzada (Scope, Architecture, Code, UX, Audit). 【F:AGENTS.md†L200-L333】
- **Requisitos associados:** REQ-019, REQ-021, REQ-022, REQ-023, REQ-029 e REQ-030.
- **Nota colaborativa:** garantir que cada papel humano explicitado para a capacidade de diagnóstico colaborativo (REQ-031–REQ-035) esteja representado na matriz de responsabilidades e receba insumos dos agentes IA.

## Hierarquia de Governança Técnica
A cadeia de decisão segue o princípio **“IA executa, humano valida”**, garantindo validação dupla antes de qualquer promoção de branch ou release.

1. **Diretor Técnico** — valida releases, aprova relatórios consolidados e autoriza mudanças de estado entre ambientes.
2. **Comitê de Governança IA** — audita decisões automatizadas, avalia ética e LGPD, correlaciona métricas em `docs/reports/`.
3. **Agentes Autônomos (Codex/IA)** — executam pipelines (`build.yml`, `test.yml`, `review.yml`, `audit.yml`), registrando evidências rastreáveis.

Todos os níveis mantêm logs vinculados ao `CHANGELOG/` e aos artefatos descritos em `req/06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade.md#catalogo-de-relatorios-automatizados`, assegurando rastreabilidade completa.
- **Requisitos associados:** REQ-019, REQ-022, REQ-023, REQ-029 e REQ-030.
- **Nota colaborativa:** acoplar checkpoints de aprovação dupla às filas clínicas descritas em REQ-031–REQ-033 para evitar liberação automática sem revisão médica.

## Fluxo de Aprovação
1. Criação de branch vinculando Issue/Plano e definição dos artefatos impactados.
2. Desenvolvimento com atualizações simultâneas em protótipo, código (React/NestJS/Extensão) e documentação RUP.
3. Execução de pipelines obrigatórios conforme `req/06-governanca-tecnica-e-controle-de-qualidade/revisoes-com-ia.md`:
   - `build.yml` — compilação API/UI/extensão, lint, TypeScript check
   - `test.yml` — testes unit/integração/E2E, acessibilidade, performance  
   - `review.yml` — revisões automatizadas IA (scope, architecture, security)
   - `audit.yml` — auditoria mensal (changelog, variáveis, governança)
4. Validação de componentes implementados:
   - **API:** endpoints, DTOs, serviços (`api/src/diagnostics/`, `api/src/onboarding/`, etc.)
   - **UI:** componentes React, helpers, testes (`ui/src/components/`, `ui/src/__tests__/`)
   - **Extensão:** sidepanel, background, storage (`extension/src/sidepanel/`, `extension/src/background/`)
5. Revisões automatizadas (Scope, Architecture, Code, UX, Audit) + revisão humana (engenharia e UX/compliance).
6. Merge somente após aprovação dupla (técnica + UX) e atualização do changelog com referências às Issues #257-#261.
- **Requisitos associados:** REQ-005 a REQ-010 (fluxos operacionais), REQ-015, REQ-019, REQ-020, REQ-021, REQ-022, REQ-023 e REQ-030.
- **Nota colaborativa:** validar se entregas que habilitam validação médica colaborativa (REQ-031–REQ-035) incluem artefatos de onboarding humano e métricas em `governance-summary.md` antes do merge.

## Ciclo HOOP de Governança
O ciclo contínuo de governança alinha os estágios RUP ao modelo **HOOP (Hipótese – Observação – Otimização – Produção)** para manter decisões rastreáveis.

1. **Hipótese (Iniciação RUP)** — definição de escopo e requisitos com registro cruzado em `req/02-planejamento/requisitos.md` e hipóteses documentadas em `docs/reports/`.
2. **Observação (Elaboração)** — revisão arquitetural e avaliação de riscos com decisões registradas em `req/02-planejamento/riscos-e-mitigacoes.md` e diagramas anexados no `CHANGELOG/`.
3. **Otimização (Construção)** — implementação e testes automatizados, validando métricas nos pipelines (`build.yml`, `test.yml`) e publicando resultados em `req/06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade.md#catalogo-de-relatorios-automatizados`.
4. **Produção (Transição)** — auditoria, versionamento e aprovação final, vinculando `audit-report.md` e entradas do `CHANGELOG.md` ao ciclo liberado.
5. **Revisão (Manutenção)** — reavaliação de indicadores, consolidação em `governance-summary.md` e atualização de mitigações em `req/02-planejamento/riscos-e-mitigacoes.md`.

Cada fase exige evidências anexadas ao PR correspondente e rastreabilidade no diretório `docs/reports/`.
- **Requisitos associados:** REQ-019, REQ-021, REQ-022, REQ-023, REQ-029, REQ-034 e REQ-035.
- **Nota colaborativa:** utilizar o estágio “Revisão” para consolidar decisões clínicas compartilhadas (REQ-031–REQ-035) e emitir recomendações cruzadas com a matriz de riscos.

## Ritos de Governança
- **Weekly Checkpoint** — revisão de pendências de aprovação, consentimento e fila clínica.
- **Post-Mortem** — obrigatório após incidentes que impactem diagnósticos, áudio ou compliance.
- **Auditoria Mensal** — geração de relatório consolidado (`docs/reports/`) com status de 60-30-10, segurança e LGPD. 【F:req/06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade.md†L31-L104】
- **Requisitos associados:** REQ-015, REQ-017, REQ-019, REQ-022, REQ-023, REQ-029 e REQ-034.
- **Nota colaborativa:** incluir revisões específicas para os indicadores de throughput humano vs. IA estabelecidos nos REQ-031–REQ-035.

## Políticas de Rastreabilidade
- Toda alteração deve conter links para requisitos RUP (plano v5), protótipos e componentes afetados.
- Relatórios de auditoria, medições cromáticas e resultados de testes devem ser anexados aos PRs.
- Logs operacionais devem permitir reconstruir a jornada do usuário em caso de auditoria clínica.
- **Requisitos associados:** REQ-017, REQ-019, REQ-022, REQ-023, REQ-024, REQ-028 e REQ-029.
- **Nota colaborativa:** manter evidências das interações IA + humano previstas em REQ-031–REQ-035 para auditorias clínicas.

## Governança Visual e Conteúdo
- Mudanças em microcopy, branding ou tokens exigem aprovação da governança UX/compliance antes do merge.
- Auditorias 60-30-10, regra 4x2 e simplicidade visual devem registrar resultado (“Conforme/Não conforme”) seguindo `AGENTS.md`. 【F:req/06-governanca-tecnica-e-controle-de-qualidade/controle-de-qualidade.md†L33-L78】
- **Requisitos associados:** REQ-016, REQ-024, REQ-028, REQ-029 e REQ-034.
- **Nota colaborativa:** alinhar ajustes visuais às necessidades dos validadores humanos e dashboards clínicos previstos nos REQ-031–REQ-035.

## Checklists LGPD/UX/QA Consolidados

### Requisitos LGPD Implementados
- Onboarding com consentimento explícito: `ui/src/components/onboarding/OnboardingConsent.tsx`, `extension/src/components/Onboarding.tsx`
- Versionamento de termos: `API_CONSENT_VERSION`, `API_CONSENT_VALIDITY_PERIOD_MS`
- Auditoria de jornada do usuário e logs para conformidade
- **Requisitos associados:** REQ-024, REQ-025, REQ-026, REQ-027, REQ-028 e REQ-029.

### UX Writing e 8pt Grid Obrigatórios
- Microcopy padronizado e templates configuráveis via `MESSAGE_PREFIX`
- Espaçamento baseado em múltiplos de 8px conforme `AGENTS.md`
- Regra 4x2 tipográfica (máximo 4 tamanhos, 2 pesos)
- **Requisitos associados:** REQ-016, REQ-024, REQ-028 e REQ-034.
- **Nota colaborativa:** garantir diferenciação clara entre mensagens automáticas da IA e instruções humanizadas exigidas pelos REQ-031–REQ-033.

### Notificações Omnicanal Implementadas
- Sistema `api/src/notifications/` com e-mail e WhatsApp — documentação detalhada em [Fluxo 9 — Notificações Omnicanal](../02-design/fluxos-spec.md#fluxo-9-notificacoes-omnicanal).
- Configuração monitorada via `ADMIN_EMAIL`, `DASHBOARD_URL`, `ADMIN_URL`, `NOTIFICATION_DEFAULT_COMPANY_NAME`, `NOTIFICATION_DEFAULT_DASHBOARD_URL`, `NOTIFICATION_DEFAULT_ADMIN_URL` e `EMAIL_NOTIFY_LOG_TEMPLATE`.
- Opt-out disponível para conformidade LGPD
- **Requisitos associados:** REQ-006, REQ-007, REQ-008, REQ-009, REQ-024, REQ-026, REQ-028 e REQ-029.
- **Nota colaborativa:** utilizar logs e preferências descritos em REQ-031–REQ-035 para distinguir alertas destinados a validadores médicos de notificações enviadas aos pacientes.

## Métricas de Governança Técnica
| Métrica | Meta | Relatório |
| --- | --- | --- |
| Cobertura de testes | ≥ 95% | `coverage-report.md`, gatilho `test.yml` |
| Erros de build | 0 tolerados | `agent-report.md`, gatilho `build.yml` |
| Alucinações IA | ≤ 2% | `audit-report.md`, revisão do Comitê IA |
| Conformidade LGPD | 100% | `governance-summary.md`, avaliação do Diretor Técnico |
| Revisão humana antes de merge | Obrigatória | `review.yml`, histórico em `CHANGELOG.md` |
| Frequência de auditorias IA | Semanal | `audit.yml`, registros em `req/06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade.md#catalogo-de-relatorios-automatizados` |
| Frequência de auditorias humanas | Mensal | `governance.yml`, matriz de `req/02-planejamento/riscos-e-mitigacoes.md` |

Os agentes definidos em `AGENTS.md` monitoram esses indicadores e consolidam os resultados nos relatórios previstos neste capítulo.
- **Requisitos associados:** REQ-015, REQ-019, REQ-022, REQ-023, REQ-029, REQ-034 e REQ-035.
- **Nota colaborativa:** incluir métricas de latência e throughput humano das validações médicas (REQ-031–REQ-035) na rotina de publicação dos indicadores.

## Versionamento dos Agentes
| Agente | Versão | Responsabilidade |
| --- | --- | --- |
| Scope Corrector | 1.0.0 | Valida aderência do PR ao escopo definido no plano v5 |
| Architecture Corrector | 1.0.0 | Revisa impacto arquitetural e dependências |
| Codex Builder/Reviewer | 1.0.0 | Suporte ao desenvolvimento e revisão de código |
| UX Reviewer | 1.0.0 | Audita microcopy, acessibilidade e 60-30-10 |
| Audit Agent | 1.0.0 | Consolida relatórios e rastreabilidade |

## Governança dos Agentes e Pipelines
| Componente | Responsável | Auditor | Frequência |
| --- | --- | --- | --- |
| `build.yml` | Code Agent | Audit Agent | A cada PR |
| `test.yml` | Test Agent | Coverage Agent | A cada commit |
| `release.yml` | Semantic Versioning Agent | Semantic Revision Validator | A cada release |
| `audit.yml` | Audit Agent | Governance Agent | Semanal |
| `governance.yml` | Governance Agent | Diretor Técnico | Mensal |

Os pipelines devem utilizar tokens seguros (`GITHUB_TOKEN`, `OPENROUTER_TOKEN`), registrar logs com hash e timestamp e arquivar relatórios em `docs/reports/` seguindo `req/06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade.md#catalogo-de-relatorios-automatizados`. Todo desvio precisa de plano de ação documentado em `req/02-planejamento/riscos-e-mitigacoes.md`.
- **Requisitos associados:** REQ-019, REQ-021, REQ-022, REQ-023, REQ-029, REQ-030 e REQ-034.
- **Nota colaborativa:** garantir que pipelines que gerenciam validações humanas (REQ-031–REQ-035) mantenham segregação de perfis e logs de consentimento compartilhados com os relatórios clínicos.

## Governança Ética e LGPD
- Dados pessoais seguem a Lei nº 13.709/2018 (LGPD) e as cláusulas descritas em `req/02-planejamento/requisitos.md` e `req/02-planejamento/riscos-e-mitigacoes.md`.
- Logs e relatórios devem ser anonimizados, armazenados com controle de acesso e referenciar o agente executor e o revisor humano.
- O consentimento de uso da extensão é auditado periodicamente pelo Comitê IA, com evidências registradas em `docs/reports/`.
- Políticas de privacidade expostas no side panel são revisadas sempre que o `CHANGELOG.md` indicar ajustes relevantes.
- **Requisitos associados:** REQ-017, REQ-024, REQ-025, REQ-026, REQ-027, REQ-028, REQ-029 e REQ-030.
- **Nota colaborativa:** assegurar que os fluxos de validação clínica (REQ-031–REQ-035) respeitem os mesmos mecanismos de consentimento e de revogação auditados para o side panel.

## Ciclo de Auditoria Técnica
1. Execução dos agentes IA publica `agent-report.md` conforme `req/06-governanca-tecnica-e-controle-de-qualidade/revisoes-com-ia.md`.
2. Verificação automática (`audit.yml`) gera `audit-report.md` e atualiza indicadores em `req/06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade.md#catalogo-de-relatorios-automatizados`.
3. Revisão humana registra decisões no `CHANGELOG/` e atualiza riscos em `req/02-planejamento/riscos-e-mitigacoes.md`.
4. Compilação mensal (`governance.yml`) consolida resultados em `governance-summary.md` com referências cruzadas a `AGENTS.md`.
5. Publicação consolidada garante rastreabilidade entre `req/06-governanca-tecnica-e-controle-de-qualidade/revisoes-com-ia.md`, `req/06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade.md#catalogo-de-relatorios-automatizados` e `CHANGELOG.md`.
6. Riscos são reavaliados e vinculados às métricas de mitigação acompanhadas pelo Comitê IA.
- **Requisitos associados:** REQ-019, REQ-021, REQ-022, REQ-023, REQ-029, REQ-034 e REQ-035.
- **Nota colaborativa:** mapear explicitamente as pendências levantadas pelos validadores humanos (REQ-031–REQ-033) para ações do Comitê IA e registros no `risk-summary.md`.

## Encerramento de Release
- Checklist completo (testes, auditorias, documentação, changelog) aprovado.
- Aprovação final assinada por engenharia e governança UX/compliance.
- Artefatos versionados e armazenados conforme políticas MBRA (12 meses). 【F:req/06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade.md†L31-L104】

## Responsabilidade Técnica
Responsável técnico: **Ricardo Malnati (MBRA)** — garante alinhamento entre decisões humanas, execuções automatizadas e conformidade ética documentada neste capítulo.

[Voltar ao índice](README-spec.md)
