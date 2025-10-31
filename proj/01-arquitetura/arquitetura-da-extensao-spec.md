<!-- req/01-arquitetura/arquitetura-da-extensao.md -->
# Arquitetura da Plataforma Yagnostic

> Base: [./arquitetura-da-extensao.md](./arquitetura-da-extensao.md)
> Plano: [/docs/plans/20251025093000-evolucao-req-spec.md](/docs/plans/20251025093000-evolucao-req-spec.md)
> Changelog: [/CHANGELOG.md#2025-10-25](/CHANGELOG.md#2025-10-25)
> Referências correlatas: [Arquitetura da extensão](/req/01-arquitetura/arquitetura-da-extensao-spec.md) · [Design geral](/req/02-design/design-geral-spec.md) · [Testes end-to-end](/req/04-testes-e-validacao/testes-end-to-end-spec.md)

A versão 5 da plataforma Yagnostic substitui o protótipo isolado por uma solução integrada composta por um front-end React (diretório `ui/`) e uma API NestJS (diretório `api/`). O objetivo é garantir rastreabilidade clínica desde o upload do exame até a entrega do laudo e do áudio gerado por IA, respeitando bloqueios administrativos e consentimentos obrigatórios. 【F:ui/src/App.tsx†L1-L79】【F:api/src/diagnostics/diagnostics.controller.ts†L1-L120】

---

## Atualizações para novos requisitos

- **Requisitos funcionais:** detalhe aqui os componentes afetados, integrações necessárias e decisões arquiteturais sempre que um novo `REQ-###` for criado. Sincronize `arquitetura-da-extensao.md` e este espelho com links para fluxos (`../02-design/fluxos.md`) e implementação (`../03-implementacao/estrutura-de-projeto.md`).
- **Requisitos não funcionais:** registre restrições técnicas, SLAs e políticas de segurança decorrentes de novos RNFs. Aponte dependências com `requisitos-nao-funcionais.md`/`requisitos-nao-funcionais-spec.md`, métricas (`../04-qualidade-testes/qualidade-e-metricas.md`) e governança (`../06-governanca-tecnica-e-controle-de-qualidade/controle-de-qualidade.md`).
- **Rastreabilidade:** mencione os IDs de requisitos envolvidos, a atualização correspondente no `CHANGELOG.md` e o protocolo de auditoria (`req/audit-history.md`).

---

## Visão Geral das Camadas
- **Aplicação Web (React + Vite)** — entrega as jornadas de aprovação, onboarding LGPD, upload de exames, dashboard operacional e fila de diagnósticos. Os componentes React consomem helpers tipados para IndexedDB e branding, mantendo consistência com o protótipo navegável. 【F:ui/src/components/approval/ApprovalStatus.tsx†L1-L173】【F:ui/src/components/dashboard/DashboardOverview.tsx†L1-L222】
- **API Médica (NestJS)** — expõe endpoints REST autenticados responsáveis por processar exames (`/diagnostics/submit`), gerar áudio (`/diagnostics/audio`) e fornecer configuração white-label, garantindo logging e validações clínicas. 【F:api/src/diagnostics/diagnostics.controller.ts†L33-L134】【F:api/src/diagnostics/diagnostics.service.ts†L21-L199】
- **Provas de conceito de branding** — os tokens consumidos pelo React são derivados do protótipo em `prototype/`, permitindo auditoria visual (regra 60-30-10) e personalização por tenant. 【F:prototype/dashboard-visao-geral.html†L1-L120】【F:prototype/branding.js†L1-L132】

## Fluxo Clínico End-to-End
1. **Login e Aprovação** — o usuário autentica no front-end e tem o acesso bloqueado até concluir a triagem administrativa. O helper `ApprovalHelper` verifica o status remoto ou aplica o fallback local controlado. 【F:ui/src/Login.tsx†L1-L93】【F:ui/src/ApprovalHelper.ts†L1-L86】
2. **Onboarding LGPD** — após aprovação, o módulo `OnboardingFlow` registra consentimentos e permissões obrigatórias antes de liberar os dashboards. 【F:ui/src/components/onboarding/OnboardingFlow.tsx†L1-L200】【F:prototype/onboarding-consentimento.html†L1-L80】
3. **Upload e Processamento** — `Upload.tsx` e `UploadHelper.ts` enviam exames em PDF para o endpoint `/diagnostics/submit`, armazenando cópias e respostas em IndexedDB (`wl-db`) quando a API estiver indisponível. 【F:ui/src/Upload.tsx†L1-L188】【F:ui/src/UploadHelper.ts†L1-L154】
4. **Geração de Diagnóstico** — a API valida tamanho do arquivo, executa prompts médicos e pode gerar áudio opcional via ElevenLabs. Os resultados retornam URLs de arquivo, áudio e PDF clínico. 【F:api/src/diagnostics/diagnostics.controller.ts†L33-L120】【F:api/src/diagnostics/dto/diagnostic-response.dto.ts†L1-L63】
5. **Dashboard e Fila** — a visão geral e a fila replicam o protótipo navegável, exibindo métricas, estados de processamento e ações de retry ou compartilhamento. 【F:ui/src/components/dashboard/DashboardOverview.tsx†L1-L222】【F:prototype/dashboard-fila.html†L120-L248】
6. **Distribuição e Histórico** — itens concluídos podem ser compartilhados via e-mail ou WhatsApp, com status rastreável e registros de auditoria exigidos pela governança. 【F:prototype/diagnostico-operacao.html†L1-L120】【F:req/06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade.md†L31-L104】

## Componentes Front-end Relevantes
- **Shell de Aplicação (`App.tsx`)** — organiza as rotas principais (Aprovação, Onboarding, Upload, Dashboard) e injeta contexto de branding carregado a partir do helper dedicado. 【F:ui/src/App.tsx†L1-L79】【F:ui/src/BrandingHelper.ts†L1-L160】
- **ApprovalStatus** — renderiza telas para estados `PENDING`, `REJECTED` e `APPROVED`, alinhadas ao protótipo administrativo. 【F:ui/src/components/approval/ApprovalStatus.tsx†L1-L173】【F:prototype/aguardando-aprovacao.html†L1-L80】
- **Onboarding Flow** — componentes de consentimento e permissões aplicam as obrigações LGPD antes de liberar o upload. 【F:ui/src/components/onboarding/OnboardingConsent.tsx†L1-L160】【F:prototype/consentimento-completo.html†L1-L92】
- **DashboardOverview / DiagnosticQueue** — exibem métricas, cards operacionais e lista de diagnósticos com estados de erro, sucesso e processamento. 【F:ui/src/components/dashboard/DashboardOverview.tsx†L1-L222】【F:ui/src/components/dashboard/DiagnosticQueue.tsx†L1-L210】
- **UploadHelper** — controla IndexedDB `wl-db` com stores versionadas, garantindo resiliência offline e simulação em modo demo. 【F:ui/src/UploadHelper.ts†L1-L154】

## Padrões Arquiteturais da UI
- **React oficial:** a camada de apresentação opera unicamente com o pacote oficial da Meta, garantindo suporte a hooks, suspense e integrações futuras com SSR. Qualquer exceção deve ser documentada como risco bloqueador. 【F:req/02-design/componentes.md†L120-L150】
- **Feature-Sliced Design:** diretórios `ui/src/components/<feature>` definem boundaries arquiteturais que se conectam aos fluxos descritos nesta seção; alterações requerem atualização sincronizada da req e do `AGENTS.md`. 【F:req/02-design/fluxos.md†L96-L115】【F:AGENTS.md†L130-L160】
- **Atomic Design:** organismos (ex.: `OnboardingFlow`, `DashboardOverview`) são compostos por moléculas e átomos reutilizáveis, assegurando consistência visual. Expansões precisam mapear a hierarquia e anexar análise ao changelog normativo. 【F:req/02-design/componentes.md†L138-L150】

## Serviços Backend e Contratos
- **DiagnosticsController** — implementa validação de arquivos (10 MB), geração de áudio e logging contextual, retornando `DiagnosticResponseDto` com URLs de laudo e áudio. 【F:api/src/diagnostics/diagnostics.controller.ts†L33-L134】【F:api/src/diagnostics/dto/diagnostic-response.dto.ts†L1-L63】
- **DiagnosticsService** — encapsula prompts médicos, geração de PDF e integração ElevenLabs, permitindo rastreamento clínico completo. 【F:api/src/diagnostics/diagnostics.service.ts†L21-L199】
- **Configuração e Debug** — endpoints auxiliares (`/config`, `/debug/env`) entregam dados de branding, limites de upload e informações de ambiente para o front-end. 【F:api/src/app.controller.ts†L35-L123】

## Regras de Acesso e Segurança
- Apenas contas aprovadas acessam o dashboard; estados de bloqueio espelham as telas `aguardando-aprovacao` e `login-aguardando-aprovacao`. 【F:prototype/login-aguardando-aprovacao.html†L1-L120】
- Consentimento versionado é pré-requisito para liberar diagnósticos, com persistência em IndexedDB e logs para auditoria. 【F:ui/src/components/onboarding/OnboardingFlow.tsx†L1-L200】【F:prototype/onboarding-permissoes.html†L1-L88】
- Tokens médicos e branding são carregados via `BrandingHelper` e replicam `branding.js`, garantindo coesão white-label. 【F:ui/src/BrandingHelper.ts†L1-L160】【F:prototype/branding.js†L1-L132】

## Resiliência e Observabilidade
- IndexedDB (`wl-db`) armazena uploads, branding e consentimentos; `DB_VERSION = 2` garante migrações controladas. 【F:ui/src/UploadHelper.ts†L1-L63】【F:ui/src/BrandingHelper.ts†L1-L160】
- Logs de diagnóstico registram duração das requisições, parâmetros e eventuais erros, suportando auditorias médicas. 【F:api/src/diagnostics/diagnostics.controller.ts†L69-L120】
- O front-end exibe banners e estados vazios alinhados ao protótipo quando a API falhar ou retornar dados inconsistentes. 【F:ui/src/components/dashboard/DiagnosticQueue.tsx†L150-L210】【F:prototype/dashboard-fila.html†L180-L248】

[Voltar ao índice](README-spec.md)
