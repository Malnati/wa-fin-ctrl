<!-- proj/01-arquitetura/requisitos-nao-funcionais-spec.md -->
# Requisitos Não Funcionais — WA Fin Ctrl

> Base: [./requisitos-nao-funcionais.md](./requisitos-nao-funcionais.md)

Os requisitos não funcionais (RNF) definem limites de qualidade, segurança e governança que o WA Fin Ctrl deve respeitar em todas as fases. Cada item deve estar vinculado a métricas monitoradas em `proj/04-qualidade-testes/` e validado em `proj/04-testes-e-validacao/`.

## Segurança
- **RNF-S-001 — Isolamento local:** a API FastAPI só pode ser acessada por redes confiáveis (localhost/VPN). Expor para internet requer plano aprovado e autenticação mútua.
- **RNF-S-002 — Controle de acesso cloud:** JWT com expiração curta (≤ 15 min) + MFA obrigatório para usuários cloud. Refresh tokens armazenados com criptografia em repouso.
- **RNF-S-003 — Sanitização de logs:** registros técnicos não podem conter dados pessoais; usar identificadores hash e campos técnicos.
- **RNF-S-004 — Integridade de arquivos:** cada comprovante processado deve ter hash SHA256 armazenado para validação futura (backlog implementado em `proj/03-implementacao/build-e-automacao-spec.md`).

## Privacidade e LGPD
- **RNF-P-001 — Minimização:** apenas metadados necessários são enviados a LLMs. Textos completos só podem ser compartilhados mediante anonimização.
- **RNF-P-002 — Retenção controlada:** dados ficam disponíveis por 5 anos ou conforme orientação do MPDFT. Expiração automática deve ser registrada em changelog.
- **RNF-P-003 — Consentimento versionado:** qualquer sincronização cloud exige consentimento explícito registrado com timestamp e responsável.
- **RNF-P-004 — Revogação imediata:** revogar consentimento remove dados de ambientes cloud e bloqueia novos envios até nova autorização.

## Desempenho
- **RNF-D-001 — Processamento incremental:** cada execução deve detectar novos arquivos em ≤ 10 s e concluir lote de 100 comprovantes em ≤ 8 min (hardware referência).
- **RNF-D-002 — WebSocket responsivo:** eventos de atualização devem ser enviados em até 2 s após conclusão do processamento.
- **RNF-D-003 — UI cloud:** páginas React precisam carregar em ≤ 2,5 s (P95) com bundle otimizado por Vite.
- **RNF-D-004 — OCR/IA:** chamadas a IA devem retornar em ≤ 5 s; acima disso registrar alerta.

## Disponibilidade e Resiliência
- **RNF-R-001 — Reexecução idempotente:** comandos `processar` com `--force` devem produzir os mesmos resultados (csv/html) quando entradas não mudam.
- **RNF-R-002 — Recuperação de falhas:** filas de upload locais precisam reprocessar automaticamente itens com status `error`, mantendo contador de tentativas.
- **RNF-R-003 — Backups automatizados:** agendar exportação semanal dos diretórios `docs/`, `mensagens/`, `ocr/` para storage seguro.
- **RNF-R-004 — Monitoramento:** métricas mínimas: tempo de processamento, quantidade de registros corrigidos, falhas de IA, eventos de revogação.

## Manutenibilidade
- **RNF-M-001 — Estrutura modular:** nenhum módulo Python deve ultrapassar 500 linhas sem justificativa; dividir por responsabilidades (`ocr`, `reporter`, `history`).
- **RNF-M-002 — Tipagem e lint:** TypeScript em modo `strict` e ESLint ativo; Python com mypy opcional (roadmap) e Ruff/Black para estilo.
- **RNF-M-003 — Documentação sincronizada:** qualquer mudança em diretório (`local/`, `cloud/`) deve atualizar RUP correspondente e changelog.
- **RNF-M-004 — Testes e2e:** conjunto mínimo de testes automatizados (`wa-fin.py teste`) deve cobrir ingestão, processamento, correção e geração de relatórios.

## UX e Acessibilidade
- **RNF-U-001 — Contrast ratio:** seguir padrões WCAG AA; relatórios HTML precisam ser legíveis em impressão PB.
- **RNF-U-002 — Navegação por teclado:** UI cloud e relatórios devem permitir navegação completa sem mouse.
- **RNF-U-003 — Estado visível:** exibir claramente status de processamento (pendente, processando, erro, concluído).
- **RNF-U-004 — Idioma e terminologia:** textos em português claro; glossário mantido em `proj/99-anexos/glossario-spec.md`.

## Observabilidade e Auditoria
- **RNF-O-001 — Histórico obrigatório:** nenhuma execução crítica pode encerrar sem registrar entrada em `data/history.json`.
- **RNF-O-002 — Correlation ID:** eventos gerados (logs, WebSocket, notificações) devem carregar identificador único do processamento.
- **RNF-O-003 — Relatórios de auditoria:** toda entrega deve gerar evidências em `docs/reports/` com referência cruzada ao changelog.
- **RNF-O-004 — Alertas proativos:** quando custo mensal de IA atingir 80% do orçamento, emitir alerta para curadoria.

## Conformidade técnica
- **RNF-C-001 — Infra como código:** Dockerfiles e compose são fonte oficial; qualquer alteração manual deve ser refletida nos arquivos versionados.
- **RNF-C-002 — Cadeia .env:** toda nova variável deve aparecer em `.env.example`, `docker-compose.yml`, `Makefile` e código consumidor.
- **RNF-C-003 — Sem scripts shell extras:** automações obrigatoriamente via Makefile, conforme políticas de `AGENTS.md`.
- **RNF-C-004 — Versionamento semântico:** releases cloud seguem `MAJOR.MINOR.PATCH` e precisam atualizar `proj/05-entrega-e-implantacao/publicacao-e-versionamento-spec.md`.

Cada RNF deve ser mapeado para testes (automáticos ou manuais) e monitorado continuamente, garantindo evidências em auditoria.

[Voltar à fase de arquitetura](README-spec.md)
