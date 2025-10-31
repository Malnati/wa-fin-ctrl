<!-- req/02-planejamento/requisitos.md -->
# Catálogo de Requisitos (RUP)

> Base: [./requisitos.md](./requisitos.md)
> Plano: [/docs/plans/20251025093000-evolucao-req-spec.md](/docs/plans/20251025093000-evolucao-req-spec.md)
> Changelog: [/CHANGELOG.md#2025-10-25](/CHANGELOG.md#2025-10-25)
> Referências correlatas: [Arquitetura da extensão](/req/01-arquitetura/arquitetura-da-extensao-spec.md) · [Design geral](/req/02-design/design-geral-spec.md) · [Testes end-to-end](/req/04-testes-e-validacao/testes-end-to-end-spec.md)

Este catálogo consolida todos os requisitos funcionais, não funcionais, técnicos e legais do projeto **Yagnostic**. Cada item mantém o identificador `REQ-###`, permitindo rastreabilidade direta com riscos, planos, políticas e changelogs.

A especificação completa de contexto, hipóteses e processo permanece documentada em [`especificacao-de-requisitos.md`](especificacao-de-requisitos-spec.md).

---

## Procedimento de atualização contínua

### Quando surgir um requisito funcional
1. **Catálogo:** registre o item aqui e em `requisitos.md`, mantendo ID sequencial e status atual.
2. **Visão e planejamento:** atualize `especificacao-de-requisitos.md`/`especificacao-de-requisitos-spec.md`, `cronograma.md`/`cronograma-spec.md` e `riscos-e-mitigacoes.md`/`riscos-e-mitigacoes-spec.md` com impactos de prazo, equipe e riscos.
3. **Arquitetura:** detalhe a mudança em `01-arquitetura/arquitetura-da-extensao.md`/`arquitetura-da-extensao-spec.md` e nas integrações relevantes (`integracoes-com-apis.md`/`integracoes-com-apis-spec.md`).
4. **Design:** descreva fluxos, estados e componentes em `02-design/fluxos.md`/`fluxos-spec.md`, `design-geral.md`/`design-geral-spec.md` e `componentes.md`/`componentes-spec.md`.
5. **Implementação:** capture padrões em `03-implementacao/estrutura-de-projeto.md`/`estrutura-de-projeto-spec.md` e `padroes-de-codigo.md`/`padroes-de-codigo-spec.md`.
6. **Testes:** inclua critérios e cenários em `04-testes-e-validacao/criterios-de-aceitacao.md`/`criterios-de-aceitacao-spec.md` e `testes-end-to-end.md`/`testes-end-to-end-spec.md`.
7. **Entrega:** alinhe ambientes e pacotes em `05-entrega-e-implantacao/ambientes-e-configuracoes.md`/`ambientes-e-configuracoes-spec.md` e `empacotamento.md`/`empacotamento-spec.md`.
8. **Governança:** registre validações em `06-governanca-tecnica-e-controle-de-qualidade/revisoes-com-ia.md`/`revisoes-com-ia-spec.md` e relaciona ao `CHANGELOG.md`.

### Quando surgir um requisito não funcional
1. **Catálogo:** registre o RNF neste arquivo e em `requisitos.md`, indicando tipo e métricas planejadas.
2. **Arquitetura:** detalhe restrições em `01-arquitetura/requisitos-nao-funcionais.md`/`requisitos-nao-funcionais-spec.md` e, se necessário, em `arquitetura-da-extensao.md`/`arquitetura-da-extensao-spec.md`.
3. **Design e UX:** ajuste impactos em `02-design/design-geral.md`/`design-geral-spec.md` e `componentes.md`/`componentes-spec.md`.
4. **Implementação e automação:** atualize `03-implementacao/build-e-automacao.md`/`build-e-automacao-spec.md` e `estrutura-de-projeto.md`/`estrutura-de-projeto-spec.md` com requisitos técnicos.
5. **Métricas e testes:** documente indicadores em `04-qualidade-testes/qualidade-e-metricas.md`/`qualidade-e-metricas-spec.md` e reflita critérios em `04-testes-e-validacao/criterios-de-aceitacao.md`/`criterios-de-aceitacao-spec.md`.
6. **Entrega e operação:** ajuste `05-entrega-e-implantacao/ambientes-e-configuracoes.md`/`ambientes-e-configuracoes-spec.md` e `publicacao-e-versionamento.md`/`publicacao-e-versionamento-spec.md`.
7. **Governança e controles:** registre evidências em `06-governanca-tecnica-e-controle-de-qualidade/controle-de-qualidade.md`/`controle-de-qualidade-spec.md` e `auditoria-e-rastreabilidade.md`/`auditoria-e-rastreabilidade-spec.md`.

### Referências obrigatórias por requisito

| Obrigação | Documento |
| --- | --- |
| Arquitetura | [`../01-arquitetura/arquitetura-da-extensao.md`](../01-arquitetura/arquitetura-da-extensao-spec.md) |
| Design e fluxos | [`../02-design/fluxos.md`](../02-design/fluxos-spec.md) · [`../02-design/design-geral.md`](../02-design/design-geral-spec.md) |
| Componentização | [`../02-design/componentes.md`](../02-design/componentes-spec.md) |
| Planejamento | [`cronograma.md`](cronograma-spec.md) · [`riscos-e-mitigacoes.md`](riscos-e-mitigacoes-spec.md) |
| Implementação | [`../03-implementacao/estrutura-de-projeto.md`](../03-implementacao/estrutura-de-projeto-spec.md) |
| Testes | [`../04-testes-e-validacao/criterios-de-aceitacao.md`](../04-testes-e-validacao/criterios-de-aceitacao-spec.md) · [`../04-testes-e-validacao/testes-end-to-end.md`](../04-testes-e-validacao/testes-end-to-end-spec.md) |
| Métricas | [`../04-qualidade-testes/qualidade-e-metricas.md`](../04-qualidade-testes/qualidade-e-metricas-spec.md) |
| Entrega | [`../05-entrega-e-implantacao/ambientes-e-configuracoes.md`](../05-entrega-e-implantacao/ambientes-e-configuracoes-spec.md) |
| Governança | [`../06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade.md`](../06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade-spec.md) |

### Checklist de encerramento

1. Item registrado aqui e no changelog.
2. Todos os arquivos base e `*-spec.md` listados acima atualizados.
3. Métricas e testes vinculados a `audit-history.md` e ao relatório gerado por `audit.yml`.
4. Comentário de auditoria publicado no PR com links para as evidências.

---

## Estrutura de classificação

1. **Requisitos Funcionais (RF)** — descrevem o comportamento esperado da extensão.
2. **Requisitos Não Funcionais (RNF)** — abrangem desempenho, segurança e restrições.
3. **Requisitos Técnicos (RT)** — tratam da arquitetura, compatibilidade e integração.
4. **Requisitos Legais e de Conformidade (RL)** — garantem aderência à LGPD, políticas do Chrome e padrões corporativos MBRA.

---

<a id="requisitos-funcionais-rf"></a>
## Requisitos Funcionais (RF)

| ID | Descrição | Fase RUP | Teste Associado | Status |
| --- | --- | --- | --- | --- |
| <a id="req-001"></a>REQ-001 | A extensão deve permitir login via Google SSO integrado à API MBRA. | Elaboração | M1 – Autenticação | Ativo |
| <a id="req-002"></a>REQ-002 | Após o login, deve ser obtido e armazenado um JWT válido no IndexedDB. | Construção | M1 – Autenticação | Ativo |
| <a id="req-003"></a>REQ-003 | A extensão deve consultar a API `/domain` e armazenar o domínio a ser monitorado. | Construção | M2 – Sincronização | Ativo |
| <a id="req-004"></a>REQ-004 | O sistema deve interceptar downloads de arquivos PDF originados do domínio autorizado. | Construção | M3 – Interceptação | Ativo |
| <a id="req-005"></a>REQ-005 | Quando um download for detectado, o arquivo deve ser submetido via upload para a API `/upload`. | Transição | M4 – Upload | Ativo |
| <a id="req-006"></a>REQ-006 | Após o upload, o sistema deve receber um token de resposta e exibir tela para compartilhamento. | Transição | M5 – Notificação | Ativo |
| <a id="req-007"></a>REQ-007 | O usuário poderá enviar o token recebido por e-mail ou WhatsApp, com validação de campos. | Transição | M5 – Notificação | Ativo |
| <a id="req-008"></a>REQ-008 | Deve ser possível adicionar múltiplos destinatários antes do envio. | Transição | M5 – Notificação | Ativo |
| <a id="req-009"></a>REQ-009 | Após o envio, a extensão deve exibir mensagem de agradecimento. | Transição | M5 – Notificação | Ativo |
| <a id="req-010"></a>REQ-010 | O painel lateral (side panel) deve exibir a tela de login e as demais interfaces interativas. | Construção | M1–M5 | Ativo |
| <a id="req-031"></a>REQ-031 | Workflow de validação médica com aprovação humana vinculada à IA. | Construção | M7 – Validação Médica | Proposto |
| <a id="req-032"></a>REQ-032 | Roteamento automático por especialidade para médicos validadores. | Construção | M7 – Validação Médica | Proposto |
| <a id="req-033"></a>REQ-033 | Interface dedicada para revisão médica com trilha de auditoria. | Construção | M7 – Validação Médica | Proposto |
| <a id="req-034"></a>REQ-034 | Dashboard de qualidade com métricas IA vs. humanos. | Transição | M8 – Monitoramento Clínico | Proposto |
| <a id="req-035"></a>REQ-035 | Integração HIS/LIS com padrões HL7 FHIR e trilha auditável. | Transição | M9 – Integrações Clínicas | Proposto |

---

<a id="requisitos-nao-funcionais-rnf"></a>
## Requisitos Não Funcionais (RNF)

| ID | Descrição | Fase RUP | Tipo | Status |
| --- | --- | --- | --- | --- |
| <a id="req-011"></a>REQ-011 | O armazenamento local deve utilizar IndexedDB com isolamento por domínio. | Construção | Segurança | Ativo |
| <a id="req-012"></a>REQ-012 | A extensão deve funcionar sem dependências externas via CDN. | Elaboração | Compatibilidade | Ativo |
| <a id="req-013"></a>REQ-013 | O build deve ser compatível com Chrome Desktop e Chrome Mobile. | Implantação | Portabilidade | Ativo |
| <a id="req-014"></a>REQ-014 | O JWT deve expirar automaticamente conforme TTL da API. | Transição | Segurança | Ativo |
| <a id="req-015"></a>REQ-015 | O tempo de resposta das requisições não deve exceder 3 segundos. | Teste | Desempenho | Ativo |
| <a id="req-016"></a>REQ-016 | A UI deve ser responsiva e adaptável ao tamanho do painel lateral. | Design | Usabilidade | Ativo |
| <a id="req-017"></a>REQ-017 | Logs locais de erro devem ser armazenados e enviados apenas sob consentimento LGPD. | Governança | Privacidade | Ativo |
| <a id="req-036"></a>REQ-036 | Disponibilidade 99.9% para workflow de validação médica. | Construção | Disponibilidade | Proposto |
| <a id="req-037"></a>REQ-037 | Latência <2s para telas de validação em 95% das requisições. | Construção | Desempenho | Proposto |
| <a id="req-038"></a>REQ-038 | Proteção de dados médicos conforme LGPD e padrões clínicos. | Construção | Segurança | Proposto |
| <a id="req-039"></a>REQ-039 | Suporte a 10.000 validações simultâneas com escalabilidade horizontal. | Construção | Escalabilidade | Proposto |
| <a id="req-040"></a>REQ-040 | Conformidade com CFM, ANVISA e SBIS para validação colaborativa. | Governança | Regulatório | Proposto |

---

<a id="requisitos-tecnicos-rt"></a>
## Requisitos Técnicos (RT)

| ID | Descrição | Fase RUP | Relacionamento | Status |
| --- | --- | --- | --- | --- |
| <a id="req-018"></a>REQ-018 | O projeto deve ser implementado em TypeScript com React e Manifest V3. | Elaboração | Arquitetura | Ativo |
| <a id="req-019"></a>REQ-019 | O build deve ser empacotado via Makefile e GitHub Actions. | Implantação | [`../06-governanca-tecnica-e-controle-de-qualidade/revisoes-com-ia.md`](../06-governanca-tecnica-e-controle-de-qualidade/revisoes-com-ia-spec.md) | Ativo |
| <a id="req-020"></a>REQ-020 | O sistema deve utilizar apenas APIs oficiais do Chrome (downloads, sidePanel, storage). | Construção | Extensão | Ativo |
| <a id="req-021"></a>REQ-021 | A integração com OpenRouter e Codex deve respeitar controle de versão de modelos. | Governança | [`../../AGENTS.md`](../../AGENTS.md) | Ativo |
| <a id="req-022"></a>REQ-022 | Todos os pipelines devem armazenar logs e artefatos em `/docs/reports/`. | Governança | [`../06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade.md#catalogo-de-relatorios-automatizados`](../06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade-spec.md#catalogo-de-relatorios-automatizados) | Ativo |
| <a id="req-023"></a>REQ-023 | Cada execução IA deve gerar metadados rastreáveis (run_id, commit, timestamp). | Governança | [`../06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade.md#catalogo-de-relatorios-automatizados`](../06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade-spec.md#catalogo-de-relatorios-automatizados) | Ativo |
| <a id="req-041"></a>REQ-041 | Arquitetura de microserviços para orquestrar validação colaborativa. | Construção | [Capacidade de Diagnóstico Colaborativo](capacidade-diagnostico-colaborativo-spec.md) | Proposto |
| <a id="req-042"></a>REQ-042 | Banco clínico particionado com trilha de auditoria para validação. | Construção | [Capacidade de Diagnóstico Colaborativo](capacidade-diagnostico-colaborativo-spec.md) | Proposto |
| <a id="req-043"></a>REQ-043 | APIs HL7 FHIR para integração com HIS/LIS parceiros. | Transição | [Capacidade de Diagnóstico Colaborativo](capacidade-diagnostico-colaborativo-spec.md) | Proposto |
| <a id="req-044"></a>REQ-044 | Observabilidade avançada com logs correlacionados e tracing distribuído. | Construção | [Capacidade de Diagnóstico Colaborativo](capacidade-diagnostico-colaborativo-spec.md) | Proposto |
| <a id="req-045"></a>REQ-045 | Deploy cloud-native com Kubernetes, auto-scaling e GitOps. | Transição | [Capacidade de Diagnóstico Colaborativo](capacidade-diagnostico-colaborativo-spec.md) | Proposto |

---

<a id="requisitos-legais-e-de-conformidade-rl"></a>
## Requisitos Legais e de Conformidade (RL)

| ID | Descrição | Fase RUP | Base Legal | Status |
| --- | --- | --- | --- | --- |
| <a id="req-024"></a>REQ-024 | A extensão deve solicitar consentimento explícito do usuário antes de qualquer uso de dados. | Construção | LGPD Art. 7 | Ativo |
| <a id="req-025"></a>REQ-025 | O termo de consentimento LGPD deve ser exibido antes da primeira autenticação. | Transição | LGPD Art. 8 | Ativo |
| <a id="req-026"></a>REQ-026 | Nenhum dado pessoal deve ser enviado a terceiros sem autorização expressa. | Governança | LGPD Art. 9 | Ativo |
| <a id="req-027"></a>REQ-027 | O armazenamento local deve permitir revogação e exclusão imediata de dados. | Transição | LGPD Art. 18 | Ativo |
| <a id="req-028"></a>REQ-028 | A política de privacidade deve estar disponível no painel lateral (side panel). | Construção | Chrome Web Store / LGPD | Ativo |
| <a id="req-029"></a>REQ-029 | A MBRA é responsável pelo tratamento e controle dos dados coletados. | Governança | LGPD Art. 37 | Ativo |
| <a id="req-030"></a>REQ-030 | A extensão deve cumprir integralmente as políticas de publicação do Chrome Manifest V3. | Implantação | Google Chrome Dev Policy | Ativo |

---

## Rastreabilidade complementar

- Matriz de riscos: [`riscos-e-mitigacoes.md`](riscos-e-mitigacoes-spec.md)
- Governança técnica: [`../06-governanca-tecnica-e-controle-de-qualidade/`](../06-governanca-tecnica-e-controle-de-qualidade/)
- Planos UI/UX: [`../../plans/`](../../plans/)
- Relatórios de auditoria: [`../../reports/`](../../reports/)

---

**Responsável:** Ricardo Malnati — Engenheiro de Software  \\
**Organização:** Millennium Brasil (MBRA)  \\
**Documento:** Catálogo de Requisitos RUP  \\
**Status:** Ativo e sob revisão contínua
