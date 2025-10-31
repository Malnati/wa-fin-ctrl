<!-- proj/02-planejamento/riscos-e-mitigacoes-spec.md -->
# Riscos e Mitigações — WA Fin Ctrl

> Base: [./riscos-e-mitigacoes.md](./riscos-e-mitigacoes.md)

| ID | Risco | Prob. | Impacto | Mitigação | Plano de contingência |
| --- | --- | --- | --- | --- | --- |
| R1 | Qualidade baixa das imagens (OCR falha) | Alta | Alto | Orientar captura, automatizar rotação, usar IA como fallback | Revisão manual destacada em dashboard |
| R2 | Custos elevados com IA | Média | Médio | Limites no NGINX, monitoramento de consumo | Desabilitar IA temporariamente e priorizar revisão manual |
| R3 | Vazamento de dados ao usar serviços externos | Baixa | Alto | Anonimizar dados, contrato com provedores, monitorar logs | Pausar integrações, comunicar MPDFT, plano de resposta a incidentes |
| R4 | Divergência entre dados local e cloud | Média | Alto | Hashes e pacotes assinados, sincronização controlada | Bloquear sincronização, executar reconciliação guiada |
| R5 | Falta de aderência à LGPD | Baixa | Alto | Revisões trimestrais, checklists, versionamento de consentimento | Suspender processamento até ajustar políticas |
| R6 | Atraso na refatoração cloud | Média | Médio | Roadmap detalhado, recursos dedicados, ritos semanais | Priorizar funcionalidades críticas locais e adiar integrações |
| R7 | Falha de backup | Baixa | Alto | Automação + testes de restauração | Restaurar de cópias offline, comunicar incidentes |
| R8 | Mudanças de requisitos pelo MPDFT | Média | Médio | Canal direto com curadores, backlog priorizado | Ajustar cronograma e comunicar impactos |

Riscos devem ser revistos mensalmente e registrados em changelog quando alterados.

[Voltar ao planejamento](README-spec.md)
