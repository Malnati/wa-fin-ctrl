<!-- req/04-testes-e-validacao/testes-end-to-end.md -->
# Testes End-to-End (E2E)

> Base: [./testes-end-to-end.md](./testes-end-to-end.md)
> Plano: [/docs/plans/20251025093000-evolucao-req-spec.md](/docs/plans/20251025093000-evolucao-req-spec.md)
> Changelog: [/CHANGELOG.md#2025-10-25](/CHANGELOG.md#2025-10-25)
> Referências correlatas: [Arquitetura da extensão](/req/01-arquitetura/arquitetura-da-extensao-spec.md) · [Design geral](/req/02-design/design-geral-spec.md) · [Testes end-to-end](/req/04-testes-e-validacao/testes-end-to-end-spec.md)

## Objetivo
Validar os fluxos críticos da plataforma Yagnostic v5 replicando o caminho real de um profissional de saúde desde a aprovação administrativa até o compartilhamento do laudo final, garantindo aderência aos protótipos e requisitos clínicos. 【F:docs/plans/plan-ui-ux-requirements-v5.md†L230-L260】

---

## Atualizações quando requisitos forem mapeados

- Inclua novos cenários neste arquivo e em `testes-end-to-end.md` sempre que um `REQ-###` ou `RNF-###` exigir validação ponta a ponta, garantindo alinhamento com `criterios-de-aceitacao.md`, `qualidade-e-metricas.md` e os fluxos descritos em `../02-design/`.
- Registre dados de execução, artefatos e logs em `docs/reports/`, vinculando ao item do `CHANGELOG.md` e ao registro em `req/audit-history.md`.
- Certifique-se de que automações (`build-e-automacao.md`) e pipelines (`../06-governanca-tecnica-e-controle-de-qualidade/revisoes-com-ia.md`) estejam configurados para executar os novos cenários.

---

## Cenários Obrigatórios
1. **Aprovação Administrativa Bloqueada**
   - Entrar com conta sem aprovação → `ApprovalStatus` exibe estado `PENDING` com contatos e impede acesso ao dashboard.
   - Registrar evidência de que o sistema retorna ao login após logout.
   - Requisitos: [REQ-001](../02-planejamento/requisitos-spec.md#req-001), [REQ-010](../02-planejamento/requisitos-spec.md#req-010), [REQ-017](../02-planejamento/requisitos-spec.md#req-017).
   - Integração colaborativa: bloqueia convites multi-especialistas de [REQ-031](../02-planejamento/requisitos-spec.md#req-031) até a aprovação humana ser concluída.
2. **Onboarding LGPD Completo**
   - Usuário aprovado executa `OnboardingFlow`, aceita termos no passo `OnboardingConsent`, confirma permissões e prossegue para o dashboard.
   - Verificar persistência no IndexedDB (`wl-db`) e exibição do resumo de consentimento.
   - Requisitos: [REQ-024](../02-planejamento/requisitos-spec.md#req-024), [REQ-025](../02-planejamento/requisitos-spec.md#req-025), [REQ-027](../02-planejamento/requisitos-spec.md#req-027).
   - Integração colaborativa: o consentimento versionado alimenta rastreabilidade médica descrita em [REQ-033](../02-planejamento/requisitos-spec.md#req-033).
3. **Upload com Geração de Áudio**
   - Selecionar arquivo PDF de 5 MB, habilitar áudio, acompanhar progresso e confirmar resposta da API com laudo e `audioUrl`.
   - Validar fallback ao desligar API e confirmar item `pending` na fila.
   - Requisitos: [REQ-004](../02-planejamento/requisitos-spec.md#req-004), [REQ-005](../02-planejamento/requisitos-spec.md#req-005), [REQ-006](../02-planejamento/requisitos-spec.md#req-006), [REQ-015](../02-planejamento/requisitos-spec.md#req-015).
4. **Dashboard e Fila Operacional**
   - Verificar cards de métricas, status da plataforma e lista de diagnósticos com estados `processing`, `success`, `error`.
   - Executar “Tentar novamente” em item com erro e confirmar atualização visual.
   - Requisitos: [REQ-006](../02-planejamento/requisitos-spec.md#req-006), [REQ-007](../02-planejamento/requisitos-spec.md#req-007), [REQ-016](../02-planejamento/requisitos-spec.md#req-016).
   - Integração colaborativa: mantém indicadores compartilhados previstos em [REQ-034](../02-planejamento/requisitos-spec.md#req-034) e logs correlacionados de [REQ-044](../02-planejamento/requisitos-spec.md#req-044).
5. **Compartilhamento e Rastreamento**
   - Enviar resultado por e-mail e WhatsApp; validar máscara, confirmação visual e registro em log.
   - Conferir que histórico registra canal, horário e responsável.
   - Requisitos: [REQ-006](../02-planejamento/requisitos-spec.md#req-006), [REQ-007](../02-planejamento/requisitos-spec.md#req-007), [REQ-008](../02-planejamento/requisitos-spec.md#req-008), [REQ-009](../02-planejamento/requisitos-spec.md#req-009), [REQ-017](../02-planejamento/requisitos-spec.md#req-017).
   - Integração colaborativa: disponibiliza evidências de envio para os prontuários compartilhados definidos em [REQ-033](../02-planejamento/requisitos-spec.md#req-033).
6. **Regra Cromática e Acessibilidade**
   - Executar auditoria 60-30-10 nas telas afetadas, anexar relatório “Conforme 603010”.
   - Rodar axe-core verificando contrastes e foco nos componentes auditados.
   - Requisitos: [REQ-016](../02-planejamento/requisitos-spec.md#req-016), [REQ-028](../02-planejamento/requisitos-spec.md#req-028), [REQ-030](../02-planejamento/requisitos-spec.md#req-030).

## Ferramentas
- **Playwright** com storage state para simular perfis aprovados e pendentes.
- **msw** para controlar respostas do `/diagnostics/submit` durante testes de fallback.
- **axe-playwright** para checagens de acessibilidade automatizadas.
- **Requisitos associados:** [REQ-018](../02-planejamento/requisitos-spec.md#req-018), [REQ-019](../02-planejamento/requisitos-spec.md#req-019), [REQ-020](../02-planejamento/requisitos-spec.md#req-020).

## Normas Arquiteturais para E2E
- **React oficial:** scripts devem validar a experiência real dos componentes React oficiais; qualquer wrapper experimental precisa ser removido antes da homologação. 【F:req/02-design/componentes.md†L120-L150】
- **Feature-Sliced Design:** cenários devem cobrir o encadeamento entre fatias (approval → onboarding → dashboard) respeitando as fronteiras definidas em `components/<feature>`. 【F:req/02-design/fluxos.md†L96-L128】
- **Atomic Design:** testes precisam evidenciar reutilização de átomos/moléculas (botões, cards) dentro dos organismos auditados, anexando relatório de conformidade caso novos componentes sejam criados. 【F:req/02-design/componentes.md†L138-L150】
- **Requisitos associados:** [REQ-016](../02-planejamento/requisitos-spec.md#req-016), [REQ-018](../02-planejamento/requisitos-spec.md#req-018), [REQ-020](../02-planejamento/requisitos-spec.md#req-020).

## Evidências
- Capturas e vídeos gerados pelo Playwright anexados ao PR/relatório.
- Logs das chamadas à API com tempos de execução e status.
- Planilha ou JSON com resultado da auditoria cromática anexado a `docs/reports/`. 【F:req/06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade.md†L31-L104】
- **Requisitos associados:** [REQ-017](../02-planejamento/requisitos-spec.md#req-017), [REQ-022](../02-planejamento/requisitos-spec.md#req-022), [REQ-023](../02-planejamento/requisitos-spec.md#req-023).
- **Integração colaborativa:** anexar a mesma evidência aos dossiês clínicos previstos em [REQ-033](../02-planejamento/requisitos-spec.md#req-033) e aos painéis unificados de [REQ-034](../02-planejamento/requisitos-spec.md#req-034).

## Critério de Sucesso
100% dos cenários acima devem passar nos ambientes DEV e HML antes da liberação para produção. Falhas bloqueiam o release até correção documentada no changelog e reexecução dos testes. 【F:CHANGELOG/20251020143759.md†L1-L120】
- **Requisitos associados:** [REQ-015](../02-planejamento/requisitos-spec.md#req-015), [REQ-019](../02-planejamento/requisitos-spec.md#req-019), [REQ-022](../02-planejamento/requisitos-spec.md#req-022).
- **Integração colaborativa:** só liberar sincronização com equipes médicas após atualizar o status dos cenários nos marcos de [REQ-031](../02-planejamento/requisitos-spec.md#req-031) e [REQ-034](../02-planejamento/requisitos-spec.md#req-034).

[Voltar ao índice](README-spec.md)
