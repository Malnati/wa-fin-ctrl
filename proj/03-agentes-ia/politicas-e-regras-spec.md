<!-- proj/03-agentes-ia/politicas-e-regras-spec.md -->
# Políticas e Regras para IA — WA Fin Ctrl

> Base: [./politicas-e-regras.md](./politicas-e-regras.md)

1. **Consentimento obrigatório:** IA só pode ser utilizada quando o responsável autorizar e o requisito RL-002 estiver atendido.
2. **Minimização de dados:** enviar apenas trechos necessários (ex.: parte do comprovante com o valor). Nunca enviar informações pessoais desnecessárias.
3. **Registro completo:** guardar prompts, respostas, `run_id`, custos e timestamp em `docs/reports/ia-run-YYYYMMDD.json`.
4. **Limites de custo:** orçamento mensal definido pela curadoria; alertar com 80% do consumo (`RNF-003`).
5. **Revisão humana:** resultados assistidos por IA precisam de revisão e aprovação explícita. UI deve destacar que houve intervenção de IA.
6. **Monitoramento:** métricas de acurácia e falhas devem ser avaliadas mensalmente; ajustar prompts conforme necessidade.
7. **Fallback manual:** se IA indisponível, pipeline continua operando; registrar alerta.
8. **Segurança:** chaves armazenadas em `.env` seguro e rotacionadas a cada trimestre. Nunca commitar segredos.
9. **Auditoria:** incluir uso de IA em relatórios de auditoria e changelog.
10. **Conformidade:** seguir orientações de `proj/00-visao/lgpd-spec.md` e `AGENTS.md`.

[Voltar aos agentes](README-spec.md)
