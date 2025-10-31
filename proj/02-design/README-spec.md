<!-- req/02-design/README.md -->
# Design do Sistema

> Base: [./README.md](./README.md)
> Plano: [/docs/plans/20251025093000-evolucao-req-spec.md](/docs/plans/20251025093000-evolucao-req-spec.md)
> Changelog: [/CHANGELOG.md#2025-10-25](/CHANGELOG.md#2025-10-25)
> Referências correlatas: [Arquitetura da extensão](/req/01-arquitetura/arquitetura-da-extensao-spec.md) · [Design geral](/req/02-design/design-geral-spec.md) · [Testes end-to-end](/req/04-testes-e-validacao/testes-end-to-end-spec.md)

A fase de Design no Rational Unified Process tem por finalidade traduzir a arquitetura lógica definida anteriormente em um modelo de design que detalhe os elementos estruturais do sistema, suas responsabilidades internas e as colaborações planejadas entre eles. Esse produto de trabalho consolida decisões técnicas que serão insumos diretos para a implementação.

Este design é derivado da fase de Arquitetura e estabelece a base concreta para a etapa de Construção, quando a extensão Chrome Yagnostic será implementada. Além da estrutura interna, os documentos desta fase agora incluem requisitos rastreáveis para o protótipo visual do side panel (`RUP-02-DES-001` a `RUP-02-DES-003`), garantindo alinhamento com as diretrizes de UX descritas em `req/06-ux-brand`.

Como parte da etapa de Design no RUP, esta documentação admite a representação visual das interações e estruturas por meio de diagramas textuais portáveis. Podem ser adotados formatos compatíveis com Markdown e pipelines de automação, como PlantUML, Mermaid ou ASCII Art, garantindo versionamento e rastreabilidade.

Documentos desta seção:
- [Design Geral](design-geral-spec.md) — descreve princípios, visão técnica detalhada e requisitos do protótipo de layout.
- [Componentes](componentes-spec.md) — define os módulos, suas funções e fronteiras.
- [Fluxos](fluxos-spec.md) — descreve a sequência lógica de interações entre os componentes.

[Voltar ao índice](../README-spec.md)
