import pandas as pd
import sys

def txt_to_csv(input_file, output_file):
    # Lê cada linha completa do arquivo de chat
    with open(input_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    df = pd.DataFrame(lines, columns=['raw'])

    # Extrai data, hora, remetente e mensagem
    pattern = r'^\[([\d]{2}/[\d]{2}/\d{4}), (\d{2}:\d{2}:\d{2})\] ([^:]+): (.*)$'
    df[['data', 'hora', 'remetente', 'mensagem']] = df['raw'].str.extract(pattern)
    
    # Extrai o nome do arquivo de anexo, se houver
    df['anexo'] = df['mensagem'].str.extract(r'<anexado:\s*([^>]+)>', expand=False).str.strip()
    df['anexo'] = df['anexo'].fillna('')
    
    # Remove a coluna bruta e salva o CSV
    df.drop(columns=['raw'], inplace=True)
    df.to_csv(output_file, index=False)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Uso: python txt2csv.py <arquivo_entrada.txt> <arquivo_saida.csv>")
        sys.exit(1)
    txt_to_csv(sys.argv[1], sys.argv[2])

