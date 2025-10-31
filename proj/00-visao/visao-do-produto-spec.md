<!-- proj/00-visao/visao-do-produto-spec.md -->
# Visão do Produto — WA Fin Ctrl

> Base: [./visao-do-produto.md](./visao-do-produto.md)

## Contexto

Prestadores de contas e curadores financeiros vinculados ao MPDFT precisam consolidar rapidamente centenas de comprovantes recebidos por canais informais (ex.: WhatsApp) para gerar relatórios auditáveis. O processo manual envolve extração de anexos, conferência de valores, classificação de despesas, geração de planilhas e produção de relatórios mensais exigidos pela Justiça. Erros de digitação, perda de arquivos e falta de rastreabilidade tornam o trabalho lento, caro e inseguro.

O **WA Fin Ctrl** responde a essa dor com um fluxo híbrido:

- **Pipeline local (Python + FastAPI):** trata imagens e PDFs, aplica OCR (Tesseract), aciona LLMs quando necessário para validar valores, unifica mensagens, gera CSVs normalizados e produz relatórios HTML mensais/gerais. Toda execução é registrada para auditoria.
- **Serviços cloud (NestJS + React):** camada colaborativa que centraliza dados recebidos do pipeline local, oferece dashboards web para revisão humana, expõe APIs para integrações com sistemas jurídicos e automatiza notificações de pendência ou inconsistência.
- **Agentes assistidos por IA:** aceleram classificação, sugere correções e apontam divergências, sempre com salvaguardas descritas em `proj/03-agentes-ia/`.

## Proposta de valor

1. **Automação ponta a ponta da prestação de contas** — ingestão, reconhecimento, classificação, consolidação e publicação em minutos, reduzindo trabalhos repetitivos.
2. **Rastreabilidade completa** — histórico de comandos, logs de IA, versões de relatórios e controle de acesso documentados para auditorias internas e externas.
3. **Governança adaptável** — compatibilidade com políticas do MPDFT, LGPD e roteiros de auditoria da curadoria; permite operar totalmente offline quando necessário.
4. **Experiência unificada** — relatórios HTML responsivos, planilhas compatíveis com modelos do Judiciário e painéis web com filtros avançados.

## Objetivos estratégicos

- Padronizar a prestação de contas mensal/anual, reduzindo o tempo de conferência manual em pelo menos 60%.
- Tornar o pipeline repetível e auditável, com registros imutáveis (`history.json`, changelog, trilha de IA) e suporte a múltiplos curadores.
- Disponibilizar APIs REST/WebSocket para integração com sistemas de acompanhamento processual e dashboards de transparência.
- Garantir aderência contínua à LGPD, provendo rastros de consentimento, controles de acesso e retenção segura dos dados.

## Métricas de sucesso

- **Tempo médio de processamento** de um lote de 100 comprovantes < 8 min em hardware padrão (8 GB RAM, 4 cores).
- **Precisão de classificação** ≥ 95% após revisão assistida (média mensal).
- **Cobertura de auditoria**: 100% das execuções registradas em `data/history.json` com resultado e argumentos.
- **Tempo de onboarding** de novo curador < 2h seguindo os guias em `proj/07-contribuicao/`.

## Premissas

- A extração inicial dos dados ocorre via exportação de conversas e anexos do WhatsApp, obedecendo os roteiros de coleta do MPDFT.
- Todas as dependências locais (Tesseract, Poppler, OpenAI opcional) são disponibilizadas via Docker/Poetry conforme especificado em `proj/03-implementacao/`.
- A sincronização com o ambiente cloud só ocorre após revisão local e consentimento explícito do responsável.
- As chaves de APIs externas (OpenAI, provedores de e-mail/notificação) permanecem sob custódia do time de curadoria, com rotação trimestral.

## Limitações atuais

- O conector cloud ainda utiliza estruturas herdadas do projeto Yagnostic; a reimplementação para domínio financeiro está em andamento (ver roadmap em `proj/02-planejamento/roadmap-spec.md`).
- O pipeline opera prioritariamente com comprovantes PDF/JPG; outros formatos exigem análise e extensões específicas.
- A dependência de OCR pode ser afetada por baixa qualidade das imagens; políticas de melhoria estão descritas em `proj/04-testes-e-validacao/validacao-de-marcos-spec.md`.
- Integrações com órgãos externos (ex.: envio automático ao MPDFT) dependem de acordos institucionais e homologação.

[Voltar ao resumo da fase](README-spec.md)
