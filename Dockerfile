FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    POETRY_HOME="/opt/poetry" \
    POETRY_VERSION="1.8.3" \
    POETRY_NO_INTERACTION=1 \
    POETRY_VIRTUALENVS_CREATE=0

# Dependências de sistema necessárias para opencv, tesseract e pdf2image
RUN apt-get update \ 
    && apt-get install -y --no-install-recommends \
        build-essential \
        curl \
        libgl1 \
        libglib2.0-0 \
        libsm6 \
        libxext6 \
        libxrender1 \
        poppler-utils \
        tesseract-ocr \ 
    && rm -rf /var/lib/apt/lists/*

# Instala o Poetry globalmente
RUN pip install --upgrade pip \ 
    && pip install "poetry==${POETRY_VERSION}"

WORKDIR /app

# Instala as dependências primeiro para aproveitar cache de camadas
COPY pyproject.toml poetry.lock* ./
RUN poetry install --no-root

# Copia o restante do código
COPY . .

# Torna o script de entrada executável
RUN chmod +x docker-entrypoint.sh

# Garante que a aplicação esteja instalada (se aplicável)
RUN poetry install

EXPOSE 8000

# Executa rotina de inicialização antes de iniciar a API
ENTRYPOINT ["./docker-entrypoint.sh"]

# Inicia a API FastAPI
CMD ["poetry", "run", "uvicorn", "src.wa_fin_ctrl.api:app", "--host", "0.0.0.0", "--port", "8000"]
