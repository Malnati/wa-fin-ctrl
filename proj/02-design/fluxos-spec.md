<!-- proj/02-design/fluxos-spec.md -->
# Fluxos — WA Fin Ctrl

> Base: [./fluxos.md](./fluxos.md)

## Fluxo 1 — Processamento incremental
1. Curador adiciona arquivos (ZIP, PDF, JPG) em `input/` ou `imgs/`.
2. Executa `wa-fin.py processar`.
3. CLI chama `processar_incremental` → identifica novos arquivos → move para diretórios corretos.
4. OCR (Tesseract) extrai texto; IA opcional confirma valores.
5. `mensagens/calculo.csv`, `mensagens/mensagens.csv` e `mensagens/diagnostico.csv` são atualizados.
6. `reporter.py` gera relatórios HTML/CSV; WebSocket emite `reload`.
7. Histórico (`data/history.json`) registra execução (com argumentos, sucesso/falha).

## Fluxo 2 — Correção de entrada
1. Analista identifica divergência no relatório ou UI.
2. Aciona comando `wa-fin.py fix` ou envia POST `/fix` via FastAPI.
3. Serviço atualiza CSVs, recalcula agregados e registra mudança no histórico.
4. WebSocket informa clientes; relatórios locais são regenerados.
5. Comentários sobre correção são anexados ao pacote de auditoria.

## Fluxo 3 — Revisão e aprovação (cloud)
1. Pipeline local exporta pacote (CSV + anexos) para diretório de sincronização.
2. CLI `sync` (futuro) ou UI cloud envia pacote para `/ingestion/packages` (NestJS).
3. API valida hashes, aplica regras de duplicidade e registra rastro de auditoria.
4. Revisores cloud avaliam pendências, aplicam comentários e aprovam.
5. Dados aprovados são publicados em dashboards e disponibilizados para órgãos de controle.

## Fluxo 4 — Auditoria periódica
1. Time de governança executa checklist (`docs/checklists/`) e verifica `data/history.json`.
2. Gera relatório de auditoria (Markdown/HTML) com referência aos comandos executados.
3. Atualiza `proj/audit-history-spec.md` e cria changelog com evidências.
4. Arquiva pacotes assinados em storage seguro; compartilha com MPDFT quando necessário.

## Fluxo 5 — Uso de IA controlada
1. Para comprovantes com texto ilegível, pipeline envia trecho minimizado ao OpenAI.
2. `ia.py` registra prompt, resposta, custo e `run_id` em logs.
3. Resultados são marcados como “Assistido por IA” e aguardam revisão humana.
4. Excedendo orçamento mensal, IA é desativada automaticamente (alerta emitido).

Diagramas complementares podem ser adicionados (Mermaid/PlantUML) conforme necessidade.

[Voltar ao índice da fase](README-spec.md)
