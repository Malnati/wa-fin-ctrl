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
from datetime import datetime
from django.utils import timezone
from .parallel_processor import processar_incremental_paralelo
from .models import EntradaFinanceira, ArquivoProcessado

# Importa as funções do módulo app.py
from ..app import processar_incremental, fix_entry
from ..env import ATTR_FIN_DIR_INPUT, ATTR_FIN_DIR_DOCS
from ..reporter import gerar_relatorio_html, gerar_relatorios_mensais_html

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
                    "storage": "database",  # Indica que foi salvo no banco
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
    Processa arquivos incrementalmente usando processamento paralelo.
    Equivalente ao comando: make process
    """
    try:
        # Obtém os parâmetros do POST
        force = request.POST.get('force', 'false').lower() == 'true'
        backup = request.POST.get('backup', 'false').lower() == 'true'
        max_workers = int(request.POST.get('max_workers', '4'))

        # Chama a função de processamento paralelo
        resultado = processar_incremental_paralelo(
            force=force, 
            backup=backup, 
            max_workers=max_workers
        )

        if resultado and resultado.get('success'):
            # Atualiza timestamp
            update_last_modified()

            # Notifica clientes via WebSocket
            try:
                broadcast_reload_sync()
            except Exception as e:
                print(f"Erro ao enviar notificação WebSocket: {e}")

            return JsonResponse({
                "success": True,
                "message": "Processamento paralelo concluído com sucesso",
                "data": {
                    "force": force,
                    "backup": backup,
                    "max_workers": max_workers,
                    "resultado": resultado,
                    "last_update": _last_update_time,
                }
            })
        else:
            return JsonResponse(
                {"error": "Erro durante o processamento paralelo"},
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
    Retorna dados financeiros em formato JSON usando banco de dados.
    Aceita parâmetro de query opcional 'month' no formato MM-YYYY.
    """
    try:
        # Filtra por mês se especificado
        month = request.GET.get('month')
        entradas = EntradaFinanceira.objects.all()
        
        if month:
            try:
                # Converte o parâmetro month (MM-YYYY) para filtro
                month_num, year = month.split('-')
                start_date = timezone.make_aware(datetime(int(year), int(month_num), 1))
                if int(month_num) == 12:
                    end_date = timezone.make_aware(datetime(int(year) + 1, 1, 1))
                else:
                    end_date = timezone.make_aware(datetime(int(year), int(month_num) + 1, 1))
                
                entradas = entradas.filter(
                    data_hora__gte=start_date,
                    data_hora__lt=end_date
                )
            except (ValueError, AttributeError):
                return JsonResponse(
                    {"error": "Formato de mês inválido. Use MM-YYYY (ex: 01-2025)"},
                    status=400
                )
        
        # Converte queryset para lista de dicionários
        rows = []
        for entrada in entradas:
            # Formata data e hora
            data_str = entrada.data_hora.strftime("%d/%m/%Y")
            hora_str = entrada.data_hora.strftime("%H:%M:%S")
            
            # Formata valor
            valor_str = f"{entrada.valor:.2f}".replace('.', ',') if entrada.valor else ""
            
            # Determina valores por pessoa baseado na classificação
            valor_ricardo = ""
            valor_rafael = ""
            if entrada.valor > 0:
                # Se é transferência, vai para Ricardo
                if entrada.classificacao.lower() in ['transferência', 'transferencia']:
                    valor_ricardo = valor_str
                # Se é pagamento, vai para Rafael  
                elif entrada.classificacao.lower() in ['pagamento']:
                    valor_rafael = valor_str
                # Para outros tipos, distribui baseado na descrição
                else:
                    desc_lower = entrada.descricao.lower() if entrada.descricao else ""
                    if any(keyword in desc_lower for keyword in ['uber', 'restaurante', 'supermercado', 'padaria', 'farmácia', 'farmacia']):
                        valor_ricardo = valor_str
                    else:
                        valor_rafael = valor_str
            
            rows.append({
                "data": data_str,
                "hora": hora_str,
                "remetente": "Sistema",  # Campo não disponível no modelo atual
                "classificacao": entrada.classificacao,
                "ricardo": valor_ricardo,
                "ricardo_float": float(valor_ricardo.replace(',', '.')) if valor_ricardo else 0.0,
                "rafael": valor_rafael,
                "rafael_float": float(valor_rafael.replace(',', '.')) if valor_rafael else 0.0,
                "anexo": entrada.arquivo_origem,
                "descricao": entrada.descricao,
                "valor": valor_str,
                "ocr": "",  # Campo não disponível no modelo atual
                "validade": "dismiss" if entrada.desconsiderada else "",
                "motivo_erro": ""
            })
        
        # Busca dados de arquivos processados
        arquivos_data = []
        arquivos = ArquivoProcessado.objects.all()
        for arquivo in arquivos:
            arquivos_data.append({
                "arquivo": arquivo.nome_arquivo,
                "tipo": arquivo.tipo,
                "status": arquivo.status,
                "data_processamento": arquivo.data_processamento.strftime("%d/%m/%Y %H:%M:%S") if arquivo.data_processamento else "",
                "erro": arquivo.erro
            })
        
        # Calcula totalizadores
        total_ricardo = sum(r['ricardo_float'] for r in rows if r.get('validade') != 'dismiss')
        total_rafael = sum(r['rafael_float'] for r in rows if r.get('validade') != 'dismiss')
        total_geral = total_ricardo + total_rafael
        
        totalizadores = {
            "ricardo": f"{total_ricardo:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'),
            "ricardo_float": total_ricardo,
            "rafael": f"{total_rafael:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'),
            "rafael_float": total_rafael,
            "geral": f"{total_geral:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'),
            "geral_float": total_geral
        }
        
        # Prepara resposta
        response_data = {
            "rows": rows,
            "arquivos": arquivos_data,
            "totalizadores": totalizadores,
            "timestamp": datetime.now().isoformat(),
            "is_editable": True,
            "tem_motivo": False,  # Campo não disponível no modelo atual
            "periodo": month if month else "Todos os períodos",
            "total_registros": len(rows),
            "total_arquivos": len(arquivos_data)
        }
        
        return JsonResponse(response_data)
        
    except Exception as e:
        return JsonResponse(
            {"error": f"Erro ao carregar dados: {str(e)}"},
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

        # Gera os relatórios
        resultado = gerar_relatorio_html(backup=backup)
        resultado_mensal = gerar_relatorios_mensais_html(backup=backup)

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
            "GET /api/reports - Dados financeiros (JSON)",
            "GET /api/reports?month=MM-YYYY - Dados por mês",
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
    Retorna entradas financeiras em formato JSON usando banco de dados.
    Aceita parâmetro de query opcional 'month' no formato YYYY-MM.
    """
    try:
        # Filtra por mês se especificado
        month = request.GET.get('month')
        entradas = EntradaFinanceira.objects.all()
        
        if month:
            try:
                # Converte o parâmetro month (YYYY-MM) para filtro
                year, month_num = month.split('-')
                start_date = timezone.make_aware(datetime(int(year), int(month_num), 1))
                if int(month_num) == 12:
                    end_date = timezone.make_aware(datetime(int(year) + 1, 1, 1))
                else:
                    end_date = timezone.make_aware(datetime(int(year), int(month_num) + 1, 1))
                
                entradas = entradas.filter(
                    data_hora__gte=start_date,
                    data_hora__lt=end_date
                )
            except (ValueError, AttributeError):
                return JsonResponse(
                    {"error": "Formato de mês inválido. Use YYYY-MM (ex: 2024-01)"},
                    status=400
                )
        
        # Converte queryset para lista de dicionários
        rows = []
        for index, entrada in enumerate(entradas):
            data = entrada.data_hora.strftime("%d/%m/%Y")
            hora = entrada.data_hora.strftime("%H:%M:%S")
            data_hora = f"{data} {hora}"
            
            # Determina se é linha de total (baseado na classificação)
            is_total_row = entrada.classificacao == "TOTAL"
            
            # Formata valor
            valor_str = f"{entrada.valor:.2f}".replace('.', ',') if entrada.valor else ""
            
            # Determina valores por pessoa (simplificado)
            valor_ricardo = ""
            valor_rafael = ""
            if entrada.valor > 0:
                if entrada.classificacao in ['transferência', 'pagamento']:
                    # Lógica simplificada - pode ser melhorada
                    valor_ricardo = valor_str
            
            # Prepara dados da linha
            row_data = {
                "identificador_unico": f"{index}_{data}_{hora}",
                "data_hora": data_hora,
                "classificacao": entrada.classificacao,
                "ricardo": valor_ricardo,
                "rafael": valor_rafael,
                "anexo": entrada.arquivo_origem,
                "descricao": entrada.descricao,
                "ocr": "",  # Campo não disponível no modelo atual
                "motivo": "",  # Campo não disponível no modelo atual
                "row_class": "total-row" if is_total_row else "normal-row",
                "data": data,
                "receitas": "",
                "despesas": "",
                "saldo": ""
            }
            
            # Para impressão, calcula receitas/despesas/saldo
            if not is_total_row:
                valor_float = entrada.valor or 0.0
                
                if entrada.classificacao.lower() == "transferência":
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
            "tem_motivo": False,  # Campo não disponível no modelo atual
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
