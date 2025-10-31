<!-- req/02-planejamento/roadmap.md -->
# Roadmap

> Base: [./roadmap.md](./roadmap.md)
> Plano: [/docs/plans/20251025093000-evolucao-req-spec.md](/docs/plans/20251025093000-evolucao-req-spec.md)
> Changelog: [/CHANGELOG.md#2025-10-25](/CHANGELOG.md#2025-10-25)
> Referências correlatas: [Arquitetura da extensão](/req/01-arquitetura/arquitetura-da-extensao-spec.md) · [Design geral](/req/02-design/design-geral-spec.md) · [Testes end-to-end](/req/04-testes-e-validacao/testes-end-to-end-spec.md)

Este documento apresentará a visão macro das etapas evolutivas da extensão Chrome, destacando objetivos por fase.
Também registrará dependências estratégicas e premissas críticas para cada período.

## Linha do Tempo da Base Legada (REQ-001 – REQ-030)

O histórico abaixo consolida as entregas que estabeleceram a extensão base antes da expansão colaborativa, respeitando a ordem dos marcos M1–M5 e a rastreabilidade com requisitos, protótipos e componentes homologados.

1. **M1 — Aprovação Administrativa Conectada**
   - **Requisitos atendidos:** REQ-001, REQ-002, REQ-010, REQ-012 e REQ-017 garantem autenticação via Google, sessão segura, exibição do side panel e governança básica de logs. 【F:.ref/REQUIREMENTS.md†L26-L35】【F:.ref/REQUIREMENTS.md†L44-L49】
   - **Entregas e componentes:** implementação das telas de bloqueio e triagem (`ApprovalStatus`) alinhadas ao protótipo de aguardando aprovação, com checklist de auditoria e logs administrativos. 【F:.ref/docs/wiki/02-planejamento/wbs.md†L6-L13】
   - **Dependências e critérios:** autenticação funcional, estados `PENDING/REJECTED/APPROVED` definidos e bloqueio do dashboard para contas não aprovadas conforme critérios de aceite de M1. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L6-L13】
   - **Protótipos e evidências:** `administracao-liberacao.html`, `aguardando-aprovacao.html` e capturas de tela registradas no encerramento do marco. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L6-L13】

2. **M2 — Onboarding LGPD com Consentimento Versionado**
   - **Requisitos atendidos:** REQ-003, REQ-024 e REQ-025 introduzem sincronização de domínio, consentimento explícito e exibição prévia dos termos LGPD no fluxo inicial. 【F:.ref/REQUIREMENTS.md†L28-L35】【F:.ref/REQUIREMENTS.md†L70-L75】
   - **Entregas e componentes:** `ConsentScreen`, permissões clínicas multi-etapas e registro de versões/timestamps no IndexedDB (`wl-db`). 【F:.ref/docs/wiki/02-planejamento/wbs.md†L10-L18】
   - **Dependências e critérios:** conclusão do M1, helpers IndexedDB ativos e auditoria “Conforme UX Writing”, além do bloqueio de uploads sem consentimento válido. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L15-L22】
   - **Protótipos e evidências:** `onboarding-consentimento.html`, `onboarding-permissoes.html` e dumps do IndexedDB anexados às revisões. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L15-L22】

3. **M3 — Upload Clínico e Geração de Áudio**
   - **Requisitos atendidos:** REQ-004, REQ-005, REQ-011 e REQ-015 cobrem interceptação de downloads, submissão à API, isolamento do IndexedDB e limites de performance. 【F:.ref/REQUIREMENTS.md†L29-L47】
   - **Entregas e componentes:** componente de upload com drag-and-drop, fallback `UploadHelper` e integração NestJS para `/diagnostics/submit` e `/diagnostics/audio`. 【F:.ref/docs/wiki/02-planejamento/wbs.md†L15-L18】
   - **Dependências e critérios:** conclusão do M2, credenciais ElevenLabs e validações de tamanho, progresso e mensagens de confidencialidade descritas nos critérios de aceite. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L24-L31】
   - **Protótipos e evidências:** `dashboard-visao-geral.html`, `diagnostico-operacao.html` e logs de API com duração inferior a 30 s. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L24-L31】

4. **M4 — Dashboard e Fila Operacional**
   - **Requisitos atendidos:** REQ-006, REQ-007, REQ-008, REQ-010 e REQ-016 sustentam notificações pós-upload, múltiplos destinatários, painel unificado e responsividade do side panel. 【F:.ref/REQUIREMENTS.md†L31-L36】【F:.ref/REQUIREMENTS.md†L48-L49】
   - **Entregas e componentes:** `DashboardOverview`, `DiagnosticQueue` e estados vazios/erro alinhados ao protótipo de fila operacional, incluindo tokens de branding. 【F:.ref/docs/wiki/02-planejamento/wbs.md†L20-L24】
   - **Dependências e critérios:** métricas atualizadas, ações contextuais (retry, compartilhar, baixar) e auditoria cromática 60-30-10 documentada. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L33-L40】
   - **Protótipos e evidências:** `dashboard-visao-geral.html`, `dashboard-fila.html` e relatórios de microinterações arquivados por milestone. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L33-L40】

5. **M5 — Comunicação e Relatórios Clínicos**
   - **Requisitos atendidos:** REQ-006, REQ-007, REQ-008, REQ-009, REQ-026, REQ-027, REQ-028, REQ-029 e REQ-030 consolidam notificações multicanal, política de privacidade, rastreabilidade e conformidade Manifest V3. 【F:.ref/REQUIREMENTS.md†L31-L36】【F:.ref/REQUIREMENTS.md†L72-L76】
   - **Entregas e componentes:** fluxos de compartilhamento com validações, templates transacionais e registros operacionais em `docs/reports/`. 【F:.ref/docs/wiki/02-planejamento/wbs.md†L25-L28】
   - **Dependências e critérios:** dependência do M4 concluído, políticas LGPD aplicadas e critérios de aceite que exigem confirmações claras, links de consentimento e auditoria de envios. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L42-L49】
   - **Protótipos e evidências:** `diagnostico-operacao.html`, `email-aprovacao-conta.html`, `email-boas-vindas-pendente.html` e relatórios de rastreabilidade anexos. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L42-L49】

[Voltar ao índice](README-spec.md) • [Ir para a expansão colaborativa](#capacidade-de-diagnóstico-colaborativo)
> **Atualização 2025-10-24 (Issues #257-#261):** Reconstrução da trilha histórica (REQ-001 a REQ-030) e sincronização das âncoras RUP com o catálogo de requisitos, respaldada pelo plano [`20251024203001-reconstruir-req-de-ref`](../../docs/plans/20251024203001-reconstruir-req-de-ref.md) e pela auditoria [`20251024203001-reconstruir-req-de-ref-audit`](../../docs/plans/20251024203001-reconstruir-req-de-ref-audit.md). 【F:docs/plans/20251024203001-reconstruir-req-de-ref.md†L9-L56】

### Registro de restauração 2025-10-24
- Linha do tempo original reconstituída com fases agrupando marcos M1–M5 e os requisitos `REQ-001` a `REQ-010`, `REQ-024` a `REQ-030`, restabelecendo o contexto anterior ao diagnóstico colaborativo. 【F:req/02-planejamento/requisitos.md†L24-L33】【F:req/02-planejamento/requisitos.md†L86-L92】【F:.ref/docs/wiki/02-planejamento/milestones.md†L6-L53】
- Correção das âncoras de requisitos (`#req-00x`) e referências cruzadas para evitar que planos e roadmap apontem para seções inexistentes. 【F:req/02-planejamento/requisitos.md†L24-L92】【F:docs/plans/20251024203001-reconstruir-req-de-ref-audit.md†L33-L60】

[Voltar ao índice](README-spec.md)

## Linha do Tempo Original da Extensão (REQ-001 – REQ-030)

### Fase 0 — Gatekeeping e Governança Inicial (Semanas -4 a 4)
- **Foco**: ativar autenticação Google SSO, bloqueios administrativos e microcopy orientativo para contas pendentes (`REQ-001`, `REQ-002`, `REQ-007`, `REQ-010`). 【F:req/02-planejamento/requisitos.md†L24-L33】
- **Dependências**: tokens validados, políticas de governança vigentes e rastreabilidade LGPD (`REQ-017`). 【F:req/02-planejamento/requisitos.md†L53-L57】【F:AGENTS.md†L200-L333】
- **Entregáveis**: telas `ApprovalStatus`, relatórios de auditoria inicial e checklist UX Writing aprovados. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L8-L18】

### Fase 1 — Onboarding LGPD e Pipeline de Upload (Semanas 5 a 12)
- **Foco**: consolidar consentimento versionado, permissões clínicas e upload clínico com fallback IndexedDB (`REQ-003`, `REQ-005`, `REQ-006`, `REQ-011`, `REQ-024` a `REQ-027`). 【F:req/02-planejamento/requisitos.md†L26-L33】【F:req/02-planejamento/requisitos.md†L47-L53】【F:req/02-planejamento/requisitos.md†L86-L89】
- **Dependências**: fluxo M1 homologado, contratos `/diagnostics/submit` e `/diagnostics/audio` disponibilizados. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L20-L44】
- **Entregáveis**: consentimento com histórico versionado, player de áudio e logs `<30 s` publicados em `docs/reports/`. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L20-L44】

### Fase 2 — Operação, Comunicação e Branding (Semanas 13 a 20)
- **Foco**: dashboards operacionais, fila de diagnósticos e comunicação multicanal cumprindo `REQ-007` a `REQ-009`, `REQ-015`, `REQ-016`, `REQ-028` a `REQ-030`. 【F:req/02-planejamento/requisitos.md†L30-L33】【F:req/02-planejamento/requisitos.md†L51-L53】【F:req/02-planejamento/requisitos.md†L90-L92】
- **Dependências**: métricas disponíveis, tokens 60-30-10 auditados e governança de envio registrada (`REQ-022`). 【F:req/02-planejamento/requisitos.md†L71-L72】【F:.ref/docs/wiki/02-planejamento/milestones.md†L46-L53】
- **Entregáveis**: dashboards publicados, templates de comunicação revisados e plano de rastreabilidade anexado a `docs/reports/`. 【F:.ref/docs/wiki/02-planejamento/milestones.md†L46-L53】

## Capacidade de Diagnóstico Colaborativo

### Estado Atual Consolidado
- **Cobertura existente:** REQ-001 a REQ-030 já implantados garantem autenticação, upload de exames, dashboards e conformidade LGPD descritos no histórico do produto. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L14-L37】
- **Componentes ativos:** extensão Chrome (Manifest V3), API NestJS de diagnósticos, UI web auxiliar e integrações com OpenRouter e TTS formam a base disponível para expansão. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L39-L49】

### Lacunas Prioritárias
1. **Processamento em tempo real:** ausência de feedback imediato na extensão após submissão do exame. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L51-L58】
2. **Suporte multiformato:** pipeline limitado a PDFs, sem cobertura DICOM/HL7/XML. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L60-L64】
3. **Auditoria ponta a ponta:** inexistência de trilha médica completa para conformidade. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L66-L70】
4. **Integração HIS/LIS:** falta de conectores hospitalares padronizados. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L72-L76】
5. **Validação humana:** diagnósticos sem aprovação de especialistas antes da entrega. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L78-L82】

### Catálogo de Requisitos da Nova Capacidade
#### Requisitos Funcionais (RF)
- **RF-031 — Workflow de Validação Médica:** fila de revisão, notificações a especialistas e histórico completo. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L90-L105】
- **RF-032 — Sistema de Especialidades Médicas:** roteamento por CRM, escalonamento e dashboard de carga. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L107-L117】
- **RF-033 — Interface de Validação:** revisão lado a lado, anotações e assinatura digital. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L119-L130】
- **RF-034 — Sistema de Qualidade e Métricas:** métricas de acurácia, alertas e relatórios regulatórios. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L132-L142】
- **RF-035 — Integração HIS/LIS:** conectores HL7 FHIR com auditoria completa. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L144-L154】

#### Requisitos Não Funcionais (RNF)
- **RNF-031 — Disponibilidade 99,9%** durante o horário comercial. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L158-L164】
- **RNF-032 — Performance de carregamento < 2s** para a interface de validação. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L166-L170】
- **RNF-033 — Segurança de dados médicos** com auditoria rastreável. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L172-L176】
- **RNF-034 — Escalabilidade** para 10.000 validações simultâneas. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L178-L182】
- **RNF-035 — Conformidade regulatória** com CFM, ANVISA e SBIS. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L184-L188】

#### Requisitos Técnicos (RT)
- **RT-031 — Microserviços de validação** com workflow, notificações e analytics dedicados. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L192-L202】
- **RT-032 — Base de dados especializada** para workflows médicos. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L204-L210】
- **RT-033 — APIs de integração hospitalar** compatíveis com OpenAPI e HL7 FHIR. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L212-L218】
- **RT-034 — Monitoramento avançado** com métricas e tracing distribuído. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L220-L226】
- **RT-035 — Infraestrutura cloud-native** em Kubernetes com GitOps. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L228-L234】

#### Regras de Negócio (RN)
- **RN-031 — Qualificação de médicos validadores.** 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L242-L246】
- **RN-032 — Priorização de exames.** 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L248-L252】
- **RN-033 — Qualidade mínima da IA.** 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L254-L258】
- **RN-034 — Responsabilidade legal dos validadores.** 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L260-L264】
- **RN-035 — Privacidade e consentimento.** 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L266-L270】

### Mapeamento de Histórias por Fase
| História de Usuário | Design | Implementação | Governança |
| --- | --- | --- | --- |
| **História 1 — Médico Especialista** | Modelar jornada e notificações no protótipo de validação médica. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L236-L244】 | Construir fila de validação (RF-031) e interface lado a lado (RF-033). 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L90-L130】 | Definir critérios de auditoria e SLA de 4h descritos nos requisitos e riscos. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L96-L105】【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L312-L326】 |
| **História 2 — Gestor de Qualidade** | Wireframes do dashboard de métricas (RF-034). 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L132-L142】 | Implementar analytics e alertas, integrando RT-034. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L220-L226】 | Atualizar relatórios regulatórios e planos de mitigação de risco. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L300-L326】 |
| **História 3 — Administrador Hospitalar** | Mapear fluxos de integração HIS/LIS em diagramas de arquitetura. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L144-L154】 | Construir conectores HL7 FHIR (RT-033) e sincronização bidirecional. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L212-L218】 | Formalizar acordos de dados e monitorar logs de auditoria de integração. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L284-L296】 |
| **História 4 — Médico Solicitante** | Definir UX das notificações e histórico clínico. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L316-L324】 | Implementar canais de notificação (Integração 2) e histórico seguro. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L332-L362】 | Garantir consentimento versionado e políticas de comunicação. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L266-L270】【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L300-L326】 |
| **História 5 — Paciente** | Elaborar protótipos acessíveis com linguagem leiga e áudio. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L344-L354】 | Implementar portal seguro com autenticação e TTS. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L90-L154】 | Estabelecer políticas de consentimento, opt-out e retenção. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L266-L270】【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L310-L328】 |

### Plano Incremental por Fase
- **Fase MVP (Semanas 1-8):** detalhar arquitetura, implementar workflow básico e validar piloto com especialistas. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L360-L368】
- **Fase Sistema Completo (Semanas 9-24):** adicionar métricas, integrações HIS/LIS, auditoria e certificações. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L370-L378】
- **Fase Produção/Expansão (Semanas 25-32):** deploy, onboarding hospitalar e plano de expansão nacional. 【F:req/02-planejamento/capacidade-diagnostico-colaborativo.md†L380-L388】
