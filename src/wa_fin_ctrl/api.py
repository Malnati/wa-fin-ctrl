# api.py
# Caminho relativo ao projeto: src/wa_fin_ctrl/api.py
# API FastAPI para processamento de comprovantes financeiros
"""
API REST FastAPI para processamento de comprovantes financeiros.
Reutiliza as funções existentes do CLI para manter consistência.
"""

from fastapi import (
    FastAPI,
    UploadFile,
    File,
    HTTPException,
    Form,
    WebSocket,
    WebSocketDisconnect,
)
from fastapi.responses import JSONResponse, HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import os
import shutil
import glob
import re
import time
from typing import Optional, List
from pathlib import Path
import pandas as pd
from datetime import datetime
import signal
import sys
from .env import ATTR_FIN_DIR_INPUT, ATTR_FIN_DIR_DOCS
from .app import processar_incremental, fix_entry
from .apps.core.reporter import gerar_relatorio_html, gerar_relatorios_mensais_html
from .apps.core.helper import normalize_value_to_brazilian_format
from .apps.core.utils import (
    _calcular_totalizadores_pessoas,
    parse_valor,
    update_last_modified,
)

# Variável global para controlar o reload e status
_force_reload = False
_last_update_time = time.time()
_connection_manager = None


def trigger_server_reload():
    """Força o reload do servidor uvicorn"""
    global _force_reload
    _force_reload = True
    # Envia sinal SIGTERM para o processo atual
    os.kill(os.getpid(), signal.SIGTERM)





# Gerenciador de conexões WebSocket
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        try:
            await websocket.send_text(message)
        except:
            self.disconnect(websocket)

    async def broadcast(self, message: str):
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                disconnected.append(connection)

        # Remove conexões inativas
        for conn in disconnected:
            self.disconnect(conn)


# Inicializa o gerenciador de conexões
_connection_manager = ConnectionManager()

