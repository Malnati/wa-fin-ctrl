#!/usr/bin/env python3
# dev/pdf.py
"""
Script de teste para extração de texto de PDFs usando pdfplumber e pdf2image.
Testa especificamente o arquivo input/00000061-2025-05-02_110443.pdf
"""

import os
import sys
import re
import cv2
import numpy as np
import pytesseract

def test_pdf_ocr(pdf_path):
    """Testa extração de texto de um PDF usando diferentes métodos"""
    print(f"🔍 Testando extração de texto do PDF: {pdf_path}")
    
    if not os.path.exists(pdf_path):
        print(f"❌ Arquivo não encontrado: {pdf_path}")
        return False
    
    # Método 1: pdfplumber (texto pesquisável)
    print("\n📄 Método 1: pdfplumber (texto pesquisável)")
    try:
        import pdfplumber
        texto_pdf = ""
        with pdfplumber.open(pdf_path) as pdf:
            print(f"   📊 PDF tem {len(pdf.pages)} páginas")
            for i, page in enumerate(pdf.pages):
                texto_pagina = page.extract_text() or ''
                texto_pdf += texto_pagina
                print(f"   📄 Página {i+1}: {len(texto_pagina)} caracteres")
        texto_pdf = texto_pdf.strip()
        texto_pdf = re.sub(r'\n+', ' ', texto_pdf)
        texto_pdf = re.sub(r'\s+', ' ', texto_pdf)
        print(f"   ✅ Texto extraído (pdfplumber): {len(texto_pdf)} caracteres")
        if texto_pdf:
            print(f"   📝 Primeiros 200 caracteres: {texto_pdf[:200]}...")
            return texto_pdf
        else:
            print("   ⚠️  Nenhum texto extraído com pdfplumber")
    except ImportError:
        print("   ❌ pdfplumber não disponível")
    except Exception as e:
        print(f"   ❌ Erro com pdfplumber: {e}")
    
    # Método 2: pdf2image + OCR
    print("\n🖼️  Método 2: pdf2image + OCR")
    try:
        from pdf2image import convert_from_path
        imagens = convert_from_path(pdf_path)
        print(f"   📊 PDF convertido em {len(imagens)} imagens")
        texto_ocr = []
        for i, img in enumerate(imagens):
            # Converte PIL Image para array do OpenCV
            img_cv = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
            gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
            _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            texto_pagina = pytesseract.image_to_string(thresh, lang='eng')
            texto_ocr.append(texto_pagina)
            print(f"   📄 Página {i+1}: {len(texto_pagina)} caracteres")
        texto_pdf = '\n'.join(texto_ocr).strip()
        texto_pdf = re.sub(r'\n+', ' ', texto_pdf)
        texto_pdf = re.sub(r'\s+', ' ', texto_pdf)
        print(f"   ✅ Texto extraído (OCR): {len(texto_pdf)} caracteres")
        if texto_pdf:
            print(f"   📝 Primeiros 200 caracteres: {texto_pdf[:200]}...")
            return texto_pdf
        else:
            print("   ⚠️  Nenhum texto extraído com OCR")
    except ImportError:
        print("   ❌ pdf2image não disponível")
    except Exception as e:
        print(f"   ❌ Erro com pdf2image: {e}")
    
    print("\n❌ Nenhum método conseguiu extrair texto")
    return False

def main():
    """Função principal"""
    pdf_path = "input/00000061-2025-05-02_110443.pdf"
    
    print("🧪 TESTE DE EXTRAÇÃO DE TEXTO DE PDF")
    print("=" * 50)
    
    resultado = test_pdf_ocr(pdf_path)
    
    print("\n" + "=" * 50)
    if resultado:
        print("✅ SUCESSO: Texto extraído do PDF!")
        print(f"📊 Total de caracteres: {len(resultado)}")
        print("\n📝 Texto completo:")
        print("-" * 30)
        print(resultado)
        print("-" * 30)
    else:
        print("❌ FALHA: Não foi possível extrair texto do PDF")
    
    return 0 if resultado else 1

if __name__ == "__main__":
    sys.exit(main()) 