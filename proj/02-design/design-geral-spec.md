<!-- req/02-design/design-geral.md -->
# Design Geral

> Base: [./design-geral.md](./design-geral.md)
> Plano: [/docs/plans/20251025093000-evolucao-req-spec.md](/docs/plans/20251025093000-evolucao-req-spec.md)
> Changelog: [/CHANGELOG.md#2025-10-25](/CHANGELOG.md#2025-10-25)
> Referências correlatas: [Arquitetura da extensão](/req/01-arquitetura/arquitetura-da-extensao-spec.md) · [Design geral](/req/02-design/design-geral-spec.md) · [Testes end-to-end](/req/04-testes-e-validacao/testes-end-to-end-spec.md)

## Objetivo
Descrever a arquitetura de design da plataforma clínica Yagnostic, garantindo alinhamento entre protótipos navegáveis, componentes React e critérios de auditoria definidos para a versão 5. O foco é suportar fluxos médicos de aprovação, consentimento LGPD, upload e análise assistida por IA, mantendo consistência visual e textual com o design system MBRA. 【F:prototype/dashboard-visao-geral.html†L1-L220】【F:ui/src/components/dashboard/DashboardOverview.tsx†L1-L222】

## Escopo
- Páginas e componentes React responsáveis pelo login, bloqueios administrativos, onboarding LGPD, upload de exames e dashboards clínicos. 【F:ui/src/App.tsx†L1-L79】【F:ui/src/components/approval/ApprovalStatus.tsx†L1-L173】
- Protótipo navegável em `prototype/` como referência 1:1 para layout, microcopy e tokens cromáticos (regra 60-30-10). 【F:prototype/aguardando-aprovacao.html†L1-L80】
- Conteúdos transacionais (e-mails, notificações) que espelham estados da fila clínica e informam pacientes e administradores. 【F:prototype/email-aprovacao-conta.html†L1-L120】
- **Requisitos associados:** [REQ-001](../02-planejamento/requisitos-spec.md#req-001), [REQ-004](../02-planejamento/requisitos-spec.md#req-004), [REQ-006](../02-planejamento/requisitos-spec.md#req-006), [REQ-010](../02-planejamento/requisitos-spec.md#req-010), [REQ-028](../02-planejamento/requisitos-spec.md#req-028).

---

## Atualizações quando requisitos evoluírem

- **Requisitos funcionais:** ajuste layouts, journeys e protótipos conforme novos `REQ-###`, atualizando `design-geral.md` e este espelho em paralelo com `fluxos.md`, `componentes.md` e integrações de arquitetura.
- **Requisitos não funcionais:** registre impactos em responsividade, acessibilidade, performance e regras cromáticas derivados de RNFs, alinhando métricas com `../04-qualidade-testes/qualidade-e-metricas.md` e controles com `../06-governanca-tecnica-e-controle-de-qualidade/controle-de-qualidade.md`.
- **Checklist de rastreabilidade:** referencie o requisito no catálogo, informe o item do `CHANGELOG.md`, cite decisões documentadas e aponte o registro correspondente em `req/audit-history.md`.

---

## Princípios de Design
- **Hierarquia orientada a decisão** — destaque para KPIs críticos de diagnóstico, ações de retry e pendências administrativas. 【F:prototype/dashboard-fila.html†L120-L248】
- **Clareza clínica** — textos curtos e acionáveis, evitando termos genéricos; microcopy segue diretrizes de UX Writing e compliance. 【F:prototype/onboarding-permissoes.html†L1-L88】
- **Escalabilidade white-label** — tokens de cor, tipografia e espaçamento derivados de `branding.js` garantem consistência entre tenants. 【F:prototype/branding.js†L1-L132】【F:ui/src/BrandingHelper.ts†L1-L160】
- **Resiliência visual** — estados de carregamento, erro e vazio são representados com ícones, descrições e ações claras. 【F:ui/src/components/dashboard/DiagnosticQueue.tsx†L150-L210】
- **Requisitos associados:** [REQ-007](../02-planejamento/requisitos-spec.md#req-007), [REQ-015](../02-planejamento/requisitos-spec.md#req-015), [REQ-016](../02-planejamento/requisitos-spec.md#req-016), [REQ-017](../02-planejamento/requisitos-spec.md#req-017).

## Camadas de Design
- **Cabeçalho e Shell** — apresenta logo dinâmico, tenant ativo e menu do usuário com ações de sessão, conforme protótipo. 【F:prototype/dashboard-visao-geral.html†L1-L60】
- **Corpo Modular** — organizado em blocos independentes (upload, insights, fila, ações rápidas) que podem ser reorganizados conforme persona. 【F:ui/src/components/dashboard/DashboardOverview.tsx†L1-L222】
- **Rodapé Clínico** — exibe data da última sincronização, links legais e contatos de suporte, obrigatório em todas as visões operacionais. 【F:prototype/dashboard-visao-geral.html†L200-L220】
- **Requisitos associados:** [REQ-006](../02-planejamento/requisitos-spec.md#req-006), [REQ-009](../02-planejamento/requisitos-spec.md#req-009), [REQ-010](../02-planejamento/requisitos-spec.md#req-010), [REQ-016](../02-planejamento/requisitos-spec.md#req-016).
- **Integração colaborativa:** a distribuição de blocos deve acomodar os painéis adicionais previstos em [REQ-034](../02-planejamento/requisitos-spec.md#req-034) sem suprimir indicadores herdados da versão clínica.

## RUP-02-DES-001 — Blueprint da Jornada Clínica
**Descrição** — Mapear a jornada completa do usuário aprovado: aprovação confirmada → onboarding → dashboard → fila de diagnósticos → compartilhamento de resultados. 【F:prototype/administracao-liberacao.html†L1-L120】【F:prototype/dashboard-fila.html†L120-L248】
- **Requisitos associados:** [REQ-001](../02-planejamento/requisitos-spec.md#req-001), [REQ-002](../02-planejamento/requisitos-spec.md#req-002), [REQ-006](../02-planejamento/requisitos-spec.md#req-006), [REQ-007](../02-planejamento/requisitos-spec.md#req-007), [REQ-009](../02-planejamento/requisitos-spec.md#req-009).
- **Integração colaborativa:** mantém bloqueios de aprovação antes de acionar convites multi-especialistas descritos em [REQ-031](../02-planejamento/requisitos-spec.md#req-031) e [REQ-032](../02-planejamento/requisitos-spec.md#req-032).

**Critérios de Aceitação**
- Cabeçalho com logo dinâmico e identificação do tenant em todas as telas autenticadas.
- Estados `PENDING`, `REJECTED`, `APPROVED` com instruções contextuais e ações de suporte. 【F:ui/src/components/approval/ApprovalStatus.tsx†L1-L173】
- Cards de upload, fila e insights respeitam grid de 8 pt e regra cromática 60-30-10. 【F:prototype/dashboard-visao-geral.html†L1-L180】

## RUP-02-DES-002 — Estados Operacionais
**Descrição** — Documentar estados de carregamento, sucesso, erro e vazio para cada componente crítico (aprovação, onboarding, upload, fila, áudio). 【F:prototype/dashboard-fila.html†L180-L248】【F:ui/src/components/dashboard/DiagnosticQueue.tsx†L150-L210】
- **Requisitos associados:** [REQ-005](../02-planejamento/requisitos-spec.md#req-005), [REQ-006](../02-planejamento/requisitos-spec.md#req-006), [REQ-015](../02-planejamento/requisitos-spec.md#req-015), [REQ-017](../02-planejamento/requisitos-spec.md#req-017).
- **Integração colaborativa:** os mesmos estados alimentam painéis médicos compartilhados exigidos por [REQ-033](../02-planejamento/requisitos-spec.md#req-033) e logs correlacionados em [REQ-044](../02-planejamento/requisitos-spec.md#req-044).

**Critérios de Aceitação**
- Indicadores visuais para processamento (spinners/barras) com mensagens de progresso. 【F:prototype/dashboard-visao-geral.html†L20-L120】
- Mensagens de erro acionáveis com botões “Tentar novamente”, “Contatar suporte” ou instruções equivalentes.
- Layouts vazios com chamadas para ação que direcionam o próximo passo do usuário.

## RUP-02-DES-003 — Responsividade e Densidade
**Descrição** — Garantir legibilidade entre 320 px e 1280 px, cobrindo desktop e tablet usados em clínicas. 【F:prototype/dashboard-visao-geral.html†L1-L220】
- **Requisitos associados:** [REQ-010](../02-planejamento/requisitos-spec.md#req-010), [REQ-015](../02-planejamento/requisitos-spec.md#req-015), [REQ-016](../02-planejamento/requisitos-spec.md#req-016).
- **Integração colaborativa:** as mesmas grades suportam dashboards expandidos descritos em [REQ-034](../02-planejamento/requisitos-spec.md#req-034) e integrações omnicanal de [REQ-043](../02-planejamento/requisitos-spec.md#req-043).

**Critérios de Aceitação**
- Quebra de cards em duas colunas para resoluções ≥ 1024 px e coluna única abaixo desse limite. 【F:ui/src/components/dashboard/DashboardOverview.tsx†L1-L222】
- Componentes críticos mantêm foco visível e espaçamentos múltiplos de 8 px em qualquer breakpoint.
- Player de áudio e botões de compartilhamento permanecem acessíveis por teclado. 【F:prototype/diagnostico-operacao.html†L68-L120】

## RUP-02-DES-004 — Regra Cromática 60-30-10
**Descrição** — Aplicar governança cromática em todas as telas entregues, com medições registradas na auditoria de qualidade. 【F:req/06-governanca-tecnica-e-controle-de-qualidade/controle-de-qualidade.md†L53-L78】
- **Requisitos associados:** [REQ-016](../02-planejamento/requisitos-spec.md#req-016), [REQ-017](../02-planejamento/requisitos-spec.md#req-017), [REQ-028](../02-planejamento/requisitos-spec.md#req-028).

**Critérios de Aceitação**
- 60% cor primária (`--color-primary-strong`), 30% cor secundária (`--color-secondary-strong`), 10% acentos (`--color-accent`). 【F:prototype/styles.css†L1-L120】
- CTAs e badges críticos utilizam apenas a cor de destaque, com contrastes AA e foco visível. 【F:prototype/dashboard-fila.html†L120-L248】
- Resultados documentados como “Conforme 603010” ou “Não conforme 603010” em relatórios de QA. 【F:req/06-governanca-tecnica-e-controle-de-qualidade/controle-de-qualidade.md†L53-L78】

## Artefatos Derivados
- Diagramas ou wireflows descrevendo jornadas de aprovação, onboarding e diagnóstico, anexados como Mermaid/PlantUML.
- Checklist de microcopy e tokens atualizados junto ao design system (branding, tipografia, ícones). 【F:prototype/branding.js†L1-L132】
- Evidências de revisão UX e compliance anexadas aos PRs correspondentes, seguindo políticas do `AGENTS.md`. 【F:AGENTS.md†L200-L333】
- **Requisitos associados:** [REQ-019](../02-planejamento/requisitos-spec.md#req-019), [REQ-022](../02-planejamento/requisitos-spec.md#req-022), [REQ-023](../02-planejamento/requisitos-spec.md#req-023).

[Voltar ao índice](README-spec.md)
