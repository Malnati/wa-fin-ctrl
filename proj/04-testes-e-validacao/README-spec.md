# Testes e Validação

> Base: [./README.md](./README.md)
> Plano: [/docs/plans/20251025093000-evolucao-req-spec.md](/docs/plans/20251025093000-evolucao-req-spec.md)
> Changelog: [/CHANGELOG.md#2025-10-25](/CHANGELOG.md#2025-10-25)
> Referências correlatas: [Arquitetura da extensão](/req/01-arquitetura/arquitetura-da-extensao-spec.md) · [Design geral](/req/02-design/design-geral-spec.md) · [Testes end-to-end](/req/04-testes-e-validacao/testes-end-to-end-spec.md)

# Testes e Validação

## Documentos disponíveis
- [`estrategia-geral.md`](estrategia-geral-spec.md) — estratégia de testes aplicada ao projeto, incluindo níveis de teste, ambientes, ferramentas e rastreabilidade. **Requisitos:** [REQ-001](../02-planejamento/requisitos-spec.md#req-001), [REQ-006](../02-planejamento/requisitos-spec.md#req-006), [REQ-015](../02-planejamento/requisitos-spec.md#req-015), [REQ-018](../02-planejamento/requisitos-spec.md#req-018).
- [`criterios-de-aceitacao.md`](criterios-de-aceitacao-spec.md) — critérios técnicos, operacionais e legais para homologação. **Requisitos:** [REQ-001](../02-planejamento/requisitos-spec.md#req-001), [REQ-007](../02-planejamento/requisitos-spec.md#req-007), [REQ-017](../02-planejamento/requisitos-spec.md#req-017), [REQ-024](../02-planejamento/requisitos-spec.md#req-024).
- [`testes-end-to-end.md`](testes-end-to-end-spec.md) — cenários E2E para validação dos fluxos principais. **Requisitos:** [REQ-004](../02-planejamento/requisitos-spec.md#req-004), [REQ-005](../02-planejamento/requisitos-spec.md#req-005), [REQ-006](../02-planejamento/requisitos-spec.md#req-006), [REQ-016](../02-planejamento/requisitos-spec.md#req-016).
- [`validacao-de-marcos.md`](validacao-de-marcos-spec.md) — marcos de validação detalhados com critérios de aceite específicos. **Requisitos:** [REQ-001](../02-planejamento/requisitos-spec.md#req-001), [REQ-005](../02-planejamento/requisitos-spec.md#req-005), [REQ-007](../02-planejamento/requisitos-spec.md#req-007), [REQ-015](../02-planejamento/requisitos-spec.md#req-015).
- [`testes-seguranca-e2e.md`](testes-seguranca-e2e-spec.md) — cenários E2E específicos para validação da capacidade de segurança. **Requisitos:** [REQ-001](../02-planejamento/requisitos-spec.md#req-001), [REQ-014](../02-planejamento/requisitos-spec.md#req-014), [REQ-017](../02-planejamento/requisitos-spec.md#req-017).
- [`resumo-validacao-seguranca.md`](resumo-validacao-seguranca-spec.md) — resumo executivo da validação da nova capacidade de segurança. **Requisitos:** [REQ-001](../02-planejamento/requisitos-spec.md#req-001), [REQ-014](../02-planejamento/requisitos-spec.md#req-014), [REQ-022](../02-planejamento/requisitos-spec.md#req-022).
- [`resumo-validacao-multiplas-capacidades.md`](resumo-validacao-multiplas-capacidades-spec.md) — consolida a evolução de todas as capacidades auditadas. **Requisitos:** [REQ-001](../02-planejamento/requisitos-spec.md#req-001) a [REQ-009](../02-planejamento/requisitos-spec.md#req-009), [REQ-015](../02-planejamento/requisitos-spec.md#req-015).

## Capacidade de Segurança Validada
Este diretório contém a validação completa de **múltiplas novas capacidades** implementadas no projeto:

### 🔒 Capacidade 1: Rejeição de Credenciais Malformadas (PR #221)
- **47 casos de teste de segurança** cobrindo credenciais malformadas, ataques de injeção, payloads oversized
- Implementada em `api/src/auth/auth.service.ts` com validação rigorosa de entrada
- **100% de rejeição** de credenciais malformadas em todos os cenários testados
- **Requisitos associados:** [REQ-001](../02-planejamento/requisitos-spec.md#req-001), [REQ-014](../02-planejamento/requisitos-spec.md#req-014), [REQ-017](../02-planejamento/requisitos-spec.md#req-017).
- **Integração colaborativa:** bloqueios alimentam auditorias médicas previstas em [REQ-033](../02-planejamento/requisitos-spec.md#req-033) e logs compartilhados de [REQ-044](../02-planejamento/requisitos-spec.md#req-044).

### 🔐 Capacidade 2: Sistema de Autenticação Google SSO (Commit 08b6812)
- **Integração OAuth2 completa** com Google Identity Services
- **Gerenciamento de sessão avançado** com validação periódica e renovação automática
- **Controle de origem** baseado em domínios autorizados
- **Fallback seguro** para autenticação demo em desenvolvimento
- **Requisitos associados:** [REQ-001](../02-planejamento/requisitos-spec.md#req-001), [REQ-002](../02-planejamento/requisitos-spec.md#req-002), [REQ-010](../02-planejamento/requisitos-spec.md#req-010).
- **Integração colaborativa:** prepara o workflow humano+IA descrito em [REQ-031](../02-planejamento/requisitos-spec.md#req-031) ao garantir identidade validada para convites multi-especialistas.

### 🔌 Capacidade 3: API Endpoints Completos (Commit 9f6f79c)
- **Endpoints REST completos** para extensão Chrome (domain, upload, notify)
- **Validação de entrada robusta** para todos os endpoints
- **Sistema de notificações** com suporte a email e WhatsApp
- **Processamento de arquivos** com validação de tipo e tamanho
- **Requisitos associados:** [REQ-004](../02-planejamento/requisitos-spec.md#req-004), [REQ-005](../02-planejamento/requisitos-spec.md#req-005), [REQ-006](../02-planejamento/requisitos-spec.md#req-006), [REQ-007](../02-planejamento/requisitos-spec.md#req-007).
- **Integração colaborativa:** mantém consistência de payloads exigida por [REQ-032](../02-planejamento/requisitos-spec.md#req-032) e métricas compartilhadas de [REQ-034](../02-planejamento/requisitos-spec.md#req-034).

### Testes Automatizados Implementados
- **47 casos de teste de segurança** para validação de credenciais (`auth.security.spec.ts`)
- **95 testes de segurança** para controllers e endpoints (`app.controller.security.spec.ts`)
- **120+ testes de integração** para todos os endpoints da API (`endpoints.integration.spec.ts`)
- **Scripts de validação automatizada** para verificação contínua de todas as capacidades
- **Requisitos associados:** [REQ-015](../02-planejamento/requisitos-spec.md#req-015), [REQ-018](../02-planejamento/requisitos-spec.md#req-018), [REQ-019](../02-planejamento/requisitos-spec.md#req-019), [REQ-022](../02-planejamento/requisitos-spec.md#req-022).

### Documentação RUP
- **Estratégia de testes** expandida com testes de segurança específicos
- **Marcos de validação** detalhados com critérios de segurança obrigatórios
- **Cenários E2E** específicos para validação de segurança
- **Resumo executivo** com métricas e resultados de validação
- **Requisitos associados:** [REQ-017](../02-planejamento/requisitos-spec.md#req-017), [REQ-022](../02-planejamento/requisitos-spec.md#req-022), [REQ-023](../02-planejamento/requisitos-spec.md#req-023).

### Critérios de Aprovação
- ✅ **100% de rejeição** de credenciais malformadas
- ✅ **0 vulnerabilidades críticas** identificadas
- ✅ **Mensagens de erro consistentes** sem vazamento de informações
- ✅ **Performance mantida** mesmo sob ataques
- **Requisitos associados:** [REQ-014](../02-planejamento/requisitos-spec.md#req-014), [REQ-015](../02-planejamento/requisitos-spec.md#req-015), [REQ-017](../02-planejamento/requisitos-spec.md#req-017).
- **Integração colaborativa:** métricas alimentam painéis clínicos definidos em [REQ-034](../02-planejamento/requisitos-spec.md#req-034) sem suprimir indicadores legados.

## Scripts de Validação Disponíveis
- `test/validate-env-constants.js` — Validação de padronização de variáveis de ambiente
- `test/security-validation.js` — Análise de cobertura de testes de segurança
- `api/src/auth/auth.security.spec.ts` — Suite completa de testes de segurança unitários
- **Requisitos associados:** [REQ-019](../02-planejamento/requisitos-spec.md#req-019), [REQ-022](../02-planejamento/requisitos-spec.md#req-022), [REQ-023](../02-planejamento/requisitos-spec.md#req-023).

## Status da Validação
**✅ VALIDAÇÃO COMPLETA** - A nova capacidade de segurança atende a 100% dos critérios obrigatórios e está pronta para execução de testes E2E e deploy em homologação.
- **Integração colaborativa:** este status deve ser sincronizado com a matriz de validação médica em [REQ-031](../02-planejamento/requisitos-spec.md#req-031) e mantido nos relatórios unificados de [REQ-034](../02-planejamento/requisitos-spec.md#req-034).

[Voltar ao índice da req](../README-spec.md)
