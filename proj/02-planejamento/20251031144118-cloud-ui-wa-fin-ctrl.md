<!-- proj/02-planejamento/20251031144118-cloud-ui-wa-fin-ctrl.md -->
# Plano 2025-10-31 14:41:18 UTC — Alinhamento do `cloud/ui` ao WA Fin Ctrl

## 1. Lista de arquivos existentes relevantes para o escopo
- `local/templates/index.html.j2` — referência do fluxo de listagem de relatórios.
- `local/src/wa_fin_ctrl/api.py` — contrato atual de `/api/reports` e entrega dos HTML.
- `local/static/scripts.js` e `local/static/styles.css` — comportamento esperado dentro dos relatórios.
- `cloud/ui/src/App.tsx`, `App.css`, `index.ts`, `index.css` — shell atual copiado do Yagnostic.
- `cloud/ui/src/constants/constants.ts` e `cloud/ui/src/constants/api.ts` — configuração de `API_BASE_URL`.
- Documentos arquiteto e requisitos: `proj/01-arquitetura/arquitetura-da-extensao-spec.md`, `proj/01-arquitetura/integracoes-com-apis-spec.md`, `proj/02-design/componentes-spec.md`, `proj/04-testes-e-validacao/criterios-de-aceitacao-spec.md`.

## 2. Lista de arquivos que serão alterados
- `cloud/ui/src` — substituição de `App.tsx`, `App.css`, `index.ts`, `index.css`, `main.tsx`.
- Criação de novos módulos focados em relatórios: `src/components/reports/*.tsx`, `src/hooks/useReports.ts`, `src/types/report.ts`, `src/constants/report.ts`.
- Exclusão de módulos Yagnostic não utilizados (`Upload*`, `Login*`, `Admin*`, `components/**`, `shared/**`, `styles/**`, `utils/**`, `assets/**`, testes legados).
- `cloud/ui/package.json` e eventuais configs correlatas para atualizar dependências/rotinas de teste.
- Atualizações em `proj/01-arquitetura/integracoes-com-apis-spec.md`, `proj/02-design/componentes-spec.md`, `proj/03-implementacao/estrutura-de-projeto-spec.md`, `proj/04-testes-e-validacao/criterios-de-aceitacao-spec.md` para refletir a nova experiência.
- Criação do changelog obrigatório em `CHANGELOG/20251031144118.md`.
- Criação do plano de auditoria espelho em `proj/02-planejamento/20251031144118-cloud-ui-wa-fin-ctrl-audit.md`.

## 3. Requisitos da mudança + requisitos globais aplicáveis
- RF-006/007 (relatórios com totais corretos e anexos) — manter consistência visual ao consumir HTML existente.
- RF-013 (listar relatórios via `/api/reports`) — implementar cliente React.
- RNF-004 (acessibilidade) — preservar estrutura responsiva/teclável.
- Políticas de `AGENTS.md` (cabeçalhos de caminho, sem scripts `.sh` novos, constantes no topo, sem hardcode em funções).
- Política de changelog obrigatório (`CHANGELOG/`).
- Princípio DRY e remoção de código morto.

## 4. Requisitos atualmente não atendidos que o plano resolve
- Ausência de UI no `cloud/ui` compatível com relatórios do WA Fin Ctrl.
- Falta de consumo do endpoint `/api/reports` pela camada TypeScript.
- Documentação RUP desatualizada sobre o papel do `cloud/ui`.
- Critério RF-013 marcado como planejado sem implementação.

## 5. Regras da mudança + regras globais
- Restringir alterações a `cloud/ui/**`, `proj/**` e `CHANGELOG/`.
- Todo valor literal usado na lógica deve virar constante em maiúsculo no topo do arquivo.
- Remover módulos e dependências não utilizados após a migração (limpeza de código morto).
- Atualizar documentação na fase correspondente do RUP (`proj/01`, `proj/02`, `proj/03`, `proj/04`).
- Respeitar convenções Vite/TypeScript (`strict`, imports no topo, sem scripts shell).
- Manter cadeia `.env → docker-compose → código` ao utilizar `VITE_API_URL`.

## 6. Regras atualmente não atendidas que motivam os ajustes
- `cloud/ui` viola DRY e responsabilidade atual por manter artefatos legados (app Yagnostic) não descritos no RUP.
- Falta de cabeçalhos de caminho em arquivos React críticos.
- Dependências (`dompurify`, `marked`, IndexedDB helpers) sem uso previsto para relatórios.
- Critérios RF-013/RNF-004 sem cobertura pela UI cloud.

## 7. Plano de auditoria (verificações previstas)
- Revisar build `npm run build` para validar compilação Vite.
- Executar `npm run test` (Vitest) cobrindo `ReportList`/`ReportViewer` com mocks do endpoint.
- Inspecionar manualmente a renderização da lista e do iframe apontando para URLs de relatório (mock/local).
- Validar que `API_BASE_URL` continua proveniente de `VITE_API_URL` via variáveis.
- Conferir ausência de imports não utilizados com `npm run lint`.
- Verificar que arquivos removidos não são referenciados em `tsconfig` ou docs restantes.

## 8. Checklists aplicáveis
- `docs/checklists/` não disponível no repositório atual; registrar no changelog a ausência de checklist formal e seguir boas práticas descritas em `AGENTS.md`.

> **Escopo restritivo:** somente arquivos TypeScript/TSX/CSS dentro de `cloud/ui`, documentação RUP em `proj/01`, `proj/02`, `proj/03`, `proj/04`, e o changelog serão modificados. Nenhuma alteração estrutural fora desses diretórios será executada.
