<!-- proj/README-spec.md -->
# Documentação RUP — WA Fin Ctrl

> Base: [./README.md](./README.md)  
> Artefato raiz da trilha de requisitos, arquitetura e governança do projeto **WA Fin Ctrl**. Todas as referências utilizam a árvore `proj/`.

Bem-vindo ao acervo oficial de requisitos do **WA Fin Ctrl**. Esta pasta consolida a visão estratégica, arquitetura técnica, design, planejamento, implementação, testes, implantação, governança e diretrizes de experiência do ecossistema que combina:

- **Pilar local (Python/FastAPI):** pipeline de processamento de comprovantes recebidos por ferramentas de mensagens, OCR híbrido (Tesseract + LLM) e geração de relatórios HTML/CSV auditáveis.
- **Pilar cloud (TypeScript/NestJS/React):** serviços e interfaces responsáveis por sincronizar dados, oferecer revisão colaborativa e expor APIs para terceiros (em evolução a partir da base herdada do projeto Yagnostic).
- **Automação assistida por IA:** agentes descritos em `AGENTS.md` para classificação, extração de valores, revisão de inconsistências e auditoria contínua.

Cada documento `*-spec.md` descreve o estado atual e o futuro próximo do produto. Os arquivos pares (`.md`) mantêm o template reutilizável. Quaisquer alterações devem ser rastreadas por changelog específico em `CHANGELOG/` e, quando houver planos/autoria, vinculadas aos artefatos correspondentes em `docs/plans/` e `proj/audit-history*.md`.

---

## Estrutura das Fases RUP

| Fase | Diretório | Papel no WA Fin Ctrl |
| --- | --- | --- |
| 00 – Visão | [./00-visao/](./00-visao/) | Propósito, escopo, personas (prestadores, curadores de contas, auditores) e compromissos legais (LGPD, normas do MPDFT). |
| 01 – Arquitetura | [./01-arquitetura/](./01-arquitetura/) | Macrovisão das camadas local/cloud, pipelines de dados, integrações com OpenAI, storage e provedores de notificações. |
| 02 – Design | [./02-design/](./02-design/) | Modelagem de componentes (CLI, API, UI), fluxos de processamento, revisão e publicação de relatórios. |
| 02 – Planejamento | [./02-planejamento/](./02-planejamento/) | Catálogo de requisitos (funcionais e RNFs), roadmap, cronograma, WBS, matriz de riscos e governança. |
| 03 – Implementação | [./03-implementacao/](./03-implementacao/) | Estrutura de diretórios, padrões de código, automações (Make, Docker, pipelines CI/CD) e práticas de qualidade. |
| 03 – Agentes IA | [./03-agentes-ia/](./03-agentes-ia/) | Regras para uso de LLMs, prompts autorizados, logging de execuções e salvaguardas. |
| 04 – Testes e Validação | [./04-testes-e-validacao/](./04-testes-e-validacao/) | Estratégias de QA, critérios de aceite, testes e2e (CLI + API + UI) e validação de marcos funcionais. |
| 04 – Qualidade & Métricas | [./04-qualidade-testes/](./04-qualidade-testes/) | Indicadores operacionais, planos de amostragem, testes exploratórios e monitoramento de regressões. |
| 05 – Entrega & Implantação | [./05-entrega-e-implantacao/](./05-entrega-e-implantacao/) | Ambientes locais/cloud, empacotamento (Docker/Poetry/nx), versionamento e operações contínuas. |
| 05 – Operação & Release (Histórico) | [./05-operacao-release/](./05-operacao-release/) | Legado e lições aprendidas de ciclos anteriores, mantidos para consulta comparativa. |
| 06 – Governança & CQ | [./06-governanca-tecnica-e-controle-de-qualidade/](./06-governanca-tecnica-e-controle-de-qualidade/) | Auditorias, papéis, checklists obrigatórios, políticas de rastreabilidade e revisão por IA. |
| 06 – UX & Brand | [./06-ux-brand/](./06-ux-brand/) | Diretrizes de experiência para dashboards web, relatórios HTML e interação CLI. |
| 07 – Contribuição | [./07-contribuicao/](./07-contribuicao/) | Processos de onboarding técnico, padrões de commit/PR e governança colaborativa. |
| 99 – Anexos | [./99-anexos/](./99-anexos/) | Glossário, referências externas (MPDFT, CNJ, órgãos de controle) e anexos complementares. |

---

## Convenções gerais

- **Rastreabilidade total:** qualquer requisito (`REQ-###`, `RNF-###`, `RL-###`) deve apontar para arquitetura, design, testes, operação e governança correspondentes. Use anchors consistentes entre arquivos.
- **Pares base/spec sincronizados:** sempre que um `*-spec.md` for alterado, atualize o arquivo base e registre a mudança em `CHANGELOG/`.
- **Cabeçalho obrigatório:** todos os arquivos Markdown iniciam com `<!-- caminho/relativo.md -->`, conforme política de `AGENTS.md`.
- **Planos & auditorias:** planos táticos ficam em `docs/plans/` com par `-audit` obrigatório. Referencie-os nas seções pertinentes.
- **Agentes de IA:** siga `proj/03-agentes-ia/` e `AGENTS.md` antes de usar LLMs, incluindo captura de `run_id` e guarda de prompts em `docs/reports/`.

---

## Navegação rápida

- [Visão do produto](00-visao/visao-do-produto-spec.md)
- [Arquitetura local x cloud](01-arquitetura/arquitetura-da-extensao-spec.md)
- [Catálogo de requisitos](02-planejamento/requisitos-spec.md)
- [Fluxos operacionais](02-design/fluxos-spec.md)
- [Estrutura de implementação](03-implementacao/estrutura-de-projeto-spec.md)
- [Critérios de aceitação](04-testes-e-validacao/criterios-de-aceitacao-spec.md)
- [Ambientes e configurações](05-entrega-e-implantacao/ambientes-e-configuracoes-spec.md)
- [Governança técnica](06-governanca-tecnica-e-controle-de-qualidade/governanca-tecnica-spec.md)
- [Diretrizes de UX](06-ux-brand/diretrizes-de-ux-spec.md)
- [Glossário](99-anexos/glossario-spec.md)

---

## Atualização contínua

1. **Planejar:** descreva a mudança em um plano (`docs/plans/`), selecione checklists em `docs/checklists/` e abra tarefa correspondente.
2. **Executar:** aplique ajustes no código/documentação sob as regras de `AGENTS.md` e dos artefatos da fase RUP.
3. **Evidenciar:** crie changelog (`CHANGELOG/YYYYMMDDHHMMSS.md`), atualize `proj/audit-history*.md` e relacione relatórios gerados.
4. **Validar:** siga os critérios de `04-testes-e-validacao/` e registre resultados na seção apropriada.
5. **Governar:** mantenha rastreabilidade completa entre requisito → implementação → teste → auditoria.

---

**Responsável atual:** indicado em `proj/06-governanca-tecnica-e-controle-de-qualidade/governanca-tecnica-spec.md`.  
**Última revisão:** atualize esta linha ao concluir o ciclo correspondente no changelog.

[Voltar ao topo](#documentação-rup-—-wa-fin-ctrl)
