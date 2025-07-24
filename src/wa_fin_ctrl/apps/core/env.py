import os

# env.py
# Caminho relativo ao projeto: src/wa_fin_ctrl/apps/core/env.py
# Variáveis de ambiente do app core

# ==== VARIÁVEIS DE AMBIENTE ====
ATTR_FIN_OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", None)
ATTR_FIN_DIR_INPUT = os.getenv("ATTR_FIN_DIR_INPUT", "input")
ATTR_FIN_DIR_IMGS = os.getenv("ATTR_FIN_DIR_IMGS", "imgs")
ATTR_FIN_DIR_MASSA = os.getenv("ATTR_FIN_DIR_MASSA", "massa")
# Removido: diretórios obsoletos não são mais necessários
# ATTR_FIN_DIR_TMP = os.getenv("ATTR_FIN_DIR_TMP", "tmp")
# ATTR_FIN_DIR_MENSAGENS = os.getenv("ATTR_FIN_DIR_MENSAGENS", "mensagens")
# Removido: diretório OCR não é mais necessário (dados no banco)
# ATTR_FIN_DIR_OCR = os.getenv("ATTR_FIN_DIR_OCR", "ocr")
ATTR_FIN_DIR_DOCS = os.getenv("ATTR_FIN_DIR_DOCS", "docs")

ATTR_FIN_ARQ_DB = os.getenv("ATTR_FIN_ARQ_DB", "db/db.sqlite3")
ATTR_FIN_ARQ_CHAT = os.getenv("ATTR_FIN_ARQ_CHAT", "_chat.txt")

# ==== CONSTANTES DE BANCO DE DADOS ====
ATTR_FIN_DIR_DB = os.getenv("ATTR_FIN_DIR_DB", "db")
ATTR_FIN_TABELA_MIGRATIONS = "django_migrations"
ATTR_FIN_MSG_BANCO_INICIALIZANDO = "🗄️  Inicializando banco de dados..."
ATTR_FIN_MSG_BANCO_INICIALIZADO = "✅ Banco de dados inicializado com sucesso!"
ATTR_FIN_MSG_ERRO_BANCO = "⚠️  Erro ao verificar/inicializar banco:"
ATTR_FIN_MSG_COMANDO_MANUAL = "💡 Execute manualmente: poetry run python manage.py migrate"

