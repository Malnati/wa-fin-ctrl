<!-- req/02-design/fluxos.md -->
# Fluxos de Interação entre Componentes

> Base: [./fluxos.md](./fluxos.md)
> Plano: [/docs/plans/20251025093000-evolucao-req-spec.md](/docs/plans/20251025093000-evolucao-req-spec.md)
> Changelog: [/CHANGELOG.md#2025-10-25](/CHANGELOG.md#2025-10-25)
> Referências correlatas: [Arquitetura da extensão](/req/01-arquitetura/arquitetura-da-extensao-spec.md) · [Design geral](/req/02-design/design-geral-spec.md) · [Testes end-to-end](/req/04-testes-e-validacao/testes-end-to-end-spec.md)

## Objetivo
Documentar, segundo o Rational Unified Process, as sequências de interação entre front-end React, extensão Chrome, helpers locais e API NestJS que sustentam as jornadas clínicas do Yagnostic v5. Cada fluxo descreve passos, estados visuais e integrações necessárias para manter paridade com o protótipo navegável e com os requisitos regulatórios.

**Componentes Implementados:**
- **API NestJS:** `api/src/` (diagnostics, admin, onboarding, notifications, consent)
- **UI React:** `ui/src/` (Dashboard, Upload, Login, Onboarding, Approval flows)
- **Extensão Chrome:** `extension/src/` (sidepanel, background, onboarding, storage integration)

---

## Atualizações quando novos requisitos forem registrados

- **Requisitos funcionais:** documente aqui os fluxos atualizados, apontando caminhos principais, alternativos e de exceção vinculados aos novos IDs `REQ-###`. Sincronize sempre `fluxos.md` e `fluxos-spec.md`, além de atualizar `design-geral.md`, `componentes.md` e as integrações em `../01-arquitetura/`.
- **Requisitos não funcionais:** registre mudanças de performance, segurança ou usabilidade que afetem sequências, destacando métricas em `../04-qualidade-testes/qualidade-e-metricas.md` e critérios em `../04-testes-e-validacao/criterios-de-aceitacao.md`.
- **Rastreabilidade:** referencie o requisito no catálogo (`../02-planejamento/requisitos.md`), cite o item do `CHANGELOG.md` e enlace o registro em `req/audit-history.md`.

---

## Notas Gerais
- Diagramas de sequência podem ser anexados em PlantUML/Mermaid mantendo texto versionável.
- Todos os fluxos devem registrar pontos de auditoria (logs, banners de erro, checkpoints de consentimento) conforme governança MBRA. 【F:req/06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade.md†L31-L104】
- **Requisitos associados:** [REQ-017](../02-planejamento/requisitos-spec.md#req-017), [REQ-022](../02-planejamento/requisitos-spec.md#req-022), [REQ-023](../02-planejamento/requisitos-spec.md#req-023).

### Fluxo 1 — Login e Aprovação Administrativa
1. Usuário acessa `Login.tsx`; formulário envia credenciais para o provedor corporativo (SSO). 【F:ui/src/Login.tsx†L1-L93】
2. Após autenticação, `ApprovalHelper` consulta `/approval/status` (ou fallback local) para verificar bloqueios. 【F:ui/src/ApprovalHelper.ts†L1-L86】
3. Se `PENDING` ou `REJECTED`, o componente `ApprovalStatus` exibe tela correspondente com instruções de suporte e termina o fluxo. 【F:ui/src/components/approval/ApprovalStatus.tsx†L1-L173】
4. Se `APPROVED`, o usuário é redirecionado para o onboarding LGPD.
- **Requisitos associados:** [REQ-001](../02-planejamento/requisitos-spec.md#req-001), [REQ-002](../02-planejamento/requisitos-spec.md#req-002), [REQ-010](../02-planejamento/requisitos-spec.md#req-010), [REQ-017](../02-planejamento/requisitos-spec.md#req-017).
- **Integração colaborativa:** garante que apenas contas liberadas possam prosseguir para convites multi-especialistas descritos em [REQ-031](../02-planejamento/requisitos-spec.md#req-031).

### Fluxo 2 — Onboarding LGPD e Permissões
#### Sequência Legada (v5)
1. `ConsentScreen` apresenta termo de consentimento LGPD e checklist de permissões obrigatórias antes da primeira autenticação. 【F:ui/src/components/onboarding/ConsentScreen.tsx†L1-L120】【F:prototype/onboarding-permissoes.html†L1-L88】
2. O usuário confirma leitura e assinatura; status é persistido em IndexedDB (`wl-db`) com timestamp e versão do termo. 【F:ui/src/UploadHelper.ts†L1-L63】
3. O aplicativo atualiza o contexto de sessão e bloqueia uploads enquanto o consentimento não estiver completo, exibindo mensagens de retomada. 【F:prototype/onboarding-consentimento.html†L1-L80】

#### Sequência Atualizada (Extensão + Web)
1. `OnboardingFlow` orquestra as quatro etapas de entrada, aplicando bloqueios enquanto consentimento e permissões não forem concluídos. 【F:ui/src/components/onboarding/OnboardingFlow.tsx†L1-L200】
2. O passo `OnboardingConsent` apresenta o termo LGPD, registra aceite versionado e sincroniza imediatamente com a API quando possível. 【F:ui/src/components/onboarding/OnboardingConsent.tsx†L1-L140】
3. `OnboardingPermissions` valida os escopos obrigatórios, persiste o status no IndexedDB (`wl-db`) com timestamp e libera o dashboard apenas após confirmação. 【F:ui/src/components/onboarding/OnboardingPermissions.tsx†L1-L160】【F:ui/src/UploadHelper.ts†L1-L63】
- **Requisitos associados:** [REQ-003](../02-planejamento/requisitos-spec.md#req-003), [REQ-024](../02-planejamento/requisitos-spec.md#req-024), [REQ-025](../02-planejamento/requisitos-spec.md#req-025), [REQ-027](../02-planejamento/requisitos-spec.md#req-027).
- **Integração colaborativa:** o consentimento versionado é compartilhado com a trilha clínica prevista em [capacidade-diagnostico-colaborativo.md](../02-planejamento/capacidade-diagnostico-colaborativo-spec.md#governanca-de-consentimento) e alimenta auditorias médicas de [REQ-033](../02-planejamento/requisitos-spec.md#req-033).

### Fluxo 3 — Upload e Processamento de Exames
1. O usuário acessa `Upload.tsx` e seleciona arquivo; o componente mostra barra de progresso e opções de áudio. 【F:ui/src/Upload.tsx†L1-L188】【F:prototype/dashboard-visao-geral.html†L20-L120】
2. A função `submitPdf` envia o arquivo para `/diagnostics/submit` com `generateAudio` e `voiceID`. 【F:ui/src/UploadHelper.ts†L40-L154】【F:api/src/diagnostics/diagnostics.controller.ts†L33-L120】
3. Caso a API falhe, o helper salva o arquivo no IndexedDB e marca o item como `pending` para retry manual. 【F:ui/src/UploadHelper.ts†L63-L154】
4. A resposta bem-sucedida retorna resumo clínico, URLs de laudo e áudio; os dados alimentam a fila e histórico.
- **Requisitos associados:** [REQ-004](../02-planejamento/requisitos-spec.md#req-004), [REQ-005](../02-planejamento/requisitos-spec.md#req-005), [REQ-011](../02-planejamento/requisitos-spec.md#req-011), [REQ-015](../02-planejamento/requisitos-spec.md#req-015).
- **Integração colaborativa:** disponibiliza metadados necessários para roteamento de especialistas em [REQ-032](../02-planejamento/requisitos-spec.md#req-032).

### Fluxo 4 — Atualização da Fila de Diagnósticos
1. `DiagnosticQueue` consulta storage local e fontes remotas (quando disponíveis) para montar a fila. 【F:ui/src/components/dashboard/DiagnosticQueue.tsx†L1-L210】
2. Cada item exibe status (`processing`, `success`, `error`, `pending`) com badges e ações contextuais (retry, compartilhar, baixar). 【F:prototype/dashboard-fila.html†L120-L248】
3. O usuário pode disparar “Tentar novamente” para itens com erro, reutilizando `submitPdf` com o arquivo persistido.
4. Atualizações são refletidas em tempo real na UI com animações ≤ 200 ms e mensagens de feedback.
- **Requisitos associados:** [REQ-006](../02-planejamento/requisitos-spec.md#req-006), [REQ-007](../02-planejamento/requisitos-spec.md#req-007), [REQ-008](../02-planejamento/requisitos-spec.md#req-008), [REQ-016](../02-planejamento/requisitos-spec.md#req-016).
- **Integração colaborativa:** a fila alimenta dashboards compartilhados definidos em [REQ-034](../02-planejamento/requisitos-spec.md#req-034) e registra eventos para observabilidade exigida em [REQ-044](../02-planejamento/requisitos-spec.md#req-044).

### Fluxo 5 — Geração e Reprodução de Áudio
1. Ao marcar “Gerar áudio”, `Upload.tsx` envia flag `generateAudio=true`; a API processa ElevenLabs e retorna `audioUrl`. 【F:ui/src/Upload.tsx†L120-L188】【F:api/src/diagnostics/diagnostics.controller.ts†L121-L189】
2. O dashboard apresenta player com controles de play/pause, tempo corrente e barra de progresso. 【F:prototype/dashboard-visao-geral.html†L80-L160】
3. Falhas na geração exibem alerta com sugestão de retry ou contato com suporte clínico.
- **Requisitos associados:** [REQ-006](../02-planejamento/requisitos-spec.md#req-006), [REQ-007](../02-planejamento/requisitos-spec.md#req-007), [REQ-015](../02-planejamento/requisitos-spec.md#req-015).

### Fluxo 6 — Compartilhamento de Resultados
1. O usuário seleciona diagnóstico concluído e insere e-mail ou telefone em campo validado. 【F:prototype/dashboard-visao-geral.html†L140-L200】
2. O sistema envia requisição ao serviço de notificações (a ser integrado) e registra log local para auditoria. 【F:prototype/diagnostico-operacao.html†L68-L120】
3. Após confirmação, a UI exibe toast de sucesso e atualiza histórico de envios.
- **Requisitos associados:** [REQ-007](../02-planejamento/requisitos-spec.md#req-007), [REQ-008](../02-planejamento/requisitos-spec.md#req-008), [REQ-009](../02-planejamento/requisitos-spec.md#req-009), [REQ-030](../02-planejamento/requisitos-spec.md#req-030).
- **Integração colaborativa:** notificações ficam disponíveis para equipes médicas via relatórios unificados descritos em [REQ-044](../02-planejamento/requisitos-spec.md#req-044).

### Fluxo 7 — Monitoramento e Status da Plataforma
1. `DashboardOverview` agrega métricas (total de diagnósticos, tempo médio, status de serviços) a partir de dados retornados pela API. 【F:ui/src/components/dashboard/DashboardOverview.tsx†L1-L222】
2. Indicadores de saúde da API, fila e áudio refletem estados `online`, `lento` ou `indisponível`, com cores alinhadas ao design system. 【F:prototype/dashboard-visao-geral.html†L120-L220】
3. Alertas críticos geram banners persistentes até resolução documentada.
- **Requisitos associados:** [REQ-006](../02-planejamento/requisitos-spec.md#req-006), [REQ-009](../02-planejamento/requisitos-spec.md#req-009), [REQ-015](../02-planejamento/requisitos-spec.md#req-015), [REQ-016](../02-planejamento/requisitos-spec.md#req-016).
- **Integração colaborativa:** métricas são reutilizadas nos painéis de qualidade previstos em [REQ-034](../02-planejamento/requisitos-spec.md#req-034).

### Fluxo 8 — Integração da Extensão Chrome (Novo)
1. **Onboarding da Extensão:** `extension/src/components/Onboarding.tsx` apresenta fluxo Welcome → Consent → Permissions → Complete com sincronização via IndexedDB.
2. **Sidepanel Integration:** `extension/src/sidepanel/App.tsx` oferece acesso rápido ao upload de exames e visualização de fila sem sair da página atual.
3. **Background Sync:** `extension/src/background/` mantém sincronização com API e gerencia notificações de status de diagnósticos.
4. **Storage Integration:** `extension/src/storage/` persiste dados localmente e sincroniza com a aplicação web principal.
- **Requisitos associados:** [REQ-010](../02-planejamento/requisitos-spec.md#req-010), [REQ-018](../02-planejamento/requisitos-spec.md#req-018), [REQ-020](../02-planejamento/requisitos-spec.md#req-020).
- **Integração colaborativa:** garante que o sidepanel compartilhe estado com o cockpit clínico descrito em [capacidade-diagnostico-colaborativo.md](../02-planejamento/capacidade-diagnostico-colaborativo-spec.md#cockpit-clinico-integrado).

<a id="fluxo-9-notificacoes-omnicanal"></a>
### Fluxo 9 — Notificações Omnicanal (Implementado)
#### Componentes responsáveis
- **API NestJS:** `api/src/notifications/notifications.controller.ts` expõe rotas REST e integra-se ao `NotificationService` para envio, rastreio e retentativas. 【F:api/src/notifications/notifications.controller.ts†L1-L204】
- **Serviço de Notificações:** `api/src/notifications/notification.service.ts` aplica templates, registra logs estruturados e gerencia histórico em memória com `trackId`. 【F:api/src/notifications/notification.service.ts†L1-L139】【F:api/src/notifications/notification.service.ts†L178-L211】
- **Fluxo de Onboarding:** `api/src/onboarding/onboarding.service.ts` dispara eventos (`user_registered`, `account_approved`, `diagnostic_ready`) utilizando o serviço para e-mail e WhatsApp mock. 【F:api/src/onboarding/onboarding.service.ts†L39-L164】
- **Requisitos associados:** [REQ-007](../02-planejamento/requisitos-spec.md#req-007), [REQ-009](../02-planejamento/requisitos-spec.md#req-009), [REQ-022](../02-planejamento/requisitos-spec.md#req-022), [REQ-023](../02-planejamento/requisitos-spec.md#req-023).
- **Integração colaborativa:** garante a trilha de notificações exigida pelo cockpit clínico descrito em [capacidade-diagnostico-colaborativo.md](../02-planejamento/capacidade-diagnostico-colaborativo-spec.md#fluxos-de-comunicacao) e sincroniza alertas médicos planejados em [REQ-034](../02-planejamento/requisitos-spec.md#req-034).

#### Endpoints transacionais (`/notifications`)
- `POST /notifications/trigger` — Dispara notificações por evento. Exemplo:

  ```json
  {
    "event": "user_registered",
    "recipients": ["user@example.com"],
    "context": {
      "userEmail": "user@example.com",
      "userName": "João Silva",
      "companyName": "MBRA",
      "registrationDate": "2025-10-20T15:30:00Z"
    }
  }
  ```

  Resposta esperada:

  ```json
  {
    "success": true,
    "trackId": "uuid-track-id",
    "message": "Notification triggered successfully",
    "timestamp": "2025-10-20T15:30:00Z"
  }
  ```

- `POST /notifications/whatsapp` — Envia mensagens mockadas para WhatsApp com rastreabilidade.
- `GET /notifications/history` — Lista histórico, permitindo auditoria cruzada com `req/06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade.md#catalogo-de-relatorios-automatizados`.
- `GET /notifications/track/:trackId` — Recupera status individual.
- `POST /notifications/retry/:trackId` — Reexecuta envios com falha para manter SLA clínico.

#### Variáveis de ambiente obrigatórias
- `ADMIN_EMAIL`, `DASHBOARD_URL`, `ADMIN_URL` — Referenciadas no fluxo de onboarding para notificar usuários e administradores. 【F:api/src/onboarding/onboarding.service.ts†L47-L107】
- `NOTIFICATION_DEFAULT_COMPANY_NAME`, `NOTIFICATION_DEFAULT_DASHBOARD_URL`, `NOTIFICATION_DEFAULT_ADMIN_URL` — Usadas como fallback nos templates de e-mail. 【F:api/src/notifications/notification.service.ts†L115-L211】
- `EMAIL_NOTIFY_LOG_TEMPLATE`, `MESSAGE_PREFIX` — Formatam logs estruturados e IDs gerados pelo controlador legado de e-mail. 【F:api/src/email/email-notify.controller.ts†L52-L84】
- **Requisitos associados:** [REQ-007](../02-planejamento/requisitos-spec.md#req-007), [REQ-009](../02-planejamento/requisitos-spec.md#req-009), [REQ-022](../02-planejamento/requisitos-spec.md#req-022), [REQ-023](../02-planejamento/requisitos-spec.md#req-023).
- **Integração colaborativa:** logs e envios são anexados às auditorias clínicas previstas em [REQ-044](../02-planejamento/requisitos-spec.md#req-044) e suportam governança descrita na [capacidade colaborativa](../02-planejamento/capacidade-diagnostico-colaborativo-spec.md#observabilidade-clinica).

#### Testes e monitoramento
- `npm run test -- --testPathPattern="notifications|onboarding"` executa suites Jest localizadas em `api/src/notifications/notifications.controller.spec.ts` e `api/src/onboarding/onboarding.controller.spec.ts`, validando gatilhos e respostas. 【F:api/src/notifications/notifications.controller.spec.ts†L1-L52】【F:api/src/onboarding/onboarding.controller.spec.ts†L1-L110】
- `api/src/onboarding/onboarding.integration.spec.ts` cobre jornada ponta a ponta, garantindo que eventos gerem notificações com variáveis corretas. 【F:api/src/onboarding/onboarding.integration.spec.ts†L1-L188】
- `api/src/endpoints.integration.spec.ts` monitora contratos HTTP (`/notify/email`, `/notify/whatsapp`) e valida formatos, contribuindo para alertas nos pipelines `test.yml`. 【F:api/src/endpoints.integration.spec.ts†L260-L332】
- Logs estruturados ficam disponíveis via `Logger` em `NotificationsController` e `NotificationService`, além da formatação de `EMAIL_NOTIFY_LOG_TEMPLATE`, permitindo auditoria de disparos e resultados. 【F:api/src/notifications/notifications.controller.ts†L24-L130】【F:api/src/notifications/notification.service.ts†L68-L139】【F:api/src/email/email-notify.controller.ts†L52-L84】

## Padrões Estruturais Obrigatórios para Novos Fluxos

### React oficial (Meta)
- **Definição:** adotamos exclusivamente o pacote `react` mantido pela Meta e sua API oficial (hooks, context, suspense) em todas as jornadas. Isso elimina forks experimentais e garante compatibilidade direta com o ecossistema de tipagem, testes e acessibilidade. 【F:AGENTS.md†L130-L160】
- **Impacto para novas features:** qualquer fluxo adicional deve ser entregue como componente React funcional, aproveitando os hooks de estado/efeito oficiais e evitando abstrações que fujam às APIs suportadas. Integrações com helpers e IndexedDB devem respeitar os padrões definidos em `OnboardingFlow` e `UploadHelper` para preservar rastreabilidade. 【F:ui/src/components/onboarding/OnboardingFlow.tsx†L1-L200】【F:ui/src/UploadHelper.ts†L1-L154】
- **Requisitos associados:** [REQ-018](../02-planejamento/requisitos-spec.md#req-018), [REQ-020](../02-planejamento/requisitos-spec.md#req-020).

### Feature-Sliced Design (FSD)
- **Definição:** a camada de UI segue o FSD, organizando código por domínio (`features/`, `entities/`, `shared/`) e mantendo isolamento de responsabilidades. Dentro do repositório, essa convenção se traduz em diretórios `ui/src/components/<feature>` com boundaries explícitos entre onboarding, approval, dashboard e comunicação. 【F:req/02-design/componentes.md†L20-L80】
- **Impacto para novas features:** ao introduzir novos fluxos, crie fatias específicas (ex.: `components/compliance/`) com estados, helpers e contratos encapsulados. Crossovers entre fatias exigem documentação na req e atualização imediata do `AGENTS.md` para manter a rastreabilidade FSD. 【F:AGENTS.md†L130-L160】
- **Requisitos associados:** [REQ-018](../02-planejamento/requisitos-spec.md#req-018), [REQ-019](../02-planejamento/requisitos-spec.md#req-019).

### Atomic Design
- **Definição:** componentes são classificados como átomos (inputs, botões), moléculas (cards, listas) e organismos (fluxos completos), reforçando reutilização incremental. Os passos de onboarding e os cards de dashboard exemplificam essa hierarquia. 【F:req/02-design/componentes.md†L60-L140】
- **Impacto para novas features:** cada incremento deve mapear quais átomos existentes serão reutilizados e quais organismos precisam ser documentados. A ausência dessa análise bloqueia aprovação de PRs, uma vez que atomicidade incorreta gera inconsistências visuais e viola a governança 60-30-10. 【F:req/06-governanca-tecnica-e-controle-de-qualidade/controle-de-qualidade.md†L53-L78】
- **Requisitos associados:** [REQ-016](../02-planejamento/requisitos-spec.md#req-016), [REQ-018](../02-planejamento/requisitos-spec.md#req-018).

Para detalhes complementares e lista de componentes por fatia, consulte [Componentes do Sistema](componentes-spec.md#padroes-estruturais-obrigatorios).

## Referências Cruzadas Entre Componentes

### API ↔ UI Integration
- `api/src/diagnostics/` ↔ `ui/src/Upload.tsx`, `ui/src/UploadHelper.ts`
- `api/src/onboarding/` ↔ `ui/src/components/onboarding/OnboardingFlow.tsx`, `ui/src/components/onboarding/OnboardingConsent.tsx`
- `api/src/admin/` ↔ `ui/src/AdminApprovals.tsx`, `ui/src/ApprovalHelper.ts`

### Extension ↔ Web App Integration  
- `extension/src/storage/` ↔ `ui/src/UploadHelper.ts` (IndexedDB sync)
- `extension/src/sidepanel/` ↔ `ui/src/Dashboard.tsx` (interface consistency)
- `extension/src/messaging/` ↔ `ui/src/` (runtime messaging)

### Compliance & Governance Integration
- Todos os fluxos implementam auditoria conforme `AGENTS.md` (60-30-10, UX Writing, 8pt Grid)
- Notificações seguem diretrizes LGPD documentadas em `req/00-visao/lgpd.md`
- Métricas e logs seguem padrões definidos em `req/06-governanca-tecnica-e-controle-de-qualidade/revisoes-com-ia.md` e `req/06-governanca-tecnica-e-controle-de-qualidade/`

[Voltar ao índice](README-spec.md)
