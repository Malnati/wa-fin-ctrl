<!-- proj/04-qualidade-testes/qualidade-e-metricas-spec.md -->
# Qualidade e Métricas — WA Fin Ctrl

> Base: [./qualidade-e-metricas.md](./qualidade-e-metricas.md)

| Indicador | Meta | Fonte |
| --- | --- | --- |
| Tempo médio de processamento (100 comprovantes) | ≤ 8 min | Logs de execução, relatórios E2E |
| Precisão pós-revisão | ≥ 95% | Comparação entre valores processados e aprovados |
| Pendências abertas > 7 dias | 0 | Dashboard cloud/local |
| Custo mensal IA | ≤ orçamento definido | `docs/reports/ia-run*.json` |
| Taxa de falha de comandos | ≤ 2% | `data/history.json` |
| Tempo de resposta UI cloud (P95) | ≤ 2,5 s | Monitoramento web |
| Incidentes de segurança | 0 | Registro de incidentes |

Métricas devem ser revisadas mensalmente e apresentadas nas reuniões de governança.

[Voltar à qualidade](README-spec.md)
