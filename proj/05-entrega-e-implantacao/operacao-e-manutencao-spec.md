<!-- proj/05-entrega-e-implantacao/operacao-e-manutencao-spec.md -->
# Operação e Manutenção — WA Fin Ctrl

> Base: [./operacao-e-manutencao.md](./operacao-e-manutencao.md)

## Rotinas
- **Diário:** executar `wa-fin.py processar`, revisar pendências, verificar alertas de IA.
- **Semanal:** backup dos diretórios críticos, revisão de logs, atualização de changelog se houver mudanças.
- **Mensal:** reunião com MPDFT, atualização de métricas, rotação de senhas temporárias.
- **Trimestral:** revisão de LGPD, rotação de chaves IA, auditoria interna.

## Monitoramento
- Coletar métricas de processamento (tempo, falhas) e IA (custo, acurácia).
- Configurar alertas para falhas de execução consecutivas ou custos elevados.

## Manutenção preventiva
- Atualizar dependências Python/TypeScript seguindo política semestral.
- Revisar integridade dos relatórios antigos e remover dados expirados conforme retenção.
- Validar storage de backups (testes de restauração).

[Voltar à entrega](README-spec.md)
