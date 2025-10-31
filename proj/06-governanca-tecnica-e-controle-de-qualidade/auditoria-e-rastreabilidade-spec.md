<!-- proj/06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade-spec.md -->
# Auditoria e Rastreabilidade — WA Fin Ctrl

> Base: [./auditoria-e-rastreabilidade.md](./auditoria-e-rastreabilidade.md)

## Trilhas obrigatórias
- `data/history.json` — registra todas as execuções de comandos (CLI/API).
- `docs/reports/` — guarda evidências de testes, uso de IA e auditorias.
- `CHANGELOG/` — histórico de mudanças com timestamp.
- `proj/audit-history-spec.md` — resumo das auditorias executadas.

## Processo de auditoria
1. Selecionar período e cenário.  
2. Exportar dados (history, relatórios, changelog).  
3. Verificar atendimento a requisitos e checklists.  
4. Registrar conclusões em relatório, anexar evidências.  
5. Atualizar `proj/audit-history-spec.md` e comunicar governança.

## Indicadores
- % de execuções com histórico completo.  
- Nº de não conformidades identificadas.  
- Tempo médio para resolver pendências.

[Voltar à governança](README-spec.md)
