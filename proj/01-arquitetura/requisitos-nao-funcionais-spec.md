<!-- req/01-arquitetura/requisitos-nao-funcionais.md -->
# Requisitos Não Funcionais

> Base: [./requisitos-nao-funcionais.md](./requisitos-nao-funcionais.md)
> Plano: [/docs/plans/20251025093000-evolucao-req-spec.md](/docs/plans/20251025093000-evolucao-req-spec.md)
> Changelog: [/CHANGELOG.md#2025-10-25](/CHANGELOG.md#2025-10-25)
> Referências correlatas: [Arquitetura da extensão](/req/01-arquitetura/arquitetura-da-extensao-spec.md) · [Design geral](/req/02-design/design-geral-spec.md) · [Testes end-to-end](/req/04-testes-e-validacao/testes-end-to-end-spec.md)

A etapa 5 consolida requisitos transversais de segurança, privacidade, desempenho e governança para o front-end React e a API NestJS da plataforma Yagnostic. Eles derivam dos protótipos navegáveis, dos helpers já implementados e das obrigações clínicas registradas na governança MBRA. 【F:prototype/dashboard-visao-geral.html†L1-L220】【F:ui/src/UploadHelper.ts†L1-L154】【F:api/src/diagnostics/diagnostics.controller.ts†L33-L189】

---

## Atualização contínua de RNFs

- Registre cada novo requisito não funcional em `req/02-planejamento/requisitos.md`/`requisitos-spec.md` com o identificador `RNF-###` antes de detalhá-lo aqui.
- Descreva impactos técnicos, SLAs, políticas de segurança e dependências de infraestrutura neste arquivo e em `arquitetura-da-extensao.md`/`arquitetura-da-extensao-spec.md`.
- Aponte métricas correspondentes em `../04-qualidade-testes/qualidade-e-metricas.md` e cenários de validação em `../04-testes-e-validacao/criterios-de-aceitacao.md`.
- Vincule a atualização ao changelog e ao registro de auditoria (`req/audit-history.md`), citando o requisito e as métricas monitoradas.

---

## Segurança
- Todas as requisições autenticadas por JWT devem validar formato e expiração antes de liberar processamento; falhas geram logs e mensagens discretas. 【F:api/src/diagnostics/diagnostics.controller.ts†L69-L120】
- Uploads aceitam apenas arquivos até 10 MB e bloqueiam mimetypes não suportados, evitando execuções arbitrárias. 【F:api/src/diagnostics/diagnostics.controller.ts†L51-L120】
- Telas de bloqueio (`ApprovalStatus`) impedem acesso ao dashboard enquanto aprovação e consentimento não forem concluídos. 【F:ui/src/components/approval/ApprovalStatus.tsx†L1-L173】
- Dados clínicos exibidos são mascarados ou agregados conforme persona, mitigando exposição desnecessária. 【F:prototype/dashboard-fila.html†L120-L248】

## Privacidade (LGPD)
- Consentimentos versionados são coletados antes de qualquer processamento e armazenados com carimbo de data/hora. 【F:ui/src/components/onboarding/OnboardingConsent.tsx†L1-L160】
- PDFs originais não permanecem no dispositivo; apenas metadados e laudos processados são retidos em IndexedDB (`wl-db`). 【F:ui/src/UploadHelper.ts†L1-L115】
- Logs devem omitir informações identificáveis, restringindo-se a identificadores técnicos e status de processamento. 【F:api/src/diagnostics/diagnostics.controller.ts†L69-L120】

## Desempenho
- Upload e fallback local precisam concluir persistência em IndexedDB em menos de 1,5 s para arquivos até 10 MB. 【F:ui/src/UploadHelper.ts†L80-L154】
- Dashboard e fila devem atualizar indicadores sem travamentos perceptíveis, mantendo interações abaixo de 200 ms. 【F:ui/src/components/dashboard/DashboardOverview.tsx†L1-L222】
- Geração de áudio só é disparada quando solicitada pelo usuário, evitando custos indevidos e preservando latência. 【F:prototype/diagnostico-operacao.html†L68-L120】

## Confiabilidade e Resiliência
- Em caso de falha na API, uploads permanecem na fila local e exibem estado `error` com opção de retry. 【F:ui/src/components/dashboard/DiagnosticQueue.tsx†L150-L210】
- O sistema registra duração das chamadas de diagnóstico e áudio, permitindo alertas quando tempos excedem limites. 【F:api/src/diagnostics/diagnostics.controller.ts†L69-L189】
- Branding e configurações são carregados de `/config` e cacheados localmente, com invalidação automática ao alterar `DB_VERSION`. 【F:ui/src/BrandingHelper.ts†L1-L160】【F:api/src/app.controller.ts†L35-L123】

## Manutenibilidade
- Componentes React seguem padrões de estado centralizado e props tipadas (`SubmitResponse`, `ApprovalResponse`) para facilitar refatorações. 【F:ui/src/UploadHelper.ts†L27-L115】【F:ui/src/ApprovalHelper.ts†L1-L86】
- Serviços NestJS encapsulam regras em classes e DTOs independentes, permitindo testes unitários isolados. 【F:api/src/diagnostics/dto/diagnostic-response.dto.ts†L1-L63】【F:api/src/diagnostics/dto/audio-request.dto.ts†L1-L52】
- Documentação RUP deve ser atualizada a cada incremento (plano, changelog, relatórios) conforme políticas do `AGENTS.md`. 【F:AGENTS.md†L200-L333】

## Padrões Estruturais de Interface
- **React oficial:** requisitos não funcionais assumem uso de React oficial; dependências externas devem ser compatíveis com a API mantida pela Meta e aprovadas pela governança. 【F:req/02-design/componentes.md†L120-L150】
- **Feature-Sliced Design:** métricas de manutenibilidade exigem que componentes residam em fatias dedicadas (`components/<feature>`), evitando acoplamento e facilitando testes isolados. 【F:req/02-design/fluxos.md†L96-L115】
- **Atomic Design:** a hierarquia atômica deve ser preservada para reduzir complexidade cognitiva; NFRs avaliam se organismos reutilizam átomos existentes antes de introduzir novos. 【F:req/02-design/componentes.md†L138-L150】

## Acessibilidade e UX
- Regra cromática 60-30-10 aplicada a dashboards, onboarding e telas de bloqueio, com medições registradas em auditoria. 【F:prototype/dashboard-visao-geral.html†L1-L220】【F:req/06-governanca-tecnica-e-controle-de-qualidade/controle-de-qualidade.md†L33-L78】
- Microcopy clara orientando ações (“Gerar áudio”, “Revisar consentimento”) conforme diretrizes de UX Writing. 【F:prototype/onboarding-permissoes.html†L1-L88】
- Navegação por teclado e foco visível em botões, campos e cards, replicando os atributos do protótipo. 【F:prototype/dashboard-visao-geral.html†L1-L120】

## Portabilidade e Distribuição
- Build React gerado via Vite, com possibilidade de distribuição como SPA protegida por autenticação corporativa. 【F:ui/package.json†L1-L80】
- API NestJS containerizada e monitorada via Docker Compose unificado, respeitando limites documentados na governança. 【F:req/06-governanca-tecnica-e-controle-de-qualidade/revisoes-com-ia.md†L18-L110】
- Evidências de testes, medições de cor e relatórios de auditoria armazenadas em `docs/reports/` para inspeção da MBRA. 【F:req/06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade.md†L31-L104】

## Critérios de Conformidade
- Pipelines automatizados precisam validar lint, testes e auditorias 60-30-10 antes de liberar merges para `main`.
- Falhas de consentimento, aprovação ou segurança bloqueiam publicação até registro de correções no changelog oficial.
- Qualquer mudança em contratos de API deve atualizar esta seção e o plano de requisitos v5 para manter rastreabilidade. 【F:docs/plans/plan-ui-ux-requirements-v5.md†L88-L210】

[Voltar ao índice](README-spec.md)
