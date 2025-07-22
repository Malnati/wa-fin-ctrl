# views.py
# Caminho relativo ao projeto: src/wa_fin_ctrl/apps/core/views.py
# Views Django para processamento de comprovantes financeiros

import os
import time
import json
import glob
from pathlib import Path
from django.shortcuts import render
from django.http import JsonResponse, FileResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

# Importa as funções do módulo app.py
from wa_fin_ctrl.app import processar_incremental, fix_entry
from wa_fin_ctrl.env import ATTR_FIN_DIR_INPUT, ATTR_FIN_DIR_DOCS

# Importa funções para WebSocket
from .consumers import broadcast_reload_sync

# Variável global para controlar o status
_last_update_time = time.time()


def update_last_modified():
    """Atualiza o timestamp da última modificação"""
    global _last_update_time
    _last_update_time = time.time()


@require_http_methods(["GET"])
def root(request):
    """
    View raiz - serve a página index.html dos relatórios.
    """
    try:
        index_path = os.path.join(ATTR_FIN_DIR_DOCS, "index.html")

        if not os.path.exists(index_path):
            return JsonResponse(
                {"error": "Página index.html não encontrada. Execute o processamento primeiro."},
                status=404
            )

        # Retorna o arquivo index.html
        return FileResponse(open(index_path, 'rb'), content_type='text/html')

    except Exception as e:
        return JsonResponse(
            {"error": f"Erro ao servir página de relatórios: {str(e)}"},
            status=500
        )


@require_http_methods(["GET"])
def get_status(request):
    """
    View para verificar status e última atualização.
    """
    return JsonResponse({
        "status": "healthy",
        "last_update": _last_update_time,
        "timestamp": time.time(),
        "websocket_available": True,  # WebSocket disponível via Channels
    })


@csrf_exempt
@require_http_methods(["POST"])
def fix_entry_view(request):
    """
    Corrige uma entrada específica em todos os arquivos CSV.
    Equivalente ao comando: make fix
    """
    try:
        # Obtém os dados do POST
        find = request.POST.get('find')
        value = request.POST.get('value', '')
        desc = request.POST.get('desc', '')
        class_ = request.POST.get('class_', '')
        rotate = request.POST.get('rotate', '')
        ia = request.POST.get('ia', 'false').lower() == 'true'
        dismiss = request.POST.get('dismiss', 'false').lower() == 'true'

        if not find:
            return JsonResponse(
                {"error": "Parâmetro 'find' é obrigatório"},
                status=400
            )

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
                broadcast_reload_sync()
            except Exception as e:
                print(f"Erro ao enviar notificação WebSocket: {e}")

            return JsonResponse({
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
                }
            })
        else:
            return JsonResponse(
                {"error": f"Entrada {find} não encontrada ou erro na correção"},
                status=404
            )

    except Exception as e:
        return JsonResponse(
            {"error": f"Erro ao corrigir entrada: {str(e)}"},
            status=500
        )


@csrf_exempt
@require_http_methods(["POST"])
def process_files(request):
    """
    Processa arquivos incrementalmente.
    Equivalente ao comando: make process
    """
    try:
        # Obtém os parâmetros do POST
        force = request.POST.get('force', 'false').lower() == 'true'
        backup = request.POST.get('backup', 'false').lower() == 'true'

        # Chama a função de processamento
        resultado = processar_incremental(force=force, backup=backup)

        if resultado:
            # Atualiza timestamp
            update_last_modified()

            # Notifica clientes via WebSocket
            try:
                broadcast_reload_sync()
            except Exception as e:
                print(f"Erro ao enviar notificação WebSocket: {e}")

            return JsonResponse({
                "success": True,
                "message": "Processamento concluído com sucesso",
                "data": {
                    "force": force,
                    "backup": backup,
                    "resultado": resultado,
                    "last_update": _last_update_time,
                }
            })
        else:
            return JsonResponse(
                {"error": "Erro durante o processamento"},
                status=500
            )

    except Exception as e:
        return JsonResponse(
            {"error": f"Erro ao processar arquivos: {str(e)}"},
            status=500
        )


