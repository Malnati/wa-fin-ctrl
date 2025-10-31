<!-- req/06-ux-brand/identidades-visuais.md -->
# Identidades Visuais

> Base: [./identidades-visuais.md](./identidades-visuais.md)
> Plano: [/docs/plans/20251025093000-evolucao-req-spec.md](/docs/plans/20251025093000-evolucao-req-spec.md)
> Changelog: [/CHANGELOG.md#2025-10-25](/CHANGELOG.md#2025-10-25)
> Referências correlatas: [Arquitetura da extensão](/req/01-arquitetura/arquitetura-da-extensao-spec.md) · [Design geral](/req/02-design/design-geral-spec.md) · [Testes end-to-end](/req/04-testes-e-validacao/testes-end-to-end-spec.md)

## Objetivo
Consolidar os elementos visuais aplicáveis ao protótipo e à implementação da extensão, alinhando a identidade Yagnostic com a capacidade white-label prevista em `BrandingHelper.ts`.

## Paleta Cromática Oficial
| Token | Hex | Uso principal | Contraste mínimo |
| --- | --- | --- | --- |
| `color-primary-500` | `#2D0F55` | Botões primários, cabeçalhos, indicadores de IA ativa | ≥ 7.2:1 sobre `#FFFFFF` |
| `color-primary-300` | `#5C2AC3` | Estado hover do botão primário, destaques de insight | ≥ 4.8:1 sobre `#FFFFFF` |
| `color-secondary-500` | `#00B5B8` | Chips, contornos focados, métricas em tempo real | ≥ 4.6:1 sobre `#FFFFFF` |
| `color-accent-200` | `#F4F5FB` | Plano de fundo de cards e módulos | ≥ 4.7:1 com texto `#1C1D22` |
| `neutral-900` | `#1C1D22` | Texto principal | — |
| `neutral-600` | `#51535E` | Texto secundário, legendas | ≥ 4.5:1 sobre `#FFFFFF` |
| `neutral-300` | `#B9BBC6` | Divisores, bordas suaves | — |
| `feedback-success` | `#1DB954` | Estados de sucesso/diagnóstico concluído | ≥ 4.5:1 |
| `feedback-warning` | `#FF9F1C` | Alertas preventivos | ≥ 4.5:1 |
| `feedback-error` | `#E63946` | Erros bloqueantes | ≥ 4.5:1 |
- **Requisitos associados:** REQ-006, REQ-007, REQ-008, REQ-009, REQ-016, REQ-024, REQ-028 e REQ-034.
- **Nota colaborativa:** prever combinações seguras para dashboards médicos (REQ-031–REQ-035) preservando contraste e diferenciação entre decisões IA e humanas.

## Tipografia e Hierarquia

### Regra Tipográfica 4x2 — Hierarquia e Consistência de Texto

#### Escopo
Aplicável a qualquer entrega que contenha texto visível ao usuário: interfaces web, aplicativos, e-mails, relatórios, notificações, mensagens, telas de login, dashboards, formulários, modais, tooltips, PDFs ou qualquer outro artefato de front-end ligado ao ecossistema Yagnostic.

#### Definição da Regra
`4x2` representa o limite máximo de quatro tamanhos tipográficos e dois pesos de fonte em um mesmo sistema visual.

| Função | Tamanho | Peso | Exemplo de uso |
| --- | --- | --- | --- |
| Headline (Título principal) | 32 px (1º maior) | Semibold (Manrope) | Títulos de páginas, seções e cabeçalhos principais (`--text-headline`) |
| Subtitle (Subtítulo) | 24 px (2º maior) | Regular ou Semibold (Manrope) | Subtítulos e blocos informativos secundários (`--text-subtitle`) |
| Body (Corpo de texto) | 16 px (3º maior) | Regular (Inter) | Conteúdo, descrições e textos explicativos (`--text-body`) |
| Caption (Texto auxiliar) | 12 px (4º maior) | Regular (Inter) | Rótulos, tooltips e notas de rodapé (`--text-caption`) |

**Pesos permitidos**

- Regular
- Semibold (ou Bold, conforme a fonte-base)

#### Diretrizes Gerais
1. **Hierarquia clara:** o contraste entre os quatro tamanhos deve ser perceptível, mantendo ritmo visual e legibilidade entre blocos de texto e componentes.
2. **Limite fixo:** nenhum artefato pode conter mais de quatro tamanhos ou dois pesos diferentes.
3. **Escala modular:** utilize progressão lógica (32 → 24 → 16 → 12 px) ou sequências múltiplas de oito para novas variantes responsivas documentadas.
4. **Coerência tipográfica:** aplique Manrope para títulos e Inter para corpos de texto; variações só são permitidas mediante exceção formal registrada.
5. **Acessibilidade:** mantenha contraste mínimo WCAG AA e espaçamento entre linhas `≥ 1.4`, inclusive em estados hover/focus.
6. **Consistência entre telas:** cada tamanho/peso deve ter nome e uso padronizado no design system (`--text-headline`, `--text-subtitle`, `--text-body`, `--text-caption`).

#### Regra de Revisão 2 — Auditoria do 4x2

**Objetivo:** confirmar a conformidade técnica e visual com a regra tipográfica 4x2 em protótipos, implementações e artefatos derivados.

**Checklist (obrigatório)**

- O arquivo utiliza no máximo quatro tamanhos e dois pesos.
- Os tamanhos estão distribuídos hierarquicamente (headline > subtitle > body > caption).
- Nenhum componente isolado possui estilos fora da escala definida.
- A mesma estrutura é mantida em telas, relatórios e mensagens.
- A tipografia comunica corretamente a hierarquia de importância (testar percepção em 3 segundos).

**Resultado**

- “Conforme 4x2”
- “Não conforme 4x2” (incluir observações e recomendações)

#### Observações Finais
- Sempre que atualizar tokens ou componentes visuais, referencie explicitamente esta regra no changelog e nos commits.
- Revisores devem documentar variações aprovadas quando houver exceções justificadas (ex.: relatórios impressos).
- Em sistemas com dark mode, preserva-se tamanhos e pesos; apenas as cores variam conforme a paleta registrada.
- **Requisitos associados:** REQ-016, REQ-024, REQ-028, REQ-029 e REQ-034.
- **Nota colaborativa:** registrar ajustes textuais quando novos perfis de validadores (REQ-031–REQ-033) demandarem diferenciação adicional.

## Componentização Visual
- **Cards Modulares:** raio 12 px, sombra `0 12px 32px -18px rgba(45,15,85,0.35)` em destaque e `0 2px 10px -6px rgba(0,0,0,0.18)` no estado padrão.
- **Botões:** altura 44 px, padding horizontal 16 px, iconografia opcional alinhada à esquerda, estado hover com `color-primary-300` e disabled em `neutral-300` com texto `neutral-600`.
- **Chips de Status:** altura 28 px, cantos 16 px, cores baseadas nos tokens de feedback, versões com ícone para insights de áudio.
- **Barras de Progresso:** largura adaptável, bordas 8 px, gradiente entre `color-primary-500` e `color-secondary-500` com label percentual.
- **Requisitos associados:** REQ-005 a REQ-010, REQ-016, REQ-018, REQ-020, REQ-024, REQ-028 e REQ-030.
- **Nota colaborativa:** reservar variantes de componentes para sinalizar estados de revisão humana (REQ-031–REQ-033) e dashboards clínicos (REQ-034–REQ-035).

## Governança 60-30-10
- **Distribuição cromática:** utilize `color-primary-500` e derivados como base predominante (60%±5%), `color-secondary-500` e variações para suportes e cartões (30%±5%) e `color-primary-300`/tokens complementares como destaque (10%±5%), reservados a CTAs, links prioritários e estados ativos.
- **Auditoria objetiva:** estime a participação das cores por área visível (seções, cartões, barras) e audite pelo menos dez componentes representativos; registre os percentuais no relatório de revisão.
- **Acessibilidade:** valide contraste WCAG AA para texto e ícones sobre cada grupo de cor e documente exemplos (hero, cards, tabelas, formulários, toasts).
- **Exceções controladas:** gráficos e heatmaps podem empregar paletas próprias desde que mantenham a hierarquia global; anote justificativas e mantenha legendas/eixos no esquema 60-30-10.
- **Requisitos associados:** REQ-016, REQ-024, REQ-028, REQ-029 e REQ-034.
- **Nota colaborativa:** auditar variações cromáticas empregadas por diferentes validadores e squads (REQ-031–REQ-035) antes de liberar personalizações.

## Aplicação em Branding Dinâmico
- A configuração padrão Yagnostic funciona como fallback; o protótipo deve ilustrar troca de logotipos, paletas e slogans via modal de personalização.
- O modal de branding precisa apresentar pré-visualização em tempo real, destacando campos `companyName`, `title`, `logo`, `primaryColor`, `secondaryColor` e links sociais.
- Tokens devem ser exportados em JSON para facilitar sincronização com IndexedDB (chaves `color`, `typography`, `spacing`, `shadow`, `radius`).
- **Requisitos associados:** REQ-006, REQ-007, REQ-008, REQ-009, REQ-016, REQ-024, REQ-028, REQ-029 e REQ-034.
- **Nota colaborativa:** documentar limites de personalização permitidos para organizações médicas parceiras (REQ-031–REQ-035) e registrar preferências no `BrandingHelper` com rastreabilidade.

## Rastreamento RUP
- Atende ao requisito `RUP-06-UX-002` (tokens e identidade visual) e sustenta `RUP-02-DES-003` ao fornecer parâmetros responsivos.
- Atualizações obrigatórias devem ser registradas em `req/validation-report.md` e no changelog correspondente.
- **Requisitos associados:** REQ-016, REQ-024, REQ-028, REQ-029, REQ-034 e REQ-035.
- **Nota colaborativa:** sincronizar atualizações com os rituais de governança colaborativa (REQ-031–REQ-035) e anexar evidências nos relatórios citados em `req/06-governanca-tecnica-e-controle-de-qualidade/`.

[Voltar ao índice](README-spec.md)
