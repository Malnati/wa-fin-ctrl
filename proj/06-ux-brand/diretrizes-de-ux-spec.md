<!-- req/06-ux-brand/diretrizes-de-ux.md -->
# Diretrizes de UX

> Base: [./diretrizes-de-ux.md](./diretrizes-de-ux.md)
> Plano: [/docs/plans/20251025093000-evolucao-req-spec.md](/docs/plans/20251025093000-evolucao-req-spec.md)
> Changelog: [/CHANGELOG.md#2025-10-25](/CHANGELOG.md#2025-10-25)
> Referências correlatas: [Arquitetura da extensão](/req/01-arquitetura/arquitetura-da-extensao-spec.md) · [Design geral](/req/02-design/design-geral-spec.md) · [Testes end-to-end](/req/04-testes-e-validacao/testes-end-to-end-spec.md)

## Contexto de Uso
A solução utiliza um painel lateral em navegadores Chromium para apoiar equipes que processam documentos, acompanham diagnósticos assistidos por IA e distribuem notificações. O fluxo exige clareza operacional, confiança nas respostas automatizadas e rastreabilidade ponta a ponta. Este artefato documenta as regras obrigatórias para qualquer subprojeto de experiência que opere nesse contexto.

### Personas Prioritárias
- **Operador Especialista (primária):** processa arquivos diariamente, aciona análises assistidas por IA, ajusta recomendações e aprova entregas.
- **Gestor Operacional (secundária):** monitora métricas, audita diagnósticos gerados e controla políticas de personalização de IA/branding.

## Padrões de Interação Essenciais
- Fluxos lineares com no máximo três passos simultâneos por ação principal.
- Breadcrumbs sintéticos ou rótulos de seção para indicar contexto atual (Upload, Diagnóstico, Insights, Histórico).
- Microinterações suaves (até 200 ms) para comunicar mudanças de estado sem distrações.
- Feedback textual explícito para ações que envolvam APIs (`/auth`, `/upload`, `/notify/*`, `/ai/*`).
- **Requisitos associados:** REQ-005 a REQ-010, REQ-016, REQ-018, REQ-024, REQ-028 e REQ-030.
- **Nota colaborativa:** manter espaço para indicadores de revisão humana exigidos pelos REQ-031–REQ-035 sem comprometer a clareza dos fluxos principais.

## RUP-06-UX-001 — Diretrizes de layout e interações do side panel
**Descrição**
Definir a organização das zonas do painel lateral (cabeçalho, corpo modular e rodapé), padrões de navegação, microinterações e estados de feedback. As implementações devem manter paridade com o protótipo aprovado e com os componentes React documentados em `req/02-design/`.

**Justificativa**
Garantir consistência entre design, desenvolvimento (`ui/src/App.tsx`, componentes de fluxo) e automações descritas nas fases RUP, reduzindo retrabalho em ciclos de validação.

**Impactos**
- Protótipo navegável (ex.: Google Stitch) e documentação de design (`req/02-design/design-geral.md`).
- Componentes React responsáveis pelos fluxos de autenticação, upload, insights multimodais e notificações.
- Estratégias de onboarding descritas nos artefatos de planejamento (`req/02-planejamento/`).

**Critérios de Aceitação**
- Cabeçalho com logo dinâmico, identificação do tenant, status de autenticação e menu contextual (até três ações).
- Corpo modular com blocos reordenáveis: Upload inteligente, Fila de processamento, Insights multimodais e Alertas/Ações pendentes.
- Rodapé persistente com texto legal, timestamp da última sincronização e links de suporte.
- Microinterações documentadas (tipo, duração, easing) replicáveis no bundle React.

**Relacionamentos**
- `RUP-02-DES-001` — Blueprint funcional do painel lateral.
- `RUP-02-DES-002` — Estados operacionais do protótipo.
- `RUP-06-UX-002` — Tokens e identidade visual.
- **Requisitos associados:** REQ-005 a REQ-010, REQ-016, REQ-018, REQ-020 e REQ-030.
- **Nota colaborativa:** garantir que os módulos previstos nos REQ-031–REQ-033 tenham slots dedicados no layout sem quebrar a hierarquia estabelecida.

**Status**: planejado
**Última atualização**: 2025-02-14 00:00 UTC

## RUP-06-UX-002 — Sistema de identidade visual e tokens de marca
**Descrição**
Estabelecer paleta cromática, tipografia, espaçamentos, elevações e iconografia padrão do produto, garantindo adaptabilidade white-label sem perder coerência visual.

**Justificativa**
Facilitar personalização controlada e manter consistência entre protótipo, bundle React e políticas de branding descritas na implementação.

**Impactos**
- Biblioteca de design tokens (protótipo e implementação CSS).
- Configuração de branding armazenada em IndexedDB (`BrandingHelper.ts`).
- Documentação de identidade visual e acessibilidade.

**Critérios de Aceitação**
- Paleta primária, secundária e de destaque documentadas com proporções 60-30-10 e contraste mínimo WCAG AA.
- Tipografia estruturada pela regra 4x2 (quatro tamanhos, dois pesos) utilizando fontes aprovadas no projeto.
- Tokens de espaçamento baseados em múltiplos de 8 px e raio de borda padronizado (por exemplo, 12 px para cards e modais).
- Iconografia unificada (Material Symbols ou biblioteca equivalente) com tamanhos mínimos definidos.
- Integração do `BrandingHelper` com IndexedDB registrando logo, nome do tenant e customizações aprovadas.
- Fallback para tokens padrão quando personalizações falharem, com logs auditáveis.

**Relacionamentos**
- `RUP-06-UX-001` — Regras do painel lateral.
- `RUP-06-UX-003` — Acessibilidade e feedback inclusivo.
- `req/06-ux-brand/identidades-visuais.md` — Registro da paleta e exemplos.
- **Requisitos associados:** REQ-006, REQ-007, REQ-008, REQ-009, REQ-016, REQ-024, REQ-028 e REQ-034.
- **Nota colaborativa:** prever variações aprovadas para validadores humanos (REQ-031–REQ-035) sem romper com os tokens padrão e com a rastreabilidade cromática.

**Status**: planejado
**Última atualização**: 2025-02-14 00:00 UTC

## RUP-06-UX-003 — Acessibilidade e feedback inclusivo no protótipo
**Descrição**
Definir padrões de contraste, foco, navegação por teclado e mensagens descritivas para garantir conformidade com WCAG 2.1 AA em protótipos e implementações.

**Justificativa**
Atender às políticas legais registradas na fase de Visão e aos compromissos de governança técnica descritos em `req/06-governanca-tecnica-e-controle-de-qualidade/`.

**Impactos**
- Protótipo e componentes React (login, upload, menus, players, modais etc.).
- Estratégia de testes automatizados de acessibilidade.
- Documentação de acessibilidade (`req/06-ux-brand/acessibilidade.md`).

**Critérios de Aceitação**
- Contraste mínimo 4.5:1 para texto normal e 3:1 para títulos.
- Navegação completa por teclado sem armadilhas de foco e com indicadores visuais de 2 px.
- Mensagens de erro/sucesso/alerta com ícones + texto + orientação acionável.
- Compatibilidade com leitores de tela (atributos ARIA em formulários, botões, player de áudio e modais).

**Relacionamentos**
- `RUP-02-DES-002` — Estados operacionais.
- `RUP-02-DES-003` — Responsividade e legibilidade.
- `RUP-06-UX-002` — Tokens e identidade visual.
- **Requisitos associados:** REQ-006, REQ-007, REQ-008, REQ-009, REQ-016, REQ-017, REQ-024, REQ-028 e REQ-029.
- **Nota colaborativa:** documentar mensagens específicas para ações de validação compartilhada (REQ-031–REQ-035), garantindo descrição acessível das decisões humanas.

**Status**: planejado
**Última atualização**: 2025-02-14 00:00 UTC

## RUP-06-UX-004 — Regra cromática 60-30-10
**Descrição**
Aplicar e auditar a regra cromática 60-30-10 em protótipos, componentes e entregas finais, definindo percentuais de uso para cores primária, secundária e de destaque, bem como diretrizes de acessibilidade e documentação de exceções.

**Critérios de Aceitação**
- Escopo abrange qualquer entrega de front-end (telas, componentes, relatórios, mensagens) com paleta mínima (primária, secundária e destaque).
- Percentuais mantidos dentro da tolerância de ±5% e cor de destaque limitada a elementos de chamada (≤15%).
- CTAs e estados críticos utilizam exclusivamente a cor de destaque com variações controladas para hover/foco/ativo.
- Textos e ícones sobre superfícies coloridas respeitam contraste mínimo WCAG AA.
- Exceções (gráficos, heatmaps) documentadas com justificativa e preservação da hierarquia global.
- Resultado das revisões registrado como “Conforme 603010” ou “Não conforme 603010”.

**Relacionamentos**
- `RUP-02-DES-004` — Governança cromática.
- `req/06-ux-brand/identidades-visuais.md` — Registro de paleta e exemplos.
- **Requisitos associados:** REQ-016, REQ-024, REQ-028, REQ-029 e REQ-034.
- **Nota colaborativa:** aplicar a regra também nos dashboards colaborativos (REQ-031–REQ-035), mantendo contraste adequado para destacar decisões humanas.

## RUP-06-UX-007 — Regra de Simplicidade Visual (“Simplicity Over Flashiness”)
**Descrição**
Estabelecer a regra de simplicidade visual para todas as interfaces produzidas, garantindo que cada elemento gráfico cumpra papel funcional claro e favoreça legibilidade, hierarquia e foco operacional.

**Diretrizes Gerais**
- Prefira contraste, espaçamento e tipografia equilibrada em vez de efeitos chamativos.
- Aceite apenas efeitos com função clara (ex.: indicar interação, foco ou estado).
- Reduza ruído visual, mantendo apenas elementos essenciais.
- Garanta um estilo visual consistente (Flat, Material etc.) por sistema.
- Permita leitura imediata (<3 s) e um único ponto principal de atenção por tela.

**Observações finais**
- Documente o propósito funcional de cada elemento visual introduzido.
- Compare versões antes/depois durante revisões para garantir evolução rumo à simplicidade.
- Aplique esta regra em conjunto com as normas de cor (60-30-10), tipografia (4x2), espaçamento (8pt Grid) e UX Writing.
- **Requisitos associados:** REQ-016, REQ-024, REQ-028, REQ-029, REQ-034 e REQ-035.
- **Nota colaborativa:** preservar foco único por tela mesmo quando indicadores adicionais de revisão médica (REQ-031–REQ-033) estiverem ativos.

## RUP-06-UX-006 — Regra de UX Writing e Simplificação de Texto
**Descrição**
Estabelecer princípios de escrita funcional para todas as interfaces textuais, garantindo mensagens claras, acionáveis e consistentes em todo o ecossistema Yagnostic.

**Escopo**
- Interfaces textuais de qualquer natureza (páginas web, aplicativos, dashboards, e-mails, modais, formulários, mensagens de erro, tooltips e relatórios).
- Todos os textos criados ou revisados por agentes humanos ou automatizados.

**Definição da Regra**
A escrita em interfaces deve seguir UX Writing e Content Design, priorizando clareza, concisão e contexto. Cada texto precisa orientar a próxima ação do usuário e não apenas descrever a interface.

### Princípios fundamentais
1. **Clareza:** o texto deve ser compreendido imediatamente, sem explicações adicionais.
2. **Concisão:** use o mínimo de palavras para expressar o máximo de sentido.
3. **Consistência:** mantenha o mesmo estilo e tom em todas as telas.
4. **Contexto:** o texto responde “o que o usuário precisa fazer agora?”.
5. **Ação:** priorize frases orientadas a verbo — foco em conduzir a ação.

### Diretrizes gerais

| Tipo | Recomendação | Exemplo |
| --- | --- | --- |
| Evitar redundâncias | Não use “page”, “screen”, “form”, “section” etc. | Voting page → Voting |
| Ações curtas e diretas | Sempre começar com o verbo principal. | Earn my tokens → Claim UMA |
| Evitar pronomes desnecessários | “My” e “Your” apenas quando o contexto exigir personalização. | My total tokens → Total tokens |
| Remover explicações autoevidentes | Se o contexto é claro, reduza a frase. | Please commit this vote now → Commit vote |
| Usar termos consistentes | O mesmo termo mantém o mesmo significado em toda a interface. | Commit, Claim, Vote — não variar |
| Foco visual e semântico | O texto guia o olhar, não compete com o conteúdo. | Headlines curtas e CTAs de alto contraste |

### Regra de Revisão 2 — Auditoria de Conformidade UX Writing
**Objetivo:** confirmar que os textos aplicados cumprem integralmente as diretrizes de UX Writing e simplificação.

**Checklist obrigatório:**
- Nenhum rótulo, título ou botão contém palavras redundantes.
- Todos os textos são curtos, claros e acionáveis.
- A hierarquia textual está evidente (headline → ação → feedback).
- Os textos se encaixam visualmente no layout (sem quebra de ritmo).
- Os verbos usados expressam ação direta e única.
- Nenhuma sentença ultrapassa 12 palavras sem necessidade contextual.

**Resultado esperado:**
- “Conforme UX Writing”.
- “Não conforme UX Writing” (incluir correções sugeridas).

### Observações finais
- Documente todas as alterações textuais justificando escolhas (clareza, redundância, foco de ação).
- Revisores comparam versões antes/depois garantindo redução de complexidade sem perda de sentido.
- Aplique esta regra em conjunto com a Regra 603010 (Cores), Regra 4x2 (Tipografia) e Regra 8pt Grid (Espaçamento) para preservar coerência entre linguagem, ritmo e forma.
- **Requisitos associados:** REQ-016, REQ-024, REQ-028, REQ-029 e REQ-034.
- **Nota colaborativa:** separar claramente mensagens automáticas e orientações dos validadores humanos descritas em REQ-031–REQ-033.

**Status**: vigente

**Última atualização**: 2025-03-31 00:00 UTC

## RUP-06-UX-006 — Regra de espaçamento 8pt Grid System
**Descrição**
Padronizar todos os espaçamentos, proporções e dimensões da interface segundo a escala modular baseada em 8 px, permitindo derivações apenas divisíveis por 4 px para manter ritmo visual, escalabilidade e harmonia entre componentes.

**Justificativa**
Evitar divergências entre protótipos, implementação front-end e entregas documentais, sustentando consistência espacial ao lado das regras cromática 603010 e tipográfica 4x2 já adotadas pela equipe.

**Escopo**
Aplica-se a todas as interfaces digitais do SACIR (páginas web, aplicações mobile, dashboards, e-mails, relatórios, micro-frontends, componentes reutilizáveis e templates), devendo ser seguido por qualquer agente que crie, edite ou ajuste layout, espaçamentos, paddings, margens, grids ou alinhamentos.

**Estrutura base de espaçamentos**

| Tipo de espaço | Valores válidos (px) | Exemplos de uso |
| --- | --- | --- |
| Mínimo | 4 | Separação entre ícones, labels pequenos |
| Pequeno | 8 | Paddings internos, gap entre botões |
| Médio | 16 | Espaçamento entre seções pequenas |
| Grande | 24 | Separação entre blocos ou cards |
| Extra | 32+ | Áreas principais, seções, containers |

**Diretrizes gerais**
1. **Base modular:** grid, containers e componentes devem alinhar-se à grade de 8 px.
2. **Unidade consistente:** px serve como referência base; ao escalar com `rem`/`em`, preserve equivalência (ex.: `1rem = 8px`).
3. **Ritmo vertical:** mantenha espaçamento uniforme entre títulos, textos e elementos interativos.
4. **Ritmo horizontal:** paddings laterais e margens obedecem à escala em múltiplos de 8.
5. **Componentização:** tokens, variáveis e classes de layout usam nomenclaturas alinhadas à escala (`--space-4`, `--space-8`, `--space-16`, ...).
6. **Exceções controladas:** apenas casos documentados (como grids de gráficos) podem sair da escala, com justificativa explícita no artefato de revisão.

**Fórmula geral**
Utilize apenas valores divisíveis por 8 ou 4. Se o valor não for divisível por 8 ou 4, não use.

**Regra de Revisão 2 — Auditoria do 8pt Grid System**
- Checklist obrigatório: verificar múltiplos de 8/4 em espaçamentos e dimensões, alinhamentos horizontais/verticais, tokens documentados, manutenção do ritmo modular e escala perceptiva coerente (micro, pequeno, médio, grande, extra).
- Resultado esperado: registrar “Conforme 8pt Grid” ou “Não conforme 8pt Grid” com lista de desvios e recomendações.

**Observações finais**
- Commits que ajustarem espaçamentos ou grids devem mencionar explicitamente esta regra.
- Revisores comparam implementações aos layouts de referência e documentam desvios aceitáveis.
- Variantes temáticas (ex.: dark mode) não alteram o grid-base.
- Esta diretriz complementa as regras 603010 (cores) e 4x2 (tipografia), assegurando consistência visual e modularidade completa no design.
- **Requisitos associados:** REQ-016, REQ-024, REQ-028, REQ-029 e REQ-034.
- **Nota colaborativa:** reservar espaçamento suficiente para widgets de validação humana (REQ-031–REQ-035) sem quebrar a cadência do layout.

**Status**: ativo

**Última atualização**: 2025-03-14 00:00 UTC

## Diretrizes Complementares
- Aplicar linguagem clara e objetiva, utilizando verbos no imperativo positivo ("Gerar diagnóstico", "Ouvir áudio", "Reprocessar laudo").
- Integrar checklist de onboarding com até quatro passos: Boas-vindas, Consentimento LGPD, Preferências de laudo e Tutorial rápido.
- Documentar no protótipo variantes de cards para os estados "Nenhum exame analisado" e "Todos os diagnósticos concluídos".
- Incluir painel compacto para métricas-chave (tempo médio de diagnóstico, número de PDFs processados, áudios gerados) com possibilidade de expansão.
- **Requisitos associados:** REQ-005 a REQ-010, REQ-016, REQ-024, REQ-028, REQ-034 e REQ-035.
- **Nota colaborativa:** evidenciar estados e métricas específicas para filas compartilhadas de validação (REQ-031–REQ-035) sem gerar ruído visual.

[Voltar ao índice](README-spec.md)
