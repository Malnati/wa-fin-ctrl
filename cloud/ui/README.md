<!-- cloud/ui/README.md -->

# WA Fin Ctrl — Interface de Relatórios

Aplicação React + Vite responsável por consumir o endpoint `/api/reports` e exibir os relatórios HTML produzidos pelo pipeline local do WA Fin Ctrl. A interface substitui o front-end herdado do Yagnostic e oferece listagem, metadados e visualização integrada dos relatórios financeiros.

## Pré-requisitos

- Node.js 20.x
- npm 10.x
- Variáveis de ambiente definidas no `.env` (veja abaixo)

Execute `npm install` na primeira utilização para sincronizar as dependências.

## Variáveis de ambiente obrigatórias

| Variável | Descrição |
| --- | --- |
| `VITE_API_URL` | URL base do `cloud/api` que expõe `/api/reports` e `/reports/*`. |
| `VITE_DEV_SERVER_PORT` | Porta utilizada pelo Vite em modo desenvolvimento e preview. |
| `VITE_PREVIEW_ALLOWED_HOSTS` | (Opcional) Hosts adicionais autorizados para `vite preview`, separados por vírgula. |

Para desenvolvimento local, crie um arquivo `.env` na raiz de `cloud/ui/` com os valores correspondentes ou utilize o `.env` provido pela cadeia `.env → docker-compose.yml → serviço` descrita em `proj/03-implementacao/estrutura-de-projeto-spec.md`.

## Scripts disponíveis

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento do Vite (HMR) usando as variáveis de ambiente configuradas. |
| `npm run build` | Executa `tsc -b` em modo strict e gera o bundle otimizado em `dist/`. |
| `npm run lint` | Verifica o código com ESLint seguindo `eslint.config.js`. |
| `npm run test` | Executa a suíte de testes com Vitest em ambiente `jsdom`. |
| `npm run test:watch` | Roda os testes em modo observação (Vitest). |
| `npm run preview` | Reconstrói o projeto e inicia `vite preview --host` para validar o artefato de produção. |

## Fluxo sugerido

1. Configure as variáveis obrigatórias (`VITE_API_URL`, `VITE_DEV_SERVER_PORT`) antes de iniciar o servidor de desenvolvimento.
2. Utilize `npm run dev` para iteração rápida; o painel mostrará os relatórios disponíveis assim que o endpoint `/api/reports` responder.
3. Antes de publicar, execute `npm run lint`, `npm run test` e `npm run build`.
4. Distribua o conteúdo de `dist/` em um ambiente estático (NGINX, CDN ou infraestrutura do projeto).

## Makefile

O `Makefile` na raiz do projeto espelha os scripts npm e permite integração com pipelines CI/CD. Execute `make help` para consultar os alvos disponíveis.

## Funcionalidades principais

- Listagem dinâmica de relatórios obtidos em `/api/reports`.
- Visualização inline via `<iframe>` preservando o CSS/JS gerado no pipeline local.
- Metadados por relatório (tamanho, período, última atualização, tipo e indicador de edição).
- Contadores agregados (total, gerais, mensais, editáveis) e ação de atualização manual.
- Tratamento de estados de carregamento, falhas e ausência de dados com mensagens auditáveis.

Consulte `proj/02-design/componentes-spec.md` para detalhes do desenho de componentes e `proj/01-arquitetura/integracoes-com-apis-spec.md` para o contrato do endpoint.
