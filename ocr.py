import os
import re
import cv2
import pytesseract
import numpy as np
import xml.etree.ElementTree as ET
from threading import Lock
ocr_xml_lock = Lock()

# === CONSTANTES DE DIRETÓRIOS ===
DIR_INPUT = os.getenv('ATTR_FIN_DIR_INPUT', 'input')
DIR_IMGS = os.getenv('ATTR_FIN_DIR_IMGS', 'imgs')

def process_image_ocr(image_path):
    """Processa uma imagem e extrai texto usando OCR"""
    try:
        if os.path.exists(image_path):
            pass
        elif not image_path.startswith(('imgs/', 'input/')):
            input_path = os.path.join(DIR_INPUT, image_path)
            if os.path.exists(input_path):
                image_path = input_path
            else:
                imgs_path = os.path.join(DIR_IMGS, image_path)
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

def registrar_ocr_xml(arquivo, texto, arq_xml=os.getenv('ATTR_FIN_OCR', 'ocr/extract.xml')):
    """Registra extração OCR no arquivo XML incrementalmente, sem sobrescrever entradas existentes."""
    with ocr_xml_lock:
        dir_ocr = os.path.dirname(arq_xml)
        if dir_ocr and not os.path.exists(dir_ocr):
            os.makedirs(dir_ocr, exist_ok=True)
        if os.path.exists(arq_xml):
            tree = ET.parse(arq_xml)
            root = tree.getroot()
        else:
            root = ET.Element('ocr')
            tree = ET.ElementTree(root)
        # Não duplica entradas
        for entry in root.findall('entry'):
            if entry.get('arquivo') == arquivo:
                return  # Já existe, não sobrescreve
        entry = ET.SubElement(root, 'entry', {'arquivo': arquivo})
        entry.text = texto
        tree.write(arq_xml, encoding='utf-8', xml_declaration=True)
