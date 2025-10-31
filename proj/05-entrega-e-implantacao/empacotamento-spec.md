<!-- proj/05-entrega-e-implantacao/empacotamento-spec.md -->
# Empacotamento — WA Fin Ctrl

> Base: [./empacotamento.md](./empacotamento.md)

## Pipeline local
- Imagens Docker baseadas em Python 3.11 com Tesseract/Poppler instalados.
- Volume para diretórios de dados (`docs/`, `mensagens/`, `ocr/`, `imgs/`).
- Build executado via `docker build -t wa-fin-ctrl-app`.
- Distribuição interna por registry privado ou export `docker save`.

## Plataforma cloud
- Build multi-stage (NestJS) produz `dist/` e copia para imagem Node slim.
- UI compilada com `npm run build` e servida por NGINX ou container estático.
- Compose com serviços `api`, `ui`, `nginx` e `worker` (futuro).

## Pacotes para auditoria
- `.zip` com relatórios HTML, CSV, histórico, changelog e evidências de IA.
- Assinatura digital (planejada) para validar integridade.

## Checklists de empacotamento
1. Rodar `make clean` para remover artefatos temporários.  
2. Garantir `.env` com valores corretos e sem segredos vazados.  
3. Executar testes antes de build.  
4. Atualizar versão no changelog e no arquivo de versionamento.

[Voltar à entrega](README-spec.md)
