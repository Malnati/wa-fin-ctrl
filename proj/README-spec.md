<!-- req/README.md -->
# Documentação RUP da Solução

> Base: [./README.md](./README.md)
> Plano: [/docs/plans/20251025093000-evolucao-req-spec.md](/docs/plans/20251025093000-evolucao-req-spec.md)
> Changelog: [/CHANGELOG.md#2025-10-25](/CHANGELOG.md#2025-10-25)
> Referências correlatas: [Arquitetura da extensão](/req/01-arquitetura/arquitetura-da-extensao-spec.md) · [Design geral](/req/02-design/design-geral-spec.md) · [Testes end-to-end](/req/04-testes-e-validacao/testes-end-to-end-spec.md)

**Fase: Documentação completa RUP**

Bem-vindo ao acervo oficial de requisitos da solução mantida neste repositório. A pasta `req/` consolida todas as fases do Rational Unified Process (RUP) aplicadas ao produto atual e a qualquer subprojeto que venha a coexistir neste mono-repositório. Cada artefato aqui publicado deve permanecer autônomo, completo e versionado em conjunto com o código-fonte, garantindo rastreabilidade ponta a ponta.

---

## Introdução Geral

A solução combina componentes cliente e servidor, integrações externas e automações operacionais. Utilize este diretório para registrar visão de negócio, arquitetura técnica, design detalhado, planejamento, implementação, testes, implantação, governança e diretrizes de experiência. Sempre que novos módulos forem adicionados (por exemplo, extensões, APIs, aplicações web ou serviços auxiliares), documente-os na fase correspondente, mantendo o histórico de decisões acessível para humanos e agentes.

As instruções operacionais para agentes estão descritas em `AGENTS.md`. Quando for necessário implementar ou revisar mudanças, consulte o artefato desta pasta referente à fase RUP adequada antes de iniciar qualquer desenvolvimento.

---

## Regras de evolução de requisitos

1. **Catálogo sempre atualizado.** Todo requisito novo ou alterado precisa ser registrado em `req/02-planejamento/requisitos.md` e refletido imediatamente em `requisitos-spec.md`, mantendo o identificador `REQ-###` ou `RNF-###` conforme aplicável.
2. **Pares base/spec sincronizados.** Qualquer ajuste nos artefatos da req deve atualizar simultaneamente o arquivo base (`.md`) e seu espelho `*-spec.md`, preservando texto, links e âncoras.
3. **Percurso documental completo.** Antes de iniciar a implementação, siga o fluxo descrito em `instrucoes-evolucao-requisitos.md`, atualizando as fases 01 a 06 da req com as evidências correspondentes para requisitos funcionais e não funcionais.
4. **Rastreabilidade mínima obrigatória.** Cada requisito precisa apontar para arquitetura, design, testes e governança associados. Registre também impactos em riscos, cronograma, métricas e publicação quando houver.
5. **Trilha de auditoria.** Feche cada ciclo com item no `CHANGELOG.md`, nova entrada em `req/audit-history.md`/`req/audit-history-spec.md` e checklist assinado em `req/06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade.md`.

---

## Estrutura das Fases RUP

| Fase | Diretório | Descrição |
| --- | --- | --- |
| 00 – Visão do Projeto | [./00-visao/](./00-visao/) | Objetivos, escopo, stakeholders e considerações legais e regulatórias. |
| 01 – Arquitetura | [./01-arquitetura/](./01-arquitetura/) | Macroarquitetura, integrações externas e requisitos não funcionais. |
| 02 – Design Detalhado | [./02-design/](./02-design/) | Componentes internos, contratos, fluxos de interação e protótipos. |
| 02 – Planejamento | [./02-planejamento/](./02-planejamento/) | Cronograma, governança, roadmap, riscos e WBS. |
| 03 – Implementação | [./03-implementacao/](./03-implementacao/) | Estrutura de diretórios, padrões de código e automações de build/teste. |
| 04 – Testes e Validação | [./04-testes-e-validacao/](./04-testes-e-validacao/) | Estratégia de QA, critérios de aceite, suites E2E e validação de marcos. |
| 05 – Entrega e Implantação | [./05-entrega-e-implantacao/](./05-entrega-e-implantacao/) | Ambientes, empacotamento, versionamento e operação contínua. |
| 06 – Governança Técnica e Controle de Qualidade | [./06-governanca-tecnica-e-controle-de-qualidade/](./06-governanca-tecnica-e-controle-de-qualidade/) | Auditorias, revisões com IA, políticas de conformidade e monitoramento. |
| 06 – UX & Brand | [./06-ux-brand/](./06-ux-brand/) | Diretrizes de UX, acessibilidade, identidade visual e regras de experiência. |
| 07 – Contribuição | [./07-contribuicao/](./07-contribuicao/) | Padrões de colaboração, commits e fluxos de PR. |
| 99 – Anexos | [./99-anexos/](./99-anexos/) | Glossário, referências externas e anexos de apoio. |

Materiais legados e históricos permanecem publicados em subdiretórios próprios. Consulte-os apenas quando for necessário recuperar contexto anterior ao ciclo atual.

## Navegação rápida pelas fases RUP

- [00-Visão](00-visao/README-spec.md): escopo, objetivos, stakeholders e diretrizes regulatórias.
- [01-Arquitetura](01-arquitetura/README-spec.md): camadas da solução, integrações externas e restrições técnicas.
- [02-Design](02-design/README-spec.md): diagramas, componentes e fluxos operacionais.
- [02-Planejamento](02-planejamento/README-spec.md): cronogramas, governança e riscos controlados.
- [03-Implementação](03-implementacao/README-spec.md): padrões estruturais, build e automações.
- [04-Testes e Validação](04-testes-e-validacao/README-spec.md): estratégia de QA, marcos e cenários ponta a ponta.
- [05-Entrega e Implantação](05-entrega-e-implantacao/README-spec.md): ambientes, publicação e versionamento.
- [06-Governança Técnica e CQ](06-governanca-tecnica-e-controle-de-qualidade/README-spec.md): auditorias, controle de qualidade e revisões com IA.
- [06-UX & Brand](06-ux-brand/README-spec.md): diretrizes de experiência, identidade e acessibilidade.
- [07-Contribuição](07-contribuicao/README-spec.md): colaboração, padrões de commit e PR.

## Materiais complementares

- [Planejamento histórico](02-planejamento/README-spec.md): registros auxiliares de roadmap, riscos e cronogramas anteriores.
- [Agentes IA (arquivo)](03-agentes-ia/README-spec.md): documentação legada das políticas de automação.
- [Documentos legados de implementação](03-implementacao/README-spec.md): indica a migração das diretrizes técnicas para as fases atuais.
- [Qualidade e testes (arquivo)](04-qualidade-testes/README-spec.md): material preservado de ciclos anteriores.
- [Operação e release (arquivo)](05-operacao-release/README-spec.md): registros históricos de implantação.
- [UX e identidade](06-ux-brand/README-spec.md): orientações complementares de experiência e comunicação visual.
- [Contribuição](07-contribuicao/README-spec.md): padrões de colaboração e governança de commits.
- [Anexos](99-anexos/README-spec.md): glossário e referências adicionais.

### Convenção de arquivos

> **Nota de governança documental:** todas as pastas da req adotam exclusivamente `README.md` como página principal. É proibido criar `index.md`/`INDEX.md`. Qualquer novo artefato deve seguir a estrutura indicada no README da fase correspondente e precisa ser aprovado no changelog que acompanha a entrega.

---

## 📍 Fases do Ciclo RUP

1. **Iniciação (Visão)** — Define objetivos, escopo e atores envolvidos.
2. **Elaboração (Arquitetura)** — Formaliza a estrutura técnica e limites de integração.
3. **Construção (Design/Implementação)** — Consolida componentes, contratos e padrões de código.
4. **Transição (Testes e Validação)** — Verifica fluxos críticos e critérios de aceite.
5. **Implantação (Entrega)** — Empacota serviços, pipelines e canais de distribuição.
6. **Governança (Operação contínua)** — Sustenta auditorias, agentes e conformidade.

---

## Automação e IA no Ciclo RUP

Os agentes inteligentes descritos em `AGENTS.md` operam de acordo com os pipelines catalogados em `req/06-governanca-tecnica-e-controle-de-qualidade/revisoes-com-ia.md`. Cada agente deve seguir as regras de controle humano, versionamento e auditoria descritas nos artefatos de governança.

---

## Conformidade e Segurança

- Atenda às legislações e normas aplicáveis ao domínio do produto (por exemplo, LGPD, HIPAA, GDPR). Documente as obrigações vigentes em `req/00-visao/lgpd.md` ou artefatos equivalentes.
- Garanta criptografia em repouso e em trânsito para dados sensíveis, registrando os mecanismos utilizados.
- Vincule políticas de acesso e monitoramento aos ambientes descritos na fase de Entrega e Implantação.

---

## 🏢 Referência de Responsabilidade Técnica

**Responsável:** consulte `req/06-governanca-tecnica-e-controle-de-qualidade/governanca-tecnica.md` para o quadro atualizado de responsabilidade.

**Infraestrutura:** GitHub e demais ferramentas aprovadas para o projeto (pipelines, registries, provedores de nuvem) documentadas na fase de Entrega e Implantação.

**Licença:** siga a política de licenciamento definida para o repositório ou a organização proprietária.

**Última atualização:** registrada no changelog correspondente à revisão mais recente.

---

[Voltar ao topo](#documentação-rup-da-solução)
