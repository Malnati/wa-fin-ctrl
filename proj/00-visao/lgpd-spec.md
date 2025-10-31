<!-- proj/00-visao/lgpd-spec.md -->
# LGPD e Compliance — WA Fin Ctrl

> Base: [./lgpd.md](./lgpd.md)

## Base legal
- **Execução de políticas públicas** (Art. 7º, III) para relatórios exigidos pelo MPDFT.
- **Legítimo interesse** (Art. 7º, IX) do responsável legal pela prestação de contas.
- **Consentimento** (Art. 7º, I) quando o processamento utilizar serviços externos (ex.: OpenAI) ou sincronização cloud.

## Agentes de tratamento
- **Controladora:** Equipe de curadoria WA (representante legal da prestação de contas).
- **Operadores:** Times técnicos local (Python) e cloud (TypeScript), além de provedores de IA/infra (OpenAI, provedores de e-mail). Contratos e SLAs devem garantir tratamento segundo LGPD.
- **Encarregado (DPO):** designado em `proj/06-governanca-tecnica-e-controle-de-qualidade/governanca-tecnica-spec.md`.

## Dados pessoais tratados
| Categoria | Exemplos | Finalidade | Retenção |
| --- | --- | --- | --- |
| Identificadores de comunicação | Nomes de contatos, número de telefone ou alias do WhatsApp | Contextualizar comprovantes e resolver divergências | 5 anos, salvo exigência judicial superior |
| Dados financeiros sensíveis | Valores transacionados, datas, descrições de despesas | Prestação de contas e auditoria | Conforme plano de retenção (`proj/06-governanca-tecnica-e-controle-de-qualidade/auditoria-e-rastreabilidade-spec.md`) |
| Metadados técnicos | Logs de execução (`history.json`), IDs de prompts IA, hashes de arquivos | Garantir rastreabilidade, reproducibilidade e auditoria | 5 anos |
| Evidências anexadas | PDFs, imagens de comprovantes, relatórios HTML/CSV | Evidenciar despesas e gerar relatórios oficiais | 5 anos ou até aprovação definitiva do MPDFT |

## Tratamento e armazenamento
- Por padrão, todos os dados permanecem **localmente** no ambiente do curador (`local/`), com diretórios segregados (`input/`, `imgs/`, `ocr/`, `docs/`).
- A sincronização com cloud exige termo de consentimento assinado e plano de retenção aprovado.
- Backups são executados localmente ou em repositórios criptografados (guideline em `proj/05-entrega-e-implantacao/operacao-e-manutencao-spec.md`).
- Quando o pipeline usa serviços externos (OCR alternativo, LLM), os dados enviados são minimizados (`texto extraído` ou `trechos anonimizados`).

## Direitos dos titulares
- **Transparência:** relatórios incluem trilha de processamento, origem dos dados e momento da última revisão.
- **Correção/eliminação:** comandos CLI (`wa-fin.py fix`, `dismiss`) e portal cloud permitirão retificar ou excluir registros conforme solicitação.
- **Revogação de consentimento:** disponível nos módulos cloud e documentada na matriz de governança; execução implica eliminação dos dados sincronizados e bloqueio de novos envios.

## Segurança e controles
- Diretórios sensíveis versionados apenas localmente (não podem ser commitados).
- Hashes SHA256 registrados para arquivos críticos; checagens documentadas em `proj/04-testes-e-validacao/validacao-de-marcos-spec.md`.
- Autenticação forte (JWT + 2FA planejado) para acesso cloud. API local exposta somente em redes confiáveis.
- Logs sensíveis sanitizados antes de análise; comandos de IA armazenam apenas prompts estritamente necessários.

## Revisões e auditoria
- Revisão trimestral deste documento ou sempre que houver mudança relevante no fluxo de dados.
- Evidências de revisão registradas no changelog e em `proj/audit-history-spec.md`.
- Incidentes de segurança devem seguir o plano descrito em `proj/06-governanca-tecnica-e-controle-de-qualidade/controle-de-qualidade-spec.md`.

[Voltar ao resumo da fase](README-spec.md)
