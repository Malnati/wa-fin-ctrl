<!-- proj/01-arquitetura/arquitetura-da-extensao-spec.md -->
# Arquitetura da Solução WA Fin Ctrl

> Base: [./arquitetura-da-extensao.md](./arquitetura-da-extensao.md)

A arquitetura do WA Fin Ctrl é dividida em dois pilares integrados: **pipeline local** (Python/FastAPI) e **plataforma cloud** (NestJS/React). O pipeline local processa comprovantes recebidos por aplicativos de mensagem, produz relatórios auditáveis e expõe APIs internas. A plataforma cloud orquestra sincronização, colaboração e publicação controlada dos dados.

## Visão macro

```
WhatsApp Export/Anexos
        │ (zip/pdf/jpg)
        ▼
┌──────────────────────────┐
│ Local Pipeline (Python) │
│ - CLI (wa-fin.py)       │
│ - OCR + IA              │
│ - CSV/HTML Generator    │
│ - FastAPI + WebSocket   │
└──────────┬──────────────┘
           │via APIs internas / arquivos versionados
           ▼
┌──────────────────────────┐
│ Plataforma Cloud         │
│ (NestJS + React)         │
│ - Ingestão segura        │
│ - Revisão colaborativa   │
│ - Dashboards             │
└──────────┬──────────────┘
           │
           ▼
Orgãos de controle, curadores, relatórios oficiais
```

## Componentes principais

### 1. Pipeline local (`local/`)
- **CLI (`wa-fin.py`, `src/wa_fin_ctrl/cli.py`):** ponto de entrada para processamento incremental (`processar`), comandos segmentados (`pdf`, `img`), verificações (`verificar`, `corrigir`) e correções cirúrgicas (`fix`). Registra execuções em `data/history.json`.
- **Engine de processamento (`app.py`, `ocr.py`, `ia.py`):** normaliza mensagens, aplica OCR (Tesseract ou ChatGPT assistido), extrai valores com heurísticas regulares e IA, identifica duplicidades, gera CSVs (`mensagens/*.csv`).
- **Gerador de relatórios (`reporter.py`, `template.py`):** converte dados consolidados em relatórios HTML mensais e geral, além de versões editáveis e imprimíveis. Mantém relação entre anexos e textos OCR (`ocr/extract.xml`).
- **API local (`src/wa_fin_ctrl/api.py`):** FastAPI com endpoints REST (`/api/status`, `/api/reports`, `/fix`) e WebSocket (`/ws`) para atualizações em tempo real. Serve HTML estático de `docs/` e imagens de `imgs/`.
- **Infraestrutura local:** Docker Compose (`local/docker-compose.yml`) executa o servidor FastAPI com volumes montados; Makefile expõe comandos para setup, processamento e testes.

### 2. Plataforma cloud (`cloud/`)
- **API NestJS (`cloud/api/`):** camada de sincronização (em transição do legado Yagnostic) responsável por autenticação, ingestão de relatórios validados, gestão de usuários/roles e notificações. Roadmap define refatoração para domínio financeiro (ver `proj/02-planejamento/roadmap-spec.md`).
- **UI React (`cloud/ui/`):** dashboard colaborativo para revisão de comprovantes, acompanhamento de pendências e publicação controlada. Adaptação visual/UX documentada em `proj/06-ux-brand/`.
- **Gateway NGINX e rate limiting:** protege integrações com LLM, e-mail e serviços externos, garantindo limites de custo e segurança.

### 3. Automação e governança
- **Agentes de IA (`proj/03-agentes-ia/`):** definem prompts autorizados, coleta de metadados (run_id, custo), e checkpoints de revisão humana.
- **Rastreabilidade:** cada execução gera entradas no histórico (`history.json`), arquivos de log e changelog (`CHANGELOG/`). Auditorias cruzam informações com `proj/audit-history-spec.md`.

## Fluxo de dados detalhado

1. **Coleta:** usuário exporta conversa e anexos do WhatsApp; arquivos são colocados em `input/` ou `imgs/`.
2. **Processamento incremental:** `wa-fin.py processar` identifica novos arquivos, move para diretórios apropriados, extrai textos e valores, atualiza CSVs e marca registros tratados.
3. **Correções assistidas:** comandos `fix` ou endpoint `/fix` permitem ajustar valores, descrições, classificação e rotacionar imagens; alterações propagam para todos os artefatos.
4. **Geração de relatórios:** `reporter.py` monta `docs/report.html`, versões mensais e páginas editáveis; `templates/*.j2` definem layout.
5. **Publicação local:** FastAPI disponibiliza relatórios e WebSocket notifica clientes conectados (UI local ou watchers).
6. **Sincronização cloud (planejada):** API NestJS recebe pacotes validados via endpoints autenticados, dispara workflows de revisão, versiona alterações e disponibiliza dashboards React.
7. **Entrega oficial:** relatórios aprovados são enviados às partes interessadas, armazenados para auditoria e referenciados em `docs/report*.html`.

## Padrões arquiteturais

- **Separação de responsabilidades:** diretórios distintos para dados (`mensagens/`, `docs/`, `ocr/`), código (`src/`, `cloud/api`, `cloud/ui`) e infraestrutura (`local/docker-compose.yml`, `Makefile`).
- **Configuração encadeada:** variáveis seguem `.env` → Docker Compose/Makefile → código (ver `proj/03-implementacao/estrutura-de-projeto-spec.md`).
- **Repetibilidade:** todo processamento pode ser reproduzido com os mesmos artefatos de entrada, graças ao histórico de comandos e scripts declarativos.
- **Observabilidade:** FastAPI expõe `/api/status`; histórico e dashboards exibem métricas de processamento. Logs sensíveis permanecem locais.
- **Segurança:** criptografia em repouso recomendada para diretórios sensíveis, comunicação HTTPS no ambiente cloud, segregação de redes para API local.

## Decisões técnicas atuais

| ID | Decisão | Motivação | Status | Próximos passos |
| --- | --- | --- | --- | --- |
| AD-001 | Processamento local como fonte de verdade | Garante operação offline e controle sobre dados sensíveis | Aprovada | Documentar política de backup e retenção automática |
| AD-002 | Uso opcional de LLM (OpenAI) para extração de valores | Elevar precisão em comprovantes ilegíveis | Em vigor | Implementar caching local e anonimização adicional |
| AD-003 | FastAPI com WebSocket para monitoramento | Permite UI reativa e integração com watchers | Aprovada | Expandir notificações para alertas de inconsistência |
| AD-004 | Refatorar legado Yagnostic para domínio financeiro | Reaproveitar infraestrutura existente (NestJS/Vite) | Em andamento | Concluir renomeações, atualizar contratos e UX |

## Riscos arquiteturais

- Dependência de qualidade das imagens (risco mitigado com checagens de nitidez e rotacionamento automático).
- Custos com LLM se uso crescer; monitoramento e limites em `proj/03-agentes-ia/politicas-e-regras-spec.md`.
- Divergência entre pipeline local e cloud durante fase de transição; políticas de sincronização incremental serão descritas no roadmap.

[Voltar à fase de arquitetura](README-spec.md)
