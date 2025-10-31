<!-- proj/04-testes-e-validacao/testes-seguranca-e2e-spec.md -->
# Testes de Segurança E2E — WA Fin Ctrl

> Base: [./testes-seguranca-e2e.md](./testes-seguranca-e2e.md)

## Cenários
1. **Acesso não autorizado** — tentar consumir `/fix` sem autenticação (quando implantado). Deve retornar 401/403 e registrar tentativa.
2. **Exposição de dados** — inspecionar respostas HTTP e logs para garantir ausência de dados pessoais desnecessários.
3. **Rate limiting IA** — executar chamadas repetidas à IA simulando abuso e validar bloqueio pelo NGINX.
4. **Integridade de pacotes** — alterar arquivo após geração do hash e garantir que sincronização cloud rejeita pacote.
5. **Revogação de consentimento** — revogar consentimento e verificar bloqueio imediato de novas execuções com IA.

Relatórios armazenados em `docs/reports/security-e2e-YYYYMMDD.json`.

[Voltar aos testes](README-spec.md)
