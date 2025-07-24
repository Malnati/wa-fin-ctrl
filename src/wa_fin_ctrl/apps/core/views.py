# views.py
# Caminho relativo ao projeto: src/wa_fin_ctrl/apps/core/views.py
# Views do app core para processamento de comprovantes financeiros

"""
Views Django para o app core.
"""

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
from .processor import processar_incremental_paralelo
from .models import EntradaFinanceira, ArquivoProcessado
from .helper import normalize_value_to_brazilian_format

# Importa as funções do módulo app.py
from ...app import processar_incremental, fix_entry
from .env import ATTR_FIN_DIR_INPUT, ATTR_FIN_DIR_DOCS
# Removido: geração de relatórios HTML não é mais necessária com React
from .utils import (
    _calcular_totalizadores_pessoas,
    parse_valor,
    update_last_modified,
)

# Importa funções para WebSocket
from .consumers import broadcast_reload_sync

# ==== CONSTANTES ====
# Arquivos
ARQUIVO_INDEX = "index.html"

# Status HTTP
STATUS_404 = 404
STATUS_500 = 500

# Mensagens de erro
ERRO_PAGINA_NAO_ENCONTRADA = "Página index.html não encontrada. Execute o processamento primeiro."
ERRO_SERVIR_PAGINA = "Erro ao servir página de relatórios: {}"
ERRO_PARAMETRO_OBRIGATORIO = "Parâmetro 'find' é obrigatório"
ERRO_ENTRADA_NAO_ENCONTRADA = "Entrada {} não encontrada ou erro na correção"
ERRO_CORRIGIR_ENTRADA = "Erro ao corrigir entrada: {}"
ERRO_PROCESSAMENTO = "Erro durante o processamento paralelo"
ERRO_PROCESSAR_ARQUIVOS = "Erro ao processar arquivos: {}"
ERRO_NENHUM_ARQUIVO = "Nenhum arquivo enviado"
ERRO_ARQUIVO_VAZIO = "Arquivo vazio"

# Mensagens de sucesso
SUCESSO_ENTRADA_CORRIGIDA = "Entrada {} corrigida com sucesso"
SUCESSO_PROCESSAMENTO = "Processamento paralelo concluído com sucesso"

# Chaves de resposta JSON
CHAVE_STATUS = "status"
CHAVE_LAST_UPDATE = "last_update"
CHAVE_TIMESTAMP = "timestamp"
CHAVE_WEBSOCKET_AVAILABLE = "websocket_available"
CHAVE_ERROR = "error"
CHAVE_SUCCESS = "success"
CHAVE_MESSAGE = "message"
CHAVE_DATA = "data"
CHAVE_FIND = "find"
CHAVE_VALUE = "value"
CHAVE_DESC = "desc"
CHAVE_CLASS = "class"
CHAVE_ROTATE = "rotate"
CHAVE_IA = "ia"
CHAVE_DISMISS = "dismiss"
CHAVE_STORAGE = "storage"
CHAVE_FORCE = "force"
CHAVE_BACKUP = "backup"
CHAVE_MAX_WORKERS = "max_workers"
CHAVE_RESULTADO = "resultado"

# Valores de resposta
VALOR_HEALTHY = "healthy"
VALOR_TRUE = True
VALOR_DATABASE = "database"

# Variável global para controlar o status
_last_update_time = time.time()





@require_http_methods(["GET"])
def root(request):
    """
    View raiz - redireciona para o frontend React.
    """
    return JsonResponse({
        "message": "Backend API ativo. Use o frontend React para interface.",
        "status": "running"
    })


