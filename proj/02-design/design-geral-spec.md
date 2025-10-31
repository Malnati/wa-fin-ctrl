<!-- proj/02-design/design-geral-spec.md -->
# Design Geral — WA Fin Ctrl

> Base: [./design-geral.md](./design-geral.md)

## Objetivo
Detalhar como os componentes do WA Fin Ctrl (CLI, serviços Python, FastAPI, UI React) colaboram para entregar a experiência de prestação de contas. O documento orienta decisões de layout, interações e organização dos módulos para garantir consistência entre pipeline local e plataforma cloud.

## Princípios
1. **Transparência operacional** — cada etapa do processamento deve expor estado, logs e ações corretivas.
2. **Foco em revisão rápida** — interfaces destacam entradas pendentes, discrepâncias de valores e sugestões da IA.
3. **Separação clara de responsabilidades** — comandos CLI para automação, API para integrações e UI para revisão colaborativa.
4. **Design escalável** — layouts responsivos, componentes reutilizáveis, possibilidade de white-label quando a plataforma cloud estiver ativa.
5. **Aderência regulatória** — textos, fluxos e templates seguem vocabulário jurídico-financeiro, mantendo trilha de consentimento e auditoria.

## Estrutura de apresentação
- **Shell e navegação (cloud UI)**: cabeçalho com identificação de curador, indicador de ambiente, menu de auditoria e botão de upload manual (futuro).
- **Painéis principais**:
  - _Resumo geral_: totais aprovados, pendentes, descartados; status do último processamento.
  - _Fila de pendências_: lista priorizada de comprovantes aguardando revisão, com filtros por mês, classificação e criticidade.
  - _Histórico de execuções_: tabela com origem (CLI/API), duração, responsável e resultado.
  - _Alertas de compliance_: cartões para consentimentos expirados, quotas de IA, incidentes abertos.
- **Relatórios HTML locais**: utilizam componentes similares (cards, badges) para manter linguagem visual alinhada à UI cloud.

## Camadas de aplicação
| Camada | Responsabilidade | Artefatos |
| --- | --- | --- |
| **Interface humana** | Relatórios HTML, UI React (cloud), CLI descritiva | `docs/report*.html`, `cloud/ui/src`, `wa-fin.py` |
| **Serviços de aplicação** | FastAPI (correções, status, WebSocket), NestJS (sync, revisão) | `local/src/wa_fin_ctrl/api.py`, `cloud/api/src` |
| **Processamento de dados** | OCR, IA, classificação, geração de CSV/HTML | `local/src/wa_fin_ctrl/app.py`, `ocr.py`, `reporter.py` |
| **Persistência** | Arquivos CSV, XML (OCR), HTML, histórico JSON, storage cloud | `mensagens/`, `ocr/`, `docs/`, `data/history.json` |

## Diretrizes de layout e UX
- **Tabela de pendências** deve destacar:
  - Data/hora, descrição, valor identificado, sugestão da IA, status de validação, botões de ação (`Corrigir`, `Descartar`, `Enviar ao cloud`).
  - Badges de criticidade (alto quando valor > R$ 1.000 ou divergência > 10%).
- **Modal de correção** inclui campos pré-preenchidos com valores atuais, preview do OCR e botões para aplicar/descartar alterações.
- **Timeline de processamento** apresenta eventos (importado, processado, corrigido, sincronizado) com carimbos de data/hora e responsável.
- **Modo offline** (local) evidencia quando IA externa está desabilitada e sugere ações manuais.

## Interações prioritárias
1. **Processar lote** (`wa-fin.py processar`) → exibir resumo no terminal e atualizar dashboards/relatórios automaticamente.
2. **Revisar discrepâncias** → abrir relatório HTML mensal -> acionar botão "Corrigir" -> enviar comando `/fix` -> recarregar dados via WebSocket.
3. **Preparar entrega oficial** → revisar checklist (consentimentos ok, quotas IA,<80%, sem pendências) -> gerar pacote -> sincronizar com cloud.
4. **Auditar execução** → acessar histórico (`data/history.json` ou tela cloud) -> exportar dados para anexar ao relatório de auditoria.

## Artefatos de suporte
- Templates Jinja2 (`templates/*.j2`) definem componentes reutilizáveis (cards, tabelas, agrupadores por classificação).
- Componentes React planejam reutilizar a mesma taxonomia (`components/dashboard`, `components/review`, `components/history`).
- Checklists de UX e acessibilidade estão em `proj/06-ux-brand/`.

## Roadmap de design
- **Fase A (local)**: consolidar experiência CLI + HTML, garantir responsividade dos relatórios e mensagens claras.
- **Fase B (cloud)**: adaptar componentes React herdados para finanças, implementar interface de revisão colaborativa, integrar com FastAPI.
- **Fase C (colaboração externa)**: expor dashboards públicos anonimizados e portal para órgãos de controle.

Atualizações neste documento devem citar requisitos relacionados e registrar impactos nos fluxos/componentes.

[Voltar ao índice da fase](README-spec.md)
