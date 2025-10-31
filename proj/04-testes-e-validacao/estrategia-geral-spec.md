<!-- req/04-testes-e-validacao/estrategia-geral.md -->
# Estratégia Geral de Testes

> Base: [./estrategia-geral.md](./estrategia-geral.md)
> Plano: [/docs/plans/20251025093000-evolucao-req-spec.md](/docs/plans/20251025093000-evolucao-req-spec.md)
> Changelog: [/CHANGELOG.md#2025-10-25](/CHANGELOG.md#2025-10-25)
> Referências correlatas: [Arquitetura da extensão](/req/01-arquitetura/arquitetura-da-extensao-spec.md) · [Design geral](/req/02-design/design-geral-spec.md) · [Testes end-to-end](/req/04-testes-e-validacao/testes-end-to-end-spec.md)

## Objetivo
Garantir que a plataforma Yagnostic v5 entregue experiências clínicas seguras, acessíveis e rastreáveis para administradores, médicos e pacientes. A estratégia cobre front-end React, API NestJS e integrações de áudio/branding, alinhando-se aos requisitos definidos no plano de UI/UX. 【F:docs/plans/plan-ui-ux-requirements-v5.md†L180-L260】

## Personas e Fluxos Prioritários
- **Administrador** — aprova contas, monitora pendências e verifica consentimentos. 【F:prototype/administracao-liberacao.html†L1-L120】
  - **Requisitos:** [REQ-001](../02-planejamento/requisitos-spec.md#req-001), [REQ-002](../02-planejamento/requisitos-spec.md#req-002), [REQ-010](../02-planejamento/requisitos-spec.md#req-010).
- **Profissional de saúde** — realiza onboarding LGPD, envia exames, acompanha fila e compartilha laudos. 【F:prototype/dashboard-fila.html†L120-L248】
  - **Requisitos:** [REQ-004](../02-planejamento/requisitos-spec.md#req-004), [REQ-005](../02-planejamento/requisitos-spec.md#req-005), [REQ-006](../02-planejamento/requisitos-spec.md#req-006), [REQ-016](../02-planejamento/requisitos-spec.md#req-016).
- **Paciente/Contato** — recebe comunicações e acessa laudos via canais configurados. 【F:prototype/email-aprovacao-conta.html†L1-L120】
  - **Requisitos:** [REQ-006](../02-planejamento/requisitos-spec.md#req-006), [REQ-007](../02-planejamento/requisitos-spec.md#req-007), [REQ-008](../02-planejamento/requisitos-spec.md#req-008), [REQ-009](../02-planejamento/requisitos-spec.md#req-009).
- **Integração colaborativa:** estes papéis alimentam o fluxo clínico previsto em [REQ-031](../02-planejamento/requisitos-spec.md#req-031) a [REQ-033](../02-planejamento/requisitos-spec.md#req-033) sem remover responsabilidades herdadas da trilha legada.

## Abordagem Multicamadas
1. **Unitário** — cobre helpers, componentes isolados e DTOs (UploadHelper, ApprovalHelper, DiagnosticResponseDto). **Requisitos:** [REQ-005](../02-planejamento/requisitos-spec.md#req-005), [REQ-018](../02-planejamento/requisitos-spec.md#req-018).
2. **Integração** — valida comunicação entre React e IndexedDB, React e mocks de `/diagnostics/submit`, NestJS e ElevenLabs. **Requisitos:** [REQ-003](../02-planejamento/requisitos-spec.md#req-003), [REQ-006](../02-planejamento/requisitos-spec.md#req-006), [REQ-020](../02-planejamento/requisitos-spec.md#req-020).
3. **Sistema** — verifica jornada completa no ambiente DEV/HML utilizando dados sintéticos. **Requisitos:** [REQ-006](../02-planejamento/requisitos-spec.md#req-006), [REQ-015](../02-planejamento/requisitos-spec.md#req-015).
4. **End-to-End** — executa cenários críticos (aprovação → onboarding → upload → dashboard → compartilhamento) com Playwright. 【F:req/04-testes-e-validacao/testes-end-to-end.md†L1-L160】 **Requisitos:** [REQ-004](../02-planejamento/requisitos-spec.md#req-004), [REQ-005](../02-planejamento/requisitos-spec.md#req-005), [REQ-007](../02-planejamento/requisitos-spec.md#req-007).
5. **Acessibilidade & UX** — mede contraste, foco e microcopy seguindo diretrizes 60-30-10 e UX Writing. 【F:req/06-governanca-tecnica-e-controle-de-qualidade/controle-de-qualidade.md†L33-L78】 **Requisitos:** [REQ-016](../02-planejamento/requisitos-spec.md#req-016), [REQ-028](../02-planejamento/requisitos-spec.md#req-028).
6. **Segurança** — assegura rejeição de credenciais malformadas, limites de upload e proteção de dados clínicos. 【F:req/04-testes-e-validacao/testes-seguranca-e2e.md†L93-L120】 **Requisitos:** [REQ-001](../02-planejamento/requisitos-spec.md#req-001), [REQ-014](../02-planejamento/requisitos-spec.md#req-014), [REQ-017](../02-planejamento/requisitos-spec.md#req-017).
- **Integração colaborativa:** cada camada mantém evidências compatíveis com os marcos médicos descritos em [REQ-034](../02-planejamento/requisitos-spec.md#req-034) e logs correlacionados de [REQ-044](../02-planejamento/requisitos-spec.md#req-044).

## Ambientes
- **DEV** — mock de diagnósticos e áudio, fallback local habilitado. Ideal para testes unitários/integrados.
- **HML** — conecta à API real em modo seguro, executa suites E2E e auditorias cromáticas.
- **PRD** — apenas validações finais e auditorias, sem execução de testes destrutivos.
- **Requisitos associados:** [REQ-015](../02-planejamento/requisitos-spec.md#req-015), [REQ-019](../02-planejamento/requisitos-spec.md#req-019), [REQ-022](../02-planejamento/requisitos-spec.md#req-022).

## Ferramentas
- **Vitest/Jest** para unitários do React e NestJS.
- **msw/fake-indexeddb** para mocks de API e IndexedDB em testes do front-end.
- **@nestjs/testing** para módulos isolados do backend.
- **Playwright** para cenários E2E com screenshot e gravação.
- **axe-core/Lighthouse** para acessibilidade e performance das telas críticas.
- **Requisitos associados:** [REQ-018](../02-planejamento/requisitos-spec.md#req-018), [REQ-019](../02-planejamento/requisitos-spec.md#req-019), [REQ-020](../02-planejamento/requisitos-spec.md#req-020).

## Evidências Esperadas
- Logs e relatórios armazenados em `docs/reports/` com link para o PR correspondente. 【F:req/06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade.md†L31-L104】
- Capturas das telas auditadas (aprovação, onboarding, dashboard, fila) anexadas aos relatórios.
- Resultado da auditoria cromática (“Conforme 603010” ou “Não conforme 603010”) para cada alteração visual. 【F:req/06-governanca-tecnica-e-controle-de-qualidade/controle-de-qualidade.md†L53-L78】
- **Requisitos associados:** [REQ-017](../02-planejamento/requisitos-spec.md#req-017), [REQ-022](../02-planejamento/requisitos-spec.md#req-022), [REQ-023](../02-planejamento/requisitos-spec.md#req-023).
- **Integração colaborativa:** relatórios compartilhados devem incluir marcadores da trilha clínica descrita em [REQ-031](../02-planejamento/requisitos-spec.md#req-031) e métricas conjuntas de [REQ-034](../02-planejamento/requisitos-spec.md#req-034).

## Rastreabilidade
Cada caso de teste deve apontar para o requisito mapeado (RF/RNF/RN/RT) no plano v5 e registrar sucesso/falha com timestamp. Auditorias periódicas devem validar cobertura mínima antes de liberar marcos. 【F:docs/plans/plan-ui-ux-requirements-v5.md†L180-L260】
- **Requisitos associados:** [REQ-022](../02-planejamento/requisitos-spec.md#req-022), [REQ-023](../02-planejamento/requisitos-spec.md#req-023).
- **Integração colaborativa:** mantenha o mesmo identificador nos relatórios médicos compartilhados previstos em [REQ-033](../02-planejamento/requisitos-spec.md#req-033) e nos painéis de qualidade de [REQ-034](../02-planejamento/requisitos-spec.md#req-034).

[Voltar ao índice](README-spec.md)
