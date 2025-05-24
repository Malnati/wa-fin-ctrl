import pandas as pd

df = pd.read_csv('novo_teste.csv')

def convert_to_float(value):
    if pd.isna(value) or value == '':
        return 0.0
    try:
        return float(str(value).replace(',', '.'))
    except:
        return 0.0

ricardo_total = df['RICARDO'].apply(convert_to_float).sum()
rafael_total = df['RAFAEL'].apply(convert_to_float).sum()
valor_total = df['VALOR'].apply(convert_to_float).sum()

print('=== TOTAIS FINANCEIROS ===')
print(f'Total RICARDO (transferências): R$ {ricardo_total:.2f}')
print(f'Total RAFAEL (transferências): R$ {rafael_total:.2f}')
print(f'Total de transferências: R$ {(ricardo_total + rafael_total):.2f}')
print(f'Total VALOR (todos os comprovantes): R$ {valor_total:.2f}')
print()

print('=== DISTRIBUIÇÃO POR TIPO ===')
transferencias = df[df['CLASSIFICACAO'] == 'Transferência']
pagamentos = df[df['CLASSIFICACAO'] == 'Pagamento']

transferencia_total = transferencias['VALOR'].apply(convert_to_float).sum()
pagamento_total = pagamentos['VALOR'].apply(convert_to_float).sum()

print(f'Total em Transferências: R$ {transferencia_total:.2f}')
print(f'Total em Pagamentos: R$ {pagamento_total:.2f}')
print(f'Verificação: {transferencia_total + pagamento_total:.2f} = {valor_total:.2f}') 