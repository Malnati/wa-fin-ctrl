<!-- proj/06-governanca-tecnica-e-controle-de-qualidade/revisoes-com-ia-spec.md -->
# Revisões com IA — WA Fin Ctrl

> Base: [./revisoes-com-ia.md](./revisoes-com-ia.md)

## Procedimento
1. Registrar execução da IA (pipeline ou agente).  
2. Revisão humana obrigatória, com marcação "Assistido por IA".  
3. Atualizar relatório de revisão (`docs/reports/ia-review-YYYYMMDD.md`).  
4. Registrar custo e decisão em `CommandHistory` e `docs/reports/`.

## Responsabilidades
- Tech Lead Python garante que prompts e usos estejam conformes.  
- Curadoria valida resultados e comunica ajustes.  
- Governança acompanha métricas e orçamento.

## Auditoria
- Revisões mensais com amostragem mínima de 5% das execuções IA.  
- Relatórios arquivados em `proj/audit-history-spec.md`.  
- Falhas ou desvios geram incidentes.

[Voltar à governança](README-spec.md)
