<!-- proj/04-testes-e-validacao/testes-end-to-end-spec.md -->
# Testes End-to-End — WA Fin Ctrl

> Base: [./testes-end-to-end.md](./testes-end-to-end.md)

## Cenário E2E 1 — Processamento completo
1. Preparar massa `massa/04*.zip` no diretório `input/`.
2. Executar `wa-fin.py processar`.
3. Verificar geração de `mensagens/*.csv` e `docs/report.html`.
4. Abrir `http://localhost:8000/` e confirmar listagem dos relatórios.
5. Validar registro em `data/history.json`.

## Cenário E2E 2 — Correção via API
1. Processar lote com valor incorreto proposital.  
2. Enviar POST `/fix` com nova informação.  
3. Confirmar atualização nos CSVs e evento WebSocket.  
4. Garantir que relatório HTML reflita alteração.

## Cenário E2E 3 — Revisão colaborativa (planejado)
1. Exportar pacote do pipeline local.  
2. Upload para API cloud `/ingestion/packages`.  
3. Revisar pendências via UI React, adicionar comentário e aprovar.  
4. Validar sincronização de status e auditoria combinada.

## Cenário E2E 4 — Falha controlada de IA
1. Desabilitar IA (remover chave).  
2. Processar comprovante que requer IA.  
3. Confirmar que pipeline marca como pendente e registra alerta.  
4. Reabilitar IA, reprocessar e verificar conclusão.

Relatórios de execução E2E devem ser armazenados em `docs/reports/e2e-YYYYMMDD.json` e citados no changelog.

[Voltar aos testes](README-spec.md)