@require_http_methods(["GET"])
def get_status(request):
    """
    View para verificar status e última atualização.
    """
    return JsonResponse({
        CHAVE_STATUS: VALOR_HEALTHY,
        CHAVE_LAST_UPDATE: _last_update_time,
        CHAVE_TIMESTAMP: time.time(),
        CHAVE_WEBSOCKET_AVAILABLE: True,  # WebSocket disponível via Channels
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
        find = request.POST.get(CHAVE_FIND)
        value = request.POST.get(CHAVE_VALUE, '')
        desc = request.POST.get(CHAVE_DESC, '')
        class_ = request.POST.get(CHAVE_CLASS, '')
        rotate = request.POST.get(CHAVE_ROTATE, '')
        ia = request.POST.get(CHAVE_IA, 'false').lower() == 'true'
        dismiss = request.POST.get(CHAVE_DISMISS, 'false').lower() == 'true'

        if not find:
            return JsonResponse(
                {CHAVE_ERROR: ERRO_PARAMETRO_OBRIGATORIO},
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
                CHAVE_SUCCESS: True,
                CHAVE_MESSAGE: SUCESSO_ENTRADA_CORRIGIDA.format(find),
                CHAVE_DATA: {
                    CHAVE_FIND: find,
                    CHAVE_VALUE: value,
                    CHAVE_DESC: desc,
                    CHAVE_CLASS: class_,
                    CHAVE_ROTATE: rotate,
                    CHAVE_IA: ia,
                    CHAVE_DISMISS: dismiss,
                    CHAVE_LAST_UPDATE: _last_update_time,
                    CHAVE_STORAGE: VALOR_DATABASE,  # Indica que foi salvo no banco
                }
            })
        else:
            return JsonResponse(
                {CHAVE_ERROR: ERRO_ENTRADA_NAO_ENCONTRADA.format(find)},
                status=404
            )

    except Exception as e:
        return JsonResponse(
            {CHAVE_ERROR: ERRO_CORRIGIR_ENTRADA.format(str(e))},
            status=STATUS_500
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
        force = request.POST.get(CHAVE_FORCE, 'false').lower() == 'true'
        backup = request.POST.get(CHAVE_BACKUP, 'false').lower() == 'true'
        max_workers = int(request.POST.get(CHAVE_MAX_WORKERS, '4'))

        # Chama a função de processamento paralelo
        resultado = processar_incremental_paralelo(
            force=force, 
            backup=backup, 
            max_workers=max_workers
        )

        if resultado and resultado.get(CHAVE_SUCCESS):
            # Atualiza timestamp
            update_last_modified()

            # Notifica clientes via WebSocket
            try:
                broadcast_reload_sync()
            except Exception as e:
                print(f"Erro ao enviar notificação WebSocket: {e}")

            return JsonResponse({
                CHAVE_SUCCESS: True,
                CHAVE_MESSAGE: SUCESSO_PROCESSAMENTO,
                CHAVE_DATA: {
                    CHAVE_FORCE: force,
                    CHAVE_BACKUP: backup,
                    CHAVE_MAX_WORKERS: max_workers,
                    CHAVE_RESULTADO: resultado,
                    CHAVE_LAST_UPDATE: _last_update_time,
                }
            })
        else:
            return JsonResponse(
                {CHAVE_ERROR: ERRO_PROCESSAMENTO},
                status=STATUS_500
            )

    except Exception as e:
        return JsonResponse(
            {CHAVE_ERROR: ERRO_PROCESSAR_ARQUIVOS.format(str(e))},
            status=STATUS_500
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
                {CHAVE_ERROR: ERRO_NENHUM_ARQUIVO},
                status=400
            )

        uploaded_file = request.FILES['file']
        
        # Verifica se o arquivo tem tamanho
        if uploaded_file.size == 0:
            return JsonResponse(
                {CHAVE_ERROR: ERRO_ARQUIVO_VAZIO},
                status=400
            )

        # Define o caminho de destino
        file_path = os.path.join(ATTR_FIN_DIR_INPUT, uploaded_file.name)
        
        # Salva o arquivo
        with open(file_path, 'wb+') as destination:
            for chunk in uploaded_file.chunks():
                destination.write(chunk)

        return JsonResponse({
            CHAVE_SUCCESS: True,
            CHAVE_MESSAGE: f"Arquivo {uploaded_file.name} enviado com sucesso",
            CHAVE_DATA: {
                "filename": uploaded_file.name,
                "size": uploaded_file.size,
                "path": file_path
            }
        })

    except Exception as e:
        return JsonResponse(
            {CHAVE_ERROR: f"Erro ao fazer upload: {str(e)}"},
            status=STATUS_500
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
        force = request.POST.get(CHAVE_FORCE, 'false').lower() == 'true'
        backup = request.POST.get(CHAVE_BACKUP, 'true').lower() == 'true'

        # Removido: geração de relatórios HTML não é mais necessária com React
        resultado = "Relatórios HTML removidos - use frontend React"
        resultado_mensal = "Relatórios HTML removidos - use frontend React"

        # Atualiza timestamp
        update_last_modified()

        # Notifica clientes via WebSocket
        try:
            broadcast_reload_sync()
        except Exception as e:
            print(f"Erro ao enviar notificação WebSocket: {e}")

        return JsonResponse({
            CHAVE_SUCCESS: True,
            CHAVE_MESSAGE: "Relatórios gerados com sucesso",
            CHAVE_DATA: {
                CHAVE_FORCE: force,
                CHAVE_BACKUP: backup,
                "relatorio_geral": resultado,
                "relatorios_mensais": resultado_mensal,
                CHAVE_LAST_UPDATE: _last_update_time,
            }
        })

    except Exception as e:
        return JsonResponse(
            {CHAVE_ERROR: f"Erro ao gerar relatórios: {str(e)}"},
            status=STATUS_500
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
        CHAVE_STATUS: VALOR_HEALTHY,
        CHAVE_TIMESTAMP: time.time(),
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



