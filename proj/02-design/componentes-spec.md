<!-- req/02-design/componentes.md -->
# Componentes do Sistema

> Base: [./componentes.md](./componentes.md)
> Plano: [/docs/plans/20251025093000-evolucao-req-spec.md](/docs/plans/20251025093000-evolucao-req-spec.md)
> Changelog: [/CHANGELOG.md#2025-10-25](/CHANGELOG.md#2025-10-25)
> Referências correlatas: [Arquitetura da extensão](/req/01-arquitetura/arquitetura-da-extensao-spec.md) · [Design geral](/req/02-design/design-geral-spec.md) · [Testes end-to-end](/req/04-testes-e-validacao/testes-end-to-end-spec.md)

## Objetivo
Mapear componentes React e elementos de interface que sustentam as jornadas clínicas do Yagnostic v5, garantindo que cada peça tenha responsabilidade clara, estados documentados e aderência ao protótipo navegável. 【F:ui/src/App.tsx†L1-L79】【F:prototype/dashboard-visao-geral.html†L1-L220】

---

## Atualizações quando requisitos mudarem

- **Requisitos funcionais:** acrescente ou ajuste componentes, estados e interações vinculados aos novos `REQ-###`, atualizando `componentes.md` e este espelho em paralelo com `fluxos.md` e `design-geral.md`.
- **Requisitos não funcionais:** reflita impactos em acessibilidade, performance, responsividade ou microcopy derivados de RNFs, alinhando métricas com `../04-qualidade-testes/qualidade-e-metricas.md` e controles com `../06-governanca-tecnica-e-controle-de-qualidade/controle-de-qualidade.md`.
- **Rastreabilidade:** cite sempre o requisito correspondente, registre o item do `CHANGELOG.md`, aponte ajustes em `../03-implementacao/estrutura-de-projeto.md` e registre a auditoria em `req/audit-history.md`.

---

## Componentes de Acesso e Aprovação
### Login (`Login.tsx`)
- Coleta credenciais corporativas, exibe bloqueios por aprovação pendente e direciona para onboarding quando necessário. 【F:ui/src/Login.tsx†L1-L93】【F:prototype/login-aguardando-aprovacao.html†L1-L120】
- Deve apresentar mensagens de erro concisas, feedback de carregamento e links de suporte.
- **Requisitos associados:** [REQ-001](../02-planejamento/requisitos-spec.md#req-001), [REQ-002](../02-planejamento/requisitos-spec.md#req-002), [REQ-010](../02-planejamento/requisitos-spec.md#req-010).

### ApprovalStatus (`components/approval/`)
- Renderiza variantes `PENDING`, `REJECTED` e `APPROVED` alinhadas às telas administrativas. 【F:ui/src/components/approval/ApprovalStatus.tsx†L1-L173】【F:prototype/aguardando-aprovacao.html†L1-L80】
- Inclui botões de contato e instruções para acelerar a triagem clínica.
- **Requisitos associados:** [REQ-006](../02-planejamento/requisitos-spec.md#req-006), [REQ-007](../02-planejamento/requisitos-spec.md#req-007), [REQ-017](../02-planejamento/requisitos-spec.md#req-017).

## Componentes de Onboarding
### ConsentScreen e Permissions (`components/onboarding/`)
- Capturam aceite LGPD, permissões de uso de dados e preferências de comunicação antes do primeiro acesso. 【F:ui/src/components/onboarding/ConsentScreen.tsx†L1-L120】【F:prototype/onboarding-consentimento.html†L1-L80】
- Persistem status em IndexedDB e exibem progresso visual por etapas.
- **Notas de convivência colaborativa:** compartilham o status de consentimento com os painéis clínicos descritos em [capacidade-diagnostico-colaborativo.md](../02-planejamento/capacidade-diagnostico-colaborativo-spec.md#governanca-de-consentimento), sem remover os bloqueios herdados do fluxo web.
- **Requisitos associados:** [REQ-003](../02-planejamento/requisitos-spec.md#req-003), [REQ-024](../02-planejamento/requisitos-spec.md#req-024), [REQ-025](../02-planejamento/requisitos-spec.md#req-025), [REQ-027](../02-planejamento/requisitos-spec.md#req-027).

### OnboardingFlow e passos (`components/onboarding/`)
- `OnboardingFlow.tsx` coordena o fluxo de quatro etapas seguindo padrões FSD e Atomic Design. O progresso é persistido via `shared/lib/ConsentHelper` garantindo retomada após recarregar. 【F:ui/src/components/onboarding/OnboardingFlow.tsx†L1-L200】
- **Atomic Design aplicado:** `OnboardingWelcome.tsx`, `OnboardingConsent.tsx`, `OnboardingPermissions.tsx` e `OnboardingComplete.tsx` são organismos que compõem o template de onboarding, cada etapa reutilizando átomos (botões) e moléculas (formulários) do sistema. 【F:ui/src/components/onboarding/OnboardingConsent.tsx†L1-L200】【F:prototype/onboarding-consentimento.html†L1-L80】
- **FSD compliance:** helpers compartilhados residem em `shared/lib/ConsentHelper` e `shared/lib/BrandingHelper`, evitando duplicação de lógica e garantindo reutilização entre features.
- Todos os componentes mantêm paleta 60-30-10, tipografia 4x2 e microinterações ≤200ms conforme protótipo navegável.
- **Requisitos associados:** [REQ-010](../02-planejamento/requisitos-spec.md#req-010), [REQ-016](../02-planejamento/requisitos-spec.md#req-016), [REQ-028](../02-planejamento/requisitos-spec.md#req-028).

## Componentes de Upload e Diagnóstico
### Upload (`Upload.tsx`)
- Recebe PDFs/DOCX, mostra progresso de upload, opções de gerar áudio e feedback sobre confidencialidade. 【F:ui/src/Upload.tsx†L1-L188】【F:prototype/dashboard-visao-geral.html†L20-L120】
- Usa `UploadHelper` para fallback local e armazenamento de arquivos no `wl-db`. 【F:ui/src/UploadHelper.ts†L1-L154】
- **Requisitos associados:** [REQ-004](../02-planejamento/requisitos-spec.md#req-004), [REQ-005](../02-planejamento/requisitos-spec.md#req-005), [REQ-011](../02-planejamento/requisitos-spec.md#req-011), [REQ-015](../02-planejamento/requisitos-spec.md#req-015).

### DiagnosticQueue (`components/dashboard/DiagnosticQueue.tsx`)
- Lista diagnósticos com estados `pending`, `processing`, `success` e `error`, permitindo retry ou compartilhamento. 【F:ui/src/components/dashboard/DiagnosticQueue.tsx†L1-L210】【F:prototype/dashboard-fila.html†L120-L248】
- Cartões exibem ícones, legendas, ações contextuais e tempo de atualização.
- **Requisitos associados:** [REQ-006](../02-planejamento/requisitos-spec.md#req-006), [REQ-007](../02-planejamento/requisitos-spec.md#req-007), [REQ-008](../02-planejamento/requisitos-spec.md#req-008), [REQ-016](../02-planejamento/requisitos-spec.md#req-016).

### DashboardOverview (`components/dashboard/DashboardOverview.tsx`)
- Apresenta métricas agregadas, ações rápidas, blocos de insights e status de serviços. 【F:ui/src/components/dashboard/DashboardOverview.tsx†L1-L222】【F:prototype/dashboard-visao-geral.html†L1-L220】
- Integra-se com helpers de branding para manter identidade white-label.
- **Requisitos associados:** [REQ-006](../02-planejamento/requisitos-spec.md#req-006), [REQ-009](../02-planejamento/requisitos-spec.md#req-009), [REQ-010](../02-planejamento/requisitos-spec.md#req-010), [REQ-016](../02-planejamento/requisitos-spec.md#req-016).

### InsightTimeline / Audio Player (prototipado)
- Exibem insights multimodais e players de áudio gerado, seguindo padrões de acessibilidade e controle. 【F:prototype/dashboard-visao-geral.html†L60-L180】
- **Requisitos associados:** [REQ-006](../02-planejamento/requisitos-spec.md#req-006), [REQ-007](../02-planejamento/requisitos-spec.md#req-007), [REQ-015](../02-planejamento/requisitos-spec.md#req-015).

## Componentes de Branding e Menu
### BrandingHelper / Branding.tsx
- Carregam configurações (`logo`, `palette`, `contact`) e aplicam tokens no app, com fallback em IndexedDB. 【F:ui/src/BrandingHelper.ts†L1-L160】【F:prototype/branding.js†L1-L132】
- **Requisitos associados:** [REQ-010](../02-planejamento/requisitos-spec.md#req-010), [REQ-016](../02-planejamento/requisitos-spec.md#req-016), [REQ-018](../02-planejamento/requisitos-spec.md#req-018).

### UserMenu (`UserMenu.tsx`)
- Exibe avatar, nome do tenant e ações de sessão (logout, configurações), com estados responsivos e foco visível. 【F:ui/src/UserMenu.tsx†L1-L158】【F:prototype/dashboard-visao-geral.html†L1-L60】
- **Requisitos associados:** [REQ-006](../02-planejamento/requisitos-spec.md#req-006), [REQ-010](../02-planejamento/requisitos-spec.md#req-010), [REQ-016](../02-planejamento/requisitos-spec.md#req-016).

## Componentes de Comunicação
### Compartilhamento (`components/dashboard`)
- Botões de e-mail/WhatsApp respeitam máscaras, validam contatos e exibem confirmação. 【F:prototype/diagnostico-operacao.html†L68-L120】【F:prototype/dashboard-visao-geral.html†L140-L200】
- **Requisitos associados:** [REQ-007](../02-planejamento/requisitos-spec.md#req-007), [REQ-008](../02-planejamento/requisitos-spec.md#req-008), [REQ-009](../02-planejamento/requisitos-spec.md#req-009), [REQ-030](../02-planejamento/requisitos-spec.md#req-030).

### Templates de E-mail (`prototype/email-*.html`)
- Representam notificações de aprovação, boas-vindas e progresso; servem como base para integrações futuras. 【F:prototype/email-aprovacao-conta.html†L1-L120】【F:prototype/email-boas-vindas-pendente.html†L1-L140】
- **Requisitos associados:** [REQ-009](../02-planejamento/requisitos-spec.md#req-009), [REQ-028](../02-planejamento/requisitos-spec.md#req-028), [REQ-029](../02-planejamento/requisitos-spec.md#req-029).

## Estados e Variantes
- Cada componente deve documentar estados `loading`, `success`, `error` e `empty`, com microcopy orientado à ação. 【F:ui/src/components/dashboard/DiagnosticQueue.tsx†L150-L210】
- Variantes responsivas precisam manter proporções de 8 pt e contraste mínimo AA em qualquer breakpoint. 【F:prototype/dashboard-visao-geral.html†L1-L220】
- **Requisitos associados:** [REQ-015](../02-planejamento/requisitos-spec.md#req-015), [REQ-016](../02-planejamento/requisitos-spec.md#req-016), [REQ-017](../02-planejamento/requisitos-spec.md#req-017).

## Diretrizes de Implementação
- Utilizar Material Symbols Rounded como set principal de ícones, com tamanho mínimo 20 px. 【F:prototype/dashboard-visao-geral.html†L1-L120】
- Tipografia segue regra 4x2 (Manrope/Inter) com pesos limitados a regular e semibold. 【F:prototype/styles.css†L1-L120】
- Microinterações ≤ 200 ms para hover/focus e ≤ 300 ms para transições de estado, garantindo feedback imediato.
- **Estrutura imutável de componentes:** todos os componentes React do `ui/` devem residir em subdiretórios por funcionalidade dentro de `ui/src/components/<feature>`. Arquivos temporários ou variações experimentais fora desse padrão são proibidos; renomeações devem atualizar este documento e o `AGENTS.md` imediatamente.
- **Requisitos associados:** [REQ-018](../02-planejamento/requisitos-spec.md#req-018), [REQ-019](../02-planejamento/requisitos-spec.md#req-019), [REQ-020](../02-planejamento/requisitos-spec.md#req-020).

## Padrões Estruturais Obrigatórios

### React oficial (Meta)
- **Definição:** o código da UI utiliza exclusivamente o pacote `react` mantido pela Meta, com hooks e contextos oficiais para controle de estado e efeitos. Bibliotecas alternativas ou forks não são aceitos. 【F:ui/src/App.tsx†L1-L79】
- **Impacto para futuras features:** novas telas ou helpers devem reutilizar hooks oficiais (`useState`, `useEffect`, `useContext`) para garantir interoperabilidade com testes, SSR e integrações planejadas. Implementações que dependam de APIs não suportadas bloqueiam a revisão técnica e exigem correção antes do merge. 【F:AGENTS.md†L130-L160】
- **Requisitos associados:** [REQ-018](../02-planejamento/requisitos-spec.md#req-018), [REQ-020](../02-planejamento/requisitos-spec.md#req-020).

### Feature-Sliced Design (FSD)
- **Definição:** componentes são organizados por fatias funcionais (`components/onboarding`, `components/approval`, `components/dashboard`), alinhadas ao FSD para separar features, entidades e elementos compartilhados. 【F:ui/src/components/onboarding/OnboardingFlow.tsx†L1-L200】【F:ui/src/components/dashboard/DashboardOverview.tsx†L1-L222】
- **Impacto para futuras features:** qualquer nova jornada deve criar diretório dedicado sob `ui/src/components/<feature>`, documentar a fronteira no RUP e atualizar `AGENTS.md`. Compartilhamento de código entre fatias ocorre via `shared`/helpers documentados; soluções ad-hoc fora do padrão serão rejeitadas. 【F:req/02-design/fluxos.md†L90-L128】
- **Requisitos associados:** [REQ-018](../02-planejamento/requisitos-spec.md#req-018), [REQ-019](../02-planejamento/requisitos-spec.md#req-019).

### Atomic Design
- **Definição:** adotamos Atomic Design para classificar componentes em átomos (botões, inputs), moléculas (cards, listas) e organismos (fluxos como `OnboardingFlow`). A documentação deve indicar a camada de cada peça para evitar duplicação. 【F:req/02-design/fluxos.md†L110-L133】
- **Impacto para futuras features:** toda feature nova precisa identificar quais átomos existentes serão reutilizados e justificar criações inéditas. Ausência dessa análise impede o avanço da revisão de UX e gera ações corretivas no changelog normativo. 【F:req/06-governanca-tecnica-e-controle-de-qualidade/controle-de-qualidade.md†L53-L78】
- **Requisitos associados:** [REQ-016](../02-planejamento/requisitos-spec.md#req-016), [REQ-018](../02-planejamento/requisitos-spec.md#req-018).

[Voltar ao índice](README-spec.md)
