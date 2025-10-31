<!-- proj/03-agentes-ia/pipeline-ia-spec.md -->
# Pipeline IA — WA Fin Ctrl

> Base: [./pipeline-ia.md](./pipeline-ia.md)

## Etapas
1. **Identificação de necessidade** — módulo `app.py` identifica comprovante com valor ausente ou texto ilegível e aciona IA.
2. **Preparação do prompt** — coletar dados mínimos (texto OCR, remetente, data) e aplicar template padronizado.
3. **Execução** — chamar API do OpenAI usando chave configurada; aplicar limites de retry e timeouts.
4. **Pós-processamento** — sanitizar resposta (regex, conversão para formato brasileiro), validar contra regras de negócio.
5. **Registro** — gravar entrada/saída/custo/tempo em `docs/reports/ia-run-*.json` e `CommandHistory`.
6. **Revisão humana** — marcar registro como "assistido por IA" e aguardar validação.
7. **Monitoramento** — gerar relatórios mensais de utilização e custos.

## Templates de prompt (exemplo)
```
Você é um especialista em comprovantes financeiros. Receba o texto abaixo e retorne APENAS o valor total da transação. Se não houver, responda "NENHUM".
Texto: {{texto}}
```

## Métricas
- Nº de execuções por mês.
- Taxa de acerto após revisão humana.
- Tempo médio de resposta.
- Custo acumulado.

## Governança
- Revisão mensal dos prompts com curadoria.
- Ajustes devem ser registrados no changelog.
- Caso a IA falhe repetidamente, temporariamente desabilitar (flag em `.env`).

[Voltar aos agentes](README-spec.md)
