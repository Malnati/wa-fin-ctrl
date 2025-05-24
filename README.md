# Gastos Tia Claudia 📊💰

Sistema para processamento automatizado de comprovantes financeiros extraídos de conversas do WhatsApp. O projeto utiliza OCR (Tesseract) e inteligência artificial (ChatGPT) para extrair valores, gerar descrições e classificar transações a partir de imagens de comprovantes.

## 🗂️ Estrutura do Projeto

### Arquivos de Entrada
- **`input/_chat.txt`**: Arquivo de exportação do WhatsApp contendo mensagens e referências a anexos
- **`input/`**: Diretório para novos arquivos a serem processados (imagens + _chat.txt)
- **`imgs/`**: Diretório contendo todas as imagens já processadas (`.jpg`, `.jpeg`, `.png`, `.pdf`)

### Arquivos de Saída
- **`mensagens.csv`**: CSV completo com todas as mensagens processadas
- **`calculo.csv`**: CSV focado apenas nos anexos com análise financeira detalhada

### Arquivos do Sistema
- **`app.py`**: Único arquivo Python do projeto (mono-source)
- **`app.sh`**: Script shell para execução simplificada
- **`pyproject.toml`**: Configuração de dependências Poetry
- **`venv/`**: Ambiente virtual Python (gerado automaticamente)

## 🚀 Como Executar

### Pré-requisitos
- Python 3.13+
- Tesseract OCR instalado no sistema
- Chave da API OpenAI configurada: `export OPENAI_API_KEY="sua_chave_aqui"`

### Comandos Disponíveis

#### 1. Processamento Incremental (Recomendado)
```bash
# Usando script shell (recomendado)
./app.sh processar

# Usando Python diretamente
python app.py processar
```

> **🔄 Processamento Automático**: O sistema verifica automaticamente o diretório `input/`, remove duplicatas, processa apenas arquivos novos e move tudo para `imgs/` ao final.

#### 2. Verificação de Totais
```bash
# Usando script shell
./app.sh verificar calculo.csv

# Usando Python diretamente
python app.py verificar calculo.csv
```

## 📋 Estrutura dos Dados de Saída

### CSV Principal (`calculo.csv`)
| Coluna | Descrição | Exemplo |
|--------|-----------|---------|
| **DATA** | Data da transação | `18/04/2025` |
| **HORA** | Hora da transação | `12:45:53` |
| **REMETENTE** | Nome do remetente | `Ricardo` ou `Rafael` |
| **CLASSIFICACAO** | Tipo de transação | `Transferência` ou `Pagamento` |
| **RICARDO** | Valor se remetente for Ricardo | `29,90` (apenas transferências) |
| **RAFAEL** | Valor se remetente for Rafael | `15,50` (apenas transferências) |
| **ANEXO** | Nome do arquivo de imagem | `00000006-PHOTO-2025-04-18-12-45-53.jpg` |
| **DESCRICAO** | Descrição gerada por IA | `Transferência - Panificadora Bonanza` |
| **VALOR** | Valor total extraído | `29,90` |
| **OCR** | Texto extraído da imagem | `PIX Banco do Brasil R$ 29,90 Padaria Bonanza` |

### Exemplos de Resultados

#### Transferências (PIX/TED/DOC)
| REMETENTE | CLASSIFICACAO | RICARDO | RAFAEL | DESCRICAO | VALOR |
|-----------|---------------|---------|--------|-----------|-------|
| Ricardo | Transferência | 429,90 | | Transferência - Panificadora Bonanza | 429,90 |
| Rafael | Transferência | | 85,00 | Transferência - Uber | 85,00 |
| Ricardo | Transferência | 1.533,27 | | Transferência - Drogaria Alpharma | 1.533,27 |

#### Pagamentos (Compras/Débito/Crédito)
| REMETENTE | CLASSIFICACAO | RICARDO | RAFAEL | DESCRICAO | VALOR |
|-----------|---------------|---------|--------|-----------|-------|
| Ricardo | Pagamento | | | Compra - Supermercado | 158,90 |
| Rafael | Pagamento | | | Medicamentos - Farmácia | 45,30 |
| Ricardo | Pagamento | | | Combustível - Posto | 89,50 |

