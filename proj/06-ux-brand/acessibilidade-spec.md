<!-- req/06-ux-brand/acessibilidade.md -->
# Acessibilidade

> Base: [./acessibilidade.md](./acessibilidade.md)
> Plano: [/docs/plans/20251025093000-evolucao-req-spec.md](/docs/plans/20251025093000-evolucao-req-spec.md)
> Changelog: [/CHANGELOG.md#2025-10-25](/CHANGELOG.md#2025-10-25)
> Referências correlatas: [Arquitetura da extensão](/req/01-arquitetura/arquitetura-da-extensao-spec.md) · [Design geral](/req/02-design/design-geral-spec.md) · [Testes end-to-end](/req/04-testes-e-validacao/testes-end-to-end-spec.md)

## Objetivo
Detalhar requisitos e boas práticas de acessibilidade que devem orientar o protótipo gerado no Google Stitch e sua posterior implementação na extensão Chrome.

## Padrões Normativos
- **WCAG 2.1 Nível AA** como baseline mínimo.
- **ARIA Authoring Practices 1.2** para componentes interativos (modais, menus, toasts).
- Conformidade com a **Lei Geral de Proteção de Dados (LGPD)** — mensagens e logs não podem expor informações pessoais desnecessárias.

## Checklist Operacional
1. Garantir foco programático na abertura de modais e ao finalizar upload.
2. Oferecer atalhos de teclado (`Alt+U` para Upload, `Alt+H` para histórico, `Alt+N` para notificações) documentados no protótipo.
3. Fornecer descrições alternativas para logos, ícones de status e ilustrações.
4. Evitar dependência exclusiva de cor; utilizar ícones e rótulos textuais nos feedbacks.
5. Disponibilizar botão "Pular para conteúdo" no topo do painel.

## Requisitos RUP
- Relacionado diretamente ao requisito `RUP-06-UX-003` (Acessibilidade e feedback inclusivo) e `RUP-02-DES-002` (Estados operacionais).
- Cobertura de testes automatizados deve ser rastreada em `req/04-testes-e-validacao/criterios-de-aceitacao.md` (quando atualizado).
- **Requisitos associados:** REQ-005 a REQ-010, REQ-011, REQ-016, REQ-017, REQ-024, REQ-028 e REQ-029.
- **Nota colaborativa:** verificar compatibilidade dos fluxos de validação humana (REQ-031–REQ-035) com leitores de tela, atalhos de teclado e mensagens descritivas antes da homologação.

## Métricas e Ferramentas
- **Contrast ratio:** usar Axe ou Lighthouse para validar ≥ 4.5:1.
- **Teclado:** teste manual + script Cypress focado em tabulação sequencial.
- **Leitor de tela:** validação com NVDA (Windows) e VoiceOver (macOS) em ambiente de homologação.

## Evidências Obrigatórias
- Capturas de tela com o indicador de foco visível.
- Gravação curta (GIF/MP4) mostrando o fluxo de upload via teclado.
- Relatório exportado do Axe com status "Passed" para os componentes principais (Login, Upload, Branding, Menu do usuário).
- **Requisitos associados:** REQ-015, REQ-016, REQ-017, REQ-022, REQ-023 e REQ-034.
- **Nota colaborativa:** anexar gravações que demonstrem o uso simultâneo por validadores humanos e IA nos cenários de aprovação compartilhada (REQ-031–REQ-033).

[Voltar ao índice](README-spec.md)
