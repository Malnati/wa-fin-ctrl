# api.py
# Caminho relativo ao projeto: src/wa_fin_ctrl/api.py
# API REST FastAPI para processamento de comprovantes financeiros
"""
API REST FastAPI para processamento de comprovantes financeiros.
Reutiliza as funções existentes do CLI para manter consistência.
"""

from fastapi import FastAPI, UploadFile, File, HTTPException, Form, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse, HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import os
import shutil
import glob
import re
from typing import Optional, List
from pathlib import Path
from .env import ATTR_FIN_DIR_INPUT, ATTR_FIN_DIR_DOCS
from .app import (
    processar_incremental,
    fix_entry
)

import signal
import os
import sys

# Variável global para controlar o reload
_force_reload = False

def trigger_server_reload():
    """Força o reload do servidor uvicorn"""
    global _force_reload
    _force_reload = True
    # Envia sinal SIGTERM para o processo atual
    os.kill(os.getpid(), signal.SIGTERM)

app = FastAPI(
    title="WA Fin Ctrl API",
    description="API REST para processamento de comprovantes financeiros do WhatsApp",
    version="1.0.0"
)

# Monta arquivos estáticos
app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/imgs", StaticFiles(directory="imgs"), name="imgs")

@app.get("/")
async def root():
    """
    Endpoint raiz - serve a página index.html dos relatórios.
    """
    try:
        index_path = os.path.join(ATTR_FIN_DIR_DOCS, "index.html")
        
        if not os.path.exists(index_path):
            raise HTTPException(
                status_code=404,
                detail="Página index.html não encontrada. Execute o processamento primeiro."
            )
        
        # Retorna o arquivo index.html
        return FileResponse(
            path=index_path,
            media_type="text/html"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao servir página de relatórios: {str(e)}"
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
            # Força reload do servidor após correção
            trigger_server_reload()
            
            return JSONResponse(
                status_code=200,
                content={
                    "success": True,
                    "message": f"Entrada {find} corrigida com sucesso. Servidor será recarregado.",
                    "data": {
                        "find": find,
                        "value": value,
                        "desc": desc,
                        "class": class_,
                        "rotate": rotate,
                        "ia": ia,
                        "dismiss": dismiss,
                        "reload_triggered": True
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

# Gerenciador de conexões WebSocket
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                # Remove conexões inativas
                self.active_connections.remove(connection)

manager = ConnectionManager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo para teste
            await manager.send_personal_message(f"Message text was: {data}", websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

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
        
        # Notifica clientes via WebSocket
        await manager.broadcast("reload")
        
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

@app.post("/upload")
async def upload(file: UploadFile = File(...)):
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

@app.get("/api/reports", response_model=List[dict])
async def list_reports():
    """
    Lista todos os relatórios HTML disponíveis no diretório docs/.
    """
    try:
        reports = []
        
        # Verifica se o diretório docs existe
        if not os.path.exists(ATTR_FIN_DIR_DOCS):
            return []
        
        # Busca todos os arquivos HTML no diretório docs
        html_files = glob.glob(os.path.join(ATTR_FIN_DIR_DOCS, "*.html"))
        
        for file_path in html_files:
            filename = os.path.basename(file_path)
            file_size = os.path.getsize(file_path)
            modified_time = os.path.getmtime(file_path)
            
            # Determina o tipo de relatório baseado no nome do arquivo
            report_type = "geral"
            period = None
            is_editable = False
            
            if filename == "index.html":
                report_type = "index"
                display_name = "Página Inicial"
            elif filename == "report.html":
                report_type = "geral"
                display_name = "Relatório Geral"
            elif filename.startswith("report-") and filename.endswith(".html"):
                # Relatórios mensais: report-2025-07-Julho.html
                match = re.match(r"report-(\d{4})-(\d{2})-(.+)\.html", filename)
                if match:
                    year = match.group(1)
                    month = match.group(3)
                    report_type = "mensal"
                    period = f"{month} {year}"
                    display_name = f"Relatório {month} {year}"
                    
                    # Verifica se é editável
                    if filename.startswith("report-edit-"):
                        is_editable = True
                        display_name += " (Editável)"
            else:
                display_name = filename
            
            reports.append({
                "filename": filename,
                "display_name": display_name,
                "type": report_type,
                "period": period,
                "is_editable": is_editable,
                "size_bytes": file_size,
                "size_mb": round(file_size / (1024 * 1024), 2),
                "modified_time": modified_time,
                "url": f"/reports/{filename}"
            })
        
        # Ordena por data de modificação (mais recente primeiro)
        reports.sort(key=lambda x: x["modified_time"], reverse=True)
        
        return reports
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao listar relatórios: {str(e)}"
        )

@app.get("/reports/{filename}")
async def get_report(filename: str):
    """
    Serve um relatório HTML específico pelo nome do arquivo.
    """
    try:
        # Valida o nome do arquivo para evitar path traversal
        if ".." in filename or "/" in filename or "\\" in filename:
            raise HTTPException(
                status_code=400,
                detail="Nome de arquivo inválido"
            )
        
        file_path = os.path.join(ATTR_FIN_DIR_DOCS, filename)
        
        if not os.path.exists(file_path):
            raise HTTPException(
                status_code=404,
                detail=f"Relatório '{filename}' não encontrado"
            )
        
        # Verifica se é um arquivo HTML
        if not filename.lower().endswith('.html'):
            raise HTTPException(
                status_code=400,
                detail="Apenas arquivos HTML são permitidos"
            )
        
        # Retorna o arquivo HTML
        return FileResponse(
            path=file_path,
            media_type="text/html"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao servir relatório: {str(e)}"
        )

@app.post("/reports/generate")
async def generate_reports(
    force: bool = Form(False),
    backup: bool = Form(True)
):
    """
    Gera relatórios HTML sob demanda.
    """
    try:
        from .reporter import gerar_relatorio_html, gerar_relatorios_mensais_html
        from .env import ATTR_FIN_ARQ_CALCULO
        
        # Verifica se o arquivo de cálculo existe
        if not os.path.exists(ATTR_FIN_ARQ_CALCULO):
            raise HTTPException(
                status_code=400,
                detail="Arquivo de cálculo não encontrado. Execute o processamento primeiro."
            )
        
        # Gera relatórios
        gerar_relatorio_html(ATTR_FIN_ARQ_CALCULO, backup=backup)
        gerar_relatorios_mensais_html(ATTR_FIN_ARQ_CALCULO, backup=backup)
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": "Relatórios gerados com sucesso",
                "data": {
                    "force": force,
                    "backup": backup,
                    "calculation_file": ATTR_FIN_ARQ_CALCULO
                }
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao gerar relatórios: {str(e)}"
        )

@app.get("/api/info")
async def api_info():
    """
    Endpoint com informações da API.
    """
    return {
        "message": "WA Fin Ctrl API",
        "version": "1.0.0",
        "endpoints": {
            "GET /": "Página principal de relatórios (HTML)",
            "GET /api/info": "Informações da API",
            "GET /api/reports": "Lista todos os relatórios disponíveis (JSON)",
            "GET /reports/{filename}": "Serve um relatório HTML específico",
            "POST /fix": "Corrige uma entrada específica",
            "POST /process": "Processa arquivos incrementalmente",
            "POST /upload": "Faz upload de arquivo ZIP",
            "POST /reports/generate": "Gera relatórios HTML sob demanda"
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