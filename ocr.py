import os
import re
import cv2
import pytesseract
import numpy as np

def process_image_ocr(image_path):
    """Processa uma imagem e extrai texto usando OCR"""
    try:
        if os.path.exists(image_path):
            pass
        elif not image_path.startswith(('imgs/', 'input/')):
            input_path = os.path.join('input', image_path)
            if os.path.exists(input_path):
                image_path = input_path
            else:
                imgs_path = os.path.join('imgs', image_path)
                if os.path.exists(imgs_path):
                    image_path = imgs_path
                else:
                    return "Arquivo não encontrado"
        elif not os.path.exists(image_path):
            return "Arquivo não encontrado"
        img = cv2.imread(image_path)
        if img is None:
            return "Erro ao carregar imagem"
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        text = pytesseract.image_to_string(thresh, lang='eng')
        text = re.sub(r'\n+', ' ', text).strip()
        text = re.sub(r'\s+', ' ', text)
        return text if text else "Nenhum texto detectado"
    except Exception as e:
        return f"Erro no OCR: {str(e)}"
