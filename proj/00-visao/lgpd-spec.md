# LGPD — Conformidade e Diretrizes

> Base: [./lgpd.md](./lgpd.md)
> Plano: [/docs/plans/20251025093000-evolucao-req-spec.md](/docs/plans/20251025093000-evolucao-req-spec.md)
> Changelog: [/CHANGELOG.md#2025-10-25](/CHANGELOG.md#2025-10-25)
> Referências correlatas: [Arquitetura da extensão](/req/01-arquitetura/arquitetura-da-extensao-spec.md) · [Design geral](/req/02-design/design-geral-spec.md) · [Testes end-to-end](/req/04-testes-e-validacao/testes-end-to-end-spec.md)

## Base legal
Legítimo interesse e execução contratual.

## Controladora
Millennium Brasil (MBRA).

## Dados tratados
JWT, identificadores de sessão e endereço de e-mail ou número de WhatsApp informados voluntariamente.

## Finalidade
Autenticação, upload de PDFs e notificação de resultados, sem armazenamento externo.

## Armazenamento
Apenas local (IndexedDB). Nenhum dado é enviado fora das APIs da MBRA.

## Consentimento
Exibido antes do login, versionado e reapresentado em cada atualização da política.

## Segurança
CSP restrita, HTTPS obrigatório e comunicação via `Authorization: Bearer <JWT>`.

## Escopo do backend
Responsabilidade de outro projeto da MBRA, não incluído aqui.

## Domínio de operação
`https://yagnostic.mbra.com.br` (ambientes DEV/HML/PRD equivalentes).

A MBRA revisará periodicamente esta política para assegurar aderência à LGPD e às melhores práticas de privacidade.

[Voltar ao índice](README-spec.md)
