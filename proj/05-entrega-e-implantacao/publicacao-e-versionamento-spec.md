<!-- proj/05-entrega-e-implantacao/publicacao-e-versionamento-spec.md -->
# Publicação e Versionamento — WA Fin Ctrl

> Base: [./publicacao-e-versionamento.md](./publicacao-e-versionamento.md)

## Versionamento
- Semantic versioning (`MAJOR.MINOR.PATCH`) para releases cloud.
- Cada release deve ter changelog dedicado (`CHANGELOG/YYYYMMDDHHMMSS.md`).
- Tag Git com o número da versão e link para o changelog.

## Publicação local
- Distribuição dos relatórios e CLI via pacote Docker/Poetry.
- Atualizações comunicadas aos curadores com instruções de migração.

## Publicação cloud
- Deploy via pipeline CI/CD (GitHub Actions/Outro) com etapas: build -> testes -> scan -> deploy.
- Rollback documentado; preferir deployments blue/green.

## Documentação
- Atualizar `proj/05-operacao-release/versao-e-changelog-spec.md` (legado) como referência histórica.
- Comunicar alterações em canais oficiais (e-mail/Slack) e registrar em `proj/06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade-spec.md`.

[Voltar à entrega](README-spec.md)
