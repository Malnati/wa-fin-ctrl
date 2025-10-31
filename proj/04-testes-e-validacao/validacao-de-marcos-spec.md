<!-- proj/04-testes-e-validacao/validacao-de-marcos-spec.md -->
# Validação de Marcos — WA Fin Ctrl

> Base: [./validacao-de-marcos.md](./validacao-de-marcos.md)

| Marco | Evidências necessárias |
| --- | --- |
| M1 — Pipeline consolidado | Execução de `wa-fin.py teste`, relatório HTML validado, checklist de acessibilidade dos relatórios, changelog com referência aos RF implementados. |
| M2 — Plataforma cloud pronta | Testes unitários NestJS/React passando, endpoint `/ingestion/packages` aceitando pacotes de homologação, autenticação validada, documentação atualizada. |
| M3 — Revisão colaborativa | E2E cobrindo upload → comentário → aprovação, registros de auditoria combinada, alertas funcionando. |
| M4 — Auditoria externa | Relatório assinado pelo MPDFT, ausência de pendências críticas, RL cumpridos. |
| M5 — Release 1.0 | Checklist `release` concluído, métricas publicadas, treinamento registrado. |

Cada marco só pode ser fechado após anexar evidências a `docs/reports/` e atualizar `proj/audit-history-spec.md`.

[Voltar aos testes](README-spec.md)