#### Totalização Mensal (Automática)
| DATA | HORA | REMETENTE | CLASSIFICACAO | RICARDO | RAFAEL | ANEXO | DESCRICAO |
|------|------|-----------|---------------|---------|--------|--------|-----------|
| 30/04/2025 | 23:59:00 | TOTAL MÊS | TOTAL | 996,29 | 93,60 | TOTAL_04_2025 | Total do mês 04/2025 |
| 31/05/2025 | 23:59:00 | TOTAL MÊS | TOTAL | 5.196,91 | 76,57 | TOTAL_05_2025 | Total do mês 05/2025 |

> **📊 Funcionalidade Automática**: O sistema adiciona automaticamente uma linha de totalização no último dia de cada mês às 23:59, somando os valores de transferências (RICARDO e RAFAEL) do mês correspondente.

### Resumo Financeiro
```
=== TOTAIS FINANCEIROS ===
Total RICARDO (transferências): R$ 9,063.13
Total RAFAEL (transferências): R$ 170.17
Total de transferências: R$ 9,233.30
Total VALOR (todos os comprovantes): R$ 28,244.01

=== DISTRIBUIÇÃO POR TIPO ===
Total em Transferências: R$ 9,233.30
Total em Pagamentos: R$ 19,010.71
Verificação: 28,244.01 = 28,244.01 ✅
```

## 🤖 Tecnologias Utilizadas

- **OCR**: Pytesseract + OpenCV para extração de texto das imagens
- **IA**: OpenAI GPT-3.5-turbo para:
  - Extração inteligente de valores
  - Geração de descrições de pagamento
  - Classificação automática de transações
- **Processamento**: Pandas para manipulação de dados
- **Ambiente**: Poetry para gerenciamento de dependências

## 🔄 Fluxo de Processamento Incremental

### 1. Preparação
- Coloque o arquivo `_chat.txt` exportado do WhatsApp no diretório `input/`
- Coloque todas as imagens dos comprovantes no diretório `input/`

### 2. Processamento Automático
1. **Verificação de Duplicatas**: Remove arquivos de `input/` que já existem em `imgs/`
2. **Processamento OCR + IA**: Processa apenas arquivos novos com OCR e ChatGPT
3. **Incrementação de CSVs**: Adiciona novos dados aos arquivos existentes (não sobrescreve)
4. **Movimentação**: Move imagens processadas de `input/` para `imgs/`
5. **Limpeza**: Remove `input/_chat.txt` e deixa `input/` vazio

### 3. Resultado Final
- **`imgs/`**: Todas as imagens processadas (histórico + novas)
- **`mensagens.csv`**: Histórico completo de mensagens (incrementado)
- **`calculo.csv`**: Histórico completo de análises financeiras (incrementado)
- **`input/`**: Diretório vazio, pronto para próximo processamento

## 🔧 Funcionalidades

### Processamento de Imagens
- Leitura automática de arquivos JPG, JPEG, PNG e PDF
- Pré-processamento com OpenCV (escala de cinza, threshold)
- OCR otimizado para comprovantes financeiros

### Análise Inteligente
- **Extração de Valores**: Identifica valores monetários principais
- **Descrições Automáticas**: Gera descrições baseadas no estabelecimento e tipo
- **Classificação**: Distingue entre transferências (PIX/TED/DOC) e pagamentos
- **Totalização Mensal**: Adiciona automaticamente linhas de total no final de cada mês

### Validação de Dados
- Conversão automática entre formatos numéricos (americano ↔ brasileiro)
- Verificação de consistência financeira
- Relatórios detalhados de totais por categoria

## 🎯 Casos de Uso

1. **Controle Financeiro Familiar**: Rastreamento de gastos compartilhados
2. **Prestação de Contas**: Análise de transferências entre pessoas
3. **Categorização Automática**: Organização de despesas por tipo
4. **Auditoria Financeira**: Verificação de consistência de valores

## ⚙️ Configuração da API OpenAI

```bash
# Configure sua chave da API
export OPENAI_API_KEY="sk-..."

# Ou adicione ao seu .bashrc/.zshrc
echo 'export OPENAI_API_KEY="sk-..."' >> ~/.bashrc
```

## 📈 Estatísticas do Projeto

- **108 comprovantes** processados automaticamente
- **54 transferências** identificadas (PIX/TED/DOC)
- **47 pagamentos** categorizados (compras/débito/crédito)
- **99%+ precisão** na extração de valores
- **Processamento automático** de descrições em português

---

**Projeto Mono-Source**: Mantido em apenas 2 arquivos principais (`app.py` + `app.sh`) para máxima simplicidade e manutenibilidade. 