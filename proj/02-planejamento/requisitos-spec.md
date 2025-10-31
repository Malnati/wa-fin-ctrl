<!-- proj/02-planejamento/requisitos-spec.md -->
# Catálogo de Requisitos — WA Fin Ctrl

> Base: [./requisitos.md](./requisitos.md)

Este catálogo consolida requisitos funcionais (RF), não funcionais (RNF) e legais (RL) do WA Fin Ctrl. IDs permanecem sequenciais e devem ser referenciados em arquitetura, design, testes, governança e changelog.

## Procedimento de atualização
1. Registrar o requisito neste catálogo e no arquivo base.
2. Atualizar documentos impactados (arquitetura, design, testes, entrega, governança).
3. Criar entrada de changelog (`CHANGELOG/`) e citar o requisito.
4. Vincular evidências de auditoria (`proj/audit-history-spec.md`).

## Requisitos funcionais (RF)
| ID | Descrição | Status | Observações |
| --- | --- | --- | --- |
| <a id="rf-001"></a>RF-001 | Ingestão de arquivos ZIP/PDF/JPG provenientes do WhatsApp com identificação automática de novos itens. | Ativo | `wa_fin_ctrl.app.processar_incremental` |
| <a id="rf-002"></a>RF-002 | Processamento incremental (`wa-fin.py processar`) com opção `--force` para reprocessar todo o acervo. | Ativo | Histórico registrado em `data/history.json`. |
| <a id="rf-003"></a>RF-003 | Comandos segmentados (`pdf`, `img`) para reprocessar tipos específicos. | Ativo | Deve respeitar diretórios configurados em `env.py`. |
| <a id="rf-004"></a>RF-004 | Extração de texto via OCR com fallback IA para valores monetários. | Ativo | Necessita consentimento para uso da IA. |
| <a id="rf-005"></a>RF-005 | Detecção automática de duplicidade de comprovantes e inconsistências de valor. | Ativo | Relatórios destacam divergências. |
| <a id="rf-006"></a>RF-006 | Geração de planilhas (`mensagens/*.csv`) consolidadas e auditáveis. | Ativo | Formatos compatíveis com MPDFT. |
| <a id="rf-007"></a>RF-007 | Geração de relatórios HTML geral e mensais, incluindo versões editáveis e imprimíveis. | Ativo | Templates em `templates/*.j2`. |
| <a id="rf-008"></a>RF-008 | Interface FastAPI para servir relatórios e aplicar correções (`/fix`). | Ativo | Disponível em Docker local. |
| <a id="rf-009"></a>RF-009 | WebSocket que notifica clientes sobre atualizações de relatórios. | Ativo | Evento `reload`. |
| <a id="rf-010"></a>RF-010 | Correções cirúrgicas de entradas (valor, descrição, classificação, rotação) via CLI/API. | Ativo | Comando `wa-fin.py fix` |
| <a id="rf-011"></a>RF-011 | Verificação e correção de totalizadores em CSV (`verificar`, `corrigir`). | Ativo | Scripts garantem integridade numérica. |
| <a id="rf-012"></a>RF-012 | Registro completo de comandos executados com argumentos e resultado. | Ativo | `CommandHistory`. |
| <a id="rf-013"></a>RF-013 | Lista automatizada de relatórios disponíveis para UI web. | Planejado | Endpoint `/api/reports`. |
| <a id="rf-014"></a>RF-014 | Exportação assinável para sincronização com plataforma cloud. | Planejado | Empacotamento com hashes. |
| <a id="rf-015"></a>RF-015 | API cloud para ingestão de pacotes validados e revisão colaborativa. | Planejado | Refatorar `cloud/api`. |
| <a id="rf-016"></a>RF-016 | Dashboard React para revisão, comentários e aprovação. | Planejado | Adaptar `cloud/ui`. |
| <a id="rf-017"></a>RF-017 | Alertas automáticos (e-mail/SMS) para pendências críticas. | Planejado | Integrar com serviço de notificações. |
| <a id="rf-018"></a>RF-018 | Trilha de auditoria consolidada (execuções, correções, sincronizações) exportável em PDF/CSV. | Planejado | Dashboard e relatórios dedicados. |

## Requisitos não funcionais (RNF)
| ID | Descrição | Status | Métrica |
| --- | --- | --- | --- |
| <a id="rnf-001"></a>RNF-001 | Processar 100 comprovantes em ≤ 8 min em hardware referência. | Ativo | Cronometrado em testes e2e. |
| <a id="rnf-002"></a>RNF-002 | WebSocket deve emitir eventos em ≤ 2 s. | Ativo | Monitorado via métricas locais. |
| <a id="rnf-003"></a>RNF-003 | Consumo de IA limitado a orçamento mensal com alerta em 80%. | Ativo | `proj/03-agentes-ia/politicas-e-regras-spec.md`. |
| <a id="rnf-004"></a>RNF-004 | Relatórios HTML responsivos e acessíveis (WCAG AA). | Em execução | Ver `proj/06-ux-brand/diretrizes-de-ux-spec.md`. |
| <a id="rnf-005"></a>RNF-005 | Disponibilidade cloud ≥ 99% com monitoramento contínuo. | Planejado | Integrar Prometheus/Grafana. |
| <a id="rnf-006"></a>RNF-006 | Logs sanitizados e correlacionados por ID único. | Ativo | Historia + logs FastAPI. |
| <a id="rnf-007"></a>RNF-007 | Suporte a operação offline (sem IA externa). | Ativo | CLI continua funcional sem chaves IA. |
| <a id="rnf-008"></a>RNF-008 | Build automatizado via Makefile/Docker sem scripts extras. | Ativo | Política em `AGENTS.md`. |

## Requisitos legais e de compliance (RL)
| ID | Descrição | Base legal | Status |
| --- | --- | --- | --- |
| <a id="rl-001"></a>RL-001 | Tratamento respaldado por execução de políticas públicas do MPDFT. | LGPD Art. 7º III | Ativo |
| <a id="rl-002"></a>RL-002 | Consentimento explícito para uso de IA externa. | LGPD Art. 7º I | Ativo |
| <a id="rl-003"></a>RL-003 | Retenção de dados por 5 anos e eliminação mediante solicitação. | LGPD Art. 15/16 | Ativo |
| <a id="rl-004"></a>RL-004 | Registro de operações de tratamento para auditoria. | LGPD Art. 37 | Ativo |
| <a id="rl-005"></a>RL-005 | Notificação imediata de incidentes de segurança. | LGPD Art. 48 | Planejado |
| <a id="rl-006"></a>RL-006 | Uso de chaves criptográficas e storage seguro para pacotes sincronizados. | MPDFT/Boas práticas | Planejado |

## Requisitos operacionais (RO)
| ID | Descrição | Status |
| --- | --- | --- |
| <a id="ro-001"></a>RO-001 | Backups semanais dos diretórios `docs/`, `mensagens/`, `ocr/`. | Planejado |
| <a id="ro-002"></a>RO-002 | Rotina de limpeza para arquivos processados após 90 dias (respeitando retenção). | Planejado |
| <a id="ro-003"></a>RO-003 | Checklist pré-entrega publicado em `docs/checklists/`. | Ativo |
| <a id="ro-004"></a>RO-004 | Scripts de verificação automática (`wa-fin.py teste`) executados antes de sincronizar com cloud. | Em execução |

Atualize as seções quando requisitos mudarem e mantenha vínculos com arquitetura, design, testes e governança.

[Voltar ao planejamento](README-spec.md)
