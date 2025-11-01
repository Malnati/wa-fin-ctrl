<!-- proj/01-arquitetura/integracoes-com-apis-spec.md -->
# Integrações com APIs — WA Fin Ctrl

> Base: [./integracoes-com-apis.md](./integracoes-com-apis.md)

## Panorama geral
O WA Fin Ctrl se apoia em integrações de dois tipos:

1. **Serviços internos** — APIs e WebSocket do pipeline local (FastAPI), responsáveis por processar comprovantes, gerar relatórios e expor dados para ferramentas auxiliares.
2. **Serviços externos** — provedores de IA (OpenAI), e-mail/SMS, armazenamento seguro e a plataforma cloud (NestJS), que orquestra colaboração e publicação.

As integrações precisam respeitar a cadeia de configuração `.env → docker-compose/Makefile → código`, manter autenticação forte e registrar toda requisição relevante para auditoria.

## Contratos locais (FastAPI)
| Endpoint | Método | Descrição | Autenticação | Consumidores |
| --- | --- | --- | --- | --- |
| `/` | `GET` | Retorna `docs/index.html` e serve a interface local de relatórios. | Restrito por rede (localhost/VPN) | Navegador do curador |
| `/api/status` | `GET` | Informa estado do pipeline (timestamp de última execução, disponibilidade do WebSocket). | Restrito por rede | UI local, monitoramento |
| `/api/reports` | `GET` | Lista relatórios disponíveis, URLs e tipo (geral, mensal, editável). | Restrito por rede | `cloud/ui` (dashboard de relatórios), scripts de auditoria |
| `/fix` | `POST` formulário | Aplica correções em registros específicos (valor, descrição, classificação, rotação). | Token local (variável `API_TOKEN` - backlog) | CLI web/cloud, automações |
| `/ws` | WebSocket | Dispara eventos `reload` quando relatórios são regenerados. | Sem autenticação (rede confiável) | UI local, watchers |

## Contratos cloud (NestJS) — estado alvo
| Endpoint | Método | Descrição | Segurança |
| --- | --- | --- | --- |
| `/auth/login` | `POST` | Autenticação com MFA e emissão de JWT. | OAuth2 + totp |
| `/ingestion/packages` | `POST` multipart | Recebe pacotes validados do pipeline local (CSV + metadados + anexos opcionais). | JWT + assinatura digital |
| `/reports` | `GET` | Lista relatórios publicados, status de revisão, logs de auditoria. | JWT + RBAC |
| `/reviews/{id}` | `PATCH` | Aprova ou retorna relatório para ajustes, registrando comentários. | JWT + RBAC (Curador/MPDFT) |
| `/notifications` | `POST` | Dispara alertas (e-mail/SMS) para responsáveis, com taxa controlada por NGINX. | JWT + quotas |
| `/metrics` | `GET` | Exibe métricas operacionais para dashboards. | JWT + RBAC (Admin) |
| `/wa-zip` | `POST` multipart | Recebe exportações de conversas WhatsApp, isola comprovantes (PDF/imagem), envia ao OpenRouter e persiste JSON `{origem, author, extected}` e TXT `<arquivo>.txt` com o autor em `cloud/api/extracted/`. | JWT (planejado) + quotas dedicadas para IA |

## Serviços externos
| Serviço | Uso | Requisitos | Notas |
| --- | --- | --- | --- |
| **OpenAI API** | Extração assistida de valores quando OCR falha (pipeline local). | Chave `OPENAI_API_KEY`, limite 1 r/min (NGINX). | Texto enviado deve ser minimizado; prompt registrado em `docs/reports/` |
| **OpenRouter API** | OCR assistido na nuvem para comprovantes do `/wa-zip`. | `OPENROUTER_API_KEY` (ou `OPENROUTER_COOKIE`), `OPENROUTER_BASE_URL`, `OPENROUTER_HTTP_REFERER`, `OPENROUTER_APP_TITLE`, modelo/engine configuráveis, rate limit 1 r/min via NGINX. | Respostas salvas em `cloud/api/extracted/*.json`; prompt inclui contexto do autor enviado e deve permanecer alinhado a `proj/02-design/componentes-spec.md`. |
| **ElevenLabs/Alternativo** | (Backlog) geração de áudio para acessibilidade. | Configuração cloud, quotas diárias. | Desabilitado por padrão nesta release |
| **E-mail/SMTP** | Notificar responsáveis sobre pendências. | Credenciais armazenadas no vault da curadoria. | Utilizar mensagens templated documentadas em `proj/06-ux-brand/` |
| **Storage seguro (S3/MinIO)** | Arquivar relatórios e anexos aprovados. | Bucket dedicado, criptografia em repouso, versionamento habilitado. | Conexões TLS obrigatórias |

## Governança de integrações
- Toda integração nova exige registro no catálogo de requisitos (`proj/02-planejamento/requisitos-spec.md`) e análise de riscos (`riscos-e-mitigacoes-spec.md`).
- Logs de requisições externos devem incluir: timestamp, responsável, ID do comando e hash do payload quando aplicável.
- Valores sensíveis (tokens, senhas) ficam fora do repositório, em `.env` ou serviços de segredos; placeholders documentados em `proj/05-entrega-e-implantacao/ambientes-e-configuracoes-spec.md`.
- Em caso de falha de integração:
  1. Registrar ocorrência em `data/history.json` (automatizado).
  2. Abrir incidente seguindo `proj/06-governanca-tecnica-e-controle-de-qualidade/controle-de-qualidade-spec.md`.
  3. Atualizar changelog com a correção aplicada.

## Estratégia de autenticação
- **Local:** restringir FastAPI a interfaces internas. Backlog inclui token por requisição (`API_AUTH_TOKEN`) e autenticação mútua quando exposta em rede.
- **Cloud:** JWT curto (15 min) + refresh + TOTP. RBAC (Curador, Analista, Auditor, Admin) definido em `proj/07-contribuicao/contribuindo-spec.md`.
- **Integrações externas:** tokens rotacionados trimestralmente; registrar rotação em changelog e checklist `docs/checklists/security.md` (obrigatório).

## Observabilidade e limites
- Rate limiting via NGINX (1 req/min para LLM, 10 req/min geral) — valores revisados em `proj/03-agentes-ia/politicas-e-regras-spec.md`.
- Dashboards de monitoramento (Grafana/Prometheus) planejados para ambientes cloud; métricas mínimas: tempo de processamento, taxa de sucesso, uso de IA, alertas por curador.
- Todo consumo acima de 80% das quotas gera alerta automático para o time de curadoria.

## Backlog de integrações
1. Consolidar módulo NestJS `reports` para refletir o contrato atual consumido pelo `cloud/ui`.
2. Converter endpoints NestJS herdados (ex.: `/diagnostics/*`) para nomenclatura financeira, atualizando DTOs e testes.
3. Adicionar webhook de sincronização inversa (MPDFT → WA Fin Ctrl) para recebimento de pareceres.
4. Definir API pública para auditorias externas com dados anonimizados.

[Voltar à fase de arquitetura](README-spec.md)
