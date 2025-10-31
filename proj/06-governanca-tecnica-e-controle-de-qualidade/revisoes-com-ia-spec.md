<!-- req/06-governanca-tecnica-e-controle-de-qualidade/revisoes-com-ia.md -->
# Revisões com Inteligência Artificial

> Base: [./revisoes-com-ia.md](./revisoes-com-ia.md)
> Plano: [/docs/plans/20251025093000-evolucao-req-spec.md](/docs/plans/20251025093000-evolucao-req-spec.md)
> Changelog: [/CHANGELOG.md#2025-10-25](/CHANGELOG.md#2025-10-25)
> Referências correlatas: [Arquitetura da extensão](/req/01-arquitetura/arquitetura-da-extensao-spec.md) · [Design geral](/req/02-design/design-geral-spec.md) · [Testes end-to-end](/req/04-testes-e-validacao/testes-end-to-end-spec.md)

## Objetivo
Documentar o uso de agentes de Inteligência Artificial na governança técnica e no controle de qualidade da extensão Chrome MBRA (Yagnostic), assegurando padronização, transparência e conformidade com as diretrizes da MBRA.

---

## Atualizações quando requisitos demandarem novas revisões

- Atualize `revisoes-com-ia.md` e este espelho sempre que um `REQ-###` ou `RNF-###` requerer validações adicionais, garantindo que os workflows GitHub Actions estejam sincronizados com os artefatos de arquitetura, design, implementação, testes e entrega.
- Registre métricas e checkpoints no `CHANGELOG.md`, `req/audit-history.md` e `docs/reports/`, citando os IDs de requisitos, riscos e métricas associados.
- Certifique-se de que controles correlatos (`auditoria-e-rastreabilidade.md`, `controle-de-qualidade.md`) sejam atualizados no mesmo PR para manter o checklist de encerramento íntegro.

---

Todas as revisões devem cruzar os achados com a [matriz de riscos](../02-planejamento/riscos-e-mitigacoes-spec.md) para manter o catálogo `RISK-###` atualizado e rastreável no plano de planejamento.
- **Requisitos associados:** REQ-019, REQ-021, REQ-022, REQ-023, REQ-029 e REQ-030.
- **Nota colaborativa:** revisar continuamente a cobertura das etapas descritas em REQ-031–REQ-035 para garantir que validadores humanos tenham insumos e logs equivalentes aos produzidos pelos agentes IA.

## Arquitetura dos agentes
- Infraestrutura baseada em OpenRouter e Codex, com modelos especializados definidos em `AGENTS.md`.
- Execução dos agentes orquestrada pelos workflows GitHub Actions descritos nesta página, utilizando tokens protegidos e política de rotação periódica.
- **Requisitos associados:** REQ-019, REQ-021, REQ-022 e REQ-023.
- **Nota colaborativa:** manter segregação de contexto para cenários com dados sensíveis de validação médica (REQ-031–REQ-035) antes de compartilhar prompts com os agentes.

## Agentes definidos
1. **Codex Builder** — gera código e documentação conforme requisitos aprovados.
2. **Codex Reviewer** — avalia inconsistências técnicas ou conceituais e sinaliza alucinações.
3. **Scope Corrector** e **Architecture Corrector** — garantem aderência das mudanças à arquitetura de referência e ao escopo aprovado.
4. **E2E Test Agent** — apoia a criação e execução de casos de teste automatizados.
5. **Audit Agent** — consolida evidências de conformidade e rastreabilidade.
- **Requisitos associados:** REQ-019, REQ-021, REQ-022, REQ-023, REQ-029 e REQ-034.
- **Nota colaborativa:** incorporar verificações específicas para validações clínicas e dashboards colaborativos (REQ-031–REQ-035) na programação de cada agente.

## Workflows GitHub Actions

| Workflow | Fase RUP | Descrição | Agentes IA | Artefatos |
| --- | --- | --- | --- | --- |
| `build.yml` | Construção | Compila TypeScript, empacota a extensão e executa testes unitários. | Não aplicável | `dist/`, logs de build |
| `review.yml` | Elaboração / Governança | Aciona IA para revisar escopo, arquitetura e alucinações. | Codex Reviewer, Hallucination Detector, Scope Corrector, Security Policy Agent, Governance Reviewer Agent | `review-report.md`, `scope-correction.json`, `security-policy-report.md`, `governance-review.json` |
| `test.yml` | Transição | Executa testes unitários, integração e E2E com Playwright. | Unit Test Agent, E2E Test Agent | `test-report.md` |
| `release.yml` | Implantação | Gera versão, changelog e pacote ZIP. | PR Agent, Release Agent | `release.zip`, changelog |
| `audit.yml` | Governança | Executa auditoria de rastreabilidade e conformidade. | Audit Agent, Governance Reporter Agent, Changelog Compliance Agent | `audit-report.md`, `governance-audit-summary.md`, `changelog-compliance.json` |
- **Requisitos associados:** REQ-015, REQ-019, REQ-021, REQ-022, REQ-023, REQ-029, REQ-030 e REQ-034.
- **Nota colaborativa:** configurar `review.yml`, `test.yml` e `audit.yml` para validar cenários de aprovação compartilhada e métricas clínicas definidas nos REQ-031–REQ-035.

## Estrutura de diretórios e arquivos

- `.github/workflows/build.yml`
- `.github/workflows/review.yml`
- `.github/workflows/test.yml`
- `.github/workflows/release.yml`
- `.github/workflows/audit.yml`

Cada arquivo YAML deve conter:
- **Gatilho (`on:`)** — define o evento (push, pull_request, cron).
- **Jobs** — nomeados conforme o objetivo (`build`, `test`, `review`, etc.).
- **Agentes IA** (quando aplicável) — executados via `openrouter run` com autenticação `OPENROUTER_TOKEN`.
- **Artefatos** — arquivos resultantes armazenados no GitHub para auditoria.
- **Requisitos associados:** REQ-019, REQ-021, REQ-022, REQ-023 e REQ-030.
- **Nota colaborativa:** anexar aos artefatos evidências das filas clínicas e decisões humanas relacionadas aos REQ-031–REQ-035.

## Descrição detalhada de cada workflow

### 🧱 `build.yml`
- **Fase RUP:** Construção.
- **Objetivo:** compilar, empacotar e validar a extensão antes de testes e revisão.
- **Gatilhos:** `push` e `pull_request` nas branches `dev` e `main`.
- **Etapas:**
  1. Instalação de dependências.
  2. Compilação TypeScript (`make build`).
  3. Lint (`make lint`).
  4. Testes unitários (`npm test`).
  5. Upload de artefatos (`dist/` e `build-logs`).
- **Critérios de sucesso:** build sem erros e artefato válido.
- **Artefatos:** `build-log.txt`, `dist/`.
- **Requisitos associados:** REQ-015, REQ-018, REQ-019, REQ-020 e REQ-030.
- **Nota colaborativa:** validar se dependências necessárias para os módulos colaborativos (REQ-031–REQ-033) estão presentes no build antes de prosseguir com revisões.

### 🔍 `review.yml`
- **Fase RUP:** Elaboração / Governança Técnica.
- **Objetivo:** revisar o conteúdo do repositório, garantindo aderência ao RUP, ausência de alucinações e consistência arquitetural.
- **Gatilhos:** `pull_request` e `workflow_dispatch`.
- **Etapas:**
  1. Extração de metadados do PR e preparação de contexto.
  2. Execução do Codex Reviewer via OpenRouter para avaliação geral de código.
  3. Acionamento do Scope Corrector para validar se o PR respeita o escopo planejado; o agente gera `scope-correction.json` com recomendações.
  4. Acionamento do Security Policy Agent validando políticas de segurança e LGPD, resultando em `security-policy-report.md`.
  5. Execução do Governance Reviewer Agent para cruzar requisitos RUP e dependências arquiteturais, produzindo `governance-review.json`.
  6. Execução do Hallucination Detector para mitigar inconsistências e alucinações.
  7. Consolidação dos resultados em `review-report.md` e publicação dos artefatos anexos.
  8. Requisição de aprovação manual antes do merge.
- **Critérios de sucesso:** nenhum erro crítico registrado, relatórios sem pendências e conformidade de segurança/governança aprovada.
- **Artefatos:** `review-report.md`, `codex-review-log.json`, `scope-correction.json`, `security-policy-report.md`, `governance-review.json`, `hallucination-report.json`.
- **Requisitos associados:** REQ-019, REQ-021, REQ-022, REQ-023, REQ-029 e REQ-034.
- **Nota colaborativa:** incluir checagens que confirmem a presença das regras colaborativas (REQ-031–REQ-035) e solicitar validação humana sempre que houver impacto clínico.

### 🧪 `test.yml`
- **Fase RUP:** Transição.
- **Objetivo:** validar o comportamento da extensão em múltiplos níveis de teste.
- **Gatilhos:** `push`, `pull_request` e agendamento semanal (`schedule`).
- **Etapas:**
  1. Executar testes unitários (`jest`).
  2. Executar testes de integração (`npm run test:integration`).
  3. Executar testes E2E com Playwright/Puppeteer.
  4. Acionar agentes IA para geração e validação automática de casos.
  5. Publicar `test-report.md` e logs como artefatos.
- **Agentes envolvidos:** Unit Test Agent, E2E Test Agent.
- **Artefatos:** `test-report.md`, `screenshots/`, `logs/`.
- **Requisitos associados:** REQ-005 a REQ-009, REQ-011, REQ-015, REQ-019, REQ-020, REQ-021 e REQ-030.
- **Nota colaborativa:** adicionar suites que cubram os fluxos de validação humana (REQ-031–REQ-033) e as métricas de monitoramento clínico (REQ-034–REQ-035).

### 🚀 `release.yml`
- **Fase RUP:** Implantação.
- **Objetivo:** criar releases versionadas e empacotar a extensão.
- **Gatilhos:** `workflow_dispatch`, `push` de tags e merge em `main`.
- **Etapas:**
  1. Verificação de integridade (lint, build, test).
  2. Geração automática de changelog (`CHANGELOG.md`).
  3. Empacotamento final (`make package`).
  4. Criação de release no GitHub (`actions/create-release`).
  5. Geração e upload de `release.zip`.
- **Agentes envolvidos:** PR Agent, Release Agent.
- **Artefatos:** `release.zip`, `CHANGELOG.md`.
- **Requisitos associados:** REQ-019, REQ-022, REQ-023, REQ-029 e REQ-030.
- **Nota colaborativa:** registrar no changelog indicadores das entregas colaborativas (REQ-031–REQ-035) e a aprovação dupla exigida pela governança técnica.

### 🧾 `audit.yml`
- **Fase RUP:** Governança Técnica e Controle de Qualidade.
- **Objetivo:** auditar execução de agentes e rastrear conformidade RUP.
- **Gatilhos:** agendamento mensal (`schedule`) e `workflow_dispatch`.
- **Etapas:**
  1. Coletar logs e metadados de execuções IA, incluindo registros do Scope Corrector, Security Policy Agent e Governance Reviewer Agent.
  2. Executar Audit Agent via OpenRouter consolidando métricas de rastreabilidade.
  3. Acionar o Governance Reporter Agent para sintetizar achados de governança técnica em `governance-audit-summary.md`.
  4. Executar o Changelog Compliance Agent garantindo que cada execução possua entradas em `CHANGELOG/`, produzindo `changelog-compliance.json`.
  5. Validar rastreabilidade entre requisitos, código, testes e relatórios IA.
  6. Gerar automaticamente `audit-report.md` e arquivar todos os artefatos em `docs/reports/`.
- **Artefatos:** `audit-report.md`, `audit-log.json`, `governance-audit-summary.md`, `changelog-compliance.json`.
- **Requisitos associados:** REQ-017, REQ-019, REQ-021, REQ-022, REQ-023, REQ-029, REQ-034 e REQ-035.
- **Nota colaborativa:** consolidar métricas de colaboração IA + humano e anexar trilhas clínicas para os requisitos REQ-031–REQ-035.

## Variáveis e segredos dos workflows
A matriz abaixo consolida segredos e variáveis citados pelos pipelines, garantindo alinhamento com a [documentação de ambientes e configurações](../05-entrega-e-implantacao/ambientes-e-configuracoes-spec.md).

| Variável | Descrição | Tipo | Uso principal |
| --- | --- | --- | --- |
| `OPENROUTER_TOKEN` | Token de acesso aos modelos IA via OpenRouter. | Secret | Autenticação dos agentes IA nos workflows `review.yml` e `audit.yml`. |
| `GITHUB_TOKEN` | Token padrão de automação GitHub Actions. | Secret | Checkout, criação de releases e upload de artefatos em todos os workflows. |
| `API_BASE` | URL base da API MBRA. | Variável de ambiente | Publicação da extensão e validações de build. |
| `BUILD_ENV` | Ambiente de build (`dev`, `hml`, `prd`). | Variável de ambiente | Diferenciação de configurações por ambiente nos jobs de build e release. |
| `MODEL_DEFAULT` | Modelo IA padrão para agentes (ex.: `phi-3-mini`, `deepseek-coder`). | Variável de ambiente | Seleção dinâmica do modelo em execuções IA. |
| `AGENT_LOG_PATH` | Diretório para logs de IA. | Variável de ambiente | Persistência de evidências consumidas pelo `audit.yml`. |
| `SECURITY_POLICY_PROFILE` | Perfil de políticas utilizado pelo Security Policy Agent nas revisões. | Variável de ambiente | Geração do `security-policy-report.md` no `review.yml`. |
| `GOVERNANCE_MATRIX_PATH` | Caminho para o catálogo de requisitos de governança consumido pelos agentes. | Variável de ambiente | Cruzamento de requisitos no `review.yml` e `audit.yml`. |
- **Requisitos associados:** REQ-019, REQ-021, REQ-022, REQ-023, REQ-029 e REQ-030.
- **Nota colaborativa:** segregar variáveis adicionais quando as execuções envolverem dados de validação clínica previstos nos REQ-031–REQ-035.

## Execução automatizada
- Os agentes são acionados por workflows com gatilhos configurados para eventos de push, Pull Request, agendamentos e auditorias extraordinárias.
- Cada execução registra logs detalhados e relatórios anexados aos artefatos do pipeline para consulta posterior.
- **Requisitos associados:** REQ-019, REQ-022, REQ-023, REQ-029 e REQ-030.
- **Nota colaborativa:** sincronizar execuções automáticas com as janelas de validação humana para evitar conflitos operacionais descritos em REQ-031–REQ-035.

## Fluxo completo de execução
1. Desenvolvedor cria branch → `push` → aciona `build.yml`.
2. PR aberto → aciona `review.yml` → revisão IA + humana.
3. Merge aprovado → aciona `test.yml` → execução E2E.
4. Release gerado → aciona `release.yml` → pacote ZIP e tag.
5. Auditoria mensal → aciona `audit.yml` → relatório RUP.
- **Requisitos associados:** REQ-019, REQ-021, REQ-022, REQ-023, REQ-029, REQ-030 e REQ-034.
- **Nota colaborativa:** inserir checkpoints entre review e audit para consolidar evidências das etapas colaborativas (REQ-031–REQ-035) antes da publicação.

## Critérios de confiabilidade
- Nenhum agente pode aprovar a própria saída; revisões cruzadas e validação humana são obrigatórias antes da publicação.
- A revisão humana acompanha todas as etapas de publicação, homologação e liberação para produção.
- **Requisitos associados:** REQ-019, REQ-021, REQ-022, REQ-023 e REQ-029.
- **Nota colaborativa:** garantir que a aprovação final registre o nome dos validadores humanos responsáveis pelos requisitos REQ-031–REQ-035.

## Relatórios de conformidade IA
- Relatórios periódicos consolidam alertas e recomendações emitidas pelos agentes, anexando evidências e métricas de confiabilidade.
- Todos os relatórios são versionados no repositório e associados às rotinas de auditoria e governança técnica.
- **Requisitos associados:** REQ-019, REQ-022, REQ-023, REQ-029 e REQ-034.
- **Nota colaborativa:** destacar métricas de colaboração IA + humano e eventuais pendências clínicas alinhadas aos REQ-031–REQ-035.

## Gestão de segredos
- Prompts, tokens e parâmetros de execução permanecem em arquivos `.env` privados e nas configurações dos workflows descritos acima.
- A gestão de segredos segue política de rotação, dupla custódia e monitoramento de uso, garantindo conformidade com as diretrizes de segurança da MBRA.
- **Requisitos associados:** REQ-017, REQ-019, REQ-021, REQ-022, REQ-023, REQ-029 e REQ-030.
- **Nota colaborativa:** armazenar separadamente as credenciais utilizadas nos fluxos de validação médica colaborativa (REQ-031–REQ-035) e revisar periodicamente os acessos concedidos aos validadores humanos.

[Voltar ao índice](README-spec.md)
