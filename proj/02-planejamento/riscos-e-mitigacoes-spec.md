<!-- req/02-planejamento/riscos-e-mitigacoes.md -->
# Riscos e Mitigações

> Base: [./riscos-e-mitigacoes.md](./riscos-e-mitigacoes.md)
> Plano: [/docs/plans/20251025093000-evolucao-req-spec.md](/docs/plans/20251025093000-evolucao-req-spec.md)
> Changelog: [/CHANGELOG.md#2025-10-25](/CHANGELOG.md#2025-10-25)
> Referências correlatas: [Arquitetura da extensão](/req/01-arquitetura/arquitetura-da-extensao-spec.md) · [Design geral](/req/02-design/design-geral-spec.md) · [Testes end-to-end](/req/04-testes-e-validacao/testes-end-to-end-spec.md)

Este capítulo consolida a gestão de riscos do programa RUP da extensão Chrome MBRA. Ele unifica a matriz geral de riscos anteriormente mantida em `RISKS.md` com os riscos específicos do plano de requisitos UI/UX versão 5, garantindo rastreabilidade única.

- **Matriz geral (IDs `RISK-###`):** migrada do documento `RISKS.md`, preservando categorias, impactos e referências cruzadas com requisitos, pipelines e relatórios.
- **Riscos específicos de UI/UX (IDs `R1`–`R8`):** mantidos do plano de requisitos UI/UX v5 para monitorar divergências de design e operação.

---

## Atualizações quando requisitos afetarem riscos

- Para cada novo `REQ-###` ou `RNF-###`, avalie se há riscos inéditos ou ajustes em severidade e registre-os tanto aqui quanto em `riscos-e-mitigacoes.md`.
- Referencie sempre o requisito associado, atualize o plano de mitigação correspondente e sincronize impactos com `cronograma.md`, `especificacao-de-requisitos.md` e `audit-history.md`.
- Registre o item no `CHANGELOG.md`, informe o status da revisão em `../06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade.md` e garanta que relatórios automatizados reflitam a alteração.

---

As seções a seguir apresentam primeiro a matriz geral e, na sequência, a visão dedicada a UI/UX, mantendo explícita a origem de cada conjunto de riscos.

## Riscos Gerais (RUP)

A matriz abaixo reflete a consolidação realizada pelo comitê de governança técnica e IA. Cada item mantém rastreabilidade direta com requisitos, pipelines e agentes para facilitar auditoria.

### Estrutura de classificação

| Categoria | Descrição |
| --- | --- |
| Técnico | Riscos relacionados a arquitetura, código, tecnologia e compatibilidade. |
| Operacional | Falhas humanas, processos ou infraestrutura. |
| Legal / Conformidade | Violação de LGPD, políticas do Chrome ou obrigações contratuais. |
| Externo / Dependência | Dependência de serviços externos (APIs, OpenRouter, Codex, Google). |

### Riscos Técnicos

| ID | Descrição | Impacto | Prob. | Mitigação | Rastreio | Status |
| --- | --- | --- | --- | --- | --- | --- |
| RISK-001 | Falha de autenticação SSO Google em ambientes restritos (rede corporativa). | 🟧 Médio | Média | Implementar fallback de autenticação com mensagem orientativa. | [REQ-001](requisitos-spec.md#req-001), [`../06-governanca-tecnica-e-controle-de-qualidade/revisoes-com-ia.md`](../06-governanca-tecnica-e-controle-de-qualidade/revisoes-com-ia-spec.md) | Ativo |
| RISK-002 | Quebra de compatibilidade com futuras versões do Chrome Manifest V3. | 🟥 Alto | Alta | Revisar Manifest a cada release e validar via `audit.yml`. | [REQ-018](requisitos-spec.md#req-018), [`../06-governanca-tecnica-e-controle-de-qualidade/revisoes-com-ia.md`](../06-governanca-tecnica-e-controle-de-qualidade/revisoes-com-ia-spec.md) | Ativo |
| RISK-003 | Corrupção de dados no IndexedDB por fechamento abrupto do navegador. | 🟨 Baixo | Média | Sincronizar transações e utilizar IndexedDB Promises. | [REQ-011](requisitos-spec.md#req-011), [`../03-implementacao/testes.md`](../03-implementacao/testes-spec.md) | Ativo |
| RISK-004 | Falha de interceptação de downloads devido a políticas CORS. | 🟥 Alto | Média | Validar permissões `downloads` e `host_permissions`. | [REQ-020](requisitos-spec.md#req-020) | Ativo |
| RISK-005 | Dependência excessiva de modelos externos (OpenRouter). | 🟧 Médio | Alta | Garantir fallback local via LM Studio / Ollama. | [`../../AGENTS.md`](../../AGENTS.md) | Ativo |

### Riscos Operacionais

| ID | Descrição | Impacto | Prob. | Mitigação | Rastreio | Status |
| --- | --- | --- | --- | --- | --- | --- |
| RISK-006 | Falha na configuração de secrets (tokens) nos pipelines. | 🟥 Alto | Média | Implementar verificação automática no `audit.yml`. | [`../06-governanca-tecnica-e-controle-de-qualidade/revisoes-com-ia.md`](../06-governanca-tecnica-e-controle-de-qualidade/revisoes-com-ia-spec.md) | Ativo |
| RISK-007 | Erros humanos em merges ou PRs automáticos. | 🟧 Médio | Alta | Requerer revisão humana obrigatória antes do merge. | [`../../AGENTS.md`](../../AGENTS.md) | Ativo |
| RISK-008 | Falha em builds automatizados (ambiente CI instável). | 🟨 Baixo | Média | Cache de dependências e retries automáticos. | [`../06-governanca-tecnica-e-controle-de-qualidade/revisoes-com-ia.md`](../06-governanca-tecnica-e-controle-de-qualidade/revisoes-com-ia-spec.md) | Ativo |
| RISK-009 | Execução incorreta de agentes IA fora do contexto correto. | 🟧 Médio | Média | Validar `workflow_dispatch` antes da execução. | [`../../AGENTS.md`](../../AGENTS.md) | Ativo |
| RISK-010 | Acúmulo de relatórios grandes e logs desnecessários. | 🟨 Baixo | Alta | Implementar limpeza automática de artefatos antigos. | [`../06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade.md#catalogo-de-relatorios-automatizados`](../06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade-spec.md#catalogo-de-relatorios-automatizados) | Ativo |

### Riscos Legais e de Conformidade

| ID | Descrição | Impacto | Prob. | Mitigação | Rastreio | Status |
| --- | --- | --- | --- | --- | --- | --- |
| RISK-011 | Falta de exibição do termo de consentimento LGPD antes da coleta de dados. | 🟥 Alto | Média | Validar exibição via testes E2E e auditoria mensal. | [REQ-024](requisitos-spec.md#req-024), [REQ-025](requisitos-spec.md#req-025) | Ativo |
| RISK-012 | Armazenamento indevido de informações pessoais fora do IndexedDB. | 🟥 Alto | Baixa | Proibir `localStorage` e validar via lint de segurança. | [REQ-027](requisitos-spec.md#req-027) | Ativo |
| RISK-013 | Falha no direito de exclusão de dados (revogação LGPD). | 🟧 Médio | Média | Incluir função "Excluir Dados" obrigatória no painel. | [REQ-027](requisitos-spec.md#req-027) | Ativo |
| RISK-014 | Violação das políticas do Chrome Web Store (execução remota). | 🟥 Alto | Baixa | Auditar CSP e Manifest antes de cada release. | [REQ-030](requisitos-spec.md#req-030) | Ativo |
| RISK-015 | Uso indevido de tokens JWT expostos em logs. | 🟥 Alto | Média | Redigir máscaras automáticas nos logs CI/CD. | [`../06-governanca-tecnica-e-controle-de-qualidade/revisoes-com-ia.md`](../06-governanca-tecnica-e-controle-de-qualidade/revisoes-com-ia-spec.md) | Ativo |

### Riscos Externos e de Dependência

| ID | Descrição | Impacto | Prob. | Mitigação | Rastreio | Status |
| --- | --- | --- | --- | --- | --- | --- |
| RISK-016 | Indisponibilidade da API yagnostic.mbra.com.br. | 🟥 Alto | Média | Implementar retries e fallback de status offline. | [REQ-003](requisitos-spec.md#req-003), [REQ-005](requisitos-spec.md#req-005) | Ativo |
| RISK-017 | Alterações não anunciadas na API MBRA (versão RESTful). | 🟧 Médio | Média | Utilizar versionamento de endpoint (`/v1`, `/v2`). | [REQ-003](requisitos-spec.md#req-003), [REQ-005](requisitos-spec.md#req-005) | Ativo |
| RISK-018 | Incompatibilidade com OpenRouter ou Codex devido a mudanças de modelo. | 🟧 Médio | Alta | Registrar versões de modelo em [`../../AGENTS.md`](../../AGENTS.md). | Ativo |
| RISK-019 | Falhas de autenticação com Google OAuth. | 🟥 Alto | Baixa | Exibir erro informativo e reautenticação automática. | [REQ-001](requisitos-spec.md#req-001) | Ativo |
| RISK-020 | Bloqueio temporário de execução IA por uso excessivo. | 🟨 Baixo | Média | Aplicar rate limit inteligente nos pipelines. | [`../06-governanca-tecnica-e-controle-de-qualidade/revisoes-com-ia.md`](../06-governanca-tecnica-e-controle-de-qualidade/revisoes-com-ia-spec.md) | Ativo |

### Mapa de severidade

| Severidade | Símbolo | Ação imediata |
| --- | --- | --- |
| Alta | 🟥 | Mitigação obrigatória e auditoria semanal |
| Média | 🟧 | Acompanhamento quinzenal |
| Baixa | 🟨 | Verificação mensal |

### Monitoramento e revisão

- Todos os riscos são auditados mensalmente pelo Audit Agent via pipeline `audit.yml`.
- Novos riscos só podem ser adicionados via Pull Request revisado por IA + humano.
- Cada `RISK-###` deve ter rastreabilidade em:
- [`requisitos.md`](requisitos-spec.md) (catálogo tabular).
  - [`../06-governanca-tecnica-e-controle-de-qualidade/revisoes-com-ia.md`](../06-governanca-tecnica-e-controle-de-qualidade/revisoes-com-ia-spec.md) (monitoramento).
  - [`../06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade.md#catalogo-de-relatorios-automatizados`](../06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade-spec.md#catalogo-de-relatorios-automatizados) (verificação).
- Riscos obsoletos são marcados como `[MITIGADO]` e arquivados em `/docs/risk-archive/`.

### Responsabilidade técnica

**Responsável:** Ricardo Malnati — Engenheiro de Software  \
**Organização:** Millennium Brasil (MBRA)  \
**Documento:** Matriz de Riscos e Mitigações RUP  \
**Status:** Ativo e sob auditoria contínua



## Riscos Específicos de UI/UX (Plano UI/UX v5)

Esta seção preserva o monitoramento dedicado aos riscos de experiência do usuário aprovados no plano de requisitos UI/UX versão 5, mantendo-os separados da matriz geral para facilitar o acompanhamento pelo time de design. 【F:docs/plans/plan-ui-ux-requirements-v5.md†L112-L150】

| ID | Risco | Probabilidade | Impacto | Mitigação | Referências |
| --- | --- | --- | --- | --- | --- |
| R1 | Divergência visual entre protótipo e React (cores, espaçamento, tokens) | Média | Alto | Medição obrigatória da regra 60-30-10 e revisão cruzada com UX antes de merge. |【F:prototype/dashboard-visao-geral.html†L1-L220】【F:req/06-governanca-tecnica-e-controle-de-qualidade/controle-de-qualidade.md†L53-L78】|
| R2 | Prompts médicos inconsistentes entre API e documentação | Baixa | Alto | Consolidar prompts em `diagnostics.service.ts` e atualizar req quando modificados. |【F:api/src/diagnostics/diagnostics.service.ts†L21-L199】【F:CHANGELOG/20260308120000.md†L1-L16】|
| R3 | Performance degradada em uploads grandes (>8 MB) ou geração de áudio simultânea | Média | Médio | Monitorar duração de `/diagnostics/submit`, aplicar fila local (`wl-db`) e alertar quando exceder 30 s. |【F:ui/src/UploadHelper.ts†L63-L154】【F:api/src/diagnostics/diagnostics.controller.ts†L69-L189】|
| R4 | Aprovação administrativa atrasada bloqueando operação | Alta | Alto | Implementar notificações proativas e relatórios de pendência; disponibilizar contatos no protótipo. |【F:prototype/administracao-liberacao.html†L1-L120】【F:prototype/faq-aprovacao.html†L1-L120】|
| R5 | Consentimento expirado sem bloqueio automático | Média | Alto | Persistir versão/timestamp do consentimento e validar em cada login antes de liberar upload. |【F:ui/src/components/onboarding/OnboardingFlow.tsx†L1-L200】【F:prototype/consentimento-completo.html†L1-L92】|
| R6 | Dependência de ElevenLabs para áudio gera custo inesperado | Média | Médio | Habilitar áudio apenas sob confirmação explícita e registrar consumo em relatórios operacionais. |【F:prototype/diagnostico-operacao.html†L68-L120】【F:api/src/diagnostics/diagnostics.controller.ts†L121-L189】|
| R7 | Falta de rastreabilidade em compartilhamentos (WhatsApp/E-mail) | Média | Alto | Registrar logs com operador, canal e timestamp; armazenar evidências em `docs/reports/`. |【F:prototype/dashboard-visao-geral.html†L140-L200】【F:req/06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade.md†L31-L104】|
| R8 | Fallback local sem sincronização automática gera dados obsoletos | Baixa | Médio | Implementar rotina de retry manual assistido com instruções claras e monitoramento diário. |【F:ui/src/UploadHelper.ts†L63-L154】【F:ui/src/components/dashboard/DiagnosticQueue.tsx†L150-L210】|

### Normas de Mitigação para Evoluções de UI
- **React oficial:** riscos que proponham bibliotecas alternativas devem registrar plano de retorno ao React oficial antes da execução da mitigação. 【F:req/02-design/componentes.md†L120-L150】
- **Feature-Sliced Design:** mitigação de riscos estruturais deve incluir revisão das fatias afetadas e atualização dos diretórios `components/<feature>`, mantendo rastreabilidade com o RUP. 【F:req/02-design/fluxos.md†L96-L115】
- **Atomic Design:** qualquer correção envolvendo componentes precisa especificar quais átomos/moléculas serão tocados para evitar regressões não rastreadas. 【F:req/02-design/componentes.md†L138-L150】

## Monitoramento Contínuo
- Revisar riscos trimestralmente em conjunto com governança técnica e compliance.
- Registrar decisões mitigatórias no changelog e nos relatórios de auditoria (`docs/reports/`). 【F:req/06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade.md†L31-L104】
- Atualizar esta tabela quando novos fluxos forem introduzidos ou quando a API real substituir os mocks atuais.

[Voltar ao índice](README-spec.md)
