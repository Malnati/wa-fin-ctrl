# api.py
# Caminho relativo ao projeto: src/wa_fin_ctrl/api.py
# API REST FastAPI para processamento de comprovantes financeiros
"""
API REST FastAPI para processamento de comprovantes financeiros.
Reutiliza as funções existentes do CLI para manter consistência.
"""

from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.responses import JSONResponse
import os
import shutil
from typing import Optional
from .env import ATTR_FIN_DIR_INPUT
from .app import (
    processar_incremental,
    fix_entry,
    dismiss_entry
)

app = FastAPI(
    title="WA Fin Ctrl API",
    description="API REST para processamento de comprovantes financeiros do WhatsApp",
    version="1.0.0"
)

@app.post("/fix")
async def fix(
    find: str = Form(...),
    value: Optional[str] = Form(""),
    desc: Optional[str] = Form(""),
    class_: Optional[str] = Form(""),
    rotate: Optional[str] = Form(""),
    ia: bool = Form(False),
    dismiss: bool = Form(False)
):
    """
    Corrige uma entrada específica em todos os arquivos CSV.
    Equivalente ao comando: make fix
    """
    try:
        # Chama a função existente do app.py
        sucesso = fix_entry(
            data_hora=find,
            novo_valor=value if value else None,
            nova_descricao=desc if desc else None,
            nova_classificacao=class_ if class_ else None,
            dismiss=dismiss,
            rotate=rotate if rotate else None,
            ia=ia
        )
        
        if sucesso:
            return JSONResponse(
                status_code=200,
                content={
                    "success": True,
                    "message": f"Entrada {find} corrigida com sucesso",
                    "data": {
                        "find": find,
                        "value": value,
                        "desc": desc,
                        "class": class_,
                        "rotate": rotate,
                        "ia": ia,
                        "dismiss": dismiss
                    }
                }
            )
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Falha ao corrigir entrada {find}"
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )

@app.post("/dismiss")
async def dismiss(find: str = Form(...)):
    """
    Marca uma entrada como desconsiderada (dismiss) em todos os arquivos CSV.
    Equivalente ao comando: make dismiss
    """
    try:
        # Chama a função existente do app.py
        sucesso = dismiss_entry(find)
        
        if sucesso:
            return JSONResponse(
                status_code=200,
                content={
                    "success": True,
                    "message": f"Entrada {find} marcada como desconsiderada",
                    "data": {
                        "find": find
                    }
                }
            )
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Falha ao marcar entrada {find} como desconsiderada"
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )

@app.post("/rotate")
async def rotate(
    find: str = Form(...),
    rotate: str = Form(...)
):
    """
    Rotaciona uma imagem específica.
    Equivalente ao comando: make fix-rotate
    """
    try:
        # Chama a função existente do app.py com apenas rotação
        sucesso = fix_entry(
            data_hora=find,
            rotate=rotate,
            ia=False
        )
        
        if sucesso:
            return JSONResponse(
                status_code=200,
                content={
                    "success": True,
                    "message": f"Imagem da entrada {find} rotacionada com sucesso",
                    "data": {
                        "find": find,
                        "rotate": rotate
                    }
                }
            )
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Falha ao rotacionar imagem da entrada {find}"
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )

@app.post("/process")
async def process(
    force: bool = Form(False),
    backup: bool = Form(False)
):
    """
    Processa arquivos incrementalmente.
    Equivalente ao comando: make process
    """
    try:
        # Chama a função existente do app.py
        processar_incremental(force=force, backup=backup)
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": "Processamento concluído com sucesso",
                "data": {
                    "force": force,
                    "backup": backup
                }
            }
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro durante o processamento: {str(e)}"
        )

@app.post("/upload-zip")
async def upload_zip(file: UploadFile = File(...)):
    """
    Faz upload de um arquivo ZIP para o diretório de entrada.
    """
    try:
        # Verifica se o arquivo é um ZIP
        if not file.filename.lower().endswith('.zip'):
            raise HTTPException(
                status_code=400,
                detail="Apenas arquivos ZIP são permitidos"
            )
        
        # Garante que o diretório existe
        os.makedirs(ATTR_FIN_DIR_INPUT, exist_ok=True)
        
        # Define o caminho completo do arquivo
        filepath = os.path.join(ATTR_FIN_DIR_INPUT, file.filename)
        
        # Salva o arquivo
        with open(filepath, "wb") as f:
            shutil.copyfileobj(file.file, f)
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": f"Arquivo {file.filename} enviado com sucesso",
                "data": {
                    "filename": file.filename,
                    "size": os.path.getsize(filepath),
                    "path": filepath
                }
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao fazer upload: {str(e)}"
        )

@app.get("/")
async def root():
    """
    Endpoint raiz com informações da API.
    """
    return {
        "message": "WA Fin Ctrl API",
        "version": "1.0.0",
        "endpoints": {
            "POST /fix": "Corrige uma entrada específica",
            "POST /dismiss": "Marca uma entrada como desconsiderada",
            "POST /rotate": "Rotaciona uma imagem",
            "POST /process": "Processa arquivos incrementalmente",
            "POST /upload-zip": "Faz upload de arquivo ZIP"
        }
    }

@app.get("/health")
async def health():
    """
    Endpoint de verificação de saúde da API.
    """
    return {
        "status": "healthy",
        "message": "API funcionando normalmente"
    } 