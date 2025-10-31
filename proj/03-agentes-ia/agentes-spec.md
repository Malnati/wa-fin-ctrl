<!-- proj/03-agentes-ia/agentes-spec.md -->
# Agentes Catalogados — WA Fin Ctrl

> Base: [./agentes.md](./agentes.md)

| Agente | Linguagem | Responsabilidade | Entradas | Saídas | Observações |
| --- | --- | --- | --- | --- | --- |
| `ocr_value_checker` | Python | Solicitar ao OpenAI extração/validação de valores quando OCR tradicional falha. | Texto OCR, contexto (remetente, banco). | Valor normalizado, nível de confiança. | Usa modelo GPT-3.5/4; registrar prompts. |
| `duplication_detector` | Python | Sugerir duplicidades baseado em data, valor e remetente. | CSV parcial. | Lista de possíveis duplicatas. | Habilitado após `RF-005`. |
| `cloud_review_assistant` | TypeScript | Gerar resumos de pendências para dashboards cloud. | Lista de comprovantes pendentes. | Texto resumido/insights. | Em planejamento Q3 2025. |

Cada agente deve ter execução rastreada, com logs armazenados em `docs/reports/` e citações no changelog.

[Voltar aos agentes](README-spec.md)
