# Políticas e Regras

> Base: [./politicas-e-regras.md](./politicas-e-regras.md)
> Plano: [/docs/plans/20251025093000-evolucao-req-spec.md](/docs/plans/20251025093000-evolucao-req-spec.md)
> Changelog: [/CHANGELOG.md#2025-10-25](/CHANGELOG.md#2025-10-25)
> Referências correlatas: [Arquitetura da extensão](/req/01-arquitetura/arquitetura-da-extensao-spec.md) · [Design geral](/req/02-design/design-geral-spec.md) · [Testes end-to-end](/req/04-testes-e-validacao/testes-end-to-end-spec.md)

As políticas de atuação de agentes de IA seguem as instruções descritas em `AGENTS.md` e na fase [05-Governança](../06-governanca-tecnica-e-controle-de-qualidade/README-spec.md), garantindo conformidade com [REQ-021](../02-planejamento/requisitos-spec.md#req-021) e [REQ-030](../02-planejamento/requisitos-spec.md#req-030).

## Diretrizes obrigatórias
- Respeitar LGPD e consentimento explícito do usuário antes de acionar qualquer modelo, conforme [REQ-024](../02-planejamento/requisitos-spec.md#req-024) e [REQ-025](../02-planejamento/requisitos-spec.md#req-025).
- Impedir transmissão de dados clínicos a terceiros sem autorização, atendendo [REQ-026](../02-planejamento/requisitos-spec.md#req-026) e revogação imediata de [REQ-027](../02-planejamento/requisitos-spec.md#req-027).
- Exibir ou anexar política de privacidade e termos no side panel quando houver interação com usuários finais, preservando [REQ-028](../02-planejamento/requisitos-spec.md#req-028) e [REQ-029](../02-planejamento/requisitos-spec.md#req-029).

## Processos de revisão
- Cada alteração solicitada por agentes precisa ser revisada manualmente antes do merge, de acordo com as checklists de `AGENTS.md` e com [REQ-022](../02-planejamento/requisitos-spec.md#req-022).
- Atualizações que afetem protótipos ou código devem incluir evidências no changelog para manter os vínculos de [REQ-005](../02-planejamento/requisitos-spec.md#req-005) a [REQ-010](../02-planejamento/requisitos-spec.md#req-010).
- Para a fase colaborativa, sincronize as novas políticas com [REQ-031](../02-planejamento/requisitos-spec.md#req-031) e com a matriz de riscos descrita em `req/02-planejamento/riscos-e-mitigacoes.md`, mantendo os registros previstos em [REQ-022](../02-planejamento/requisitos-spec.md#req-022).

[Voltar ao índice](README-spec.md)
