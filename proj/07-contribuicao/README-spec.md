<!-- req/07-contribuicao/README.md -->
# Contribuição

> Base: [./README.md](./README.md)
> Plano: [/docs/plans/20251025093000-evolucao-req-spec.md](/docs/plans/20251025093000-evolucao-req-spec.md)
> Changelog: [/CHANGELOG.md#2025-10-25](/CHANGELOG.md#2025-10-25)
> Referências correlatas: [Arquitetura da extensão](/req/01-arquitetura/arquitetura-da-extensao-spec.md) · [Design geral](/req/02-design/design-geral-spec.md) · [Testes end-to-end](/req/04-testes-e-validacao/testes-end-to-end-spec.md)

Esta seção organiza como novas contribuições preservam o histórico do produto, os requisitos `REQ-001` a `REQ-030` e a convivência com a capacidade colaborativa (`REQ-031` a `REQ-045`). O foco é manter o fluxo RUP da extensão Chrome MBRA alinhado aos protótipos, código-fonte e controles de governança já publicados.

- [Contribuindo](contribuindo-spec.md): passo a passo de onboarding, preparação de ambiente e rotinas de revisão que protegem os fluxos M1–M5 legados e descrevem como coexistem com o diagnóstico colaborativo. (`REQ-001`–`REQ-030`, `REQ-031`–`REQ-035`).
- [Padrões de Commit](padroes-de-commit-spec.md): convenções de mensagens, exemplos e validações automáticas que reforçam rastreabilidade com os requisitos e os protótipos homologados. (`REQ-016`, `REQ-019`, `REQ-022`, `REQ-028`).
- [Template de PR](template-de-pr-spec.md): checklist de revisão cruzando código, documentação e protótipos antes de liberar as mudanças, mantendo a rastreabilidade com os requisitos funcionais, não funcionais e colaborativos. (`REQ-006`, `REQ-010`, `REQ-019`, `REQ-029`, `REQ-033`).

## Rastreabilidade essencial
- Cada contribuição deve citar explicitamente os requisitos atendidos utilizando o formato `[REQ-00x](../02-planejamento/requisitos-spec.md#req-00x)`, garantindo navegação direta para o catálogo oficial.
- Atualizações em protótipos (`prototype/*.html`, `prototype/styles.css`) e código (`ui/src/**`, `extension/**`) devem referenciar os mesmos requisitos já implementados para prevenir regressões em login, sincronização, uploads e notificações (`REQ-001`–`REQ-010`).
- Qualquer entrega que interaja com auditoria, dashboards ou observabilidade precisa manter a rastreabilidade com `REQ-015`, `REQ-019`, `REQ-022` e `REQ-029`, anexando evidências no PR e no `CHANGELOG`.
- **Nota colaborativa:** ao modificar fluxos compartilhados entre legados e colaborativos (filas, dashboards, notificações), documente a compatibilidade com `REQ-031`–`REQ-035` seguindo as instruções em [`req/02-planejamento/capacidade-diagnostico-colaborativo.md`](../02-planejamento/capacidade-diagnostico-colaborativo-spec.md).

[Voltar ao índice](../README-spec.md)
