# Glossário

> Base: [./glossario.md](./glossario.md)
> Plano: [/docs/plans/20251025093000-evolucao-req-spec.md](/docs/plans/20251025093000-evolucao-req-spec.md)
> Changelog: [/CHANGELOG.md#2025-10-25](/CHANGELOG.md#2025-10-25)
> Referências correlatas: [Arquitetura da extensão](/req/01-arquitetura/arquitetura-da-extensao-spec.md) · [Design geral](/req/02-design/design-geral-spec.md) · [Testes end-to-end](/req/04-testes-e-validacao/testes-end-to-end-spec.md)

Este documento consolida os termos herdados do legado e relaciona cada conceito às entregas
vigentes do projeto da extensão Chrome. Todas as entradas mantêm as referências originais a
protótipos e módulos de código, com apontamentos explícitos para os requisitos
[REQ-001](../02-planejamento/requisitos-spec.md#req-001) a
[REQ-030](../02-planejamento/requisitos-spec.md#req-030).

## Funcionalidades principais (REQ-001 a REQ-010)

| Termo | Definição objetiva | Protótipo / Código | Requisitos |
| --- | --- | --- | --- |
| Google SSO MBRA | Fluxo de autenticação que delega a entrada corporativa ao Google e à API MBRA. | [prototype/login.html](../../prototype/login.html), [extension/src/api/client.ts](../../extension/src/api/client.ts) | [REQ-001](../02-planejamento/requisitos-spec.md#req-001) |
| JWT corporativo | Token emitido após o SSO e armazenado no IndexedDB com expiração controlada. | [extension/src/storage/db.ts](../../extension/src/storage/db.ts) | [REQ-002](../02-planejamento/requisitos-spec.md#req-002), [REQ-014](../02-planejamento/requisitos-spec.md#req-014) |
| Domínios monitorados | Lista de hosts autorizados para interceptar laudos clínicos. | [extension/src/api/client.ts](../../extension/src/api/client.ts), [extension/src/sidepanel/App.tsx](../../extension/src/sidepanel/App.tsx) | [REQ-003](../02-planejamento/requisitos-spec.md#req-003) |
| Interceptação de PDF | Cancelamento e captura de downloads médicos feitos no domínio autorizado. | [extension/src/background/index.ts](../../extension/src/background/index.ts) | [REQ-004](../02-planejamento/requisitos-spec.md#req-004) |
| Upload clínico | Envio seguro do arquivo interceptado para o endpoint `/upload`. | [extension/src/api/client.ts](../../extension/src/api/client.ts) | [REQ-005](../02-planejamento/requisitos-spec.md#req-005) |
| Token de diagnóstico | Identificador retornado pela API para rastrear processamento e notificações. | [extension/src/background/index.ts](../../extension/src/background/index.ts), [prototype/onboarding-permissoes.html](../../prototype/onboarding-permissoes.html) | [REQ-006](../02-planejamento/requisitos-spec.md#req-006) |
| Notificação multicanal | Disparo coordenado de e-mails e WhatsApp corporativo com o token gerado. | [extension/src/api/client.ts](../../extension/src/api/client.ts), [extension/src/sidepanel/App.tsx](../../extension/src/sidepanel/App.tsx), [prototype/email-aprovacao-conta.html](../../prototype/email-aprovacao-conta.html) | [REQ-007](../02-planejamento/requisitos-spec.md#req-007) |
| Fila de destinatários | Interface que permite incluir múltiplos contatos antes do envio. | [extension/src/sidepanel/App.tsx](../../extension/src/sidepanel/App.tsx) | [REQ-008](../02-planejamento/requisitos-spec.md#req-008) |
| Mensagem de agradecimento | Conteúdo exibido ao concluir comunicações clínicas e replicado nos templates de e-mail. | [api/src/email/mensagens.json](../../api/src/email/mensagens.json), [api/src/notifications/notification.service.ts](../../api/src/notifications/notification.service.ts) | [REQ-009](../02-planejamento/requisitos-spec.md#req-009) |
| Painel lateral Yagnostic | Side panel do Chrome que concentra login, tokens e notificações. | [extension/manifest.config.ts](../../extension/manifest.config.ts), [extension/src/sidepanel/App.tsx](../../extension/src/sidepanel/App.tsx) | [REQ-010](../02-planejamento/requisitos-spec.md#req-010) |

## Requisitos não funcionais (REQ-011 a REQ-017)

| Termo | Definição objetiva | Protótipo / Código | Requisitos |
| --- | --- | --- | --- |
| IndexedDB isolado | Banco local segmentado por domínio para sessão, tokens e consentimentos. | [extension/src/storage/db.ts](../../extension/src/storage/db.ts) | [REQ-011](../02-planejamento/requisitos-spec.md#req-011) |
| Build offline | Empacotamento via Vite e Manifest V3 sem dependências CDN em produção. | [extension/vite.config.ts](../../extension/vite.config.ts), [extension/package.json](../../extension/package.json) | [REQ-012](../02-planejamento/requisitos-spec.md#req-012) |
| Compatibilidade Chrome | Manifesto configurado para desktop e mobile com permissões controladas. | [extension/manifest.config.ts](../../extension/manifest.config.ts) | [REQ-013](../02-planejamento/requisitos-spec.md#req-013) |
| Expiração de sessão | Persistência do campo `expiresAt` para invalidar automaticamente o JWT. | [extension/src/storage/db.ts](../../extension/src/storage/db.ts) | [REQ-014](../02-planejamento/requisitos-spec.md#req-014) |
| SLA de requisições | Monitoramento de desempenho previsto para manter respostas abaixo de 3 s. | [req/05-entrega-e-implantacao/ambientes-e-configuracoes.md](../05-entrega-e-implantacao/ambientes-e-configuracoes-spec.md) | [REQ-015](../02-planejamento/requisitos-spec.md#req-015) |
| Responsividade do painel | Layout do side panel adaptável a múltiplas larguras. | [extension/src/sidepanel/App.module.css](../../extension/src/sidepanel/App.module.css) | [REQ-016](../02-planejamento/requisitos-spec.md#req-016) |
| Logs com consentimento | Registro de aceite LGPD e sincronização com o background antes de armazenar erros. | [extension/src/components/Onboarding.tsx](../../extension/src/components/Onboarding.tsx), [extension/src/storage/db.ts](../../extension/src/storage/db.ts) | [REQ-017](../02-planejamento/requisitos-spec.md#req-017) |

## Requisitos técnicos (REQ-018 a REQ-023)

| Termo | Definição objetiva | Protótipo / Código | Requisitos |
| --- | --- | --- | --- |
| Stack TypeScript + React | Implementação oficial da extensão em TypeScript, React e Manifest V3. | [extension/README.md](../../extension/README.md), [extension/manifest.config.ts](../../extension/manifest.config.ts) | [REQ-018](../02-planejamento/requisitos-spec.md#req-018) |
| Automação de build | Makefile e GitHub Actions que empacotam a extensão. | [extension/Makefile](../../extension/Makefile), [docs/reports/](../../docs/reports/) | [REQ-019](../02-planejamento/requisitos-spec.md#req-019) |
| APIs Chrome oficiais | Uso controlado de `chrome.downloads`, `chrome.storage`, `chrome.identity` e `sidePanel`. | [extension/src/background/index.ts](../../extension/src/background/index.ts), [extension/src/sidepanel/App.tsx](../../extension/src/sidepanel/App.tsx) | [REQ-020](../02-planejamento/requisitos-spec.md#req-020) |
| Versionamento de IA | Política de modelos descrita nos guias de agentes. | [AGENTS.md](../../AGENTS.md), [req/06-governanca-tecnica-e-controle-de-qualidade/revisoes-com-ia.md](../06-governanca-tecnica-e-controle-de-qualidade/revisoes-com-ia-spec.md) | [REQ-021](../02-planejamento/requisitos-spec.md#req-021) |
| Logs e artefatos | Armazenamento centralizado de relatórios gerados pelos pipelines. | [req/06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade.md](../06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade-spec.md) | [REQ-022](../02-planejamento/requisitos-spec.md#req-022) |
| Metadados de execuções | Exportação obrigatória de `run_id`, commit e timestamp nas execuções de IA. | [req/06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade.md](../06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade-spec.md), [docs/reports/](../../docs/reports/) | [REQ-023](../02-planejamento/requisitos-spec.md#req-023) |

## Requisitos legais e de conformidade (REQ-024 a REQ-030)

| Termo | Definição objetiva | Protótipo / Código | Requisitos |
| --- | --- | --- | --- |
| Consentimento explícito | Aceite LGPD obrigatório antes de qualquer uso da extensão. | [extension/src/components/Onboarding.tsx](../../extension/src/components/Onboarding.tsx), [extension/src/sidepanel/App.tsx](../../extension/src/sidepanel/App.tsx) | [REQ-024](../02-planejamento/requisitos-spec.md#req-024) |
| Termo pré-autenticação | Exibição do termo de privacidade antes do primeiro login. | [prototype/onboarding-consentimento.html](../../prototype/onboarding-consentimento.html), [extension/src/components/Onboarding.tsx](../../extension/src/components/Onboarding.tsx) | [REQ-025](../02-planejamento/requisitos-spec.md#req-025) |
| Tratamento controlado | Garantia de que nenhum dado pessoal é enviado sem autorização. | [req/06-governanca-tecnica-e-controle-de-qualidade/governanca-tecnica.md](../06-governanca-tecnica-e-controle-de-qualidade/governanca-tecnica-spec.md) | [REQ-026](../02-planejamento/requisitos-spec.md#req-026) |
| Revogação imediata | Permite exclusão local e revogação de dados pelo usuário. | [extension/src/storage/db.ts](../../extension/src/storage/db.ts) | [REQ-027](../02-planejamento/requisitos-spec.md#req-027) |
| Política no painel | Disponibiliza política de privacidade diretamente no side panel. | [extension/src/sidepanel/App.tsx](../../extension/src/sidepanel/App.tsx), [prototype/onboarding-boas-vindas.html](../../prototype/onboarding-boas-vindas.html) | [REQ-028](../02-planejamento/requisitos-spec.md#req-028) |
| Controlador MBRA | Declaração de responsabilidade pelo tratamento dos dados. | [req/06-governanca-tecnica-e-controle-de-qualidade/governanca-tecnica.md](../06-governanca-tecnica-e-controle-de-qualidade/governanca-tecnica-spec.md) | [REQ-029](../02-planejamento/requisitos-spec.md#req-029) |
| Políticas Chrome Web Store | Cumprimento das normas Manifest V3 para publicação. | [extension/manifest.config.ts](../../extension/manifest.config.ts), [req/05-entrega-e-implantacao/empacotamento-e-publicacao.md](../05-entrega-e-implantacao/empacotamento-e-publicacao.md) | [REQ-030](../02-planejamento/requisitos-spec.md#req-030) |

## Notas de coexistência com a capacidade colaborativa

- Os termos associados à fila clínica, notificações e trilhas de auditoria mantêm dependência
  direta dos requisitos [REQ-031](../02-planejamento/requisitos-spec.md#req-031) a
  [REQ-035](../02-planejamento/requisitos-spec.md#req-035). Sempre que novos componentes forem
  introduzidos para validação humana, registre o termo correspondente no glossário.
- As responsabilidades de logs, metadados e consentimento permanecem alinhadas às evoluções
  descritas em [`capacidade-diagnostico-colaborativo.md`](../02-planejamento/capacidade-diagnostico-colaborativo-spec.md).

[Voltar ao índice](README-spec.md)
