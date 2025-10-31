<!-- req/02-planejamento/especificacao-de-requisitos.md -->
# Especificação de Requisitos (RUP)

> Base: [./especificacao-de-requisitos.md](./especificacao-de-requisitos.md)
> Plano: [/docs/plans/20251025093000-evolucao-req-spec.md](/docs/plans/20251025093000-evolucao-req-spec.md)
> Changelog: [/CHANGELOG.md#2025-10-25](/CHANGELOG.md#2025-10-25)
> Referências correlatas: [Arquitetura da extensão](/req/01-arquitetura/arquitetura-da-extensao-spec.md) · [Design geral](/req/02-design/design-geral-spec.md) · [Testes end-to-end](/req/04-testes-e-validacao/testes-end-to-end-spec.md)

**Projeto:** Extensão Chrome MBRA (Yagnostic)  
**Organização:** Millennium Brasil (MBRA)

Esta página consolida todos os requisitos do projeto conforme a metodologia **Rational Unified Process (RUP)**.
Cada requisito é identificado, classificado e vinculado às fases subsequentes do ciclo de desenvolvimento (Arquitetura, Design, Testes e Governança), garantindo rastreabilidade com a matriz de riscos e os relatórios automatizados.

---

## 0. Processo de evolução

- Registre todo requisito novo em `requisitos.md`/`requisitos-spec.md`, atualizando também esta especificação com o intervalo correto de IDs.
- Aplique o fluxo descrito em `instrucoes-evolucao-requisitos.md` para atualizar arquitetura, design, planejamento, implementação, testes, entrega e governança, sempre em pares base/`*-spec.md`.
- Relacione cada requisito com riscos (`riscos-e-mitigacoes.md`), cronograma (`cronograma.md`), métricas (`../04-qualidade-testes/qualidade-e-metricas.md`) e auditoria (`../06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade.md`).
- Finalize o ciclo com item no `CHANGELOG.md`, entrada em `req/audit-history.md` e comentário de auditoria no PR.

---

## 1. Estrutura de classificação

Os requisitos estão organizados nas seguintes categorias:

1. **Requisitos Funcionais (RF)** — descrevem o comportamento esperado da extensão.
2. **Requisitos Não Funcionais (RNF)** — abrangem desempenho, segurança e restrições.
3. **Requisitos Técnicos (RT)** — tratam da arquitetura, compatibilidade e integração.
4. **Requisitos Legais e de Conformidade (RL)** — garantem aderência à LGPD, políticas do Chrome e padrões corporativos MBRA.

---

## 2. Catálogo detalhado

As tabelas completas de requisitos foram consolidadas em [`requisitos.md`](requisitos-spec.md). O arquivo mantém os identificadores `REQ-###`, âncoras individuais para cada item e as mesmas colunas de fase, testes, relacionamentos e status anteriormente publicados aqui.

### 2.1 Requisitos Funcionais (RF)
Consulte a tabela de [Requisitos Funcionais](requisitos-spec.md#requisitos-funcionais-rf) para o detalhamento completo e navegação direta por ID (`REQ-001` a `REQ-035`).

### 2.2 Requisitos Não Funcionais (RNF)
Os critérios de desempenho, segurança e disponibilidade permanecem organizados em [Requisitos Não Funcionais](requisitos-spec.md#requisitos-nao-funcionais-rnf), preservando as mesmas descrições e estados de acompanhamento.

### 2.3 Requisitos Técnicos (RT)
Integrações, arquitetura e dependências estão documentadas em [Requisitos Técnicos](requisitos-spec.md#requisitos-tecnicos-rt), garantindo rastreabilidade com governança e capacidade colaborativa.

### 2.4 Requisitos Legais e de Conformidade (RL)
Obrigações LGPD, políticas da Chrome Web Store e demais requisitos regulatórios continuam descritos na seção de [Requisitos Legais e de Conformidade](requisitos-spec.md#requisitos-legais-e-de-conformidade-rl).

---

> Detalhes completos da nova capacidade colaborativa estão documentados em [`capacidade-diagnostico-colaborativo.md`](capacidade-diagnostico-colaborativo-spec.md).

## 6. Rastreabilidade e correlação

| Elemento | Documento de referência |
| --- | --- |
| Testes | [`../04-testes-e-validacao/`](../04-testes-e-validacao/) |
| Arquitetura | [`../01-arquitetura/`](../01-arquitetura/) |
| Design | [`../02-design/`](../02-design/) |
| Implantação | [`../05-entrega-e-implantacao/`](../05-entrega-e-implantacao/) |
| Governança | [`../06-governanca-tecnica-e-controle-de-qualidade/`](../06-governanca-tecnica-e-controle-de-qualidade/) |
| Agentes e Pipelines | [`../../AGENTS.md`](../../AGENTS.md), [`../06-governanca-tecnica-e-controle-de-qualidade/revisoes-com-ia.md`](../06-governanca-tecnica-e-controle-de-qualidade/revisoes-com-ia-spec.md) |

---

## 7. Controle de versão e auditoria

- Cada requisito deve conter seu ID único (REQ-###) e aparecer nos relatórios de auditoria (`docs/reports/audit-report.md`).
- Alterações em requisitos exigem PR exclusivo e aprovação por IA + humano.
- O pipeline `audit.yml` verifica:
  - Requisitos não rastreados.
  - Requisitos obsoletos ou duplicados.
  - Falhas de associação com testes ou commits.
- Todos os requisitos são exportados automaticamente em formato JSON para rastreabilidade futura.

---

## 8. Responsabilidade técnica

**Responsável:** Ricardo Malnati — Engenheiro de Software  
**Organização:** Millennium Brasil (MBRA)  
**Documento:** Especificação e Rastreabilidade de Requisitos  
**Status:** Ativo e sob revisão contínua
