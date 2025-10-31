<!-- req/03-implementacao/estrutura-de-projeto.md -->
> **Nota de convenção:** Este documento utiliza a notação personalizada `【F:...†L...】` para referenciar arquivos e intervalos de linhas relevantes.  
> Por exemplo, `【F:ui/src/App.tsx†L1-L79】` indica o arquivo `ui/src/App.tsx`, linhas 1 a 79.  
> Esta notação não é padrão Markdown e serve apenas como referência textual. Para mais detalhes, consulte AGENTS.md.
# Estrutura de Projeto

> Base: [./estrutura-de-projeto.md](./estrutura-de-projeto.md)
> Plano: [/docs/plans/20251025093000-evolucao-req-spec.md](/docs/plans/20251025093000-evolucao-req-spec.md)
> Changelog: [/CHANGELOG.md#2025-10-25](/CHANGELOG.md#2025-10-25)
> Referências correlatas: [Arquitetura da extensão](/req/01-arquitetura/arquitetura-da-extensao-spec.md) · [Design geral](/req/02-design/design-geral-spec.md) · [Testes end-to-end](/req/04-testes-e-validacao/testes-end-to-end-spec.md)

Esta fase descreve como os subprojetos do repositório são estruturados durante a implementação. As orientações abrangem a aplicação web React (`ui/`), a API NestJS (`api/`) e a extensão Chromium (`extension/`), mantendo paridade com `req/02-design/` e `req/01-arquitetura/`. 【F:ui/src/App.tsx†L1-L79】【F:api/src/app.module.ts†L1-L39】【F:extension/src/background/index.ts†L1-L120】

---

## Atualizações exigidas por novos requisitos

- **Requisitos funcionais:** sempre que um `REQ-###` alterar estrutura ou diretórios, sincronize `estrutura-de-projeto.md` e este espelho com os ajustes e referencie os componentes/documentos correspondentes em `../02-design/` e `../01-arquitetura/`.
- **Requisitos não funcionais:** documente configurações técnicas adicionais (performance, segurança, automação) e mantenha alinhados `build-e-automacao.md`, `padroes-de-codigo.md` e `qualidade-e-metricas.md`.
- **Rastreabilidade:** mencione os IDs de requisitos, registre o item no `CHANGELOG.md`, atualize `req/audit-history.md` e informe a governança (`../06-governanca-tecnica-e-controle-de-qualidade/`) sobre scripts, pipelines ou controles impactados.

---

## Panorama geral de organização
- **Estratos do produto** — UI, API e extensão compartilham contratos (DTOs, IndexedDB, tokens) alinhados ao protótipo navegável. 【F:prototype/dashboard-visao-geral.html†L1-L220】【F:api/src/upload/dto/upload-response.dto.ts†L1-L40】
- **Governança** — toda alteração estrutural exige referência cruzada em `.ref/docs/wiki/`, planos aprovados e changelog da entrega. 【F:.ref/docs/wiki/index.md†L1-L24】【F:docs/plans/plan-ui-ux-requirements-v5.md†L88-L210】【F:CHANGELOG/20251020143759.md†L1-L120】
- **Automação e scripts** — uso exclusivo de `Makefile` por subprojeto, sem adição de novos shells. 【F:ui/Makefile†L1-L37】【F:api/Makefile†L1-L47】【F:extension/Makefile†L1-L40】

## Clientes web (`ui/`)

### Núcleo do aplicativo
- `src/main.tsx` e `src/App.tsx` iniciam a aplicação, registram rotas (Approval, Onboarding, Dashboard, Upload) e conectam helpers de branding. 【F:ui/src/main.tsx†L1-L10】【F:ui/src/App.tsx†L1-L79】
- `package.json` e `vite.config.ts` definem scripts (`dev`, `build`, `lint`, `preview`) e proxy para a API usando variáveis `VITE_*`. 【F:ui/package.json†L1-L28】【F:ui/vite.config.ts†L1-L36】
- `index.ts` expõe os componentes de onboarding como SDK interno para reuse em outros clientes. 【F:ui/src/index.ts†L1-L7】
> **Atualização 2025-10-24 (Issues #257-#261):** Reconstrução dos mapeamentos explícitos de diretórios `ui/` e `api/` para restabelecer a conformidade com `REQ-018` a `REQ-022`, seguindo o plano [`20251024203001-reconstruir-req-de-ref`](../../docs/plans/20251024203001-reconstruir-req-de-ref.md) e a auditoria [`20251024203001-reconstruir-req-de-ref-audit`](../../docs/plans/20251024203001-reconstruir-req-de-ref-audit.md). 【F:docs/plans/20251024203001-reconstruir-req-de-ref.md†L9-L56】

### Registro de restauração 2025-10-24
- Reintrodução do detalhamento dos módulos React (Approval, Onboarding, Dashboard, Upload, Branding) e do módulo NestJS de diagnósticos, conforme a referência histórica da versão 5. 【F:.ref/docs/wiki/03-implementacao/estrutura-de-projeto.md†L6-L44】
- Correção das âncoras internas para os requisitos técnicos `REQ-018` a `REQ-022`, garantindo rastreabilidade com pipelines e auditorias. 【F:req/02-planejamento/requisitos.md†L67-L72】【F:docs/plans/20251024203001-reconstruir-req-de-ref-audit.md†L33-L60】

## Front-end (`ui/` e demais clientes web)
- Utilize **React com TypeScript**, seguindo obrigatoriamente o padrão **Feature-Sliced Design (FSD)** combinado com **Atomic Design**, preservando a arquitetura descrita na referência. 【F:.ref/docs/wiki/03-implementacao/estrutura-de-projeto.md†L8-L18】
- Mantenha os fluxos principais em `src/components/approval/`, `src/components/onboarding/`, `src/components/dashboard/`, `src/Upload.tsx`/`src/UploadHelper.ts` e `src/BrandingHelper.ts`, alinhados aos requisitos `REQ-001` a `REQ-010` e `REQ-018`. 【F:.ref/docs/wiki/03-implementacao/estrutura-de-projeto.md†L10-L31】【F:req/02-planejamento/requisitos.md†L24-L33】【F:req/02-planejamento/requisitos.md†L67-L70】
- Centralize tokens e constantes em `src/BrandingHelper.ts` e `src/constants/`, garantindo sincronização com `docs/prototype/branding.js` e governança LGPD (`REQ-017`, `REQ-028`). 【F:.ref/docs/wiki/03-implementacao/estrutura-de-projeto.md†L30-L38】【F:req/02-planejamento/requisitos.md†L53-L57】【F:req/02-planejamento/requisitos.md†L90-L92】
- Cada componente deve declarar o caminho relativo no cabeçalho, conforme descrito em `AGENTS.md`, e atualizar `req/02-design/componentes.md`/`fluxos.md` sempre que novos módulos forem criados. 【F:AGENTS.md†L120-L160】【F:req/02-design/componentes.md†L138-L150】
- Protótipos e microcopy (`docs/prototype/*.html`) permanecem como fonte única da UI; divergências exigem revisão simultânea nos requisitos RUP e changelog. 【F:.ref/docs/wiki/03-implementacao/estrutura-de-projeto.md†L34-L44】

## Back-end (`api/` e serviços complementares)
- APIs Node.js adotam NestJS com TypeScript, preservando o módulo `diagnostics` com controller, service e DTOs (`REQ-018`, `REQ-020`, `REQ-022`). 【F:.ref/docs/wiki/03-implementacao/estrutura-de-projeto.md†L20-L44】【F:req/02-planejamento/requisitos.md†L67-L72】
- `src/app.controller.ts` deve continuar expondo `/config`, `/debug/env` e health checks, enquanto novos módulos ficam sob `src/diagnostics/` ou `src/modules/<domínio>/`. 【F:.ref/docs/wiki/03-implementacao/estrutura-de-projeto.md†L20-L44】
- Contratos (DTOs) residem em `src/diagnostics/dto/` e devem ser versionados em conjunto com o front-end (`REQ-005`, `REQ-006`). 【F:.ref/docs/wiki/03-implementacao/estrutura-de-projeto.md†L20-L44】【F:req/02-planejamento/requisitos.md†L28-L33】
- Scripts auxiliares continuam vetados; orquestrações adicionais devem ser implementadas via `Makefile`, respeitando a política anti-shell do projeto. 【F:AGENTS.md†L96-L140】
- Novos serviços exigem atualização de `req/01-arquitetura/`, `req/02-design/` e registro no changelog correspondente. 【F:docs/plans/20251024203001-reconstruir-req-de-ref-audit.md†L52-L60】

## Mapas Detalhados Herdados — Extensão Clínica V5
- `ui/src/App.tsx` — Orquestra rotas Approval, Onboarding, Dashboard e Upload, mantendo contexto de branding. 【F:.ref/docs/wiki/03-implementacao/estrutura-de-projeto.md†L6-L13】【F:ui/src/App.tsx†L1-L79】
- `ui/src/components/approval/` — Contém `ApprovalStatus` e helpers que refletem estados `PENDING`/`REJECTED`/`APPROVED`. 【F:.ref/docs/wiki/03-implementacao/estrutura-de-projeto.md†L6-L13】【F:ui/src/components/approval/ApprovalStatus.tsx†L1-L173】
- `ui/src/components/onboarding/` — Implementa consentimento LGPD e permissões clínicas, com persistência IndexedDB. 【F:.ref/docs/wiki/03-implementacao/estrutura-de-projeto.md†L6-L13】【F:ui/src/components/onboarding/ConsentScreen.tsx†L1-L120】
- `ui/src/components/dashboard/` — Reproduz `DashboardOverview` e `DiagnosticQueue` alinhados aos protótipos. 【F:.ref/docs/wiki/03-implementacao/estrutura-de-projeto.md†L6-L13】【F:prototype/dashboard-visao-geral.html†L1-L220】
- `ui/src/Upload.tsx` e `ui/src/UploadHelper.ts` — Tratam upload clínico, fallback IndexedDB (`wl-db`) e contratos `SubmitResponse`. 【F:.ref/docs/wiki/03-implementacao/estrutura-de-projeto.md†L11-L18】【F:ui/src/Upload.tsx†L1-L188】
- `ui/src/BrandingHelper.ts` — Sincroniza tokens com `prototype/branding.js` e controla versões. 【F:.ref/docs/wiki/03-implementacao/estrutura-de-projeto.md†L11-L18】【F:prototype/branding.js†L1-L132】
- `ui/src/constants/` — Centraliza chaves de armazenamento, endpoints e limites operacionais. 【F:.ref/docs/wiki/03-implementacao/estrutura-de-projeto.md†L11-L18】【F:ui/src/constants/constants.ts†L1-L160】
- `api/src/app.controller.ts` — Exponde `/config`, `/debug/env` e health checks documentados. 【F:.ref/docs/wiki/03-implementacao/estrutura-de-projeto.md†L16-L20】【F:api/src/app.controller.ts†L35-L123】
- `api/src/diagnostics/` — Concentra controller, service e DTOs para upload, áudio e respostas clínicas. 【F:.ref/docs/wiki/03-implementacao/estrutura-de-projeto.md†L16-L20】【F:api/src/diagnostics/diagnostics.controller.ts†L33-L189】
- `api/test/` — Abriga suites unitárias e e2e cobrindo fluxos críticos descritos em `req/04-testes-e-validacao/`. 【F:.ref/docs/wiki/03-implementacao/estrutura-de-projeto.md†L16-L20】【F:req/04-testes-e-validacao/testes-end-to-end.md†L1-L160】

### Convenções Operacionais Legadas
- Componentes React devem manter importações absolutas controladas e seguir Atomic Design/Feature-Sliced. 【F:.ref/docs/wiki/03-implementacao/estrutura-de-projeto.md†L22-L35】【F:req/02-design/componentes.md†L138-L150】
- Hooks e helpers compartilhados residem em `ui/src/utils/` ou `ui/src/hooks/`, evitando duplicidade. 【F:.ref/docs/wiki/03-implementacao/estrutura-de-projeto.md†L27-L31】
- IndexedDB utiliza `DB_VERSION = 2` e stores `FILES_STORE`, `BRANDING_STORE`, `CONSENT_STORE`, com auditoria registrada. 【F:.ref/docs/wiki/03-implementacao/estrutura-de-projeto.md†L27-L33】【F:ui/src/UploadHelper.ts†L1-L63】
- Atualizações em fluxos exigem sincronização entre protótipo, React, NestJS e documentação RUP. 【F:.ref/docs/wiki/03-implementacao/estrutura-de-projeto.md†L33-L36】【F:req/02-design/fluxos.md†L14-L40】
- Novas estruturas de pasta requerem revisão na governança técnica e atualização dos pipelines descritos em `req/06-governanca-tecnica-e-controle-de-qualidade/revisoes-com-ia.md`. 【F:.ref/docs/wiki/03-implementacao/estrutura-de-projeto.md†L33-L36】【F:req/06-governanca-tecnica-e-controle-de-qualidade/revisoes-com-ia.md†L18-L124】

## Documentação e Referências
- `prototype/` ou diretórios equivalentes concentram protótipos e materiais de referência aprovados; atualizações precisam refletir imediatamente nos componentes React/NestJS e no catálogo `REQ-018` a `REQ-022`. 【F:.ref/docs/wiki/03-implementacao/estrutura-de-projeto.md†L34-L44】【F:req/02-planejamento/requisitos.md†L67-L72】
- `req/` permanece como fonte oficial de requisitos; cite o changelog [`CHANGELOG/20251024203001-reconstrucao-req.md`](../../CHANGELOG/20251024203001-reconstrucao-req.md) ao registrar novas alterações estruturais. 【F:docs/plans/20251024203001-reconstruir-req-de-ref.md†L49-L56】
- Os padrões de testes residem em `req/04-testes-e-validacao/`; amplie suites para cobrir fluxos recuperados de aprovação, onboarding e upload. 【F:.ref/docs/wiki/03-implementacao/estrutura-de-projeto.md†L40-L44】【F:req/02-planejamento/milestones.md†L18-L44】

### Jornadas e módulos funcionais
- **Aprovação clínica** (`components/approval/`) — renderiza estados `PENDING`, `APPROVED`, `REJECTED`, exibindo microcopy oficial e ações de contato. 【F:ui/src/components/approval/ApprovalStatus.tsx†L1-L173】【F:prototype/aguardando-aprovacao.html†L1-L80】
- **Onboarding** (`components/onboarding/`) — orquestra consentimento LGPD, permissões e conclusão, persistindo progresso via `shared/lib/ConsentHelper`. 【F:ui/src/components/onboarding/OnboardingFlow.tsx†L1-L200】【F:ui/src/shared/lib/ConsentHelper.ts†L1-L52】
- **Dashboard clínico** (`components/dashboard/`) — `DashboardOverview` e `DiagnosticQueue` refletem métricas, fila e interações de retry conforme o protótipo. 【F:ui/src/components/dashboard/DashboardOverview.tsx†L1-L222】【F:ui/src/components/dashboard/DiagnosticQueue.tsx†L1-L210】
- **Upload multicanal** (`Upload.tsx`, `UploadHelper.ts`) — aceita PDFs, mantém fallback IndexedDB (`wl-db`) e sincroniza com API/Extensão. 【F:ui/src/Upload.tsx†L1-L188】【F:ui/src/UploadHelper.ts†L1-L154】
- **Integração multiusuário** (`AppIntegrationHelper.ts`, `MultiUserAuthHelper.ts`) — mantém contexto por usuário, migra credenciais legadas e aplica branding específico. 【F:ui/src/AppIntegrationHelper.ts†L1-L120】【F:ui/src/MultiUserAuthHelper.ts†L1-L200】

### Camada compartilhada, contratos e utilidades
- `shared/lib/BrandingHelper.ts` e `shared/lib/ConsentHelper.ts` padronizam tokens e sincronizações LGPD com a API. 【F:ui/src/shared/lib/BrandingHelper.ts†L1-L120】【F:ui/src/shared/lib/ConsentHelper.ts†L1-L88】
- `constants/constants.ts` concentra `API_BASE_URL`, chaves de cookie/localStorage e variáveis white-label para uso em todos os módulos. 【F:ui/src/constants/constants.ts†L1-L80】
- `utils/indexedDb.ts` e `utils/markdown.ts` oferecem infraestrutura de persistência e sanitização de conteúdo para múltiplas features. 【F:ui/src/utils/indexedDb.ts†L1-L64】【F:ui/src/utils/markdown.ts†L1-L60】
- `src/__tests__/UploadIntegration.test.ts` valida contratos entre UI, helpers e API simulada. 【F:ui/src/__tests__/UploadIntegration.test.ts†L1-L160】

### Assets e documentação complementar
- `public/` mantém assets versionados (`vite.svg`) que precisam refletir o branding descrito em `req/06-ux-brand/`. 【F:ui/public/vite.svg†L1-L15】【F:req/06-ux-brand/identidades-visuais.md†L1-L32】
- Atualizações de componentes ou microcopy devem ser sincronizadas com `req/02-design/componentes.md` e `req/02-design/fluxos.md`. 【F:req/02-design/componentes.md†L5-L48】【F:req/02-design/fluxos.md†L90-L133】

## API NestJS (`api/`)

### Infraestrutura e composição
- `package.json`, `Makefile` e `docker-compose.yml` definem scripts, alvos Docker e integrações com o stack nginx documentado. 【F:api/package.json†L1-L28】【F:api/Makefile†L1-L47】【F:docker-compose.yml†L1-L120】
- `src/app.module.ts` agrega módulos (diagnostics, upload, onboarding, consent, notifications, admin, config, auth). 【F:api/src/app.module.ts†L1-L39】
- `src/app.controller.ts` publica health checks, `/config` e `/debug/env`, utilizados por UI e extensão na inicialização. 【F:api/src/app.controller.ts†L35-L123】
- `src/modules/config/` fornece `ConfigController` e DTOs para origens e `googleClientId`, espelhando integrações front-end. 【F:api/src/modules/config/config.controller.ts†L1-L60】【F:api/src/modules/config/dto/config-response.dto.ts†L1-L20】

### Módulos de domínio e responsabilidades
- **Diagnóstico** (`diagnostics/`) — controller, service, DTOs e serviços OCR/PDF que abastecem dashboard e fila clínica. 【F:api/src/diagnostics/diagnostics.controller.ts†L33-L189】【F:api/src/diagnostics/dto/diagnostic-response.dto.ts†L1-L63】
- **Upload** (`upload/`) — valida PDF (≤10 MB), gera tokens e retorna `UploadResponseDto` consumido por UI/Extensão. 【F:api/src/upload/upload.controller.ts†L1-L120】【F:api/src/upload/dto/upload-response.dto.ts†L1-L40】
- **Histórico de arquivos** (`file-history/`) — persiste metadados e garante cache conforme constantes globais. 【F:api/src/file-history/file-history.service.ts†L1-L96】【F:api/src/constants/constants.ts†L25-L64】
- **Notificações** (`notifications/`) — centraliza templates e disparos de e-mail/WhatsApp acionados por onboarding/diagnósticos. 【F:api/src/notifications/notification.service.ts†L1-L104】
- **Onboarding** (`onboarding/`) — usa `NotificationService` para fluxos de registro, aprovação e pendência. 【F:api/src/onboarding/onboarding.service.ts†L1-L95】【F:api/src/onboarding/dto/onboarding.dto.ts†L1-L52】
- **Consentimento LGPD** (`consent/`) — expõe endpoints de submissão, validação e histórico com DTOs validados. 【F:api/src/consent/consent.controller.ts†L1-L104】【F:api/src/consent/dto/consent.dto.ts†L1-L52】
- **Administração** (`admin/`) — operações de aprovação, rejeição e consulta de status para admins clínicos. 【F:api/src/admin/admin.controller.ts†L1-L80】
- **Autenticação mock** (`auth/`) — gera JWTs simulados e seleciona usuários padrão a partir da credencial Google. 【F:api/src/auth/auth.service.ts†L1-L88】

### Contratos expostos e testes
- DTOs devem permanecer em subpastas dedicadas (`<modulo>/dto`) e sincronizados com consumidores (`ui`, `extension`). 【F:api/src/diagnostics/dto/diagnostic-response.dto.ts†L1-L63】【F:api/src/upload/dto/upload-request.dto.ts†L1-L48】
- Testes unitários/integrados (`src/test/`, `*.spec.ts`) precisam cobrir fluxos críticos descritos em `req/04-testes-e-validacao/`. 【F:api/src/test/upload.e2e-spec.ts†L1-L160】【F:req/04-testes-e-validacao/testes-end-to-end.md†L1-L36】
- Qualquer módulo novo deve atualizar `req/01-arquitetura/integracoes-com-apis.md` com endpoints, autenticação e dependências externas. 【F:req/01-arquitetura/integracoes-com-apis.md†L12-L88】

## Extensão Chromium (`extension/`)

### Estrutura e build
- `package.json`, `Makefile` e `vite.config.ts` replicam política de scripts (build, lint, preview) e configuração Manifest V3. 【F:extension/package.json†L1-L30】【F:extension/Makefile†L1-L40】【F:extension/vite.config.ts†L1-L40】
- `manifest.config.ts` gera o manifest final e aponta side panel, background e content scripts. 【F:extension/manifest.config.ts†L1-L120】

### Módulos principais
- **Background** (`src/background/index.ts`) — intercepta downloads PDF, sincroniza tokens com IndexedDB e responde a mensagens da UI. 【F:extension/src/background/index.ts†L1-L120】
- **Content** (`src/content/index.ts`) — marca páginas elegíveis indicando presença da extensão. 【F:extension/src/content/index.ts†L1-L10】
- **Sidepanel** (`src/sidepanel/App.tsx`) — apresenta tokens, envia notificações e solicita reprocessamento conforme protótipo. 【F:extension/src/sidepanel/App.tsx†L1-L200】【F:prototype/dashboard-fila.html†L120-L248】
- **API client** (`src/api/client.ts`) — abstrai chamadas ao backend para upload, domínios autorizados e notificações. 【F:extension/src/api/client.ts†L1-L160】
- **Storage** (`src/storage/db.ts`) — gerencia IndexedDB compartilhando contratos com UI (`UploadJobMetadata`). 【F:extension/src/storage/db.ts†L1-L120】【F:ui/src/UploadHelper.ts†L1-L88】
- **Mensageria** (`src/messaging/runtime.ts`) — tipa mensagens `chrome.runtime` e garante compatibilidade com background/sidepanel. 【F:extension/src/messaging/runtime.ts†L1-L120】

### Alinhamento documental
- Alterações na extensão que impactem fluxos clínicos devem ser refletidas em `req/02-design/fluxos.md` e nas páginas correspondentes de `.ref/docs/wiki/03-implementacao/`. 【F:req/02-design/fluxos.md†L112-L133】【F:.ref/docs/wiki/03-implementacao/estrutura-de-projeto.md†L5-L120】

## Convivência entre FSD, Atomic Design e governança
- **FSD adaptado** — este projeto adota uma abordagem FSD modificada, onde features residem em `components/<feature>` (Approval, Onboarding, Dashboard), em vez do padrão `src/features/`. A lógica transversal permanece em `shared/` e `utils/`. Consulte `AGENTS.md` para justificativa e mantenha as fronteiras registradas em `req/02-design/fluxos.md`. 【F:ui/src/components/onboarding/OnboardingFlow.tsx†L1-L200】【F:req/02-design/fluxos.md†L90-L133】
- **Atomic Design** — documentos de componentes classificam átomos, moléculas e organismos; quaisquer variações devem ser descritas em `req/02-design/componentes.md` e vinculadas ao protótipo. 【F:req/02-design/componentes.md†L9-L48】【F:prototype/dashboard-visao-geral.html†L1-L220】
- **Documentação complementar** — mantenha atualizados `req/06-ux-brand/`, `.ref/docs/wiki/05-entrega-e-implantacao/` e `AGENTS.md` para refletir dependências, tokens e políticas operacionais. 【F:req/06-ux-brand/identidades-visuais.md†L1-L60】【F:.ref/docs/wiki/05-entrega-e-implantacao/ambientes-e-configuracoes.md†L1-L32】【F:AGENTS.md†L200-L333】
- **Changelog e planos** — toda mudança estrutural precisa citar o plano aprovado (`docs/plans/`) e registrar no changelog correspondente. 【F:docs/plans/plan-ui-ux-requirements-v5.md†L88-L210】【F:CHANGELOG/20251020143759.md†L1-L120】

## Governança
- Siga a política de automação e auditoria descrita em `req/06-governanca-tecnica-e-controle-de-qualidade/governanca-tecnica.md` antes de introduzir novas tarefas em pipelines CI/CD. 【F:req/06-governanca-tecnica-e-controle-de-qualidade/governanca-tecnica.md†L40-L120】
- Padrões adicionais (reorganização de pastas, novas convenções) requerem aprovação prévia e atualização sincronizada nos artefatos desta fase. 【F:req/06-governanca-tecnica-e-controle-de-qualidade/controle-de-qualidade.md†L53-L96】

[Voltar ao índice](README-spec.md)
