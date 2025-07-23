import os

# env.py
# Caminho relativo ao projeto: src/wa_fin_ctrl/apps/core/env.py
# Variáveis de ambiente do app core

# ==== VARIÁVEIS DE AMBIENTE ====
ATTR_FIN_OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", None)
ATTR_FIN_DIR_INPUT = os.getenv("ATTR_FIN_DIR_INPUT", "input")
ATTR_FIN_DIR_IMGS = os.getenv("ATTR_FIN_DIR_IMGS", "imgs")
ATTR_FIN_DIR_MASSA = os.getenv("ATTR_FIN_DIR_MASSA", "massa")
ATTR_FIN_DIR_TMP = os.getenv("ATTR_FIN_DIR_TMP", "tmp")
ATTR_FIN_DIR_MENSAGENS = os.getenv("ATTR_FIN_DIR_MENSAGENS", "mensagens")
ATTR_FIN_DIR_OCR = os.getenv("ATTR_FIN_DIR_OCR", "ocr")
ATTR_FIN_DIR_DOCS = os.getenv("ATTR_FIN_DIR_DOCS", "docs")