@csrf_exempt
@require_http_methods(["POST"])
def upload_file(request):
    """
    Faz upload de um arquivo para o diretório de entrada.
    """
    try:
        if 'file' not in request.FILES:
            return JsonResponse(
                {"error": "Nenhum arquivo enviado"},
                status=400
            )

        uploaded_file = request.FILES['file']
        
        # Verifica se o arquivo tem tamanho
        if uploaded_file.size == 0:
            return JsonResponse(
                {"error": "Arquivo vazio"},
                status=400
            )

        # Define o caminho de destino
        file_path = os.path.join(ATTR_FIN_DIR_INPUT, uploaded_file.name)
        
        # Salva o arquivo
        with open(file_path, 'wb+') as destination:
            for chunk in uploaded_file.chunks():
                destination.write(chunk)

        return JsonResponse({
            "success": True,
            "message": f"Arquivo {uploaded_file.name} enviado com sucesso",
            "data": {
                "filename": uploaded_file.name,
                "size": uploaded_file.size,
                "path": file_path
            }
        })

    except Exception as e:
        return JsonResponse(
            {"error": f"Erro ao fazer upload: {str(e)}"},
            status=500
        )


@require_http_methods(["GET"])
def list_reports(request):
    """
    Lista todos os relatórios HTML disponíveis.
    """
    try:
        reports_dir = ATTR_FIN_DIR_DOCS
        if not os.path.exists(reports_dir):
            return JsonResponse({"reports": []})

        # Busca todos os arquivos HTML
        html_files = glob.glob(os.path.join(reports_dir, "*.html"))
        
        reports = []
        for file_path in html_files:
            filename = os.path.basename(file_path)
            file_size = os.path.getsize(file_path)
            file_mtime = os.path.getmtime(file_path)
            
            reports.append({
                "filename": filename,
                "size": file_size,
                "modified": file_mtime,
                "url": f"/reports/{filename}"
            })

        # Ordena por data de modificação (mais recente primeiro)
        reports.sort(key=lambda x: x["modified"], reverse=True)

        return JsonResponse({"reports": reports})

    except Exception as e:
        return JsonResponse(
            {"error": f"Erro ao listar relatórios: {str(e)}"},
            status=500
        )


@require_http_methods(["GET"])
def get_report(request, filename):
    """
    Serve um relatório HTML específico.
    """
    try:
        file_path = os.path.join(ATTR_FIN_DIR_DOCS, filename)
        
        if not os.path.exists(file_path):
            return JsonResponse(
                {"error": f"Relatório {filename} não encontrado"},
                status=404
            )

        # Retorna o arquivo HTML
        return FileResponse(open(file_path, 'rb'), content_type='text/html')

    except Exception as e:
        return JsonResponse(
            {"error": f"Erro ao servir relatório: {str(e)}"},
            status=500
        )


@csrf_exempt
@require_http_methods(["POST"])
def generate_reports(request):
    """
    Gera relatórios HTML.
    """
    try:
        # Obtém os parâmetros do POST
        force = request.POST.get('force', 'false').lower() == 'true'
        backup = request.POST.get('backup', 'true').lower() == 'true'

        # Importa a função de geração de relatórios
        from wa_fin_ctrl.reporter import gerar_relatorio_html, gerar_relatorios_mensais_html
        from wa_fin_ctrl.env import ATTR_FIN_ARQ_CALCULO

        # Verifica se o arquivo de cálculo existe
        if not os.path.exists(ATTR_FIN_ARQ_CALCULO):
            return JsonResponse(
                {"error": "Arquivo de cálculo não encontrado. Execute o processamento primeiro."},
                status=400
            )

        # Gera os relatórios
        resultado = gerar_relatorio_html(ATTR_FIN_ARQ_CALCULO, backup=backup)
        resultado_mensal = gerar_relatorios_mensais_html(ATTR_FIN_ARQ_CALCULO, backup=backup)

        # Atualiza timestamp
        update_last_modified()

        # Notifica clientes via WebSocket
        try:
            broadcast_reload_sync()
        except Exception as e:
            print(f"Erro ao enviar notificação WebSocket: {e}")

        return JsonResponse({
            "success": True,
            "message": "Relatórios gerados com sucesso",
            "data": {
                "force": force,
                "backup": backup,
                "relatorio_geral": resultado,
                "relatorios_mensais": resultado_mensal,
                "last_update": _last_update_time,
            }
        })

    except Exception as e:
        return JsonResponse(
            {"error": f"Erro ao gerar relatórios: {str(e)}"},
            status=500
        )


