# ocr.py
# Caminho relativo ao projeto: ocr.py
# Módulo de processamento OCR para imagens e PDFs com suporte a extração incremental
import os
import re
import cv2
import pytesseract
import numpy as np
import xml.etree.ElementTree as ET
from threading import Lock
from .env import *

ocr_xml_lock = Lock()


def process_image_ocr(image_path):
    """Processa uma imagem ou PDF e extrai texto usando OCR, consultando o XML incremental antes."""
    try:
        arq_xml = ATTR_FIN_ARQ_OCR_XML
        # 1. Consulta o XML incremental
        if os.path.exists(arq_xml):
            try:
                tree = ET.parse(arq_xml)
                root = tree.getroot()
                for entry in root.findall("entry"):
                    if entry.get("arquivo") == os.path.basename(image_path):
                        return entry.text or ""
            except Exception:
                pass  # Se falhar, ignora e tenta extrair normalmente
        # 2. Resolve caminho real
        if os.path.exists(image_path):
            pass
        elif not image_path.startswith(
            (f"{ATTR_FIN_DIR_IMGS}/", f"{ATTR_FIN_DIR_INPUT}/")
        ):
            input_path = os.path.join(ATTR_FIN_DIR_INPUT, image_path)
            if os.path.exists(input_path):
                image_path = input_path
            else:
                imgs_path = os.path.join(ATTR_FIN_DIR_IMGS, image_path)
                if os.path.exists(imgs_path):
                    image_path = imgs_path
                else:
                    return "Arquivo não encontrado"
        elif not os.path.exists(image_path):
            return "Arquivo não encontrado"
        # 3. Se for PDF, aplica pdfplumber e fallback com OCR via pdf2image
        if image_path.lower().endswith(".pdf"):
            try:
                import pdfplumber
                from pdf2image import convert_from_path
            except ImportError:
                return (
                    "Erro: Suporte a PDF não disponível. "
                    "Adicione as bibliotecas 'pdfplumber' e 'pdf2image' no Dockerfile para processar PDFs."
                )

            texto_pdf = ""

            # Método 1: pdfplumber
            try:
                with pdfplumber.open(image_path) as pdf:
                    for page in pdf.pages:
                        texto_pagina = page.extract_text() or ""
                        texto_pdf += texto_pagina
            except Exception:
                texto_pdf = ""

            texto_pdf = texto_pdf.strip()
            texto_pdf = re.sub(r"\n+", " ", texto_pdf)
            texto_pdf = re.sub(r"\s+", " ", texto_pdf)

            # Método 2: OCR com pdf2image se pdfplumber falhar ou retornar vazio
            if not texto_pdf:
                try:
                    imagens = convert_from_path(image_path)
                    texto_ocr = []
                    for img in imagens:
                        img_cv = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
                        gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
                        _, thresh = cv2.threshold(
                            gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU
                        )
                        texto_pagina = pytesseract.image_to_string(thresh, lang="eng")
                        texto_ocr.append(texto_pagina)
                    texto_pdf = "\n".join(texto_ocr).strip()
                    texto_pdf = re.sub(r"\n+", " ", texto_pdf)
                    texto_pdf = re.sub(r"\s+", " ", texto_pdf)
                except Exception as e:
                    return f"Erro ao processar PDF: {str(e)}"

            # Converter PDF para JPG se ainda não foi convertido
            _converter_pdf_para_jpg(image_path)

            registrar_ocr_xml(os.path.basename(image_path), texto_pdf)
            return texto_pdf if texto_pdf else "Nenhum texto detectado"
        # 4. Caso contrário, processa como imagem
        img = cv2.imread(image_path)
        if img is None:
            return "Erro ao carregar imagem"
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        text = pytesseract.image_to_string(thresh, lang="eng")
        text = re.sub(r"\n+", " ", text).strip()
        text = re.sub(r"\s+", " ", text)
        registrar_ocr_xml(os.path.basename(image_path), text)
        return text if text else "Nenhum texto detectado"
    except Exception as e:
        return f"Erro no OCR: {str(e)}"


def registrar_ocr_xml(arquivo, texto, arq_xml=ATTR_FIN_ARQ_OCR_XML):
    """Registra extração OCR no arquivo XML incrementalmente, sem sobrescrever entradas existentes."""
    with ocr_xml_lock:
        dir_ocr = os.path.dirname(arq_xml)
        if dir_ocr and not os.path.exists(dir_ocr):
            os.makedirs(dir_ocr, exist_ok=True)
        if os.path.exists(arq_xml):
            tree = ET.parse(arq_xml)
            root = tree.getroot()
        else:
            root = ET.Element("ocr")
            tree = ET.ElementTree(root)
        # Não duplica entradas
        for entry in root.findall("entry"):
            if entry.get("arquivo") == arquivo:
                return  # Já existe, não sobrescreve
        entry = ET.SubElement(root, "entry", {"arquivo": arquivo})
        entry.text = texto
        tree.write(arq_xml, encoding="utf-8", xml_declaration=True)


def _converter_pdf_para_jpg(pdf_path):
    """Converte um PDF para JPG mantendo o mesmo nome do arquivo original."""
    try:
        # Verificar se o arquivo é um PDF
        if not pdf_path.lower().endswith(".pdf"):
            return

        # Verificar se já existe uma versão JPG
        nome_base = os.path.splitext(os.path.basename(pdf_path))[0]
        jpg_path = os.path.join(ATTR_FIN_DIR_IMGS, f"{nome_base}.jpg")

        if os.path.exists(jpg_path):
            print(f"📄 JPG já existe para {os.path.basename(pdf_path)}")
            return

        # Converter PDF para JPG
        from pdf2image import convert_from_path
        from PIL import Image

        print(f"🔄 Convertendo {os.path.basename(pdf_path)} para JPG...")

        # Converter primeira página do PDF para imagem
        imagens = convert_from_path(pdf_path, first_page=1, last_page=1)

        if imagens:
            # Salvar como JPG
            imagem = imagens[0]
            imagem.save(jpg_path, "JPEG", quality=85)
            print(f"✅ PDF convertido para JPG: {nome_base}.jpg")
        else:
            print(
                f"❌ Erro: Não foi possível converter {os.path.basename(pdf_path)} para JPG"
            )

    except Exception as e:
        print(f"❌ Erro ao converter PDF para JPG: {str(e)}")
