# Visão do Produto

> Base: [./visao-do-produto.md](./visao-do-produto.md)
> Plano: [/docs/plans/20251025093000-evolucao-req-spec.md](/docs/plans/20251025093000-evolucao-req-spec.md)
> Changelog: [/CHANGELOG.md#2025-10-25](/CHANGELOG.md#2025-10-25)
> Referências correlatas: [Arquitetura da extensão](/req/01-arquitetura/arquitetura-da-extensao-spec.md) · [Design geral](/req/02-design/design-geral-spec.md) · [Testes end-to-end](/req/04-testes-e-validacao/testes-end-to-end-spec.md)

Médicos e equipes clínicas enfrentam laudos laboratoriais extensos, frequentemente com mais de quarenta indicadores que precisam ser avaliados rapidamente para orientar condutas e comunicar pacientes. A análise manual consome tempo, gera filas de atendimento e dificulta manter registros consistentes em todos os sistemas assistenciais. A MBRA propõe atacar essa dor no ponto de origem — o momento em que o laudo é baixado — automatizando a geração e a entrega dos diagnósticos enriquecidos por IA.

Para isso, o Yagnostic evolui para uma **extensão do Google Chrome** conectada às APIs corporativas da MBRA. A extensão intercepta o download de PDFs de exames, encaminha os arquivos para os serviços de diagnóstico por IA, acompanha a geração de relatórios em PDF e áudio com insights priorizados e recebe um token representando o pacote consolidado. Em seguida, a própria extensão aciona os endpoints de notificações para distribuir o token aos destinatários configurados (profissionais, pacientes ou integrações externas), garantindo rastreabilidade ponta a ponta e auditoria automática.

## Benefícios principais
- Reduz o tempo que médicos gastam analisando laudos extensos, entregando diagnósticos sintetizados e priorizados.
- Garante diagnósticos gerados por IA em formatos PDF e áudio diretamente pelas APIs MBRA.
- Distribui o token do diagnóstico por múltiplos canais (e-mail seguro, integrações e webhooks) a partir da extensão.
- Mantém rastreabilidade completa do ciclo, com conformidade LGPD e registros de auditoria dos acessos e notificações.

## Alinhamento estratégico
O projeto amplia o portfólio digital da MBRA ao unir automação client-side, IA proprietária e APIs corporativas. A extensão Chrome torna-se a porta de entrada oficial para orquestrar diagnósticos inteligentes em portais de terceiros, reforçando o uso das APIs MBRA, acelerando integrações com novos laboratórios e posicionando a empresa como referência em governança de diagnósticos distribuídos.

## Premissas
- APIs de diagnóstico, geração de áudio e notificações disponíveis e autenticadas via MBRA.
- Modelos de IA treinados e governança contínua sobre datasets clínicos nos ambientes corporativos.
- Permissões do Chrome (downloads, notificações, armazenamento seguro) homologadas e auditáveis.
- Catálogo de destinatários e políticas de consentimento administrados pela plataforma MBRA.

## Limitações
- Alterações nos modelos de IA seguem processos regulatórios e ciclos de validação clínica formais.
- A extensão opera exclusivamente no Google Chrome (manifest v3) e depende de políticas da Chrome Web Store.
- O envio do token limita-se aos canais previamente homologados e aos destinatários com consentimento ativo.
- Novos formatos de arquivo ou portais adicionais exigem análise de segurança e privacidade antes da ativação.

[Voltar ao índice](README-spec.md)
