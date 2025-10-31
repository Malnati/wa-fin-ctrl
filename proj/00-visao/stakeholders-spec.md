# Stakeholders

> Base: [./stakeholders.md](./stakeholders.md)
> Plano: [/docs/plans/20251025093000-evolucao-req-spec.md](/docs/plans/20251025093000-evolucao-req-spec.md)
> Changelog: [/CHANGELOG.md#2025-10-25](/CHANGELOG.md#2025-10-25)
> Referências correlatas: [Arquitetura da extensão](/req/01-arquitetura/arquitetura-da-extensao-spec.md) · [Design geral](/req/02-design/design-geral-spec.md) · [Testes end-to-end](/req/04-testes-e-validacao/testes-end-to-end-spec.md)

## Partes interessadas
- **Proprietário do produto:** Millennium Brasil (MBRA).
- **Clientes-alvo:** laboratórios, hospitais e redes de saúde que precisam acelerar a interpretação de laudos por suas equipes médicas.
- **Usuários finais:** profissionais que operam a extensão, médicos que recebem diagnósticos sintetizados, equipes clínicas que consomem os tokens e destinatários notificados (pacientes, integrações corporativas).

## Necessidades resumidas
- **MBRA:** fortalecer o uso das APIs corporativas, manter auditoria ponta a ponta e ampliar a adoção da IA em diagnósticos.
- **Laboratórios, hospitais e redes de saúde:** automatizar a captura de PDFs, reduzir retrabalho manual e garantir distribuição rápida dos tokens de diagnóstico para médicos.
- **Usuários finais:** operar um fluxo simples de interceptação, obter diagnósticos em múltiplos formatos e receber notificações confiáveis que priorizem achados críticos.

## Papéis e responsabilidades
| Parte | Papel | Responsabilidades | Indicador de Sucesso |
| --- | --- | --- | --- |
| MBRA | Controladora e mantenedora do produto | Evoluir APIs, modelos de IA e governança da extensão (publicação, suporte, auditoria) | Disponibilidade >99% dos serviços e conformidade regulatória |
| Laboratórios/Hospitais | Clientes corporativos | Configurar destinatários, conceder consentimentos e validar diagnósticos gerados | Redução do tempo de liberação dos laudos e queda em retrabalho manual |
| Operadores da extensão | Usuários que instalam e executam o add-on | Habilitar a interceptação, revisar notificações e apoiar usuários finais | Taxa de interceptação bem-sucedida e satisfação operacional |
| Destinatários notificados | Médicos, pacientes ou integrações automatizadas | Consumir o token recebido e acessar relatórios PDF/áudio conforme permissão | Confirmações de recebimento e aderência às notificações |

A comunicação e a governança seguirão o cronograma interno da MBRA, com ritos periódicos de acompanhamento, revisão de indicadores e alinhamento estratégico com as demais iniciativas digitais da organização.

[Voltar ao índice](README-spec.md)
