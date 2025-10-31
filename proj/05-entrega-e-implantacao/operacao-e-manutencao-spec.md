<!-- req/05-entrega-e-implantacao/operacao-e-manutencao.md -->
# Operação e Manutenção

> Base: [./operacao-e-manutencao.md](./operacao-e-manutencao.md)
> Plano: [/docs/plans/20251025093000-evolucao-req-spec.md](/docs/plans/20251025093000-evolucao-req-spec.md)
> Changelog: [/CHANGELOG.md#2025-10-25](/CHANGELOG.md#2025-10-25)
> Referências correlatas: [Arquitetura da extensão](/req/01-arquitetura/arquitetura-da-extensao-spec.md) · [Design geral](/req/02-design/design-geral-spec.md) · [Testes end-to-end](/req/04-testes-e-validacao/testes-end-to-end-spec.md)

## Objetivo
Estabelecer rotinas de operação, suporte e evolução contínua da plataforma Yagnostic v5, assegurando conformidade clínica, disponibilidade e aderência às diretrizes de branding e UX conforme [REQ-015](../02-planejamento/requisitos-spec.md#req-015), [REQ-017](../02-planejamento/requisitos-spec.md#req-017), [REQ-022](../02-planejamento/requisitos-spec.md#req-022) e [REQ-029](../02-planejamento/requisitos-spec.md#req-029). 【F:docs/plans/plan-ui-ux-requirements-v5.md†L260-L320】

## Responsabilidades
- **MBRA** — monitora indicadores clínicos, aprova mudanças em prompts médicos e conduz auditorias de segurança/UX, garantindo [REQ-024](../02-planejamento/requisitos-spec.md#req-024) e [REQ-029](../02-planejamento/requisitos-spec.md#req-029).
- **Equipe de Engenharia** — mantém pipelines, corrige incidentes, atualiza documentação RUP e coordena releases, cumprindo [REQ-019](../02-planejamento/requisitos-spec.md#req-019) e [REQ-022](../02-planejamento/requisitos-spec.md#req-022).
- **Governança UX/Compliance** — revisa microcopy, consentimentos e comunicações antes de cada release para preservar [REQ-025](../02-planejamento/requisitos-spec.md#req-025) e [REQ-028](../02-planejamento/requisitos-spec.md#req-028). 【F:AGENTS.md†L200-L333】

## Rotinas Operacionais
- Revisar diariamente dashboards de status (fila de diagnósticos, geração de áudio, consumo de API) para cumprir [REQ-005](../02-planejamento/requisitos-spec.md#req-005), [REQ-006](../02-planejamento/requisitos-spec.md#req-006) e [REQ-015](../02-planejamento/requisitos-spec.md#req-015). 【F:prototype/dashboard-visao-geral.html†L120-L220】
- Monitorar logs de upload/compartilhamento e registrar anomalias em `docs/reports/`, atendendo [REQ-022](../02-planejamento/requisitos-spec.md#req-022) e [REQ-029](../02-planejamento/requisitos-spec.md#req-029). 【F:req/06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade.md†L31-L104】
- Validar cadastros pendentes e consentimentos expirados, acionando a equipe responsável quando necessário para manter [REQ-024](../02-planejamento/requisitos-spec.md#req-024) e [REQ-025](../02-planejamento/requisitos-spec.md#req-025).

## Manutenção Corretiva
1. Abrir issue vinculando requisito/marco afetado e anexar evidências para preservar [REQ-022](../02-planejamento/requisitos-spec.md#req-022).
2. Implementar correção em branch dedicada, atualizar testes e documentação pertinente, garantindo [REQ-015](../02-planejamento/requisitos-spec.md#req-015) e [REQ-019](../02-planejamento/requisitos-spec.md#req-019).
3. Registrar changelog citando Issue #241 ou derivadas, anexar relatório de testes e aprovações para cumprir [REQ-029](../02-planejamento/requisitos-spec.md#req-029). 【F:CHANGELOG/20251020143759.md†L1-L120】

## Manutenção Evolutiva
- Avaliar impacto em protótipos, componentes React e serviços NestJS antes de iniciar desenvolvimento, resguardando [REQ-018](../02-planejamento/requisitos-spec.md#req-018) e [REQ-020](../02-planejamento/requisitos-spec.md#req-020).
- Atualizar plano de requisitos v5 e req correspondentes (Arquitetura, Design, Testes, Governança) antes do merge, garantindo [REQ-022](../02-planejamento/requisitos-spec.md#req-022) e [REQ-029](../02-planejamento/requisitos-spec.md#req-029).
- Executar auditoria cromática e de UX Writing sempre que novos componentes ou textos forem introduzidos para manter [REQ-016](../02-planejamento/requisitos-spec.md#req-016) e [REQ-028](../02-planejamento/requisitos-spec.md#req-028). 【F:req/06-governanca-tecnica-e-controle-de-qualidade/controle-de-qualidade.md†L33-L78】

## Monitoramento e Alertas
- Configurar alertas para upload >30 s, falhas na geração de áudio e acúmulo de exames `pending` por >4h, protegendo [REQ-005](../02-planejamento/requisitos-spec.md#req-005), [REQ-006](../02-planejamento/requisitos-spec.md#req-006) e [REQ-015](../02-planejamento/requisitos-spec.md#req-015).
- Rodar scanner de dependências e testes de segurança a cada release planejado para garantir [REQ-017](../02-planejamento/requisitos-spec.md#req-017) e [REQ-024](../02-planejamento/requisitos-spec.md#req-024).
- Registrar métricas de consumo de ElevenLabs e custos associados para avaliação financeira, vinculando resultados a [REQ-022](../02-planejamento/requisitos-spec.md#req-022) e preparando indicadores para REQ-034.

## Cadência de Manutenção
| Tipo | Frequência | Responsável | Evidência obrigatória |
| --- | --- | --- | --- |
| Auditoria técnica completa | Trimestral | Governance Agent + Revisor Humano | `docs/reports/governance-summary.md` compilado via `governance.yml` (garante [REQ-022](../02-planejamento/requisitos-spec.md#req-022)). |
| Atualização de agentes IA | Trimestral | Audit Agent + Codex Builder | `docs/reports/agent-report.md` (suporta [REQ-021](../02-planejamento/requisitos-spec.md#req-021)). |
| Atualização de modelos OpenRouter | Trimestral | Governance Agent | `docs/reports/agents-update.log` (cobre [REQ-021](../02-planejamento/requisitos-spec.md#req-021) e [REQ-029](../02-planejamento/requisitos-spec.md#req-029)). |
| Atualização de dependências npm | Trimestral | DevOps | `docs/reports/build-report.md` (mantém [REQ-019](../02-planejamento/requisitos-spec.md#req-019)). |
| Revalidação de pipelines | Trimestral | CI/CD Team | `docs/reports/pipeline-audit.log` (cumpre [REQ-019](../02-planejamento/requisitos-spec.md#req-019) e [REQ-022](../02-planejamento/requisitos-spec.md#req-022)). |
| Revisão LGPD e políticas Chrome | Semestral | Comitê de Ética | `docs/reports/audit-report.md` via `governance.yml` (assegura [REQ-024](../02-planejamento/requisitos-spec.md#req-024) e [REQ-030](../02-planejamento/requisitos-spec.md#req-030)). |
| Testes E2E completos | A cada release | Test Agent | `docs/reports/test-report.md` (garante [REQ-015](../02-planejamento/requisitos-spec.md#req-015)). |
| Backup e limpeza de logs | Mensal | DevOps | `docs/reports/maintenance-log.md` (protege [REQ-017](../02-planejamento/requisitos-spec.md#req-017) e [REQ-029](../02-planejamento/requisitos-spec.md#req-029)). |
| Revisão humana final | Anual | Diretor Técnico | `docs/reports/governance-summary.md` (reforça [REQ-029](../02-planejamento/requisitos-spec.md#req-029)). |

Todas as rotinas devem ser registradas em `req/06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade.md#catalogo-de-relatorios-automatizados` e vinculadas ao ciclo RUP descrito em [`governanca-tecnica.md`](../06-governanca-tecnica-e-controle-de-qualidade/governanca-tecnica-spec.md#ciclo-hoop-de-governanca).

## Indicadores e Evidências
| Indicador | Meta | Evidência |
| --- | --- | --- |
| Tempo médio de correção de falhas | ≤ 48h | `docs/reports/maintenance-log.md` (atende [REQ-015](../02-planejamento/requisitos-spec.md#req-015)). |
| Taxa de sucesso em builds CI | ≥ 99% | `docs/reports/build-report.md` (garante [REQ-019](../02-planejamento/requisitos-spec.md#req-019)). |
| Conformidade de agentes IA | 100% | `docs/reports/agent-report.md` (mantém [REQ-021](../02-planejamento/requisitos-spec.md#req-021)). |
| Versões de modelos em conformidade | 100% | `docs/reports/agents-update.log` (cobre [REQ-021](../02-planejamento/requisitos-spec.md#req-021) e [REQ-029](../02-planejamento/requisitos-spec.md#req-029)). |
| Falhas de pipeline detectadas | 0 | `docs/reports/pipeline-audit.log` (reforça [REQ-019](../02-planejamento/requisitos-spec.md#req-019) e [REQ-022](../02-planejamento/requisitos-spec.md#req-022)). |
| Reincidência de bugs | ≤ 1% | `docs/reports/test-report.md` (garante [REQ-015](../02-planejamento/requisitos-spec.md#req-015)). |
| Conformidade LGPD | 100% | `docs/reports/governance-summary.md` consolidado por `governance.yml` (assegura [REQ-024](../02-planejamento/requisitos-spec.md#req-024) e [REQ-029](../02-planejamento/requisitos-spec.md#req-029)). |
| Disponibilidade operacional | ≥ 99,8% | `docs/reports/uptime-monitor.md` (apoia [REQ-015](../02-planejamento/requisitos-spec.md#req-015)). |

Os indicadores devem ser auditados trimestralmente pelo Governance Agent e homologados pelo Comitê de Governança, com evidências anexadas em `docs/reports/`.

## Governança de Branding e Tokens
- Revisar periodicamente `branding.js` e `BrandingHelper.ts` para garantir paridade visual entre tenants e cumprir [REQ-016](../02-planejamento/requisitos-spec.md#req-016) e [REQ-028](../02-planejamento/requisitos-spec.md#req-028). 【F:prototype/branding.js†L1-L132】【F:ui/src/BrandingHelper.ts†L1-L160】
- Qualquer alteração em paleta, fontes ou ícones deve ser aprovada pela governança UX e refletida no relatório 60-30-10, preservando [REQ-016](../02-planejamento/requisitos-spec.md#req-016) e alinhamento com REQ-034.

## Contingência e Rollback
- Garantir que toda alteração crítica disponha de rollback em até **15 minutos**, com gatilho automatizado pelo pipeline `rollback.yml`, cumprindo [REQ-015](../02-planejamento/requisitos-spec.md#req-015).
- Manter backups automáticos em `/backups/daily/` e `/backups/weekly/`, com logs consolidados em `docs/reports/maintenance-log.md`, atendendo [REQ-017](../02-planejamento/requisitos-spec.md#req-017) e [REQ-029](../02-planejamento/requisitos-spec.md#req-029).
- Registrar cada execução do pipeline `rollback.yml` em `docs/reports/rollback-report.md`, incluindo causa, ação corretiva e ticket associado no `CHANGELOG/`, garantindo [REQ-022](../02-planejamento/requisitos-spec.md#req-022).
- Sincronizar os resultados de rollback com o pipeline mensal `governance.yml`, anexando evidências no relatório consolidado (`docs/reports/governance-summary.md`) para cumprir [REQ-029](../02-planejamento/requisitos-spec.md#req-029).

## Encerramento de Ciclo
- Atualizar documentação RUP com evidências e lições aprendidas após cada release, reforçando [REQ-022](../02-planejamento/requisitos-spec.md#req-022).
- Verificar que DEV, HML e PRD executam a mesma versão do front-end e da API, garantindo [REQ-019](../02-planejamento/requisitos-spec.md#req-019) e [REQ-030](../02-planejamento/requisitos-spec.md#req-030).
- Arquivar relatório de auditoria (segurança, UX, LGPD) com status final “Aprovado” antes de concluir a implantação, cumprindo [REQ-024](../02-planejamento/requisitos-spec.md#req-024) e [REQ-029](../02-planejamento/requisitos-spec.md#req-029). 【F:req/06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade.md†L31-L104】

[Voltar ao índice](README-spec.md)
