<!-- proj/04-testes-e-validacao/criterios-de-aceitacao-spec.md -->
# Critérios de Aceitação — WA Fin Ctrl

> Base: [./criterios-de-aceitacao.md](./criterios-de-aceitacao.md)

| Requisito | Critérios de aceitação |
| --- | --- |
| RF-001/002 | Ao executar `wa-fin.py processar`, novos comprovantes são reconhecidos e marcados como processados; logs registram operação; relatórios atualizados. |
| RF-004 | Para comprovantes com valor ilegível, IA retorna valor normalizado; quando não identifica, retorna "NENHUM" e marca como pendente. |
| RF-006/007 | Relatórios HTML exibem totais corretos, diferenciam despesas por classificação e apresentam link para comprovantes. |
| RF-008/009 | Endpoint `/api/status` responde `200` com timestamp atualizado; WebSocket envia `reload` após processamento. |
| RF-010 | Comando `wa-fin.py fix` atualiza CSVs, reflete em relatórios e registra evento no histórico. |
| RF-013 | API `/api/reports` retorna lista ordenada de relatórios com URLs válidos (planejado). |
| RNF-001 | Execução de teste de performance com lote de 100 comprovantes conclui em ≤ 8 min. |
| RNF-004 | Auditoria de acessibilidade confirma contraste e navegação por teclado. |
| RL-002 | Ao habilitar IA, usuário deve fornecer consentimento explícito; logs registram data/hora/responsável. |

Todos os critérios devem ter testes automatizados ou scripts reprodutíveis descritos em `proj/04-qualidade-testes/testplan-spec.md`.

[Voltar aos testes](README-spec.md)
