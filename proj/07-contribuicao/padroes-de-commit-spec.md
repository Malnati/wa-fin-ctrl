<!-- req/07-contribuicao/padroes-de-commit.md -->
# Padrões de Commit

> Base: [./padroes-de-commit.md](./padroes-de-commit.md)
> Plano: [/docs/plans/20251025093000-evolucao-req-spec.md](/docs/plans/20251025093000-evolucao-req-spec.md)
> Changelog: [/CHANGELOG.md#2025-10-25](/CHANGELOG.md#2025-10-25)
> Referências correlatas: [Arquitetura da extensão](/req/01-arquitetura/arquitetura-da-extensao-spec.md) · [Design geral](/req/02-design/design-geral-spec.md) · [Testes end-to-end](/req/04-testes-e-validacao/testes-end-to-end-spec.md)

Este guia define a estrutura das mensagens de commit para preservar a rastreabilidade dos requisitos legados (`REQ-001` a `REQ-030`), alinhar-se às automações de build (`REQ-019`, `REQ-022`) e registrar impactos na capacidade colaborativa (`REQ-031`–`REQ-035`).

[Voltar ao índice](README-spec.md)

## 1. Estrutura recomendada
1. **Linha de assunto** — `tipo(escopo): resumo curto`
   - `tipo` em minúsculas (`feat`, `fix`, `docs`, `refactor`, `chore`, `test`).
   - `escopo` descreve módulo ou artefato (`extension`, `ui`, `prototype`, `docs`).
   - Inclua o requisito principal no final da linha entre colchetes, por exemplo `feat(extension): intercepta PDFs [REQ-004]`.
2. **Corpo** — frases curtas explicando:
   - Motivo da mudança e relação com protótipos ou código (ex.: `prototype/dashboard-visao-geral.html`, `extension/src/background/index.ts`).
   - Evidências ou scripts executados (`make build`, `npm run lint`) com resultados relevantes para `REQ-015`, `REQ-019` e `REQ-022`.
3. **Rodapé** — use blocos `Refs:` para listar requisitos adicionais e issues.
   - `Refs: REQ-007, REQ-024, Issue #123`
   - Quando envolver validação médica, acrescente `Collab: REQ-031` etc., garantindo convivência com os legados.

## 2. Checklist de conteúdo obrigatório
- [ ] Identificar pelo menos um requisito legado diretamente impactado (`REQ-001`–`REQ-030`).
- [ ] Referenciar artefatos modificados: protótipos (`prototype/*.html`, `prototype/styles.css`), código (`extension/src/**`, `ui/src/**`) ou documentação (`req/`, `docs/wiki/`).
- [ ] Declarar se há impacto na governança ou auditoria (`REQ-022`, `REQ-029`) e anexar evidências geradas em `docs/reports/`.
- [ ] Incluir notas sobre compatibilidade com a capacidade colaborativa sempre que afetar filas, dashboards, notificações ou consentimentos (`REQ-031`–`REQ-035`).

## 3. Exemplos práticos
```text
feat(extension): bloqueia downloads externos [REQ-004]

- impede captura de PDFs fora da lista em extension/src/background/index.ts
- atualiza protótipo prototype/dashboard-visao-geral.html para refletir mensagens
- evidencia: make test-ext (ok) • docs/reports/20251201/perf.log

Refs: REQ-003, REQ-005
Collab: REQ-032
```

```text
docs(req): detalha consentimento LGPD [REQ-024]

- alinha req/07-contribuicao/contribuindo.md com onboarding em extension/src/components/Onboarding.tsx
- adiciona nota sobre consentimento de especialistas (REQ-031)
- atualiza CHANGELOG/20251024203001-reconstrucao-req.md com rastreabilidade

Refs: REQ-025, REQ-028, Issue #241
```

## 4. Integração com pipelines
- `make lint`, `npm run typecheck` e `npm run test` devem ser executados e citados sempre que código for alterado, reforçando `REQ-019` e `REQ-022`.
- Commits que afetam segurança, consentimento ou privacidade precisam mencionar a atualização correspondente em `CHANGELOG/` e nos relatórios de auditoria (`REQ-026`, `REQ-029`).
- **Nota colaborativa:** quando o commit habilitar funcionalidades médicas, acrescente link para o protótipo clínico relevante (`prototype/diagnostico-operacao.html`, `prototype/dashboard-visao-geral.html`) e declare explicitamente que os critérios legados permanecem válidos.

[Voltar ao índice](README-spec.md)
