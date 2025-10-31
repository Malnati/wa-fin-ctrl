<!-- proj/02-planejamento/roadmap-spec.md -->
# Roadmap — WA Fin Ctrl

> Base: [./roadmap.md](./roadmap.md)

## Fase 0 — Base consolidada (Q1 2025)
- Concluir migração documental para `proj/`.
- Validar pipeline local (RF-001 a RF-012) com dados reais.
- Documentar políticas LGPD e RNFs críticos.

## Fase 1 — Convergência cloud (Q2 2025)
- Refatorar `cloud/api` e `cloud/ui` removendo referências Yagnostic.
- Disponibilizar autenticação, ingestão de pacotes e dashboard mínimo.
- Integrar FastAPI com endpoint `/api/reports` consumido pela UI.

## Fase 2 — Colaboração e alertas (Q3 2025)
- Implementar revisão colaborativa, comentários e status de aprovação (RF-016).
- Adicionar notificações (RF-017) e monitoramento de custos IA (RNF-003).
- Entregar painel de auditoria com trilha de execução e relatórios exportáveis (RF-018).

## Fase 3 — Operação assistida (Q4 2025)
- Automatizar backups, retenção e compliance (RO-001/002).
- Expor API externa para órgãos de controle (escopo limitado, dados anonimizados).
- Realizar piloto com MPDFT e publicar release 1.0.

## Fase 4 — Transparência ampliada (2026+)
- Dashboards públicos com dados agregados.
- Integrações com sistemas terceiros (ERP, CRMs).
- Inteligência preditiva para alertas financeiros.

### Eixos transversais
- **Governança:** revisões trimestrais, atualização contínua de changelog/audit trails.
- **Qualidade:** testes automatizados, monitoramento de métricas e validações de UX.
- **Segurança:** hardening de infraestrutura, rotação de chaves, pentests.

[Voltar ao planejamento](README-spec.md)
