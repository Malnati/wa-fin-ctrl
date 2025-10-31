# Testes End-to-End Complementares para Segurança

> Base: [./testes-seguranca-e2e.md](./testes-seguranca-e2e.md)
> Plano: [/docs/plans/20251025093000-evolucao-req-spec.md](/docs/plans/20251025093000-evolucao-req-spec.md)
> Changelog: [/CHANGELOG.md#2025-10-25](/CHANGELOG.md#2025-10-25)
> Referências correlatas: [Arquitetura da extensão](/req/01-arquitetura/arquitetura-da-extensao-spec.md) · [Design geral](/req/02-design/design-geral-spec.md) · [Testes end-to-end](/req/04-testes-e-validacao/testes-end-to-end-spec.md)

## Objetivo
Complementar os testes E2E existentes com cenários específicos para validação da nova capacidade de segurança implementada: rejeição de credenciais malformadas.

## E2E-SEC-001: Validação de Credenciais Malformadas
### Objetivo
Validar que a nova capacidade de segurança rejeita adequadamente credenciais malformadas

### Sub-cenários de segurança

#### E2E-SEC-001a: Credenciais Nulas e Vazias
**Passos:**
1. Abrir side panel de autenticação
2. Tentar autenticar com credencial null
3. Tentar autenticar com credencial undefined
4. Tentar autenticar com string vazia
5. Tentar autenticar com apenas espaços em branco

**Resultado esperado:**
- Todas as tentativas rejeitadas
- Mensagem de erro consistente: "Credencial Google inválida ou não reconhecida"
- Nenhum JWT gerado
- Tentativas registradas nos logs de auditoria
**Requisitos associados:** [REQ-001](../02-planejamento/requisitos-spec.md#req-001), [REQ-014](../02-planejamento/requisitos-spec.md#req-014), [REQ-017](../02-planejamento/requisitos-spec.md#req-017).

#### E2E-SEC-001b: Ataques de Injeção
**Passos:**
1. Tentar SQL injection: `'; DROP TABLE users; --`
2. Tentar XSS: `<script>alert('xss')</script>`
3. Tentar path traversal: `../../etc/passwd`
4. Tentar poluição de protótipo: `{"__proto__":{"isAdmin":true}}`

**Resultado esperado:**
- Todas as tentativas rejeitadas
- Sistema não comprometido
- Logs de segurança capturam tentativas de ataque
- Interface permanece estável
**Requisitos associados:** [REQ-001](../02-planejamento/requisitos-spec.md#req-001), [REQ-014](../02-planejamento/requisitos-spec.md#req-014), [REQ-017](../02-planejamento/requisitos-spec.md#req-017).

#### E2E-SEC-001c: Payloads Malformados
**Passos:**
1. Tentar credential com formato JWT inválido (menos de 3 segmentos)
2. Tentar credential com base64 malformado
3. Tentar credential com JSON inválido no payload
4. Tentar credential com payload extremamente grande (>10KB)

**Resultado esperado:**
- Todas as tentativas rejeitadas
- Performance não degradada significativamente
- Memória não vazada
**Requisitos associados:** [REQ-001](../02-planejamento/requisitos-spec.md#req-001), [REQ-014](../02-planejamento/requisitos-spec.md#req-014), [REQ-015](../02-planejamento/requisitos-spec.md#req-015).
**Integração colaborativa:** garante que apenas credenciais válidas alimentem o fluxo médico descrito em [REQ-031](../02-planejamento/requisitos-spec.md#req-031).

## E2E-SEC-002: Cenários de Segurança - Upload de Arquivos
### Objetivo
Validar segurança na funcionalidade de upload

### Sub-cenários
#### E2E-SEC-002a: Tipos de Arquivo Não Permitidos
**Passos:**
1. Tentar interceptar download de arquivo .exe
2. Tentar interceptar download de arquivo .bat
3. Tentar interceptar download de arquivo sem extensão

**Resultado esperado:**
- Arquivos maliciosos rejeitados
- Apenas PDFs aceitos para upload
**Requisitos associados:** [REQ-004](../02-planejamento/requisitos-spec.md#req-004), [REQ-005](../02-planejamento/requisitos-spec.md#req-005), [REQ-006](../02-planejamento/requisitos-spec.md#req-006).

#### E2E-SEC-002b: Arquivos Oversized
**Passos:**
1. Tentar upload de PDF > limite configurado
2. Verificar tratamento de erro

**Resultado esperado:**
- Upload rejeitado com mensagem clara
- Sistema permanece estável
**Requisitos associados:** [REQ-005](../02-planejamento/requisitos-spec.md#req-005), [REQ-006](../02-planejamento/requisitos-spec.md#req-006), [REQ-015](../02-planejamento/requisitos-spec.md#req-015).
**Integração colaborativa:** evita anexos inválidos nos relatórios clínicos previstos em [REQ-033](../02-planejamento/requisitos-spec.md#req-033).

## E2E-SEC-003: Auditoria e Logs de Segurança
### Objetivo
Validar que eventos de segurança são adequadamente registrados

### Passos
1. Executar diversos cenários de segurança (E2E-SEC-001)
2. Verificar logs de auditoria
3. Confirmar timestamp e detalhes dos eventos
4. Verificar que dados sensíveis não são logados

### Resultado esperado
- Todos os eventos de segurança registrados
- Logs contêm informações suficientes para auditoria
- Dados sensíveis não expostos nos logs
- Rotação de logs funcional
**Requisitos associados:** [REQ-017](../02-planejamento/requisitos-spec.md#req-017), [REQ-022](../02-planejamento/requisitos-spec.md#req-022), [REQ-023](../02-planejamento/requisitos-spec.md#req-023).
**Integração colaborativa:** mantém rastreabilidade exigida pelos painéis unificados de [REQ-034](../02-planejamento/requisitos-spec.md#req-034).

## Critérios de Aprovação Específicos para Segurança
### Obrigatórios
- [ ] 100% dos cenários de segurança (E2E-SEC-001, E2E-SEC-002, E2E-SEC-003) aprovados
- [ ] 0 vulnerabilidades críticas identificadas
- [ ] Mensagens de erro consistentes e não revelam informações sensíveis
- [ ] Performance mantida mesmo com ataques de payload grande
**Requisitos associados:** [REQ-014](../02-planejamento/requisitos-spec.md#req-014), [REQ-015](../02-planejamento/requisitos-spec.md#req-015), [REQ-017](../02-planejamento/requisitos-spec.md#req-017).

### Métricas de Segurança
- **Taxa de rejeição de credenciais malformadas**: 100%
- **Taxa de rejeição de ataques de injeção**: 100%
- **Tempo de resposta para credenciais inválidas**: < 500ms
- **Vazamento de informações em logs**: 0 ocorrências
**Integração colaborativa:** métricas devem ser copiadas para os painéis clínicos descritos em [REQ-034](../02-planejamento/requisitos-spec.md#req-034).

## Integração com CI/CD
Os testes de segurança devem ser:
- Executados obrigatoriamente em todo PR que toque autenticação
- Incluídos em scans de segurança automatizados
- Reportados com métricas específicas de segurança
- Integrados com ferramentas de análise de vulnerabilidades
**Requisitos associados:** [REQ-019](../02-planejamento/requisitos-spec.md#req-019), [REQ-022](../02-planejamento/requisitos-spec.md#req-022), [REQ-023](../02-planejamento/requisitos-spec.md#req-023).
**Integração colaborativa:** sincronizar resultados com os pipelines clínicos previstos em [REQ-031](../02-planejamento/requisitos-spec.md#req-031) para não perder rastreabilidade.

[Voltar ao documento principal](testes-end-to-end-spec.md)

[Voltar ao índice](README-spec.md)
