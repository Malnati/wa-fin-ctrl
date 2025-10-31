# Escopo

> Base: [./escopo.md](./escopo.md)
> Plano: [/docs/plans/20251025093000-evolucao-req-spec.md](/docs/plans/20251025093000-evolucao-req-spec.md)
> Changelog: [/CHANGELOG.md#2025-10-25](/CHANGELOG.md#2025-10-25)
> Referências correlatas: [Arquitetura da extensão](/req/01-arquitetura/arquitetura-da-extensao-spec.md) · [Design geral](/req/02-design/design-geral-spec.md) · [Testes end-to-end](/req/04-testes-e-validacao/testes-end-to-end-spec.md)

## Objetivo do produto
Entregar uma extensão do Google Chrome que intercepte downloads de laudos em PDF, encaminhe os arquivos para as APIs MBRA de diagnósticos por IA, consolide relatórios em PDF e áudio com insights priorizados para médicos e distribua o token do diagnóstico aos destinatários autorizados.

## Em escopo
- Extensão Chrome (manifest v3) com permissões para interceptar downloads de PDF e monitorar o histórico de notificações.
- Upload seguro dos PDFs capturados para as APIs MBRA responsáveis por geração de diagnósticos assistidos por IA.
- Orquestração dos serviços que produzem laudos em PDF e áudio com priorização de achados clínicos e retornam um token único por diagnóstico.
- Consumo dos endpoints de notificações para distribuir o token aos destinatários configurados (profissionais, pacientes, integrações).
- Configurações de destinatários, consentimentos e políticas de retenção expostas via APIs corporativas.
- Auditoria ponta a ponta do fluxo (captura, processamento, notificações) com registros centralizados na MBRA.

## Fora de escopo
- Suporte a navegadores além do Google Chrome ou versões anteriores ao manifest v3.
- Alterações em portais de terceiros além das configurações necessárias para capturar o download.
- Substituição dos ERPs clínicos dos laboratórios; integrações permanecem via APIs e notificações.
- Execução de modelos de IA fora dos ambientes certificados e monitorados pela MBRA.

## Entregáveis
- Extensão do Google Chrome empacotada e documentada para publicação na Chrome Web Store corporativa.
- APIs de diagnóstico, geração de áudio e notificações com contratos versionados e guias de integração.
- Automação de processamento IA com evidências de validação clínica e relatórios de performance.
- Documentação operacional, de conformidade e auditoria para o fluxo completo da extensão.

## Critérios de sucesso
- Download de laudos interceptado pela extensão com envio automático para as APIs de diagnóstico.
- Relatórios em PDF e áudio gerados pela IA com token único disponível para consulta segura.
- Notificações entregues aos destinatários autorizados com confirmação registrada na trilha de auditoria.
- Cumprimento das políticas de privacidade (LGPD) e das normas clínicas aplicáveis durante todo o fluxo.

[Voltar ao índice](README-spec.md)
