<!-- proj/02-design/componentes-spec.md -->
# Componentes — WA Fin Ctrl

> Base: [./componentes.md](./componentes.md)

## Mapa de componentes

### 1. CLI e automação (Python)
| Componente | Arquivo | Responsabilidade | Notas |
| --- | --- | --- | --- |
| `wa-fin.py` | `local/wa-fin.py` | Ponto de entrada; delega comandos para `wa_fin_ctrl.cli`. | Mantém comentários de caminho e valida variáveis de ambiente. |
| `cli` | `local/src/wa_fin_ctrl/cli.py` | Define comandos (`processar`, `pdf`, `img`, `verificar`, `corrigir`, `fix`, `teste`). | Registra histórico automático. |
| `app` | `local/src/wa_fin_ctrl/app.py` | Núcleo de processamento: leitura de mensagens, OCR, heurísticas de valor, geração de CSV. | Usa constantes de `env.py`; precisa permanecer modular. |
| `history` | `local/src/wa_fin_ctrl/history.py` | Persistência de histórico com JSON. | Garantir transações atômicas (escrita -> flush). |
| `reporter`/`template` | `local/src/wa_fin_ctrl/reporter.py`, `template.py` | Geração de relatórios HTML, páginas editáveis e impressões. | Templates em `templates/*.j2`. |
| `ocr` | `local/src/wa_fin_ctrl/ocr.py` | Extração de texto com Tesseract ou fallback IA. | Deve suportar rotação automática. |
| `ia` | `local/src/wa_fin_ctrl/ia.py` | Integrações com OpenAI (ChatGPT) para validar/extrair valores. | Respeitar limites de custo e consentimento. |

### 2. Serviços locais (FastAPI)
| Componente | Arquivo | Responsabilidade | Notas |
| --- | --- | --- | --- |
| `api` | `local/src/wa_fin_ctrl/api.py` | Endpoints REST, WebSocket, entrega de relatórios; coordena notificações de reload. | Em breve: `/api/reports`, autenticação opcional. |
| `static` | `local/static/` | Recursos compartilhados (CSS, JS). | Servidos pelo FastAPI. |
| `templates/index.html.j2` | | Landing para listar relatórios, com estados de carregamento. | Deve consumir `/api/reports`. |

### 3. Plataforma cloud (TypeScript)
| Componente | Local | Responsabilidade | Status |
| --- | --- | --- | --- |
| `cloud/api` (NestJS) | `cloud/api/src` | APIs de sincronização, autenticação, notificações, monitoramento. | Refatorar de Yagnostic para finanças. |
| `WhatsappModule` | `cloud/api/src/modules/whatsapp` | Endpoint `/wa-zip`: processa ZIP do WhatsApp, filtra comprovantes, envia ao OpenRouter e grava JSONs. | Ativo — usa `OpenRouterModule` e armazena saídas em `cloud/api/extracted/`. |
| `cloud/ui` (React) | `cloud/ui/src` | Dashboard de relatórios: lista `/api/reports`, incorpora visualização via iframe e metadados. | Substitui app Yagnostic; segue contratos WA Fin Ctrl. |
| `ReportsDashboard` | `cloud/ui/src/components/reports/ReportsDashboard.tsx` | Orquestra busca, estados de carregamento e seleção de relatórios. | Depende de `useReports`. |
| `ReportList`/`ReportViewer` | `cloud/ui/src/components/reports` | Lista relatórios com filtros básicos e exibe HTML em iframe respeitando scripts do pipeline. | Reutiliza HTML gerado localmente. |
| `useReports` hook | `cloud/ui/src/hooks/useReports.ts` | Consumir `/api/reports`, cachear resposta e expor `refresh`. | Tratamento de erros/unreachable API. |
| `NGINX` gateway | `cloud/api/nginx` | Rate limiting para IA, roteamento seguro. | Configura limites `1r/m` (IA) e `10r/m` (geral). |

### 4. Documentação e governança
| Componente | Local | Responsabilidade |
| --- | --- | --- |
| RUP (`proj/`) | Pastas 00-99 | Registro das fases RUP, requisitos, planos e auditorias. |
| Checklists | `docs/checklists/` | Verificações obrigatórias antes de releases/auditorias. |
| Relatórios | `docs/report*.html` | Evidências entregues aos órgãos de controle. |

## Regras de relacionamento
- CLI executa `app` → gera CSV/HTML → `reporter` atualiza `docs/` → FastAPI serve arquivos e dispara WebSocket.
- Correções (`fix`) atualizam CSV, histórico e disparam WebSocket; UI deve consumir evento `reload`.
- Plataforma cloud consome pacotes exportados do pipeline local; nunca altera dados locais diretamente.
- IA (`ia.py`) só executa quando variáveis de ambiente necessárias são fornecidas e consentimento ativo.

## Dependências externas
- OCR: Tesseract + Poppler (configurados no Docker local).
- IA (local): OpenAI (Chat Completions) — chave opcional.
- IA (cloud): OpenRouter (Chat Completions + plugin `file-parser`) — requer `OPENROUTER_API_KEY`, `OPENROUTER_PDF_MODEL`, `OPENROUTER_PDF_ENGINE`.
- Storage/Email: definidos em `.env` e documentados na fase 05 (Entrega).

## Extensões planejadas
- `local/src/wa_fin_ctrl/sync.py`: utilitário para empacotar e enviar relatórios validados ao cloud.
- `cloud/ui/src/pages/Corrections.tsx`: painel de revisão com filtros avançados.
- `cloud/api/src/reports`: módulo dedicado a versionamento de relatórios e histórico de decisões.

Atualize este inventário sempre que novos módulos forem criados ou responsabilidades alteradas.

[Voltar ao índice da fase](README-spec.md)
