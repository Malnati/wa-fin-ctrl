<!-- req/01-arquitetura/integracoes-com-apis.md -->
# Integrações com APIs

> Base: [./integracoes-com-apis.md](./integracoes-com-apis.md)
> Plano: [/docs/plans/20251025093000-evolucao-req-spec.md](/docs/plans/20251025093000-evolucao-req-spec.md)
> Changelog: [/CHANGELOG.md#2025-10-25](/CHANGELOG.md#2025-10-25)
> Referências correlatas: [Arquitetura da extensão](/req/01-arquitetura/arquitetura-da-extensao-spec.md) · [Design geral](/req/02-design/design-geral-spec.md) · [Testes end-to-end](/req/04-testes-e-validacao/testes-end-to-end-spec.md)

A versão 5 da plataforma opera sobre endpoints NestJS versionados e autenticados que suportam upload de exames, geração de áudio, distribuição de configurações e monitoramento clínico. Este documento detalha contratos, ambientes e obrigações de segurança consumidos pelos apps React e pelos protótipos navegáveis. 【F:api/src/diagnostics/diagnostics.controller.ts†L1-L134】【F:ui/src/Upload.tsx†L1-L188】

---

## Atualizações quando requisitos afetarem integrações

- **Requisitos funcionais:** descreva novos contratos, parâmetros e sequências aqui sempre que um `REQ-###` introduzir ou alterar integrações. Atualize o arquivo base e este espelho em conjunto com `arquitetura-da-extensao.md` e `../02-design/fluxos.md`.
- **Requisitos não funcionais:** documente requisitos de segurança, latência ou disponibilidade exigidos por RNFs, alinhando métricas com `../04-qualidade-testes/qualidade-e-metricas.md` e testes com `../04-testes-e-validacao/criterios-de-aceitacao.md`.
- **Rastreabilidade:** vincule as mudanças ao catálogo (`../02-planejamento/requisitos.md`), ao `CHANGELOG.md` e ao registro em `req/audit-history.md`.

---

## Ambientes Homologados
- **DEV** — sandbox interno apontando para `https://yagnostic-dev.mbra.com.br`, com geração de laudos simulada e ElevenLabs desativado por padrão.
- **HML** — ambiente de homologação integrado ao pipeline de QA, habilitando geração de áudio sob credenciais de teste controladas.
- **PRD** — produção médica com políticas de retenção e auditoria completas. Todas as chamadas exigem consentimento LGPD registrado e aprovação administrativa prévia. 【F:api/src/app.controller.ts†L35-L123】【F:prototype/aguardando-aprovacao.html†L1-L80】

## Endpoints Principais
| Endpoint | Método | Descrição | Consumidores |
| --- | --- | --- | --- |
| `/diagnostics/submit` | `POST` multipart | Recebe arquivo (≤ 10 MB) com flags `generateAudio` e `voiceID`, processa prompts médicos e retorna laudo + URLs. | `Upload.tsx`, `UploadHelper.ts`, Dashboard 【F:api/src/diagnostics/diagnostics.controller.ts†L33-L120】【F:ui/src/UploadHelper.ts†L40-L115】|
| `/diagnostics/audio` | `POST` JSON | Gera áudio ElevenLabs para texto clínico, registrando custos e metadados. | Painel de diagnóstico, automações administrativas 【F:api/src/diagnostics/diagnostics.controller.ts†L121-L189】【F:prototype/diagnostico-operacao.html†L68-L120】|
| `/config` | `GET` | Entrega branding, opções de voz, limites de upload e feature flags. | `BrandingHelper.ts`, onboarding LGPD 【F:api/src/app.controller.ts†L35-L123】【F:ui/src/BrandingHelper.ts†L1-L160】|
| `/debug/env` | `GET` | Exibe variáveis não sensíveis para suporte, auditadas pela governança. | Ferramentas internas, pipelines 【F:api/src/app.controller.ts†L83-L123】|
| `/approval/status` | `GET` (planejado) | Retornará status administrativo para liberar o dashboard. Enquanto não existir, `ApprovalHelper` aplica fallback local. | `ApprovalHelper.ts`, telas de bloqueio 【F:ui/src/ApprovalHelper.ts†L1-L86】【F:prototype/administracao-liberacao.html†L1-L120】|

## Autenticação e Governança
- Todas as requisições enviadas pelos apps React devem incluir cabeçalho `Authorization: Bearer <JWT>` emitido pelo provedor corporativo. Validações de token são obrigatórias antes do processamento. 【F:api/src/diagnostics/diagnostics.controller.ts†L51-L120】
- O acesso ao dashboard é negado até que `ApprovalHelper` retorne `APPROVED`. Estados intermediários exibem telas `PENDING` ou `REJECTED` com instruções de suporte. 【F:ui/src/components/approval/ApprovalStatus.tsx†L1-L173】
- Consentimento LGPD precisa ser persistido e enviado junto às requisições críticas (upload, áudio), garantindo rastreabilidade. 【F:ui/src/components/onboarding/OnboardingFlow.tsx†L1-L200】【F:prototype/onboarding-consentimento.html†L1-L80】

## Tratamento de Erros e Resiliência
- O front-end mantém fila local no IndexedDB (`wl-db`) para reprocessar uploads quando a API estiver indisponível, preservando metadados do arquivo. 【F:ui/src/UploadHelper.ts†L1-L115】
- A API registra logs estruturados com duração, tipo de arquivo e exceções, permitindo correlação com relatórios médicos. 【F:api/src/diagnostics/diagnostics.controller.ts†L69-L120】
- Estados de erro exibem banners e ações de retry alinhadas ao protótipo `dashboard-fila.html`, evitando perda de contexto clínico. 【F:ui/src/components/dashboard/DiagnosticQueue.tsx†L150-L210】【F:prototype/dashboard-fila.html†L180-L248】

## Padrões Arquiteturais Obrigatórios
- **React oficial:** integrações precisam assumir que o front-end consome as APIs usando React oficial; camadas de compatibilidade ou libs alternativas não são suportadas e devem ser tratadas como riscos. 【F:req/02-design/componentes.md†L120-L150】
- **Feature-Sliced Design:** endpoints devem respeitar limites definidos pelas fatias `components/<feature>`, evitando APIs que obriguem acoplamento indevido entre domínios. Novos contratos precisam ser documentados com a fatia correspondente. 【F:req/02-design/fluxos.md†L96-L115】
- **Atomic Design:** respostas das APIs devem considerar reutilização de átomos/moléculas existentes (ex.: cards, listas), garantindo que novos dados possam ser apresentados sem quebrar organismos já definidos. 【F:req/02-design/componentes.md†L138-L150】

## LGPD e Minimização de Dados
- PDFs originais não permanecem armazenados no front-end; apenas referências e resultados são retidos no IndexedDB e na API conforme políticas internas. 【F:ui/src/UploadHelper.ts†L1-L115】
- Consentimentos e aprovações são versionados para auditoria, e qualquer revogação bloqueia imediatamente novos uploads. 【F:ui/src/components/onboarding/OnboardingConsent.tsx†L1-L160】
- Dados sensíveis expostos em dashboards utilizam estados mascarados ou informações agregadas, respeitando as diretrizes de UX. 【F:prototype/dashboard-visao-geral.html†L1-L120】

## Próximos Passos de Integração
- Implementar endpoint real `/approval/status` com webhook de notificação, substituindo o fallback local documentado.
- Criar API de fila administrativa para sincronizar dashboards com dados reais, mantendo paridade com os protótipos de RF-025.
- Expor métricas de consumo do ElevenLabs e limites de upload para monitoramento em tempo real no dashboard de status. 【F:prototype/dashboard-visao-geral.html†L120-L220】【F:api/src/diagnostics/diagnostics.service.ts†L127-L199】

[Voltar ao índice](README-spec.md)
