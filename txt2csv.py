import pandas as pd
import sys
import re
import os
from PIL import Image
import pytesseract
import cv2
import numpy as np

def process_image_ocr(image_path):
    """Processa uma imagem e extrai texto usando OCR"""
    try:
        if not os.path.exists(image_path):
            return "Arquivo não encontrado"
        
        # Carrega a imagem
        img = cv2.imread(image_path)
        if img is None:
            return "Erro ao carregar imagem"
        
        # Converte para escala de cinza
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Aplica threshold para melhorar o OCR
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Extrai texto usando pytesseract
        text = pytesseract.image_to_string(thresh, lang='eng')
        
        # Remove quebras de linha excessivas e espaços
        text = re.sub(r'\n+', ' ', text).strip()
        text = re.sub(r'\s+', ' ', text)
        
        return text if text else "Nenhum texto detectado"
        
    except Exception as e:
        return f"Erro no OCR: {str(e)}"

def txt_to_csv(input_file, output_file):
    """Funcionalidade original - extrai todos os dados das mensagens"""
    # Lê cada linha completa do arquivo de chat
    with open(input_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    df = pd.DataFrame(lines, columns=['raw'])

    # Padrão mais flexível para capturar linhas com caracteres invisíveis
    pattern = r'.*?\[([\d]{2}/[\d]{2}/\d{4}), (\d{2}:\d{2}:\d{2})\] ([^:]+): (.*)$'
    df[['data', 'hora', 'remetente', 'mensagem']] = df['raw'].str.extract(pattern)
    
    # Extrai o nome do arquivo de anexo, se houver
    df['anexo'] = df['mensagem'].str.extract(r'<anexado:\s*([^>]+)>', expand=False).str.strip()
    df['anexo'] = df['anexo'].fillna('')
    
    # Adiciona coluna para dados do OCR
    df['ocr_data'] = ''
    
    # Processa OCR para cada anexo que é uma imagem
    print("Processando OCR das imagens...")
    for idx, row in df.iterrows():
        if row['anexo'] and (row['anexo'].endswith('.jpg') or row['anexo'].endswith('.jpeg') or row['anexo'].endswith('.png')):
            print(f"Processando OCR: {row['anexo']}")
            ocr_result = process_image_ocr(row['anexo'])
            df.at[idx, 'ocr_data'] = ocr_result
    
    # Remove a coluna bruta e salva o CSV
    df.drop(columns=['raw'], inplace=True)
    df.to_csv(output_file, index=False)
    print(f"CSV completo salvo: {output_file}")

def txt_to_csv_anexos_only(input_file, output_file):
    """Nova funcionalidade - extrai apenas dados de anexos (DATA/HORA, remetente, anexos e OCR)"""
    # Lê cada linha completa do arquivo de chat
    with open(input_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    df = pd.DataFrame(lines, columns=['raw'])

    # Padrão mais flexível para capturar linhas com caracteres invisíveis
    pattern = r'.*?\[([\d]{2}/[\d]{2}/\d{4}), (\d{2}:\d{2}:\d{2})\] ([^:]+): (.*)$'
    df[['data', 'hora', 'remetente', 'mensagem']] = df['raw'].str.extract(pattern)
    
    # Extrai o nome do arquivo de anexo, se houver
    df['anexo'] = df['mensagem'].str.extract(r'<anexado:\s*([^>]+)>', expand=False).str.strip()
    df['anexo'] = df['anexo'].fillna('')
    
    # Filtra apenas linhas que têm anexos (remove mensagens de texto)
    df_anexos = df[df['anexo'] != ''].copy()
    
    # Remove a coluna mensagem pois não precisamos dela
    df_anexos.drop(columns=['mensagem'], inplace=True)
    
    # Adiciona coluna para dados do OCR
    df_anexos['ocr_data'] = ''
    
    # Processa OCR para cada anexo que é uma imagem
    print("Processando OCR das imagens (apenas anexos)...")
    for idx, row in df_anexos.iterrows():
        if row['anexo'] and (row['anexo'].endswith('.jpg') or row['anexo'].endswith('.jpeg') or row['anexo'].endswith('.png')):
            print(f"Processando OCR: {row['anexo']}")
            ocr_result = process_image_ocr(row['anexo'])
            df_anexos.at[idx, 'ocr_data'] = ocr_result
    
    # Remove a coluna bruta e salva o CSV
    df_anexos.drop(columns=['raw'], inplace=True)
    df_anexos.to_csv(output_file, index=False)
    print(f"CSV apenas anexos salvo: {output_file}")
    print(f"Total de anexos processados: {len(df_anexos)}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Uso: python txt2csv.py <arquivo_entrada.txt> <arquivo_saida.csv>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    # Executa a funcionalidade original (completa)
    print("=== PROCESSANDO DADOS COMPLETOS ===")
    txt_to_csv(input_file, output_file)
    
    # Executa a nova funcionalidade (apenas anexos)
    print("\n=== PROCESSANDO APENAS ANEXOS ===")
    calculo_file = "calculo.csv"
    txt_to_csv_anexos_only(input_file, calculo_file)

