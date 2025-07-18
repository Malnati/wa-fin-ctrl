import os

# ==== VARIÁVEIS DE AMBIENTE ====
ATTR_FIN_OPENAI_API_KEY     = os.getenv('ATTR_FIN_OPENAI_API_KEY', None)
ATTR_FIN_DIR_INPUT          = os.getenv('ATTR_FIN_DIR_INPUT', 'input')
ATTR_FIN_DIR_IMGS           = os.getenv('ATTR_FIN_DIR_IMGS', 'imgs')
ATTR_FIN_DIR_MASSA          = os.getenv('ATTR_FIN_DIR_MASSA', 'massa')
ATTR_FIN_DIR_TMP            = os.getenv('ATTR_FIN_DIR_TMP', 'tmp')
ATTR_FIN_ARQ_CALCULO        = os.getenv('ATTR_FIN_ARQ_CALCULO', 'mensagens/calculo.csv')
ATTR_FIN_ARQ_MENSAGENS      = os.getenv('ATTR_FIN_ARQ_MENSAGENS', 'mensagens/mensagens.csv')
ATTR_FIN_ARQ_DIAGNOSTICO    = os.getenv('ATTR_FIN_ARQ_DIAGNOSTICO', 'mensagens/diagnostico.csv')
ATTR_FIN_ARQ_CHAT           = os.getenv('ATTR_FIN_ARQ_CHAT', '_chat.txt')
ATTR_FIN_ARQ_OCR_XML        = os.getenv('ATTR_FIN_ARQ_OCR_XML', 'ocr/extract.xml') 