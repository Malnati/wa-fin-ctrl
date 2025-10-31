<!-- req/03-implementacao/padroes-de-codigo.md -->
# Padrões de Código e Convenções

> Base: [./padroes-de-codigo.md](./padroes-de-codigo.md)
> Plano: [/docs/plans/20251025093000-evolucao-req-spec.md](/docs/plans/20251025093000-evolucao-req-spec.md)
> Changelog: [/CHANGELOG.md#2025-10-25](/CHANGELOG.md#2025-10-25)
> Referências correlatas: [Arquitetura da extensão](/req/01-arquitetura/arquitetura-da-extensao-spec.md) · [Design geral](/req/02-design/design-geral-spec.md) · [Testes end-to-end](/req/04-testes-e-validacao/testes-end-to-end-spec.md)

As convenções abaixo são obrigatórias para o desenvolvimento do front-end React e da API NestJS na versão 5, assegurando coerência entre componentes, serviços e requisitos clínicos, conforme [REQ-001](../02-planejamento/requisitos-spec.md#req-001) a [REQ-030](../02-planejamento/requisitos-spec.md#req-030). 【F:docs/plans/plan-ui-ux-requirements-v5.md†L150-L210】

---

## Atualizações quando requisitos impactarem convenções

- Atualize este arquivo e `padroes-de-codigo.md` sempre que um novo `REQ-###` ou `RNF-###` exigir convenções adicionais, referenciando também `estrutura-de-projeto.md`, `build-e-automacao.md` e os artefatos de testes correspondentes.
- Registre scripts, linters ou validações extras em `../06-governanca-tecnica-e-controle-de-qualidade/revisoes-com-ia.md` e vincule o item no `CHANGELOG.md` e em `req/audit-history.md`.
- Certifique-se de que os impactos estejam refletidos nos componentes (`../02-design/componentes.md`) e nos fluxos (`../02-design/fluxos.md`) para manter rastreabilidade end-to-end.

---

## React (ui/)
- **Tipagem estrita** — todos os componentes utilizam TypeScript com tipos explícitos (`SubmitResponse`, `ApprovalResponse`, `BrandingConfig`). Evitar `any` e validar dados antes de atualizar estado para cumprir [REQ-018](../02-planejamento/requisitos-spec.md#req-018).
- **Estado e efeitos** — preferir hooks dedicados e separação entre dados locais (IndexedDB) e remotos, preservando isolamento previsto em [REQ-011](../02-planejamento/requisitos-spec.md#req-011) e fluxos de aprovação definidos em [REQ-004](../02-planejamento/requisitos-spec.md#req-004) e [REQ-005](../02-planejamento/requisitos-spec.md#req-005).
- **Microcopy e acessibilidade** — textos em português claro, seguindo diretrizes de UX Writing e garantindo atributos ARIA quando aplicável, alinhados às mensagens de onboarding e notificações de [REQ-007](../02-planejamento/requisitos-spec.md#req-007) a [REQ-010](../02-planejamento/requisitos-spec.md#req-010) e aos consentimentos de [REQ-024](../02-planejamento/requisitos-spec.md#req-024).
- **CSS/Tokens** — consumir variáveis geradas pelo `BrandingHelper` e manter espaçamentos em múltiplos de 8 px, mantendo responsividade exigida por [REQ-016](../02-planejamento/requisitos-spec.md#req-016) e a presença da política de privacidade de [REQ-028](../02-planejamento/requisitos-spec.md#req-028).
- **Tratamento de erros** — exibir mensagens acionáveis (“Tentar novamente”, “Contatar suporte”) e logs discretos no console para depuração, respeitando limites de desempenho de [REQ-015](../02-planejamento/requisitos-spec.md#req-015) e privacidade de [REQ-017](../02-planejamento/requisitos-spec.md#req-017).

## NestJS (api/)
- **DTOs e validação** — todas as rotas expõem DTOs (`DiagnosticResponseDto`, `AudioRequestDto`) e validadores (`MaxFileSizeValidator`) antes de chamar serviços, cobrindo submissões e notificações de [REQ-005](../02-planejamento/requisitos-spec.md#req-005) a [REQ-008](../02-planejamento/requisitos-spec.md#req-008). 【F:api/src/diagnostics/diagnostics.controller.ts†L33-L189】【F:api/src/diagnostics/dto/audio-request.dto.ts†L1-L52】
- **Logging estruturado** — usar `Logger` com `ENTER/EXIT/ERROR`, registrando duração e parâmetros relevantes sem vazar dados sensíveis, conforme [REQ-017](../02-planejamento/requisitos-spec.md#req-017) e [REQ-029](../02-planejamento/requisitos-spec.md#req-029).
- **Separação de responsabilidades** — controllers tratam HTTP, services concentram lógica clínica/prompt, DTOs definem contrato, mantendo fácil testabilidade exigida por [REQ-020](../02-planejamento/requisitos-spec.md#req-020) e [REQ-021](../02-planejamento/requisitos-spec.md#req-021).
- **Integrações externas** — chamadas a ElevenLabs e storage devem ser encapsuladas em métodos dedicados, com flags para ambientes de teste, garantindo privacidade e políticas de publicação de [REQ-025](../02-planejamento/requisitos-spec.md#req-025) e [REQ-030](../02-planejamento/requisitos-spec.md#req-030).

## IndexedDB e Persistência Local
- Versionar stores com `DB_VERSION = 2`; qualquer alteração exige script de migração e atualização da documentação, assegurando isolamento de [REQ-011](../02-planejamento/requisitos-spec.md#req-011) e governança descrita em [REQ-022](../02-planejamento/requisitos-spec.md#req-022). 【F:ui/src/UploadHelper.ts†L1-L63】
- Persistir apenas dados necessários (metadados de arquivos, branding, consentimento), seguindo LGPD e a revogação imediata prevista em [REQ-024](../02-planejamento/requisitos-spec.md#req-024) a [REQ-027](../02-planejamento/requisitos-spec.md#req-027). 【F:ui/src/UploadHelper.ts†L63-L154】【F:ui/src/BrandingHelper.ts†L1-L160】

## Commits e Revisões
- Mensagens de commit devem citar requisito/milestone quando aplicável e manter formato imperativo curto, reforçando a rastreabilidade de [REQ-022](../02-planejamento/requisitos-spec.md#req-022).
- Cada PR deve anexar evidências (prints, logs, medições 60-30-10) conforme `AGENTS.md` e `req/06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade.md#catalogo-de-relatorios-automatizados`, atendendo [REQ-023](../02-planejamento/requisitos-spec.md#req-023).
- Mudanças em microcopy clínico requerem aprovação de UX/compliance antes do merge para manter conformidade com [REQ-024](../02-planejamento/requisitos-spec.md#req-024) e [REQ-028](../02-planejamento/requisitos-spec.md#req-028).
- Ao coexistir com a capacidade colaborativa descrita em [REQ-031](../02-planejamento/requisitos-spec.md#req-031) a [REQ-033](../02-planejamento/requisitos-spec.md#req-033), registre revisões conjuntas no changelog correspondente.

## Atualização de Documentação
- Qualquer nova convenção deve ser refletida nas seções de Arquitetura, Design e Testes, em alinhamento com [REQ-019](../02-planejamento/requisitos-spec.md#req-019).
- Alterações que afetem integrações, tokens de branding ou fluxo clínico precisam atualizar o plano v5 para manter rastreabilidade de [REQ-005](../02-planejamento/requisitos-spec.md#req-005) a [REQ-010](../02-planejamento/requisitos-spec.md#req-010). 【F:docs/plans/plan-ui-ux-requirements-v5.md†L88-L210】
- Documente impactos nos fluxos colaborativos previstos em [REQ-034](../02-planejamento/requisitos-spec.md#req-034) e [REQ-035](../02-planejamento/requisitos-spec.md#req-035) sempre que a governança IA for acionada.

[Voltar ao índice](README-spec.md)
