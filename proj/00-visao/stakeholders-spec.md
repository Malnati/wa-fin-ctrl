<!-- proj/00-visao/stakeholders-spec.md -->
# Stakeholders — WA Fin Ctrl

> Base: [./stakeholders.md](./stakeholders.md)

## Visão geral
O WA Fin Ctrl envolve diferentes públicos para garantir conformidade legal, qualidade dos relatórios e viabilidade operacional. A tabela a seguir detalha objetivos, responsabilidades e indicadores de sucesso para cada grupo.

| Parte interessada | Papel no projeto | Responsabilidades chave | Indicadores de sucesso |
| --- | --- | --- | --- |
| **Curadoria financeira (time WA)** | Product owner / operação diária | Definir prioridades de processamento, validar classificações, aprovar sincronização cloud | Tempo de processamento por lote < 8 min · % de relatórios aprovados sem retrabalho |
| **Curadores MPDFT** | Fiscalização e compliance | Homologar relatórios entregues, garantir aderência aos roteiros oficiais, emitir recomendações | # de pendências abertas vs. resolvidas · SLA de resposta às análises |
| **Time técnico local (Python)** | Engenharia de dados & automação | Manter pipeline `wa_fin_ctrl`, evoluir CLI/API, garantir reprodutibilidade e logs completos | Taxa de falhas por execução · Cobertura de testes · Atualização da documentação técnica |
| **Time técnico cloud (TypeScript)** | Serviços e UI colaborativa | Evoluir APIs/React para revisão remota, publicar builds e monitorar uso | Disponibilidade > 99% · Latência média < 200 ms · Feedback dos usuários |
| **Analistas financeiros** | Usuários finais dos relatórios | Utilizar relatórios para prestação de contas, solicitar correções, apontar inconsistências | Satisfação (> 4/5) · Nº de erros identificados manualmente |
| **Parceiros de IA (OpenAI/LLMs)** | Fornecedores auxiliares | Disponibilizar APIs com SLA estável e permitir rastreabilidade de prompts/respostas | Tempo de resposta < 3 s · Custo por token dentro do orçamento |

## Interações críticas
- **Ritos semanais** entre curadoria financeira e time técnico para analisar pendências de processamento, revisar backlog de requisitos (ver `proj/02-planejamento/roadmap-spec.md`) e priorizar correções.
- **Checkpoints mensais** com curadores do MPDFT para emitir parecer sobre relatórios enviados, revisar indicadores de conformidade e validar melhorias.<br>
- **Operação assistida por IA** registrada em `docs/reports/` e `proj/03-agentes-ia/`, garantindo transparência sobre prompts, custos e decisões tomadas.

## Responsabilidades compartilhadas
- **Segurança e privacidade:** garantir que chaves/API e dados pessoais respeitem `proj/00-visao/lgpd-spec.md` e que nenhum dado saia da infraestrutura autorizada.
- **Documentação:** manter artefatos `proj/` atualizados; um requisito só é considerado concluído quando rastreado do catálogo até os testes.
- **Auditoria:** registrar cada execução relevante em `data/history.json`, atualizar `proj/audit-history-spec.md` e gerar changelog (`CHANGELOG/`).

[Voltar ao resumo da fase](README-spec.md)
