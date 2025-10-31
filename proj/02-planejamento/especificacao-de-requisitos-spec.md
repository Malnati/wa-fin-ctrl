<!-- proj/02-planejamento/especificacao-de-requisitos-spec.md -->
# Especificação de Requisitos — WA Fin Ctrl

> Base: [./especificacao-de-requisitos.md](./especificacao-de-requisitos.md)

## Contexto
Este documento descreve o processo adotado para levantamento, priorização e manutenção dos requisitos do WA Fin Ctrl. Ele conecta a visão do projeto (fase 00) com os artefatos de planejamento e execução.

- **Domínio:** prestação de contas financeira para curadores e órgãos de controle (MPDFT).
- **Escopo inicial:** processamento local automatizado + infraestrutura cloud em transição.
- **Stakeholders:** curadores financeiros, analistas, auditores, time técnico e parceiros de IA.

## Processo RUP adotado
1. **Iniciação** — capturar necessidades com curadoria e MPDFT, registrar visão/escopo (fase 00).
2. **Elaboração** — mapear arquitetura, fluxos e requisitos detalhados (fases 01 e 02).
3. **Construção** — implementar pipeline local, serviços cloud e UX (fases 03 e 06).
4. **Transição** — validar entregas com testes, auditorias e publicação (fases 04 e 05).
5. **Operação** — monitorar métricas, revisar políticas, planejar evoluções (fases 05/06).

## Critérios de priorização
- **Obrigatório:** requisitos legais/compliance (RL), ingestão e relatórios fundamentais (RF-001 a RF-012).
- **Alta prioridade:** sincronização cloud, dashboards colaborativos, alertas automáticos.
- **Média prioridade:** integrações externas (e-mail, storage), automação de backups.
- **Baixa prioridade:** recursos opcionais (áudio, dashboards públicos anonimizados).

## Gestão de mudanças
- Mudanças geram plano em `docs/plans/` com checklist selecionado.
- Atualizações registradas no changelog (timestamp único) e referenciadas nos artefatos afetados.
- Auditorias documentadas em `proj/audit-history-spec.md`.
- Rastreabilidade mantida via âncoras (`RF-###`, `RNF-###`, `RL-###`).

## Fontes de requisitos
- Entrevistas e ritos com curadoria financeira.
- Normas do MPDFT, LGPD e orientações judiciais.
- Observações de uso real do pipeline atual.
- Feedback de auditores e agentes IA.

## Métricas de acompanhamento
- % de requisitos obrigatórios implementados.
- Tempo entre solicitação de mudança e disponibilização em produção.
- Nº de regressões/bugs por requisito.
- Cumprimento dos RNFs críticos (performance, segurança, privacidade).

Atualize este documento sempre que o processo, priorização ou fontes de requisitos forem alterados.

[Voltar ao planejamento](README-spec.md)
