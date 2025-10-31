<!-- req/05-entrega-e-implantacao/empacotamento.md -->
# Empacotamento e Build Final

> Base: [./empacotamento.md](./empacotamento.md)
> Plano: [/docs/plans/20251025093000-evolucao-req-spec.md](/docs/plans/20251025093000-evolucao-req-spec.md)
> Changelog: [/CHANGELOG.md#2025-10-25](/CHANGELOG.md#2025-10-25)
> Referências correlatas: [Arquitetura da extensão](/req/01-arquitetura/arquitetura-da-extensao-spec.md) · [Design geral](/req/02-design/design-geral-spec.md) · [Testes end-to-end](/req/04-testes-e-validacao/testes-end-to-end-spec.md)

## Objetivo
Documentar como o pacote final da extensão é construído e preparado para distribuição, garantindo conformidade com o Manifest V3 e com as políticas da Chrome Web Store em atendimento a [REQ-012](../02-planejamento/requisitos-spec.md#req-012), [REQ-018](../02-planejamento/requisitos-spec.md#req-018), [REQ-019](../02-planejamento/requisitos-spec.md#req-019) e [REQ-030](../02-planejamento/requisitos-spec.md#req-030).

---

## Atualizações quando requisitos afetarem o empacotamento

- Ajuste `empacotamento.md` e este espelho sempre que novos `REQ-###` ou `RNF-###` exigirem mudanças no processo de build, no Manifest ou em artefatos distribuídos, mantendo alinhamento com `build-e-automacao.md` e `publicacao-e-versionamento.md`.
- Vincule as alterações a arquitetura (`../01-arquitetura/`), riscos (`../02-planejamento/riscos-e-mitigacoes.md`) e critérios de testes (`criterios-de-aceitacao.md`, `testes-end-to-end.md`).
- Registre o item no `CHANGELOG.md`, documente evidências em `docs/reports/` e atualize `req/audit-history.md` conforme checklist de `auditoria-e-rastreabilidade.md`.

---

## Processo de empacotamento
1. **Instalar dependências:** executar `npm install` dentro de `ui/` (ou `make install`) para cumprir [REQ-018](../02-planejamento/requisitos-spec.md#req-018).
2. **Executar `npm run build`:** gera o diretório `ui/dist/` com os bundles otimizados pelo Vite, assegurando [REQ-019](../02-planejamento/requisitos-spec.md#req-019).
3. **Revisar `public/`:** garantir que `manifest.json`, ícones e HTML estejam atualizados e coerentes com a CSP definida, respeitando [REQ-012](../02-planejamento/requisitos-spec.md#req-012) e [REQ-028](../02-planejamento/requisitos-spec.md#req-028).
4. **Montar o pacote ZIP:** combinar o conteúdo de `dist/`, `public/` e demais assets locais necessários (sem scripts remotos) em um arquivo `.zip` pronto para upload, alinhado a [REQ-020](../02-planejamento/requisitos-spec.md#req-020).
5. **Validar CSP e permissões:** conferir que apenas permissões essenciais estão listadas e que não há referências a CDNs ou scripts inline, garantindo [REQ-012](../02-planejamento/requisitos-spec.md#req-012) e [REQ-030](../02-planejamento/requisitos-spec.md#req-030).
6. **Registrar evidências:** armazenar hashes do pacote, logs de build e checklist de revisão junto aos artefatos do pipeline para cumprir [REQ-022](../02-planejamento/requisitos-spec.md#req-022) e [REQ-029](../02-planejamento/requisitos-spec.md#req-029).
7. **Preparar feature flags colaborativas:** validar que bundlers preservam `APPROVAL_STATUS_ENDPOINT` e demais variáveis ligadas a REQ-031–REQ-035 sem impactar os fluxos originais.

## Checklist de conformidade pré-upload
- `manifest.json` com permissões `downloads`, `identity`, `storage`, `sidePanel` e domínios atualizados, conforme [REQ-020](../02-planejamento/requisitos-spec.md#req-020) e [REQ-030](../02-planejamento/requisitos-spec.md#req-030).
- Variáveis de ambiente resolvidas para o ambiente alvo (`API_BASE` e caminhos de endpoint) garantindo [REQ-003](../02-planejamento/requisitos-spec.md#req-003) e [REQ-010](../02-planejamento/requisitos-spec.md#req-010).
- Build determinístico: o mesmo commit resulta no mesmo pacote quando `npm run build` é executado em ambiente limpo, evidenciando [REQ-019](../02-planejamento/requisitos-spec.md#req-019).
- Testes definidos para o ciclo executados com sucesso antes da geração do artefato, cumprindo [REQ-015](../02-planejamento/requisitos-spec.md#req-015) e [REQ-022](../02-planejamento/requisitos-spec.md#req-022).
- Registro das evidências de build e checklist anexado ao changelog correspondente, reforçando [REQ-029](../02-planejamento/requisitos-spec.md#req-029).

[Voltar ao índice](README-spec.md)
