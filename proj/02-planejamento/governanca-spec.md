<!-- proj/02-planejamento/governanca-spec.md -->
# Governança do Projeto — WA Fin Ctrl

> Base: [./governanca.md](./governanca.md)

## Estrutura de decisão
- **Comitê de curadoria (semanal):** decide prioridades de processamento, revisa pendências e aprova entregas de curto prazo.
- **Comitê técnico (semanal):** acompanha implementação, riscos técnicos e indicadores de qualidade.
- **Conselho de conformidade (mensal):** revisa LGPD, auditorias, interações com MPDFT.

## Papéis
| Papel | Responsabilidades |
| --- | --- |
| Gestor do produto | Priorizar backlog, garantir alinhamento com stakeholders, registrar decisões. |
| Líder técnico Python | Manter pipeline local, revisar PRs, assegurar testes. |
| Líder técnico TypeScript | Conduzir refatoração cloud, garantir integração UI/API. |
| Responsável por governança | Atualizar políticas LGPD, checklists e relatórios de auditoria. |
| Analistas financeiros | Validar relatórios, reportar inconsistências, participar de testes UAT. |

## Ferramentas de acompanhamento
- **Documentação RUP (proj/)**: fonte oficial das decisões.
- **Changelog (`CHANGELOG/`)**: cada alteração registrada com timestamp.
- **Histórico (`data/history.json`)**: rastreabilidade de comandos.
- **Checklists (`docs/checklists/`)**: lista obrigatória antes de releases.
- **Relatórios (`docs/reports/`)**: evidências geradas pelos pipelines e auditorias.

## Processos chave
1. **Proposta de mudança** → abrir plano (`docs/plans/`), selecionar checklists, obter aprovação do comitê técnico.
2. **Implementação** → seguir instruções `AGENTS.md`, manter documentação atualizada.
3. **Validação** → executar testes, coletar evidências, gerar relatório de auditoria.
4. **Encerramento** → atualizar changelog, comunicar stakeholders, revisar métricas na reunião semanal.

[Voltar ao planejamento](README-spec.md)
