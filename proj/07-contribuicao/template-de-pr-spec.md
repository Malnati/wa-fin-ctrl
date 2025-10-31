<!-- req/07-contribuicao/template-de-pr.md -->
# Template de PR

> Base: [./template-de-pr.md](./template-de-pr.md)
> Plano: [/docs/plans/20251025093000-evolucao-req-spec.md](/docs/plans/20251025093000-evolucao-req-spec.md)
> Changelog: [/CHANGELOG.md#2025-10-25](/CHANGELOG.md#2025-10-25)
> Referências correlatas: [Arquitetura da extensão](/req/01-arquitetura/arquitetura-da-extensao-spec.md) · [Design geral](/req/02-design/design-geral-spec.md) · [Testes end-to-end](/req/04-testes-e-validacao/testes-end-to-end-spec.md)

Use o modelo abaixo para manter rastreabilidade completa entre código, protótipos e requisitos (`REQ-001` a `REQ-030`), além de registrar convivência com a capacidade colaborativa (`REQ-031`–`REQ-035`).

[Voltar ao índice](README-spec.md)

---

```markdown
## Descrição
- [ ] Resumo objetivo da mudança
- [ ] Artefatos atualizados (ex.: `extension/src/background/index.ts`, `ui/src/Dashboard.tsx`, `prototype/*.html`)
- [ ] Evidências anexadas em `docs/reports/YYYYMMDD/`

## Requisitos atendidos
- [ ] REQ-___ — descrição do impacto (link para [catálogo](../02-planejamento/requisitos-spec.md#req-___))
- [ ] REQ-___ — descrição do impacto adicional
- [ ] N/A

> Inclua referências adicionais em `Refs:` quando mais de três requisitos forem afetados.

## Validações executadas
- [ ] `make lint` (extension/ui) — reforça [REQ-019](../02-planejamento/requisitos-spec.md#req-019)
- [ ] `npm run typecheck`
- [ ] `npm run test`
- [ ] Outra: ________ (ex.: `npm run build`, `docker compose up extension`)

## Impacto colaborativo
- [ ] Não há mudanças que afetem REQ-031–REQ-035
- [ ] Há impacto e foi documentado:
  - [ ] Fluxo de validação médica ([REQ-031](../02-planejamento/requisitos-spec.md#req-031))
  - [ ] Roteamento de especialistas ([REQ-032](../02-planejamento/requisitos-spec.md#req-032))
  - [ ] Interface médica ([REQ-033](../02-planejamento/requisitos-spec.md#req-033))
  - [ ] Métricas e auditoria clínica ([REQ-034](../02-planejamento/requisitos-spec.md#req-034))
  - [ ] Integrações HIS/LIS ([REQ-035](../02-planejamento/requisitos-spec.md#req-035))

## Checklist adicional
- [ ] Atualizei `CHANGELOG/` quando aplicável (`REQ-029`)
- [ ] Confirmei conformidade com Manifest V3 (`REQ-030`) se permissões mudarem
- [ ] Revisei textos conforme `AGENTS.md` e regras de UX Writing (`REQ-016`, `REQ-028`)
- [ ] Anexei prints ou vídeos para mudanças em UI (`prototype/login.html`, `ui/src/components/dashboard/DashboardOverview.tsx`)

## Observações
- Itens pendentes, riscos, dependências ou notas para o revisor.
```

---

**Dicas rápidas**
- Compare o PR com os protótipos do diretório [`prototype/`](../../prototype/) para garantir aderência visual (`REQ-016`, `REQ-028`).
- Ao alterar workflows de download/upload, cite explicitamente `REQ-004` a `REQ-007` e vincule commits relevantes.
- Para atualizações em consentimento ou privacidade, inclua capturas do fluxo `extension/src/components/Onboarding.tsx` e destaque o ID da política (`REQ-024`–`REQ-027`).

[Voltar ao índice](README-spec.md)
