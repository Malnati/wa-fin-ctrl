<!-- req/05-entrega-e-implantacao/README.md -->
# Entrega e Implantação

> Base: [./README.md](./README.md)
> Plano: [/docs/plans/20251025093000-evolucao-req-spec.md](/docs/plans/20251025093000-evolucao-req-spec.md)
> Changelog: [/CHANGELOG.md#2025-10-25](/CHANGELOG.md#2025-10-25)
> Referências correlatas: [Arquitetura da extensão](/req/01-arquitetura/arquitetura-da-extensao-spec.md) · [Design geral](/req/02-design/design-geral-spec.md) · [Testes end-to-end](/req/04-testes-e-validacao/testes-end-to-end-spec.md)

A fase de Deployment do Rational Unified Process (RUP) consolida todo o trabalho anterior para entregar a extensão Chrome MBRA (Yagnostic) validada e pronta para uso em operação. Nesta etapa final, os artefatos aprovados são empacotados, versionados e publicados com rastreabilidade completa entre requisitos, planos de teste e resultados homologados.

Todos os procedimentos aqui descritos respeitam as regras técnicas já estabelecidas no repositório, somam-se às premissas desta fase e asseguram integridade do build, controle de versões e conformidade com a legislação aplicável, especialmente a Lei Geral de Proteção de Dados (LGPD).

## Conteúdo da seção
- [Empacotamento](empacotamento-spec.md) — define como a extensão é compilada e empacotada para distribuição em conformidade com [REQ-012](../02-planejamento/requisitos-spec.md#req-012), [REQ-018](../02-planejamento/requisitos-spec.md#req-018) e [REQ-019](../02-planejamento/requisitos-spec.md#req-019).
- [Ambientes e Configurações](ambientes-e-configuracoes-spec.md) — detalha DEV, HML e PRD com as variáveis correspondentes, garantindo [REQ-003](../02-planejamento/requisitos-spec.md#req-003), [REQ-010](../02-planejamento/requisitos-spec.md#req-010) e [REQ-029](../02-planejamento/requisitos-spec.md#req-029).
- [Publicação e Versionamento](publicacao-e-versionamento-spec.md) — estabelece versionamento, releases e fluxo de distribuição para atender [REQ-019](../02-planejamento/requisitos-spec.md#req-019), [REQ-022](../02-planejamento/requisitos-spec.md#req-022) e [REQ-030](../02-planejamento/requisitos-spec.md#req-030).
- [Operação e Manutenção](operacao-e-manutencao-spec.md) — descreve monitoramento pós-implantação e ciclos de atualização alinhados com [REQ-015](../02-planejamento/requisitos-spec.md#req-015), [REQ-017](../02-planejamento/requisitos-spec.md#req-017) e [REQ-029](../02-planejamento/requisitos-spec.md#req-029), além de preparar a coexistência com REQ-031–REQ-035.

[Voltar ao índice](../README-spec.md)
