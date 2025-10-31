<!-- proj/00-visao/escopo-spec.md -->
# Escopo — WA Fin Ctrl

> Base: [./escopo.md](./escopo.md)

## Objetivo do produto
Garantir que curadores e times de prestação de contas consigam transformar comprovantes recebidos via aplicativos de mensagem em relatórios auditáveis, com mínimo esforço manual, rastreabilidade completa e aderência às regras do MPDFT.

## Entregáveis principais
- Pipeline local automatizado para ingestão, tratamento, classificação e consolidação de comprovantes (CLI + FastAPI + relatórios HTML/CSV).
- Estrutura cloud para sincronização segura, revisão colaborativa, alertas e publicação de relatórios (NestJS + React, evoluindo do legado Yagnostic).
- Modelos de dados, templates e planilhas compatíveis com roteiros oficiais de prestação de contas.
- Pacote de governança: trilha de auditoria (`data/history.json`), changelog, políticas LGPD, checklists obrigatórios e scripts de verificação.

## Escopo funcional (fase atual)
1. **Ingestão e preparação**
   - Importar arquivos ZIP, PDFs e imagens provenientes do WhatsApp.
   - Normalizar nomes de arquivos, extrair metadados de data/hora, separar anexos em diretórios dedicados.
2. **Reconhecimento e classificação**
   - Aplicar OCR local (Tesseract) e, quando necessário, recorrer a LLM (OpenAI) para confirmar valores.
   - Classificar entradas por categorias (alimentação, transporte, saúde, etc.) com sugestões de IA e revisão humana.
   - Detectar duplicidades, valores ausentes e inconsistências de forma automática.
3. **Consolidação e publicação**
   - Gerar planilhas (`mensagens/*.csv`), relatórios HTML gerais e mensais (`docs/report-YYYY-MM-Nome.html`) e versão editável.
   - Disponibilizar API REST/WebSocket para acompanhar progresso, solicitar correções (`/fix`) e listar relatórios.
   - Manter histórico de execuções com argumentos e status (sucesso/falha).
4. **Governança e compliance**
   - Registrar consentimentos, hipóteses legais e políticas de retenção em `proj/00-visao/lgpd-spec.md`.
   - Exigir revisão final e assinatura digital antes de sincronizar com ambientes cloud (quando habilitado).

## Fora de escopo imediato
- Publicação automática para órgãos externos sem revisão humana.
- Conectores nativos com ERPs ou bancos; integrações acontecem via exportação/importação padronizada.
- Reconhecimento de anexos manuscritos ou ilegíveis sem intervenção; tais casos permanecem em fluxo manual assistido.
- Manutenção de infraestrutura on-premise fora do stack documentado (Poetry/Docker/NestJS/Vite).

## Critérios de sucesso
- Processamento incremental funcionando 24x7, com capacidade de reprocessar arquivos específicos e registrar tentativas.
- Relatórios entregues com consistência numérica validada (`wa_fin_ctrl.check` + testes e2e).
- Cobertura mínima de 95% dos comprovantes processados automaticamente, com fila explícita para exceções.
- Nenhum dado sensível enviado a serviços externos sem registro e consentimento.

[Voltar ao resumo da fase](README-spec.md)
