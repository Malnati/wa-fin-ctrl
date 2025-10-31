<!-- proj/04-qualidade-testes/testplan-spec.md -->
# Plano de Testes — WA Fin Ctrl

> Base: [./testplan.md](./testplan.md)

## Escopo
- Pipeline local (Python/FastAPI)
- Plataforma cloud (NestJS/React)
- Integrações externas (IA, notificações)

## Estratégia
- Automatizar testes unitários e integração para cada módulo crítico.
- Executar suites E2E em momentos chave (antes de releases, após correções sensíveis).
- Registrar evidências em `docs/reports/`.

## Cronograma de testes
| Fase | Atividade |
| --- | --- |
| Q1 | Validação do pipeline local com massa real |
| Q2 | Testes da refatoração cloud e ingestão |
| Q3 | E2E colaborativo, alertas e auditoria |
| Q4 | Ensaios gerais antes do release 1.0 |

## Equipe
- QA/Curadoria: executa testes exploratórios e valida relatórios.
- Engenharia Python: mantém testes automáticos locais.
- Engenharia TypeScript: mantém testes cloud e e2e.

## Critérios de aceite dos testes
- Cobertura mínima conforme RNF.  
- Nenhum defeito crítico aberto.  
- Checklists de segurança e LGPD concluídos.

[Voltar à qualidade](README-spec.md)
