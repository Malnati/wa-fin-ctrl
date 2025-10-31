<!-- req/06-governanca-tecnica-e-controle-de-qualidade/controle-de-qualidade.md -->
# Controle de Qualidade

> Base: [./controle-de-qualidade.md](./controle-de-qualidade.md)
> Plano: [/docs/plans/20251025093000-evolucao-req-spec.md](/docs/plans/20251025093000-evolucao-req-spec.md)
> Changelog: [/CHANGELOG.md#2025-10-25](/CHANGELOG.md#2025-10-25)
> Referências correlatas: [Arquitetura da extensão](/req/01-arquitetura/arquitetura-da-extensao-spec.md) · [Design geral](/req/02-design/design-geral-spec.md) · [Testes end-to-end](/req/04-testes-e-validacao/testes-end-to-end-spec.md)

## Objetivo
Estabelecer práticas de QA para a plataforma Yagnostic v5, garantindo conformidade com RUP, LGPD e políticas de branding/UX. 【F:docs/plans/plan-ui-ux-requirements-v5.md†L260-L320】

---

## Atualizações quando requisitos alterarem QA

- Atualize `controle-de-qualidade.md` e este espelho sempre que um `REQ-###` ou `RNF-###` definir novos critérios de QA, audit checklists ou métricas, mantendo alinhamento com `qualidade-e-metricas.md`, `revisoes-com-ia.md`, `auditoria-e-rastreabilidade.md` e `req/audit-history.md`.
- Vincule cada alteração ao item correspondente no `CHANGELOG.md` e aos relatórios em `docs/reports/`, citando os IDs de requisitos e riscos.
- Valide que componentes, fluxos e testes foram atualizados nas fases anteriores (arquitetura, design, implementação, testes, entrega) conforme `instrucoes-evolucao-requisitos.md`.

---

## Critérios Gerais
- Pipelines (lint, build, testes unitários/E2E, auditorias) executados sem falhas antes de qualquer merge. 【F:req/06-governanca-tecnica-e-controle-de-qualidade/revisoes-com-ia.md†L18-L110】
- Revisão dupla obrigatória: engenharia + UX/compliance.
- Documentação atualizada (req, plano v5, changelog, relatórios) para cada entrega.
- **Requisitos associados:** REQ-015, REQ-016, REQ-018, REQ-019, REQ-022, REQ-023 e REQ-030.
- **Nota colaborativa:** validar se ajustes de UX contemplam a jornada multiaprovadores descrita nos REQ-031 a REQ-035 antes de autorizar o merge.

## Auditoria 60-30-10 (Regra Cromática)
1. Medir proporções de cor em cada tela impactada (aprovação, onboarding, dashboard, fila, e-mails).
2. Validar tolerância ±5% para primária (60%), secundária (30%) e destaque (10%).
3. Garantir que CTAs utilizem apenas cores de destaque e mantenham contraste AA.
4. Registrar resultado como “Conforme 603010” ou “Não conforme 603010” com ações corretivas. 【F:prototype/dashboard-visao-geral.html†L1-L220】【F:prototype/styles.css†L1-L120】
- **Requisitos associados:** REQ-016, REQ-024, REQ-028 e REQ-034.
- **Nota colaborativa:** assegurar que variações cromáticas personalizadas para validadores humanos (REQ-031–REQ-033) mantenham compatibilidade com os tokens padrão e com a governança técnica.

## Auditoria Tipográfica 4x2
- Limitar a quatro tamanhos e dois pesos tipográficos (Manrope/Inter) nas telas atualizadas.
- Validar hierarquia (headline > subtítulo > corpo > legenda) e legibilidade ≤ 12 palavras por frase quando aplicável. 【F:prototype/dashboard-visao-geral.html†L1-L220】
- Registrar resultado “Conforme 4x2” ou “Não conforme 4x2”.
- **Requisitos associados:** REQ-016, REQ-024 e REQ-028.
- **Nota colaborativa:** quando o fluxo envolver múltiplos revisores (REQ-031–REQ-035), preservar indicadores textuais que distingam decisões automatizadas de validações humanas.

## Auditoria de UX Writing e Simplicidade Visual
- Textos devem ser diretos, orientados à ação e alinhados ao contexto clínico. 【F:prototype/onboarding-permissoes.html†L1-L88】
- Verificar checklist de simplicidade (um foco principal por tela, ausência de ornamentos desnecessários). 【F:AGENTS.md†L80-L180】
- Registrar “Aprovado (sem alucinações)” ou “Reprovado — ajustar microcopy”.
- **Requisitos associados:** REQ-016, REQ-024, REQ-028 e REQ-029.
- **Nota colaborativa:** garantir instruções claras para os papéis humanos descritos em REQ-031–REQ-035, diferenciando ações de IA e de validadores no microcopy.

## QA Técnico
- Testes unitários: cobertura dos helpers (`UploadHelper`, `ApprovalHelper`, `BrandingHelper`).
- Testes E2E: cenários descritos em `testes-end-to-end.md` com evidências anexadas.
- Testes de segurança: validar rejeição de credenciais malformadas, payloads oversized, ataque XSS/SQL. 【F:req/04-testes-e-validacao/testes-seguranca-e2e.md†L93-L120】
- **Requisitos associados:** REQ-005, REQ-006, REQ-007, REQ-011, REQ-015, REQ-019, REQ-020, REQ-021 e REQ-030.
- **Nota colaborativa:** incluir cenários de aprovação compartilhada (REQ-031–REQ-033) e monitoramento clínico (REQ-034–REQ-035) nos testes E2E antes da homologação.

## Relatórios Obrigatórios
- **Relatório QA** — consolidar resultados de testes, auditorias e métricas de desempenho.
- **Audit Trail** — lista de commits, PRs, telas e componentes afetados com links para requisitos e protótipos.
- **Medição Cromática** — arquivo (planilha/JSON) com cálculo 60-30-10 armazenado em `docs/reports/`. 【F:req/06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade.md†L31-L104】
- **Métricas de Governança Técnica** — acompanhar metas e evidências descritas em [governanca-tecnica.md](governanca-tecnica-spec.md#metricas-de-governanca-tecnica).
- **Requisitos associados:** REQ-019, REQ-022, REQ-023, REQ-029 e REQ-034.
- **Nota colaborativa:** registrar indicadores de throughput humano vs. IA para atender às métricas de colaboração médica (REQ-031–REQ-035).

## Critérios de Bloqueio
- Falhas em testes E2E críticos (aprovação, onboarding, upload, dashboard, compartilhamento).
- Auditoria 60-30-10 ou 4x2 “Não conforme” sem correção documentada.
- Ausência de logs de consentimento/aprovação ou evidências LGPD.
- Vulnerabilidades críticas ou altas identificadas em scanners de segurança.

[Voltar ao índice](README-spec.md)
