<!-- proj/02-planejamento/cronograma-spec.md -->
# Cronograma — WA Fin Ctrl

> Base: [./cronograma.md](./cronograma.md)

## Linha do tempo macro (2025)
| Período | Atividade principal | Responsáveis | Saídas |
| --- | --- | --- | --- |
| Jan–Fev | Consolidação do pipeline local, documentação RUP, automatização dos relatórios | Time Python | `docs/report*.html`, RNFs críticos implementados |
| Mar–Abr | Refatoração da plataforma cloud (renomeações, atualização NestJS/React, autenticação) | Time TypeScript | API básica + UI alinhada a WA Fin Ctrl |
| Mai–Jun | Sincronização local ↔ cloud, testes e2e, integração com armazenamento seguro | Time híbrido | Endpoint `/ingestion/packages`, protótipo de dashboard colaborativo |
| Jul | Auditoria conjunta com MPDFT, ajustes de LGPD e checklist de conformidade | Curadoria + Governança | Relatório de auditoria, atualização `proj/audit-history-spec.md` |
| Ago | Automação de alertas e notificações, métricas operacionais, dashboards | Time TypeScript | Painel de alertas, integrações e-mail/SMS |
| Set | Backups automatizados, storage seguro, política de retenção | Infra + Governança | Playbook de backup, scripts aprovados |
| Out | Release 1.0 cloud, migração piloto com usuários reais | Time completo | Changelog oficial, trainings |
| Nov–Dez | Evoluções incremental (dashboards públicos, API externa), planejamento 2026 | Todos | Roadmap 2026, lições aprendidas |

## Dependências críticas
- Conclusão do catálogo de requisitos antes da refatoração cloud.
- Disponibilização de credenciais e infraestrutura para testes NestJS/React.
- Aprovação das políticas LGPD antes da sincronização com ambientes externos.

## Cadências de acompanhamento
- **Semanal (sexta)** — revisão de progresso e bloqueios (curadoria + técnicos).
- **Mensal (última segunda)** — checkpoint com MPDFT, revisão de indicadores e RNFs.
- **Trimestral** — auditoria interna de conformidade e atualização do roadmap.

Alterações no cronograma devem ser registradas no changelog e refletidas neste documento.

[Voltar ao planejamento](README-spec.md)
