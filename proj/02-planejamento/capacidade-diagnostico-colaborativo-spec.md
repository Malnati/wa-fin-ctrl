<!-- req/02-planejamento/capacidade-diagnostico-colaborativo.md -->
# Capacidade de Diagnóstico Colaborativo

> Base: [./capacidade-diagnostico-colaborativo.md](./capacidade-diagnostico-colaborativo.md)
> Plano: [/docs/plans/20251025093000-evolucao-req-spec.md](/docs/plans/20251025093000-evolucao-req-spec.md)
> Changelog: [/CHANGELOG.md#2025-10-25](/CHANGELOG.md#2025-10-25)
> Referências correlatas: [Arquitetura da extensão](/req/01-arquitetura/arquitetura-da-extensao-spec.md) · [Design geral](/req/02-design/design-geral-spec.md) · [Testes end-to-end](/req/04-testes-e-validacao/testes-end-to-end-spec.md)

**Projeto:** Extensão Chrome MBRA (Yagnostic)
**Organização:** Millennium Brasil (MBRA)
**Data:** 2025-10-20 03:08:52 UTC

Este documento consolida a análise, os requisitos e o plano de entrega da nova capacidade de **diagnóstico colaborativo**. O objetivo é integrar um fluxo de validação médica humana sobre os diagnósticos gerados pela IA, garantindo conformidade regulatória e qualidade assistencial antes da entrega ao paciente.

---

## 1. Análise do Estado Atual

### Capacidades Existentes
Com base na análise da documentação e código atual, o sistema possui:

**Funcionalidades Implementadas:**
- REQ-001 a REQ-010: Login via Google SSO, interceptação de PDF, upload para API
- REQ-011 a REQ-017: Armazenamento IndexedDB, compatibilidade Chrome, UI responsiva
- REQ-018 a REQ-023: Stack TypeScript/React/Manifest V3, pipelines CI/CD
- REQ-024 a REQ-030: Conformidade LGPD, políticas Chrome Web Store

**Componentes Operacionais:**
- Chrome Extension (Manifest V3) com TypeScript/React
- API NestJS para processamento de diagnósticos
- UI web complementar para visualização
- Sistema de notificações por email/WhatsApp (mockado)
- Integração com OpenRouter para análise por IA
- Sistema TTS para geração de áudio

### Lacunas Identificadas

**1. Processamento de Diagnóstico em Tempo Real**
- **Problema:** A API possui capacidade de diagnóstico, mas a extensão não oferece feedback em tempo real
- **Impacto:** Usuários não sabem se o arquivo foi processado com sucesso
- **Evidência:** [`especificacao-de-requisitos.md`](especificacao-de-requisitos-spec.md) não descreve retorno imediato para usuários finais

**2. Gestão de Múltiplos Formatos de Arquivo**
- **Problema:** Sistema focado apenas em PDFs
- **Impacto:** Limitação para laboratórios que usam outros formatos (DICOM, HL7, XML)
- **Evidência:** Arquitetura da extensão documenta apenas filtros para PDF

**3. Auditoria e Rastreabilidade Completa**
- **Problema:** Falta sistema de auditoria ponta a ponta para conformidade médica
- **Impacto:** Dificuldade em atender regulamentações específicas da área da saúde
- **Evidência:** [`especificacao-de-requisitos.md`](especificacao-de-requisitos-spec.md) não detalha trilha de auditoria médica

**4. Integração com Sistemas de Gestão Hospitalar (HIS/LIS)**
- **Problema:** Não há integração nativa com sistemas hospitalares existentes
- **Impacto:** Necessidade de trabalho manual para correlacionar diagnósticos
- **Evidência:** Integrações com APIs não mencionam padrões hospitalares

**5. Controle de Qualidade de Diagnósticos**
- **Problema:** Sistema não possui validação médica humana antes da entrega
- **Impacto:** Riscos de responsabilidade legal em diagnósticos automatizados
- **Evidência:** Issue 0052 menciona agentes retornando respostas estáticas

---

## 2. Proposta de Nova Capacidade: Sistema de Diagnóstico Colaborativo

### Visão Geral
Implementar um sistema que permite colaboração entre IA e médicos especialistas para validação de diagnósticos antes da entrega final, incluindo workflow de aprovação e sistema de qualidade.

### Justificativa Estratégica
- **Conformidade Regulatória:** Atende CFM e ANVISA para diagnósticos assistidos
- **Diferenciação Competitiva:** Primeiro sistema com validação humana integrada
- **Redução de Riscos:** Minimiza responsabilidade legal da MBRA
- **Escalabilidade:** Permite crescimento controlado da base de usuários

---

## 3. Requisitos Funcionais da Nova Capacidade

### RF-031: Workflow de Validação Médica
**Descrição:** O sistema deve implementar workflow onde diagnósticos por IA são submetidos para validação por médico especialista antes da entrega.
**Critérios de Aceite:**
- Diagnóstico gerado pela IA entra em fila de validação
- Médico especialista recebe notificação para revisão
- Interface permite aprovação, rejeição ou modificação do diagnóstico
- Histórico completo de alterações é mantido
- SLA máximo de 4 horas para validação em horário comercial

### RF-032: Sistema de Especialidades Médicas
**Descrição:** O sistema deve rotear diagnósticos para médicos especialistas baseado no tipo de exame.
**Critérios de Aceite:**
- Cadastro de médicos com especialidades e CRM
- Algoritmo de roteamento baseado em tipo de exame e disponibilidade
- Sistema de escalation para exames urgentes
- Dashboard de carga de trabalho por especialista

### RF-033: Interface de Validação para Médicos
**Descrição:** Interface web dedicada para médicos revisarem e validarem diagnósticos gerados por IA.
**Critérios de Aceite:**
- Visualização lado a lado: laudo original e diagnóstico IA
- Ferramentas de marcação e anotação
- Sistema de comentários e colaboração
- Assinatura digital integrada
- Suporte mobile para urgências

### RF-034: Sistema de Qualidade e Métricas
**Descrição:** Dashboard de qualidade com métricas de performance da IA e médicos validadores.
**Critérios de Aceite:**
- Métricas de acurácia da IA por tipo de exame
- Tempo médio de validação por especialista
- Taxa de concordância IA vs. médico
- Alertas para padrões de qualidade baixa
- Relatórios regulatórios automatizados

### RF-035: Integração com Sistemas Hospitalares
**Descrição:** APIs padronizadas para integração com HIS/LIS existentes.
**Critérios de Aceite:**
- Suporte a padrões HL7 FHIR
- Conectores para principais sistemas brasileiros (Tasy, MV, Philips)
- Sincronização bidirecional de pacientes e exames
- Mapeamento de códigos TUSS e TISS
- Auditoria de todas as integrações

---

## 4. Requisitos Não Funcionais da Nova Capacidade

### RNF-031: Disponibilidade do Sistema de Validação
**Descrição:** Sistema deve ter 99.9% de uptime durante horário comercial (6h-22h).
**Métrica:** Máximo 43 minutos de downtime por mês
**Verificação:** Monitoramento contínuo com alertas automáticos

### RNF-032: Performance de Validação
**Descrição:** Interface de validação deve responder em menos de 2 segundos para carregamento de exames.
**Métrica:** 95% das requisições < 2s, 99% < 5s
**Verificação:** Métricas de APM em produção

### RNF-033: Segurança de Dados Médicos
**Descrição:** Conformidade com LGPD e padrões internacionais para dados de saúde.
**Métrica:** Zero vazamentos de dados, auditoria 100% rastreável
**Verificação:** Auditorias semestrais e testes de penetração

### RNF-034: Escalabilidade do Workflow
**Descrição:** Sistema deve suportar até 10.000 validações simultâneas.
**Métrica:** Processamento linear até 10k concurrent users
**Verificação:** Testes de carga automatizados

### RNF-035: Conformidade Regulatória
**Descrição:** Atendimento completo às normas CFM, ANVISA e SBIS.
**Métrica:** 100% dos requisitos regulatórios atendidos
**Verificação:** Auditoria anual por consultoria especializada

---

## 5. Requisitos Técnicos da Nova Capacidade

### RT-031: Arquitetura de Microserviços para Validação
**Descrição:** Sistema de validação deve ser implementado como microserviços independentes.
**Especificações:**
- Serviço de workflow de validação (Node.js/NestJS)
- Serviço de notificações em tempo real (WebSockets)
- Serviço de métricas e analytics (Time-series DB)
- Message broker para comunicação assíncrona (RabbitMQ/Redis)

### RT-032: Base de Dados Especializada
**Descrição:** Estrutura de dados otimizada para workflows médicos.
**Especificações:**
- PostgreSQL com extensões para dados médicos
- Índices otimizados para consultas por especialidade
- Particionamento por data para performance
- Backup/restore com RPO < 1 hora

### RT-033: APIs de Integração Hospitalar
**Descrição:** Camada de integração padronizada para sistemas externos.
**Especificações:**
- REST APIs com OpenAPI 3.0
- Suporte a HL7 FHIR R4
- Conectores específicos para cada sistema
- Rate limiting e throttling por cliente

### RT-034: Sistema de Monitoramento Avançado
**Descrição:** Observabilidade completa do sistema de validação.
**Especificações:**
- Logs estruturados com correlation IDs
- Métricas custom no Prometheus
- Tracing distribuído com Jaeger
- Alertas inteligentes baseados em ML

### RT-035: Infraestrutura Cloud-Native
**Descrição:** Deploy em Kubernetes com alta disponibilidade.
**Especificações:**
- Multi-AZ deployment no AWS/GCP
- Auto-scaling baseado em métricas custom
- Service mesh para comunicação segura
- GitOps para deploy automatizado

---

## 6. Histórias de Usuário

### História 1: Médico Especialista
**Como** médico cardiologista cadastrado no sistema
**Eu quero** receber notificações de ECGs que precisam de validação
**Para que** eu possa revisar e aprovar diagnósticos de IA antes da entrega ao paciente

**Critérios de Aceite:**
- Notificação por email e app mobile
- Interface mostra ECG original e interpretação IA
- Posso aprovar, rejeitar ou modificar o diagnóstico
- Assinatura digital é aplicada automaticamente
- Paciente é notificado apenas após minha aprovação

### História 2: Gestor de Qualidade
**Como** gestor de qualidade da MBRA
**Eu quero** acompanhar métricas de concordância entre IA e médicos
**Para que** eu possa identificar necessidades de retreinamento da IA

**Critérios de Aceite:**
- Dashboard com métricas em tempo real
- Filtros por especialidade, período e médico
- Alertas automáticos para tendências problemáticas
- Relatórios exportáveis para reguladores
- Drill-down em casos específicos de discordância

### História 3: Administrador Hospitalar
**Como** administrador de TI hospitalar
**Eu quero** integrar o sistema Yagnostic com nosso HIS
**Para que** diagnósticos sejam automaticamente registrados no prontuário

**Critérios de Aceite:**
- API de integração com documentação completa
- Mapeamento automático de campos padrão
- Sincronização bidirecional de pacientes
- Logs de auditoria de todas as operações
- Rollback automático em caso de falhas

### História 4: Médico Solicitante
**Como** médico que solicitou um exame
**Eu quero** ser notificado quando o diagnóstico validado estiver pronto
**Para que** eu possa dar continuidade ao tratamento do paciente

**Critérios de Aceite:**
- Notificação via WhatsApp, email ou app
- Link direto para o diagnóstico validado
- Histórico de todos os exames do paciente
- Possibilidade de solicitar segunda opinião
- Feedback sobre qualidade do diagnóstico

### História 5: Paciente
**Como** paciente que realizou um exame
**Eu quero** receber meu diagnóstico de forma segura e compreensível
**Para que** eu possa entender minha condição e próximos passos

**Critérios de Aceite:**
- Acesso por link seguro com autenticação
- Linguagem leiga explicando o diagnóstico
- Áudio disponível para acessibilidade
- Opção de compartilhar com outros médicos
- Canal para dúvidas com médico validador

---

## 7. Regras de Negócio

### RN-031: Qualificação de Médicos Validadores
- Apenas médicos com CRM ativo podem ser validadores
- Especialistas devem ter certificação específica da área
- Validação obrigatória a cada 2 anos
- Limite máximo de 50 validações por médico por dia

### RN-032: Priorização de Exames
- Exames urgentes (emergência) têm prioridade máxima
- Rotacionamento automático entre médicos disponíveis
- Escalation automático após 2 horas sem validação
- Backup por telessaúde para horários noturnos

### RN-033: Qualidade Mínima IA
- Diagnósticos com confiança < 70% vão direto para validação
- Taxa de concordância IA vs. médico deve ser > 85%
- Retreinamento obrigatório se taxa cai abaixo de 80%
- Auditoria mensal de casos discordantes

### RN-034: Responsabilidade Legal
- Médico validador assume responsabilidade pelo diagnóstico final
- MBRA responsável apenas pela plataforma tecnológica
- Seguro de responsabilidade civil obrigatório para validadores
- Todos os casos mantidos por 20 anos para auditoria

### RN-035: Privacidade e Consentimento
- Consentimento explícito para processamento por IA
- Opt-out disponível para validação humana apenas
- Anonimização de dados para treinamento IA
- Direito de exclusão completa a qualquer momento

---

## 8. Pontos de Integração

### Integração 1: Sistema de Validação ↔ API Existente
**Protocolo:** REST API
**Formato:** JSON
**Autenticação:** JWT Bearer Token
**Endpoints Novos:**
- `POST /validation/submit` - Submete diagnóstico para validação
- `GET /validation/queue` - Lista exames pendentes por especialista
- `PUT /validation/{id}/approve` - Aprova diagnóstico
- `PUT /validation/{id}/reject` - Rejeita diagnóstico
- `GET /validation/metrics` - Métricas de qualidade

### Integração 2: Sistema de Notificações Avançado
**Protocolo:** WebSocket + Message Queue
**Formato:** JSON
**Canais:**
- Email via SendGrid/SES
- WhatsApp via Twilio
- Push notifications mobile
- SMS para urgências
- Integração com PACS/LIS

### Integração 3: Sistemas Hospitalares (HL7 FHIR)
**Protocolo:** HTTPS REST
**Formato:** FHIR R4 JSON
**Recursos FHIR:**
- Patient - dados demográficos
- DiagnosticReport - laudos e diagnósticos
- Observation - resultados de exames
- Practitioner - dados de médicos
- Organization - instituições

### Integração 4: Sistema de Auditoria
**Protocolo:** Event Streaming
**Formato:** AVRO/JSON
**Eventos:**
- ValidacaoIniciada
- ValidacaoCompleta
- DiagnosticoModificado
- AcessoRelatório
- IntegracaoExterna

---

## 9. Critérios de Aceite da Capacidade

### Critério 1: Funcionalidade Básica
- [ ] Médico consegue se cadastrar e ser aprovado como validador
- [ ] Diagnóstico IA entra automaticamente na fila de validação
- [ ] Interface permite validação completa com assinatura
- [ ] Paciente recebe apenas diagnósticos validados
- [ ] Auditoria registra todas as ações

### Critério 2: Performance e Escalabilidade
- [ ] Sistema suporta 1000 validações simultâneas
- [ ] Interface carrega em menos de 2 segundos
- [ ] Notificações chegam em menos de 30 segundos
- [ ] Backup e recovery em menos de 1 hora
- [ ] 99.9% uptime durante horário comercial

### Critério 3: Integração e Compatibilidade
- [ ] Integração com pelo menos 3 sistemas hospitalares
- [ ] APIs documentadas com OpenAPI 3.0
- [ ] Suporte a HL7 FHIR R4 completo
- [ ] Conectores testados em ambiente real
- [ ] Rollback automático em falhas de integração

### Critério 4: Conformidade e Segurança
- [ ] Auditoria externa confirma conformidade LGPD
- [ ] Certificação SBIS para sistemas de saúde
- [ ] Testes de penetração sem vulnerabilidades críticas
- [ ] Backup de dados médicos com criptografia
- [ ] Logs de auditoria imutáveis e rastreáveis

### Critério 5: Usabilidade e Experiência
- [ ] Interface aprovada por médicos em teste de usabilidade
- [ ] Tempo de validação reduzido em 50% vs. processo manual
- [ ] Taxa de adoção > 80% entre médicos piloto
- [ ] NPS > 7 entre usuários finais
- [ ] Documentação e treinamento disponíveis

---

## 10. Riscos e Mitigações

### Risco 1: Resistência dos Médicos à IA
**Probabilidade:** Alta
**Impacto:** Alto
**Mitigação:**
- Programa de change management
- Treinamento extensivo sobre benefícios
- Casos de sucesso e estudos científicos
- Interface que empodera médicos, não substitui

### Risco 2: Complexidade Regulatória
**Probabilidade:** Média
**Impacto:** Alto
**Mitigação:**
- Consultoria especializada em regulamentação médica
- Implementação faseada com aprovações intermediárias
- Comitê médico consultivo permanente
- Relacionamento próximo com CFM e ANVISA

### Risco 3: Integração com Sistemas Legados
**Probabilidade:** Alta
**Impacto:** Médio
**Mitigação:**
- POCs com principais sistemas do mercado
- Parceria com fornecedores de HIS/LIS
- APIs flexíveis com múltiplos formatos
- Equipe especializada em integrações

### Risco 4: Escalabilidade da Validação Humana
**Probabilidade:** Média
**Impacto:** Alto
**Mitigação:**
- Rede nacional de especialistas
- Telemedicina para cobertura 24/7
- IA cada vez mais precisa reduzindo necessidade de validação
- Parcerias com sociedades médicas

### Risco 5: Responsabilidade Legal
**Probabilidade:** Baixa
**Impacto:** Muito Alto
**Mitigação:**
- Seguro de responsabilidade civil robusto
- Contratos claros definindo responsabilidades
- Auditoria completa de todos os casos
- Compliance rigoroso com normativas médicas

---

## 11. Próximos Passos

### Fase 1: Validação de Conceito (MVP) - 8 semanas
1. **Semanas 1-2:** Design detalhado da arquitetura de validação
2. **Semanas 3-4:** Implementação do workflow básico de validação
3. **Semanas 5-6:** Interface web para médicos validadores
4. **Semanas 7-8:** Testes com grupo piloto de médicos

### Fase 2: Sistema Completo - 16 semanas
1. **Semanas 9-12:** Sistema de métricas e qualidade
2. **Semanas 13-16:** Integrações com HIS/LIS
3. **Semanas 17-20:** Sistema de auditoria e conformidade
4. **Semanas 21-24:** Testes de carga e certificações

### Fase 3: Produção e Expansão - 8 semanas
1. **Semanas 25-26:** Deploy em produção e monitoramento
2. **Semanas 27-28:** Onboarding de hospitais piloto
3. **Semanas 29-30:** Ajustes baseados em feedback real
4. **Semanas 31-32:** Plano de expansão nacional

---

## 12. Responsabilidade Técnica e Aprovações

**Responsável Técnico:** Ricardo Malnati — Engenheiro de Software
**Organização:** Millennium Brasil (MBRA)
**Documento:** `req/02-planejamento/capacidade-diagnostico-colaborativo.md`
**Data de Criação:** 2025-10-20 03:08:52 UTC
**Status:** Aguardando Revisão e Aprovação

**Aprovações Necessárias:**
- [ ] Diretor Técnico MBRA
- [ ] Conselho Médico Consultivo
- [ ] Compliance e Jurídico
- [ ] Arquiteto de Soluções
- [ ] Líder de Produto

**Critérios para Aprovação:**
- Alinhamento com estratégia corporativa MBRA
- Viabilidade técnica e econômica
- Conformidade regulatória validada
- Riscos identificados e mitigados
- Roadmap detalhado e realista

---

*Este documento será atualizado conforme feedback das revisões e aprovações necessárias.*
