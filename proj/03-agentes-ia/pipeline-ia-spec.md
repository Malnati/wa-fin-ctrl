# Pipeline IA

> Base: [./pipeline-ia.md](./pipeline-ia.md)
> Plano: [/docs/plans/20251025093000-evolucao-req-spec.md](/docs/plans/20251025093000-evolucao-req-spec.md)
> Changelog: [/CHANGELOG.md#2025-10-25](/CHANGELOG.md#2025-10-25)
> Referências correlatas: [Arquitetura da extensão](/req/01-arquitetura/arquitetura-da-extensao-spec.md) · [Design geral](/req/02-design/design-geral-spec.md) · [Testes end-to-end](/req/04-testes-e-validacao/testes-end-to-end-spec.md)

Os pipelines que acionam agentes de IA estão descritos em detalhe no arquivo `req/06-governanca-tecnica-e-controle-de-qualidade/revisoes-com-ia.md` e dão suporte direto a [REQ-019](../02-planejamento/requisitos-spec.md#req-019), [REQ-021](../02-planejamento/requisitos-spec.md#req-021) e [REQ-022](../02-planejamento/requisitos-spec.md#req-022). Utilize a fase [05-Governança](../06-governanca-tecnica-e-controle-de-qualidade/README-spec.md) para acompanhar auditorias, logs e responsabilidades associados a essas automações.

## Fluxo de execução
- `build.yml` prepara artefatos da extensão e da API antes da análise IA, garantindo que submissões de [REQ-005](../02-planejamento/requisitos-spec.md#req-005) e tokens de [REQ-006](../02-planejamento/requisitos-spec.md#req-006) estejam disponíveis.
- `review.yml` chama agentes de escopo, arquitetura e código para validar alterações frente a [REQ-018](../02-planejamento/requisitos-spec.md#req-018) e [REQ-030](../02-planejamento/requisitos-spec.md#req-030).
- `audit.yml` persiste metadados (`run_id`, `model`, `timestamp`) em `docs/reports/`, atendendo [REQ-023](../02-planejamento/requisitos-spec.md#req-023) e [REQ-029](../02-planejamento/requisitos-spec.md#req-029).

## Integração com colaboração clínica
- Quando fluxos colaborativos (validação médica humana + IA) forem ativados, sincronize os gatilhos com [REQ-031](../02-planejamento/requisitos-spec.md#req-031) e métricas de qualidade de [REQ-034](../02-planejamento/requisitos-spec.md#req-034), preservando os relatórios exigidos por [REQ-022](../02-planejamento/requisitos-spec.md#req-022).
- Pipelines que manipulam dados clínicos devem registrar consentimentos ativos antes da execução, respeitando [REQ-024](../02-planejamento/requisitos-spec.md#req-024) e o histórico de revogação de [REQ-027](../02-planejamento/requisitos-spec.md#req-027).

## Artefatos obrigatórios
- Cada job precisa anexar logs e relatórios no diretório `docs/reports/`, conforme tabela `catalogo-de-relatorios-automatizados` e [REQ-022](../02-planejamento/requisitos-spec.md#req-022).
- Sempre que os agentes sugerirem ajustes em protótipos (`docs/prototype/*.html`) ou em código (`ui/`, `api/`, `extension/`), registre os arquivos no relatório da execução para cumprir [REQ-018](../02-planejamento/requisitos-spec.md#req-018) e [REQ-028](../02-planejamento/requisitos-spec.md#req-028).

[Voltar ao índice](README-spec.md)
