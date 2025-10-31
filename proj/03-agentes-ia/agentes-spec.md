# Agentes

> Base: [./agentes.md](./agentes.md)
> Plano: [/docs/plans/20251025093000-evolucao-req-spec.md](/docs/plans/20251025093000-evolucao-req-spec.md)
> Changelog: [/CHANGELOG.md#2025-10-25](/CHANGELOG.md#2025-10-25)
> Referências correlatas: [Arquitetura da extensão](/req/01-arquitetura/arquitetura-da-extensao-spec.md) · [Design geral](/req/02-design/design-geral-spec.md) · [Testes end-to-end](/req/04-testes-e-validacao/testes-end-to-end-spec.md)

As definições vigentes dos agentes estão documentadas em [Governança Técnica](../06-governanca-tecnica-e-controle-de-qualidade/governanca-tecnica-spec.md) e na tabela oficial de `AGENTS.md`, garantindo rastreabilidade direta com [REQ-021](../02-planejamento/requisitos-spec.md#req-021) e [REQ-023](../02-planejamento/requisitos-spec.md#req-023).

## Escopo e responsabilidades
- `AGENTS.md` centraliza identificadores, modelos e versões de cada agente operacional, devendo ser atualizado a cada release que impacte [REQ-019](../02-planejamento/requisitos-spec.md#req-019) e pipelines CI/CD.
- A governança técnica publica revisões periódicas que confirmam aderência dos agentes às políticas LGPD ([REQ-024](../02-planejamento/requisitos-spec.md#req-024)) e às obrigações de auditoria ([REQ-029](../02-planejamento/requisitos-spec.md#req-029)).
- Cada execução IA deve registrar `run_id`, `commit` e `timestamp` em `docs/reports/`, preservando a rastreabilidade de [REQ-022](../02-planejamento/requisitos-spec.md#req-022) e [REQ-023](../02-planejamento/requisitos-spec.md#req-023).

## Convivência com a capacidade colaborativa
- A retomada dos fluxos clínicos colaborativos deve incluir esses agentes em revisões conjuntas descritas em [REQ-031](../02-planejamento/requisitos-spec.md#req-031) a [REQ-033](../02-planejamento/requisitos-spec.md#req-033), mantendo a rastreabilidade de logs prevista em [REQ-022](../02-planejamento/requisitos-spec.md#req-022).
- Mudanças que envolvam validação médica compartilhada precisam ser descritas simultaneamente em `req/02-planejamento/capacidade-diagnostico-colaborativo.md` para manter alinhamento com [REQ-034](../02-planejamento/requisitos-spec.md#req-034) e [REQ-035](../02-planejamento/requisitos-spec.md#req-035) sem violar consentimentos de [REQ-024](../02-planejamento/requisitos-spec.md#req-024).

## Referências cruzadas
- Utilize `docs/prototype/` e os repositórios de código (`ui/`, `api/`, `extension/`) como fonte de verdade durante execuções dos agentes, citando o arquivo de saída por meio da notação `【F:path†Lx-Ly】` adotada em [REQ-018](../02-planejamento/requisitos-spec.md#req-018).
- Sempre que um agente ajustar microcopy ou tokens de branding, sincronize as alterações com `req/06-ux-brand/identidades-visuais.md` e com os requisitos legais [REQ-024](../02-planejamento/requisitos-spec.md#req-024) a [REQ-028](../02-planejamento/requisitos-spec.md#req-028).

[Voltar ao índice](README-spec.md)
