<!-- ui/README.md -->

# Interface web do Yagnostic

Esta aplicação React + Vite oferece a interface de usuário do projeto Yagnostic. Após a remoção das integrações com Cloudflare/Wrangler, o fluxo de desenvolvimento e publicação tornou-se totalmente neutro em relação a provedores.

## Pré-requisitos

- Node.js 20.x
- npm 10.x

Execute `npm install` na primeira utilização para baixar as dependências.

## Scripts disponíveis

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento do Vite em `http://localhost:5173` utilizando Hot Module Replacement. |
| `npm run build` | Executa a verificação de tipos incremental (`tsc -b`) e gera a versão otimizada em `dist/`. |
| `npm run lint` | Executa o ESLint seguindo as regras definidas em `eslint.config.js`. |
| `npm run preview` | Reconstrói o projeto e inicia o servidor de pré-visualização (`vite preview --host`) para validar os artefatos gerados em `dist/`. |

## Fluxo de trabalho sugerido

1. Rode `npm run dev` durante o desenvolvimento para obter recarregamento rápido.
2. Antes de publicar, execute `npm run build` e `npm run preview` para garantir que o bundle de produção está consistente.
3. Publique o conteúdo do diretório `dist/` no provedor de hospedagem estática de sua preferência (por exemplo, Amazon S3, GitHub Pages, Netlify ou infraestrutura própria).

## Makefile

O `Makefile` na raiz do projeto espelha os scripts npm e facilita a automação em pipelines CI/CD. Consulte `make help` para ver a lista de comandos disponíveis.

## Compatibilidade com ambientes HTTP

- O plano dedicado à remoção de dependências de HTTPS ([../docs/plans/20241017131500-remove-https-dependency.md](../docs/plans/20241017131500-remove-https-dependency.md)) garante que a interface funcione integralmente servida por `http://`.
- A auditoria correspondente ([../docs/plans/20241017131500-remove-https-dependency-audit.md](../docs/plans/20241017131500-remove-https-dependency-audit.md)) confirma o funcionamento dos cookies de sessão e das validações de URL em ambientes sem TLS.
- O helper de login (`src/LoginHelper.ts`) aplica o atributo `secure` apenas quando a página é carregada com protocolo HTTPS, preservando compatibilidade futura ao reativar TLS.