@require_http_methods(["GET"])
def api_info(request):
    """
    Informações sobre a API.
    """
    return JsonResponse({
        "name": "WA Fin Ctrl API",
        "description": "API Django para processamento de comprovantes financeiros do WhatsApp",
        "version": "1.0.0",
        "framework": "Django",
        "endpoints": [
            "GET / - Página principal",
            "GET /api/status - Status da API",
            "POST /fix - Corrigir entrada",
            "POST /process - Processar arquivos",
            "POST /upload - Upload de arquivo",
            "GET /api/reports - Listar relatórios",
            "GET /reports/{filename} - Obter relatório",
            "POST /reports/generate - Gerar relatórios",
            "GET /api/info - Informações da API",
            "GET /health - Health check"
        ]
    })


@require_http_methods(["GET"])
def health(request):
    """
    Health check da API.
    """
    return JsonResponse({
        "status": "healthy",
        "timestamp": time.time(),
        "service": "wa-fin-ctrl"
    })


@require_http_methods(["GET"])
def api_entries(request):
    """
    Retorna entradas financeiras em formato JSON.
    Aceita parâmetro de query opcional 'month' no formato YYYY-MM.
    """
    try:
        from .env import ATTR_FIN_ARQ_CALCULO
        import pandas as pd
        from datetime import datetime
        
        if not os.path.exists(ATTR_FIN_ARQ_CALCULO):
            return JsonResponse(
                {"error": "Arquivo de cálculo não encontrado. Execute o processamento primeiro."},
                status=404
            )
        
        # Carrega o CSV
        df = pd.read_csv(ATTR_FIN_ARQ_CALCULO, dtype=str)
        
        # Filtra por mês se especificado
        month = request.GET.get('month')
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
                return JsonResponse(
                    {"error": "Formato de mês inválido. Use YYYY-MM (ex: 2024-01)"},
                    status=400
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
                    from .helper import normalize_value_to_brazilian_format
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
        
        return JsonResponse(response_data)
        
    except Exception as e:
        return JsonResponse(
            {"error": f"Erro ao carregar entradas: {str(e)}"},
            status=500
        )


def _calcular_totalizadores_pessoas(rows):
    """Calcula totalizadores por pessoa, excluindo registros com 'dismiss'."""
    
    def parse_valor(valor_str):
        """Converte string de valor para float."""
        if not valor_str or valor_str.lower() in ["nan", ""]:
            return 0.0
        try:
            from .helper import normalize_value_to_brazilian_format
            valor_brasileiro = normalize_value_to_brazilian_format(valor_str)
            return float(valor_brasileiro.replace(",", "."))
        except (ValueError, TypeError):
            return 0.0
    
    total_ricardo = 0.0
    total_rafael = 0.0
    
    for row in rows:
        # Pula registros marcados como dismiss
        if row.get("row_class", "").find("dismiss-row") != -1:
            continue
        
        # Soma valores de Ricardo
        valor_ricardo = parse_valor(row.get("ricardo", ""))
        total_ricardo += valor_ricardo
        
        # Soma valores de Rafael
        valor_rafael = parse_valor(row.get("rafael", ""))
        total_rafael += valor_rafael
    
    return {
        "ricardo": f"{total_ricardo:.2f}".replace(".", ","),
        "rafael": f"{total_rafael:.2f}".replace(".", ","),
        "ricardo_float": total_ricardo,
        "rafael_float": total_rafael,
    }
