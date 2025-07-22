# check.py
# Caminho relativo ao projeto: check.py
# Módulo de validação de conformidade OCR para relatórios HTML
import sys
import pandas as pd
import xml.etree.ElementTree as ET
import os


def main():
    """Valida se todas as linhas do CSV têm OCR associado."""
    arquivo_csv = sys.argv[1]

    try:
        df = pd.read_csv(arquivo_csv, dtype=str)

        # Verifica se a coluna OCR existe
        if "OCR" not in df.columns:
            print("❌ Erro: coluna 'OCR' não encontrada no arquivo CSV")
            sys.exit(1)

        # Carrega o XML de OCR para verificar se os arquivos foram processados
        xml_file = "ocr/extract.xml"
        ocr_processed = set()

        if os.path.exists(xml_file):
            tree = ET.parse(xml_file)
            root = tree.getroot()
            for entry in root.findall("entry"):
                arquivo = entry.get("arquivo")
                ocr_processed.add(arquivo)

        # Filtra linhas que não têm OCR no CSV E não foram processadas no XML
        faltantes = []

        for idx, row in df.iterrows():
            anexo = row.get("ANEXO", "")
            ocr = row.get("OCR", "")

            # Se não tem OCR no CSV E não foi processado no XML
            if (
                pd.isna(ocr) or ocr == "" or ocr == "nan"
            ) and anexo not in ocr_processed:
                faltantes.append(row)

        if faltantes:
            print("❌ Falha: as seguintes linhas não têm OCR associado:")
            for row in faltantes:
                print(f"{row['DATA']} {row['HORA']} {row['ANEXO']}")
            print(f"\nTotal de linhas sem OCR: {len(faltantes)}")
            sys.exit(1)

        # Verifica se há arquivos processados no XML mas sem texto (imagens ilegíveis)
        imagens_sem_texto = []
        if os.path.exists(xml_file):
            tree = ET.parse(xml_file)
            root = tree.getroot()
            for entry in root.findall("entry"):
                arquivo = entry.get("arquivo")
                texto = entry.text or ""
                if not texto or texto == "":
                    # Verifica se esse arquivo está no CSV
                    if arquivo in df["ANEXO"].values:
                        imagens_sem_texto.append(arquivo)

        if imagens_sem_texto:
            print(
                f"⚠️  Aviso: {len(imagens_sem_texto)} imagens foram processadas mas não têm texto legível:"
            )
            for arquivo in imagens_sem_texto:
                print(f"  {arquivo}")
            print("  (Isso é normal para imagens sem texto ou ilegíveis)")

        print("✅ OK: todas as linhas têm OCR processado.")
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
