<!-- req/02-planejamento/milestones.md -->
# Milestones

> Base: [./milestones.md](./milestones.md)
> Plano: [/docs/plans/20251025093000-evolucao-req-spec.md](/docs/plans/20251025093000-evolucao-req-spec.md)
> Changelog: [/CHANGELOG.md#2025-10-25](/CHANGELOG.md#2025-10-25)
> Referências correlatas: [Arquitetura da extensão](/req/01-arquitetura/arquitetura-da-extensao-spec.md) · [Design geral](/req/02-design/design-geral-spec.md) · [Testes end-to-end](/req/04-testes-e-validacao/testes-end-to-end-spec.md)

Os marcos abaixo consolidam tanto a trilha administrativa-operacional original (RUP 2024) quanto a trilha colaborativa (REQ-031 a REQ-045). A convivência entre ambas garante continuidade das entregas herdadas e evolução regulatória do diagnóstico colaborativo. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L90-L388】

## Trilha Administrativa-Operacional (Legado RUP 2024)

Os marcos M1–M5 abaixo preservam escopo, nomenclatura e critérios originais documentados antes da inclusão da capacidade colaborativa.

### M1 — Aprovação Administrativa Conectada (RF-008)
- **Objetivo**: disponibilizar telas de aprovação e bloqueios alinhados ao protótipo `administracao-liberacao.html`, com fallback documentado até que o endpoint real esteja pronto. 【F:docs/prototype/administracao-liberacao.html†L1-L120】【F:ui/src/components/approval/ApprovalStatus.tsx†L1-L173】
- **Dependências**: autenticação funcional, definição dos estados `PENDING`, `REJECTED`, `APPROVED`, governança em `AGENTS.md`.
- **Critérios de Aceite**:
  - Login bloqueia acesso ao dashboard para contas não aprovadas. 【F:ui/src/Login.tsx†L1-L93】
  - Telas exibem instruções de contato e tempo médio de aprovação. 【F:docs/prototype/aguardando-aprovacao.html†L1-L80】
  - Logs registram tentativas de acesso e status retornado.
- **Evidências**: captura de tela dos estados, logs de fallback, checklist de microcopy aprovado pela governança.

### M2 — Onboarding LGPD com Consentimento Versionado
- **Objetivo**: implementar fluxo completo de consentimento e permissões antes do upload, conforme protótipo `onboarding-consentimento.html`. 【F:docs/prototype/onboarding-consentimento.html†L1-L80】【F:ui/src/components/onboarding/ConsentScreen.tsx†L1-L120】
- **Dependências**: M1 concluído, helpers IndexedDB (`wl-db`), textos validados por compliance.
- **Critérios de Aceite**:
  - Consentimento armazena versão, timestamp e operador autenticado. 【F:ui/src/components/onboarding/ConsentScreen.tsx†L80-L120】
  - Revogação bloqueia novos uploads até regularização.
  - Auditoria gera relatório “Conforme UX Writing” seguindo `AGENTS.md`.
- **Evidências**: gravação do fluxo, dump do IndexedDB com consentimento, relatório de revisão UX.

### M3 — Upload Clínico e Geração de Áudio (RF-008/RNF-007)
- **Objetivo**: habilitar upload de exames com opção de áudio, seguindo layout do dashboard e contrato `/diagnostics/submit`. 【F:docs/prototype/dashboard-visao-geral.html†L20-L120】【F:api/src/diagnostics/diagnostics.controller.ts†L33-L189】
- **Dependências**: M2 concluído, integração com `UploadHelper`, credenciais ElevenLabs configuradas em ambiente seguro.
- **Critérios de Aceite**:
  - Upload aceita arquivos até 10 MB, apresenta progresso e mensagens de confidencialidade. 【F:ui/src/Upload.tsx†L1-L188】
  - Fallback local salva arquivos e permite retry manual. 【F:ui/src/UploadHelper.ts†L63-L154】
  - Áudio opcional gera player funcional ou mensagem de indisponibilidade. 【F:docs/prototype/diagnostico-operacao.html†L68-L120】
- **Evidências**: testes manuais, logs da API com duração < 30 s, checklist de acessibilidade.

### M4 — Dashboard e Fila Operacional (RF-008/RNF-007)
- **Objetivo**: entregar visão geral, fila e ações rápidas conforme protótipos `dashboard-visao-geral.html` e `dashboard-fila.html`. 【F:docs/prototype/dashboard-visao-geral.html†L1-L220】【F:docs/prototype/dashboard-fila.html†L120-L248】
- **Dependências**: M3 concluído, mocks ou API real para métricas e fila, tokens de branding aplicados.
- **Critérios de Aceite**:
  - Cards exibem KPIs (total, sucesso, falhas, uploads do dia) com atualização periódica. 【F:ui/src/components/dashboard/DashboardOverview.tsx†L1-L222】
  - Fila apresenta ações contextuais (retry, compartilhar, baixar) e estados de erro tratados. 【F:ui/src/components/dashboard/DiagnosticQueue.tsx†L1-L210】
  - Regra cromática 60-30-10 auditada e documentada. 【F:docs/wiki/06-governanca-tecnica-e-controle-de-qualidade/controle-de-qualidade.md†L53-L78】
- **Evidências**: screenshot do dashboard, relatório 603010, checklist de microinterações.

### M5 — Comunicação e Relatórios Clínicos
- **Objetivo**: habilitar compartilhamento de resultados e templates de e-mail alinhados aos protótipos. 【F:docs/prototype/diagnostico-operacao.html†L68-L120】【F:docs/prototype/email-boas-vindas-pendente.html†L1-L140】
- **Dependências**: M4 concluído, políticas de LGPD aplicadas, canais de contato validados.
- **Critérios de Aceite**:
  - Botões de compartilhamento validam formato de e-mail/WhatsApp e exibem confirmações claras. 【F:docs/prototype/dashboard-visao-geral.html†L140-L200】
  - Templates incluem links de consentimento e status da aprovação. 【F:docs/prototype/email-aprovacao-conta.html†L1-L120】
  - Auditoria registra quem enviou cada comunicação (logs ou planilhas em `docs/reports/`). 【F:REPORTS.md†L24-L74】
- **Evidências**: amostras de e-mails/WhatsApp, screenshot da interface de envio, relatório de rastreabilidade.

## Trilha Colaborativa de Diagnóstico (REQ-031 a REQ-045)

A trilha colaborativa evolui os requisitos legados acrescentando REQ-031+ sem descontinuar os controles prévios. Sempre que houver sobreposição, aplicar primeiro os critérios M1–M5 legados e, em seguida, complementar com as capacidades colaborativas.

**Nota de Prioridade e Execução:**  
> "Aplicar primeiro os critérios M1–M5 legados" significa que, em situações de sobreposição ou conflito entre requisitos legados (M1–M5) e colaborativos (REQ-031+), os critérios dos marcos M1–M5 devem ser avaliados e cumpridos antes da aplicação dos critérios colaborativos.  
> - **Ordem de execução:** Validar todos os critérios de M1–M5 antes de iniciar a validação dos critérios colaborativos.  
> - **Prioridade em resolução de conflitos:** Se houver incompatibilidade, os critérios legados prevalecem, e os colaborativos só podem ser aplicados se não violarem os legados.  
> - **Sequência de auditoria:** Auditorias devem registrar primeiro o cumprimento dos critérios M1–M5, e só então os colaborativos.  
> **Exemplo prático:**  
> | Situação                       | Critério M1–M5 | Critério Colaborativo | Decisão Final                |
> |-------------------------------|----------------|----------------------|------------------------------|
> | Upload sem consentimento LGPD | Não atende     | Atende               | Reprovar (prioridade M2)     |
> | Dashboard com KPIs incompletos| Não atende     | Atende               | Reprovar (prioridade M4)     |
> | Comunicação via novo canal    | Atende         | Atende               | Aprovar (ambos atendidos)    |
### M1C — MVP: Validação de Conceito (Semanas 1-8)
> **Atualização 2025-10-24 (Issues #257-#261):** Recuperação da linha do tempo original da extensão Chrome (REQ-001 a REQ-030) e ajuste das âncoras RUP, seguindo o plano [`20251024203001-reconstruir-req-de-ref`](../../docs/plans/20251024203001-reconstruir-req-de-ref.md) e auditoria [`20251024203001-reconstruir-req-de-ref-audit`](../../docs/plans/20251024203001-reconstruir-req-de-ref-audit.md). 【F:docs/plans/20251024203001-reconstruir-req-de-ref.md†L9-L56】

### Registro de restauração 2025-10-24
- Reintrodução dos marcos M1–M5 originais com vínculos explícitos aos requisitos `REQ-001` a `REQ-010` (funcionais) e `REQ-024` a `REQ-030` (conformidade). 【F:req/02-planejamento/requisitos.md†L24-L33】【F:req/02-planejamento/requisitos.md†L86-L92】【F:.ref/docs/wiki/02-planejamento/milestones.md†L6-L53】
- Correção das âncoras `#req-00x` nos critérios de aceite e evidências para restabelecer a rastreabilidade RUP auditada. 【F:req/02-planejamento/requisitos.md†L24-L92】【F:docs/plans/20251024203001-reconstruir-req-de-ref-audit.md†L33-L60】

## Linha do Tempo Original da Extensão (REQ-001 – REQ-030)

### M1 — Aprovação Administrativa Conectada (RF-008)
- **Objetivo**: consolidar login SSO, bloqueios administrativos e microcopy de orientação para contas aguardando aprovação, garantindo conformidade com `REQ-001`, `REQ-002`, `REQ-007` e `REQ-010`. 【F:req/02-planejamento/requisitos.md†L24-L33】
- **Dependências**: autenticação ativa, governança descrita em `AGENTS.md` e tokens aprovados. 【F:AGENTS.md†L200-L333】
- **Critérios de Aceite**:
  - Gatekeeping bloqueia acesso ao dashboard enquanto a conta estiver pendente, replicando o fluxo `ApprovalStatus`. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L8-L18】
  - Logs registram tentativas de acesso e mantêm rastreabilidade LGPD (`REQ-017`). 【F:req/02-planejamento/requisitos.md†L53-L57】
- **Evidências**: capturas das telas `aguardando-aprovacao.html`, checklist “Conforme UX Writing” e export de logs. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L8-L18】

### M2 — Onboarding LGPD com Consentimento Versionado
- **Objetivo**: ativar fluxo de consentimento LGPD com versionamento e permissões clínicas, atendendo `REQ-024` a `REQ-027` e reforçando `REQ-006`. 【F:req/02-planejamento/requisitos.md†L29-L29】【F:req/02-planejamento/requisitos.md†L86-L89】
- **Dependências**: conclusão do M1, validação jurídica dos textos e armazenamento IndexedDB (`REQ-011`). 【F:req/02-planejamento/requisitos.md†L47-L53】
- **Critérios de Aceite**:
  - Consentimento salva versão, timestamp e operador autenticado conforme `ConsentScreen`. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L20-L32】
  - Revogação bloqueia uploads até regularização, mantendo registro auditável. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L20-L32】
- **Evidências**: gravação do fluxo, dump do IndexedDB (`CONSENT_STORE`) e relatório UX/compliance. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L20-L32】

### M3 — Upload Clínico e Geração de Áudio (RF-008/RNF-007)
- **Objetivo**: habilitar upload de exames com fallback e player de áudio, cobrindo `REQ-003`, `REQ-005`, `REQ-006` e `REQ-017`. 【F:req/02-planejamento/requisitos.md†L26-L33】【F:req/02-planejamento/requisitos.md†L53-L57】
- **Dependências**: M2 concluído, contrato `/diagnostics/submit` publicado e credenciais de TTS homologadas. 【F:.ref/docs/wiki/02-planejamento/wbs.md†L30-L38】
- **Critérios de Aceite**:
  - Upload aceita arquivos até 10 MB com barra de progresso e mensagens de confidencialidade. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L34-L44】
  - Fallback IndexedDB garante retry manual e recuperação pós-offline. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L34-L44】
- **Evidências**: testes manuais, logs da API `<30 s` e checklist de acessibilidade aplicado. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L34-L44】

### M4 — Dashboard e Fila Operacional (RF-008/RNF-007)
- **Objetivo**: entregar visão geral e fila operacional conectadas ao side panel, cumprindo `REQ-007` a `REQ-010`, `REQ-015` e `REQ-016`. 【F:req/02-planejamento/requisitos.md†L30-L33】【F:req/02-planejamento/requisitos.md†L51-L53】
- **Dependências**: M3 aprovado, métricas disponíveis e tokens de branding auditados. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L46-L49】
- **Critérios de Aceite**:
  - Cards exibem KPIs com atualização periódica e fila permite ações contextuais. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L46-L49】
  - Regra cromática 60-30-10 validada e registrada em relatório de governança (`REQ-028`). 【F:req/02-planejamento/requisitos.md†L90-L92】
- **Evidências**: screenshot do dashboard, relatório 603010 e checklist de microinterações aprovado. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L46-L49】

### M5 — Comunicação e Relatórios Clínicos
- **Objetivo**: formalizar envio de resultados com templates auditáveis, entregando `REQ-007` a `REQ-009` e conformidade `REQ-028` a `REQ-030`. 【F:req/02-planejamento/requisitos.md†L30-L33】【F:req/02-planejamento/requisitos.md†L90-L92】
- **Dependências**: M4 homologado, políticas de LGPD aprovadas e canais de contato validados. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L51-L53】
- **Critérios de Aceite**:
  - Botões validam formatos e exibem confirmações claras, registrando operador responsável. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L51-L53】
  - Templates incluem links de consentimento e status da aprovação, garantindo rastreabilidade (`REQ-022`). 【F:req/02-planejamento/requisitos.md†L71-L72】
- **Evidências**: amostras de e-mail/WhatsApp, relatório de rastreabilidade e anexos armazenados em `docs/reports/`. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L51-L53】

## M1 — MVP: Validação de Conceito (Semanas 1-8)
- **Objetivo**: comprovar o fluxo colaborativo entre IA e especialistas antes da entrega ao paciente. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L360-L368】
- **Dependências**: stack atual estável (extensão, API NestJS, UI web) e integrações OpenRouter funcionando. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L39-L49】
- **Critérios de Aceite**:
  - SLA de validação < 4 horas em horário comercial com auditoria completa. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L96-L105】
  - Históricos de aprovação/rejeição rastreáveis para cada diagnóstico. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L96-L105】
  - Riscos de resistência médica e escalabilidade dos validadores avaliados e mitigados. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L300-L326】
- **Evidências**: gravações do fluxo piloto, export de logs do workflow e checklist “Conforme UX Writing”. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L236-L246】

### M2C — Sistema Completo (Semanas 9-24)
- **Objetivo**: disponibilizar métricas avançadas, roteamento inteligente e integrações hospitalares homologadas. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L370-L378】
- **Dependências**: MVP aprovado, acordos com hospitais parceiros e ambientes de homologação disponíveis. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L284-L296】
- **Critérios de Aceite**:
  - Métricas de acurácia e tempo médio acessíveis aos gestores de qualidade. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L132-L142】
  - Integrações validadas em cenários reais com logs de auditoria completos. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L152-L154】【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L332-L362】
  - Riscos regulatórios e de responsabilidade legal revisados pelo comitê. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L300-L326】
- **Evidências**: relatórios de testes de carga, documentação OpenAPI publicada e atas de reuniões com compliance. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L132-L142】【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L300-L326】

### M3C — Produção e Expansão (Semanas 25-32)
- **Objetivo**: colocar a operação em produção com alta disponibilidade, onboarding hospitalar e plano de expansão nacional. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L380-L388】
- **Dependências**: M2C concluído, certificações regulatórias emitidas e time de governança definido. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L184-L188】【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L300-L326】
- **Critérios de Aceite**:
  - Disponibilidade mínima de 99,9% comprovada em monitoração contínua. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L158-L164】
  - Notificações multicanal ativas para médicos solicitantes e pacientes. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L332-L354】
  - Comitê de governança aprova escalabilidade humana e compliance jurídico. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L300-L326】
- **Evidências**: relatórios de monitoramento, métricas de adoção hospitalar e atas de aprovação do comitê. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L380-L388】

## Normas de Planejamento para Marcos Convergentes
- **Convergência com design system**: todo marco deve citar protótipos e componentes React afetados, mantendo aderência às regras de Atomic Design, Feature-Sliced e diretrizes herdadas. 【F:req/02-design/componentes.md†L138-L150】【F:req/02-design/fluxos.md†L96-L115】
- **Rastreabilidade regulatória**: requisitos históricos (RF-008/RNF-007) permanecem ativos e devem ser citados junto dos requisitos `REQ-031` a `REQ-045` em changelogs, PRs e relatórios de auditoria.  
## Marcos Herdados — Extensão Clínica V5

### M1 — Aprovação Administrativa Conectada (RF-008)
- **Objetivo**: disponibilizar telas de aprovação e bloqueios alinhados ao protótipo `administracao-liberacao.html`, com fallback documentado até que o endpoint real esteja pronto. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L6-L13】【F:prototype/administracao-liberacao.html†L1-L120】
- **Dependências**: autenticação funcional, estados `PENDING`/`REJECTED`/`APPROVED` definidos e governança ativa em `AGENTS.md`. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L6-L13】【F:AGENTS.md†L200-L333】
- **Critérios de Aceite**:
  - Login bloqueia dashboard para contas não aprovadas. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L10-L13】【F:ui/src/Login.tsx†L1-L93】
  - Telas exibem instruções de contato e tempo médio de aprovação. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L10-L13】【F:prototype/aguardando-aprovacao.html†L1-L80】
  - Logs registram tentativas de acesso e status retornado. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L10-L13】
- **Evidências**: capturas dos estados, logs de fallback e checklist “Conforme UX Writing”. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L10-L13】

### M2 — Onboarding LGPD com Consentimento Versionado
- **Objetivo**: implementar fluxo completo de consentimento e permissões antes do upload, conforme protótipo `onboarding-consentimento.html`. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L15-L22】【F:prototype/onboarding-consentimento.html†L1-L80】
- **Dependências**: M1 concluído, helpers IndexedDB configurados e textos validados por compliance. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L15-L22】
- **Critérios de Aceite**:
  - Consentimento registra versão, timestamp e operador autenticado. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L18-L22】【F:ui/src/components/onboarding/ConsentScreen.tsx†L80-L120】
  - Revogação bloqueia novos uploads até regularização. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L18-L22】
  - Auditoria gera relatório “Conforme UX Writing” seguindo `AGENTS.md`. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L18-L22】【F:AGENTS.md†L200-L333】
- **Evidências**: gravação do fluxo, dump do IndexedDB e relatório de revisão UX. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L18-L22】

### M3 — Upload Clínico e Geração de Áudio (RF-008/RNF-007)
- **Objetivo**: habilitar upload de exames com opção de áudio, respeitando layout do dashboard e contrato `/diagnostics/submit`. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L24-L31】【F:prototype/dashboard-visao-geral.html†L20-L120】
- **Dependências**: M2 concluído, `UploadHelper` integrado e credenciais ElevenLabs em ambiente seguro. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L24-L31】
- **Critérios de Aceite**:
  - Upload aceita arquivos até 10 MB com barra de progresso e mensagens de confidencialidade. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L27-L31】【F:ui/src/Upload.tsx†L1-L188】
  - Fallback local salva arquivos e permite retry manual. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L27-L31】【F:ui/src/UploadHelper.ts†L63-L154】
  - Áudio opcional gera player funcional ou mensagem de indisponibilidade. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L27-L31】【F:prototype/diagnostico-operacao.html†L68-L120】
- **Evidências**: testes manuais, logs da API < 30 s e checklist de acessibilidade. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L27-L31】

### M4 — Dashboard e Fila Operacional (RF-008/RNF-007)
- **Objetivo**: entregar visão geral, fila e ações rápidas conforme protótipos `dashboard-visao-geral.html` e `dashboard-fila.html`. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L33-L40】【F:prototype/dashboard-visao-geral.html†L1-L220】
- **Dependências**: M3 concluído, fontes de métricas disponíveis e tokens de branding aplicados. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L33-L40】
- **Critérios de Aceite**:
  - Cards apresentam KPIs com atualização periódica. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L36-L40】【F:ui/src/components/dashboard/DashboardOverview.tsx†L1-L222】
  - Fila exibe ações contextuais e trata erros. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L36-L40】【F:ui/src/components/dashboard/DiagnosticQueue.tsx†L1-L210】
  - Regra cromática 60-30-10 auditada e documentada. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L36-L40】【F:req/06-governanca-tecnica-e-controle-de-qualidade/controle-de-qualidade.md†L53-L78】
- **Evidências**: screenshot do dashboard, relatório 603010 e checklist de microinterações. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L36-L40】

### M5 — Comunicação e Relatórios Clínicos
- **Objetivo**: habilitar compartilhamento de resultados e templates de comunicação alinhados aos protótipos. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L42-L49】【F:prototype/diagnostico-operacao.html†L68-L120】
- **Dependências**: M4 concluído, políticas LGPD aplicadas e canais de contato validados. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L42-L49】
- **Critérios de Aceite**:
  - Botões validam formato de e-mail/WhatsApp e exibem confirmações claras. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L45-L49】【F:prototype/dashboard-visao-geral.html†L140-L200】
  - Templates incluem links de consentimento e status da aprovação. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L45-L49】【F:prototype/email-aprovacao-conta.html†L1-L120】
  - Auditoria registra responsável e data de cada envio. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L45-L49】【F:.ref/REPORTS.md†L24-L74】
- **Evidências**: amostras de comunicação, screenshot da interface e relatório de rastreabilidade. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L45-L49】

## Normas de Planejamento para Novos Marcos
- **Convergência com design system**: cada marco deve citar protótipos e componentes React afetados, mantendo aderência às regras de Atomic Design e Feature-Sliced. 【F:req/02-design/componentes.md†L138-L150】【F:req/02-design/fluxos.md†L96-L115】
- **Rastreabilidade regulatória**: requisitos `REQ-031` a `REQ-045` e riscos associados precisam ser referenciados em changelogs e PRs. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L90-L270】
- **Evidências obrigatórias**: anexar relatórios de auditoria, métricas e gravações que comprovem conformidade clínica e técnica. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L300-L326】

## Governança dos Marcos
- Cada milestone (legado ou colaborativo) requer changelog dedicado mencionando Issue #241 e anexando as evidências listadas para sua trilha. 【F:CHANGELOG/20251020143759.md†L1-L120】
- Aprovações dependem de revisão técnica, UX e compliance médico, seguindo políticas descritas em `AGENTS.md` e mantendo as alçadas originais da trilha RUP. 【F:AGENTS.md†L200-L333】
- Bloqueios ou exceções devem ser registrados com responsáveis e plano de ação no conselho de governança, indicando explicitamente se impactam requisitos legados, colaborativos ou ambos. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L300-L326】

[Voltar ao índice](README-spec.md)