app = FastAPI(
    title="WA Fin Ctrl API",
    description="API REST para processamento de comprovantes financeiros do WhatsApp",
    version="1.0.0",
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
                detail="Página index.html não encontrada. Execute o processamento primeiro.",
            )

        # Retorna o arquivo index.html
        return FileResponse(path=index_path, media_type="text/html")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Erro ao servir página de relatórios: {str(e)}"
        )


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Endpoint WebSocket para notificações em tempo real"""
    await _connection_manager.connect(websocket)
    try:
        while True:
            # Mantém a conexão ativa
            data = await websocket.receive_text()
            # Echo para teste
            await _connection_manager.send_personal_message(f"Echo: {data}", websocket)
    except WebSocketDisconnect:
        _connection_manager.disconnect(websocket)
    except Exception as e:
        print(f"Erro no WebSocket: {e}")
        _connection_manager.disconnect(websocket)


@app.get("/api/status")
async def get_status():
    """
    Endpoint para verificar status e última atualização.
    Útil para polling quando WebSocket não está disponível.
    """
    return {
        "status": "healthy",
        "last_update": _last_update_time,
        "timestamp": time.time(),
        "websocket_available": True,
    }


@app.post("/fix")
async def fix(
    find: str = Form(...),
    value: Optional[str] = Form(""),
    desc: Optional[str] = Form(""),
    class_: Optional[str] = Form(""),
    rotate: Optional[str] = Form(""),
    ia: bool = Form(False),
    dismiss: bool = Form(False),
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
            ia=ia,
        )

        if sucesso:
            # Atualiza timestamp
            update_last_modified()

            # Notifica clientes via WebSocket
            try:
                await _connection_manager.broadcast("reload")
            except Exception as e:
                print(f"Erro ao enviar notificação WebSocket: {e}")

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
                        "dismiss": dismiss,
                        "last_update": _last_update_time,
                        "storage": "database",  # Indica que foi salvo no banco
                    },
                },
            )
        else:
            raise HTTPException(
                status_code=400, detail=f"Falha ao corrigir entrada {find}"
            )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")


@app.post("/process")
async def process(force: bool = Form(False), backup: bool = Form(False)):
    """
    Processa arquivos incrementalmente.
    Equivalente ao comando: make process
    """
    try:
        # Chama a função existente do app.py
        processar_incremental(force=force, backup=backup)

        # Atualiza timestamp
        update_last_modified()

        # Notifica clientes via WebSocket
        try:
            await _connection_manager.broadcast("reload")
        except Exception as e:
            print(f"Erro ao enviar notificação WebSocket: {e}")

        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": "Processamento concluído com sucesso",
                "data": {
                    "force": force,
                    "backup": backup,
                    "last_update": _last_update_time,
                },
            },
        )

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Erro durante o processamento: {str(e)}"
        )


@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    """
    Faz upload de um arquivo ZIP para o diretório de entrada.
    """
    try:
        # Verifica se o arquivo é um ZIP
        if not file.filename.lower().endswith(".zip"):
            raise HTTPException(
                status_code=400, detail="Apenas arquivos ZIP são permitidos"
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
                    "path": filepath,
                },
            },
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao fazer upload: {str(e)}")


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

            reports.append(
                {
                    "filename": filename,
                    "display_name": display_name,
                    "type": report_type,
                    "period": period,
                    "is_editable": is_editable,
                    "size_bytes": file_size,
                    "size_mb": round(file_size / (1024 * 1024), 2),
                    "modified_time": modified_time,
                    "url": f"/reports/{filename}",
                }
            )

        # Ordena por data de modificação (mais recente primeiro)
        reports.sort(key=lambda x: x["modified_time"], reverse=True)

        return reports

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Erro ao listar relatórios: {str(e)}"
        )


@app.get("/reports/{filename}")
async def get_report(filename: str):
    """
    Serve um relatório HTML específico pelo nome do arquivo.
    """
    try:
        # Valida o nome do arquivo para evitar path traversal
        if ".." in filename or "/" in filename or "\\" in filename:
            raise HTTPException(status_code=400, detail="Nome de arquivo inválido")

        file_path = os.path.join(ATTR_FIN_DIR_DOCS, filename)

        if not os.path.exists(file_path):
            raise HTTPException(
                status_code=404, detail=f"Relatório '{filename}' não encontrado"
            )

        # Verifica se é um arquivo HTML
        if not filename.lower().endswith(".html"):
            raise HTTPException(
                status_code=400, detail="Apenas arquivos HTML são permitidos"
            )

        # Retorna o arquivo HTML
        return FileResponse(path=file_path, media_type="text/html")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Erro ao servir relatório: {str(e)}"
        )


@app.post("/reports/generate")
async def generate_reports(force: bool = Form(False), backup: bool = Form(True)):
    """
    Gera relatórios HTML sob demanda.
    """
    try:
        # Gera relatórios
        gerar_relatorio_html(backup=backup)
        gerar_relatorios_mensais_html(backup=backup)

        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": "Relatórios gerados com sucesso",
                "data": {
                    "force": force,
                    "backup": backup,
                },
            },
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Erro ao gerar relatórios: {str(e)}"
        )


@app.get("/api/entries")
async def api_entries(month: str = None):
    """
    Retorna entradas financeiras em formato JSON.
    Aceita parâmetro de query opcional 'month' no formato YYYY-MM.
    """
    try:
        # Dados agora vêm do banco de dados
        # TODO: Implementar consulta ao banco de dados
        raise HTTPException(
            status_code=501,
            detail="Endpoint em desenvolvimento - dados agora vêm do banco de dados"
        )
        
        # Filtra por mês se especificado
        if month:
            try:
                # Converte o parâmetro month (YYYY-MM) para filtro
                year, month_num = month.split('-')
                df['DATA_DT'] = pd.to_datetime(df['DATA'], format='%d/%m/%Y', errors='coerce')
                df = df[
                    (df['DATA_DT'].dt.year == int(year)) & 
                    (df['DATA_DT'].dt.month == int(month_num))
                ]
            except (ValueError, AttributeError):
                raise HTTPException(
                    status_code=400,
                    detail="Formato de mês inválido. Use YYYY-MM (ex: 2024-01)"
                )
        
        # Converte DataFrame para lista de dicionários
        rows = []
        for index, row in df.iterrows():
            data = str(row.get("DATA", ""))
            hora = str(row.get("HORA", ""))
            data_hora = f"{data} {hora}" if data != "nan" and hora != "nan" else ""
            
            # Determina se é linha de total
            remetente = str(row.get("REMETENTE", ""))
            is_total_row = remetente == "TOTAL MÊS"
            
            # Prepara dados da linha
            row_data = {
                "identificador_unico": f"{index}_{data}_{hora}",
                "data_hora": data_hora,
                "classificacao": str(row.get("CLASSIFICACAO", "")),
                "ricardo": str(row.get("RICARDO", "")),
                "rafael": str(row.get("RAFAEL", "")),
                "anexo": str(row.get("ANEXO", "")),
                "descricao": str(row.get("DESCRICAO", "")),
                "ocr": str(row.get("OCR", "")),
                "motivo": str(row.get("MOTIVO", "")),
                "row_class": "total-row" if is_total_row else "normal-row",
                "data": data,
                "receitas": "",
                "despesas": "",
                "saldo": ""
            }
            
            # Para impressão, calcula receitas/despesas/saldo
            if not is_total_row:
                valor = str(row.get("VALOR", "0"))
                try:
                    valor_float = float(normalize_value_to_brazilian_format(valor).replace(",", "."))
                except:
                    valor_float = 0.0
                
                classificacao = str(row.get("CLASSIFICACAO", "")).lower()
                if classificacao == "transferência":
                    row_data["receitas"] = f"{valor_float:.2f}".replace(".", ",")
                else:
                    row_data["despesas"] = f"{valor_float:.2f}".replace(".", ",")
            
            rows.append(row_data)
        
        # Calcula totalizadores
        totalizadores = _calcular_totalizadores_pessoas(rows)
        
        # Prepara resposta
        response_data = {
            "rows": rows,
            "totalizadores": totalizadores,
            "timestamp": datetime.now().isoformat(),
            "is_editable": True,
            "tem_motivo": any(row.get("motivo") and row.get("motivo") != "nan" for row in rows),
            "periodo": month if month else "Todos os períodos"
        }
        
        return response_data
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao carregar entradas: {str(e)}"
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
            "GET /api/entries": "Retorna entradas financeiras (JSON)",
            "GET /reports/{filename}": "Serve um relatório HTML específico",
            "POST /fix": "Corrige uma entrada específica",
            "POST /process": "Processa arquivos incrementalmente",
            "POST /upload": "Faz upload de arquivo ZIP",
            "POST /reports/generate": "Gera relatórios HTML sob demanda",
        },
    }


@app.get("/health")
async def health():
    """
    Endpoint de verificação de saúde da API.
    """
    return {"status": "healthy", "message": "API funcionando normalmente"}
