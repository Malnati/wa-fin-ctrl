# check.py
# Caminho relativo ao projeto: check.py
# Módulo de validação de conformidade OCR para relatórios HTML
import sys
import pandas as pd

def main():
    """Valida se todas as linhas do CSV têm OCR associado."""
    arquivo_csv = sys.argv[1]
    
    try:
        df = pd.read_csv(arquivo_csv, dtype=str)
        
        # Verifica se a coluna OCR existe
        if 'OCR' not in df.columns:
            print("❌ Erro: coluna 'OCR' não encontrada no arquivo CSV")
            sys.exit(1)
        
        # Filtra linhas sem OCR (vazias ou NaN)
        faltantes = df[df['OCR'].isna() | (df['OCR'] == '') | (df['OCR'] == 'nan')]
        
        if not faltantes.empty:
            print("❌ Falha: as seguintes linhas não têm OCR associado:")
            print(faltantes[['DATA', 'HORA', 'ANEXO']].to_string(index=False))
            print(f"\nTotal de linhas sem OCR: {len(faltantes)}")
            sys.exit(1)
        
        print("✅ OK: todas as linhas têm OCR.")
        print(f"Total de linhas validadas: {len(df)}")
        
    except FileNotFoundError:
        print(f"❌ Erro: arquivo {arquivo_csv} não encontrado")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Erro ao processar arquivo: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Uso: python check.py <arquivo_calculo.csv>")
        sys.exit(1)
    main() 