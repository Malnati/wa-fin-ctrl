# processor.py
# Caminho relativo ao projeto: src/wa_fin_ctrl/apps/core/processor.py
# Módulo para processamento paralelo de imagens usando Django ORM

import os
import concurrent.futures
from pathlib import Path
from datetime import datetime
from django.db import transaction
from django.utils import timezone
from django.conf import settings

from .models import Processamento, EntradaFinanceira, ArquivoProcessado
from .ocr import process_image_ocr
from .ia import (
    extract_total_value_with_chatgpt,
    generate_payment_description_with_chatgpt,
    classify_transaction_type_with_chatgpt
)
from .env import ATTR_FIN_DIR_INPUT, ATTR_FIN_DIR_IMGS
from .helper import normalize_sender, normalize_value_to_brazilian_format
from .utils import (
    descomprimir_zip_se_existir,
    organizar_subdiretorios_se_necessario,
    mover_arquivos_processados,
)
import zipfile
import shutil


def processar_arquivo_individual(arquivo_path, processamento_id, force=False):
    """
    Processa um arquivo individual em thread separada.
    
    Args:
        arquivo_path: Caminho para o arquivo a ser processado
        processamento_id: ID do registro de processamento
        force: Se True, reprocessa mesmo se já foi processado
    
    Returns:
        dict: Resultado do processamento com status e detalhes
    """
    try:
        nome_arquivo = os.path.basename(arquivo_path)
        
        # Verifica se já foi processado (se não for force)
        if not force:
            arquivo_existente = ArquivoProcessado.objects.filter(
                nome_arquivo=nome_arquivo,
                status='processado'
            ).first()
            
            if arquivo_existente:
                return {
                    'success': True,
                    'message': f'Arquivo {nome_arquivo} já processado anteriormente',
                    'skipped': True
                }
        
        # Determina o tipo do arquivo
        extensao = Path(arquivo_path).suffix.lower()
        if extensao in ['.jpg', '.jpeg', '.png']:
            tipo_arquivo = 'imagem'
        elif extensao == '.pdf':
            tipo_arquivo = 'pdf'
        else:
            tipo_arquivo = 'outro'
        
        # PASSO 1: Aplicar OCR
        ocr_text = process_image_ocr(arquivo_path)
        
        # PASSO 2: Extrair informações com IA
        valor_total = ""
        descricao = ""
        classificacao = ""
        ai_used = False
        
        if ocr_text and ocr_text not in [
            "Arquivo não encontrado",
            "Erro ao carregar imagem",
            "Nenhum texto detectado",
        ]:
            # Extrai valor do OCR
            valor_total = extract_total_value_with_chatgpt(ocr_text)
            
            # Extrai classificação do OCR
            classificacao = classify_transaction_type_with_chatgpt(ocr_text)
            
            # Extrai descrição do OCR
            descricao = generate_payment_description_with_chatgpt(ocr_text)
            
            if valor_total:
                ai_used = True
        
        # PASSO 3: Se a IA não identificou, classifica como desconhecido
        if not valor_total:
            valor_total = ""
            descricao = "Não foi possível extrair informações"
            classificacao = "desconhecido"
        
        # PASSO 4: Salva no banco de dados
        with transaction.atomic():
            # Cria ou atualiza registro do arquivo
            arquivo_processado, created = ArquivoProcessado.objects.update_or_create(
                nome_arquivo=nome_arquivo,
                defaults={
                    'tipo': tipo_arquivo,
                    'tamanho': os.path.getsize(arquivo_path),
                    'data_processamento': timezone.now(),
                    'processamento_id': processamento_id,
                    'status': 'processado',
                    'erro': ''
                }
            )
            
            # Cria entrada financeira
            if valor_total:
                # Converte valor para formato brasileiro
                valor_brasileiro = normalize_value_to_brazilian_format(valor_total)
                valor_float = float(valor_brasileiro.replace(',', '.'))
                
                entrada = EntradaFinanceira.objects.create(
                    data_hora=timezone.now(),
                    valor=valor_float,
                    descricao=descricao,
                    classificacao=classificacao,
                    arquivo_origem=nome_arquivo,
                    processamento_id=processamento_id,
                    desconsiderada=False
                )
            else:
                entrada = None
        
        return {
            'success': True,
            'message': f'Arquivo {nome_arquivo} processado com sucesso',
            'arquivo': nome_arquivo,
            'ocr_text': ocr_text[:100] + '...' if len(ocr_text) > 100 else ocr_text,
            'valor': valor_total,
            'descricao': descricao,
            'classificacao': classificacao,
            'ai_used': ai_used,
            'entrada_criada': entrada is not None
        }
        
    except Exception as e:
        # Registra erro no banco
        try:
            with transaction.atomic():
                ArquivoProcessado.objects.update_or_create(
                    nome_arquivo=os.path.basename(arquivo_path),
                    defaults={
                        'tipo': 'outro',
                        'tamanho': 0,
                        'data_processamento': timezone.now(),
                        'processamento_id': processamento_id,
                        'status': 'erro',
                        'erro': str(e)
                    }
                )
        except:
            pass
        
        return {
            'success': False,
            'message': f'Erro ao processar {os.path.basename(arquivo_path)}: {str(e)}',
            'error': str(e)
        }


def processar_incremental_paralelo(force=False, entry=None, backup=False, max_workers=4):
    """
    Processamento paralelo principal de arquivos.
    
    Args:
        force: Se True, reprocessa todos os arquivos
        entry: Filtro específico de entrada (formato: DD/MM/AAAA HH:MM:SS)
        backup: Se True, cria backups antes do processamento
        max_workers: Número máximo de workers paralelos
    
    Returns:
        dict: Resultado do processamento
    """
    print(f"=== INICIANDO PROCESSAMENTO PARALELO {'FORÇADO' if force else 'INCREMENTAL'} ===")
    
    # Cria registro de processamento
    processamento = Processamento.objects.create(
        tipo='force' if force else 'incremental',
        status='em_andamento',
        data_hora_inicio=timezone.now()
    )
    
    try:
        # PASSO 1: Verificar e descomprimir arquivos ZIP
        print("=== VERIFICANDO ARQUIVOS ZIP ===")
        if not descomprimir_zip_se_existir():
            print("❌ Erro na descompressão de arquivo ZIP. Processamento interrompido.")
            processamento.status = 'erro'
            processamento.erro = "Erro na descompressão de arquivo ZIP"
            processamento.save()
            return {
                'success': False,
                'message': 'Erro na descompressão de arquivo ZIP',
                'error': 'Erro na descompressão de arquivo ZIP'
            }
        
        # PASSO 2: Organizar subdiretórios se necessário
        print("=== VERIFICANDO SUBDIRETÓRIOS ===")
        organizar_subdiretorios_se_necessario()
        
        # PASSO 3: Busca arquivos para processar
        input_dir = Path(ATTR_FIN_DIR_INPUT)
        if not input_dir.exists():
            raise Exception(f"Diretório {ATTR_FIN_DIR_INPUT} não encontrado!")
        
        # Filtra por tipo de arquivo
        extensoes_aceitas = ['.jpg', '.jpeg', '.png', '.pdf']
        arquivos = [
            f for f in input_dir.iterdir()
            if f.is_file() and f.suffix.lower() in extensoes_aceitas
        ]
        
        if not arquivos:
            print("Nenhum arquivo encontrado para processar.")
            processamento.status = 'concluido'
            processamento.mensagem = "Nenhum arquivo encontrado"
            processamento.save()
            return {
                'success': True,
                'message': 'Nenhum arquivo encontrado para processar',
                'arquivos_processados': 0,
                'arquivos_erro': 0
            }
        
        print(f"Encontrados {len(arquivos)} arquivos para processar")
        
        # Processa arquivos em paralelo
        resultados = []
        with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
            # Submete todas as tarefas
            future_to_arquivo = {
                executor.submit(processar_arquivo_individual, str(arquivo), processamento.id, force): arquivo
                for arquivo in arquivos
            }
            
            # Coleta resultados
            for future in concurrent.futures.as_completed(future_to_arquivo):
                arquivo = future_to_arquivo[future]
                try:
                    resultado = future.result()
                    resultados.append(resultado)
                    
                    if resultado['success']:
                        if resultado.get('skipped'):
                            print(f"⏭️  {arquivo.name}: {resultado['message']}")
                        else:
                            print(f"✅ {arquivo.name}: {resultado['message']}")
                    else:
                        print(f"❌ {arquivo.name}: {resultado['message']}")
                        
                except Exception as e:
                    erro_resultado = {
                        'success': False,
                        'message': f'Erro inesperado: {str(e)}',
                        'error': str(e)
                    }
                    resultados.append(erro_resultado)
                    print(f"❌ {arquivo.name}: Erro inesperado - {str(e)}")
        
        # Atualiza estatísticas do processamento
        arquivos_processados = len([r for r in resultados if r['success'] and not r.get('skipped')])
        arquivos_erro = len([r for r in resultados if not r['success']])
        arquivos_pulados = len([r for r in resultados if r.get('skipped')])
        
        # PASSO 4: Move arquivos processados para imgs/
        print("\n=== MOVENDO ARQUIVOS PROCESSADOS ===")
        arquivos_movidos = mover_arquivos_processados()
        
        processamento.status = 'concluido'
        processamento.data_hora_fim = timezone.now()
        processamento.arquivos_processados = arquivos_processados
        processamento.arquivos_erro = arquivos_erro
        processamento.mensagem = f"Processamento concluído: {arquivos_processados} processados, {arquivos_erro} erros, {arquivos_pulados} pulados, {arquivos_movidos} movidos"
        processamento.save()
        
        print(f"\n=== RESUMO DO PROCESSAMENTO ===")
        print(f"✅ Arquivos processados: {arquivos_processados}")
        print(f"❌ Arquivos com erro: {arquivos_erro}")
        print(f"⏭️  Arquivos pulados: {arquivos_pulados}")
        print(f"📁 Arquivos movidos: {arquivos_movidos}")
        print(f"📊 Total de arquivos: {len(arquivos)}")
        
        return {
            'success': True,
            'message': 'Processamento paralelo concluído com sucesso',
            'arquivos_processados': arquivos_processados,
            'arquivos_erro': arquivos_erro,
            'arquivos_pulados': arquivos_pulados,
            'arquivos_movidos': arquivos_movidos,
            'total_arquivos': len(arquivos),
            'processamento_id': processamento.id
        }
        
    except Exception as e:
        # Atualiza status de erro
        processamento.status = 'erro'
        processamento.data_hora_fim = timezone.now()
        processamento.erro = str(e)
        processamento.save()
        
        print(f"❌ Erro durante o processamento: {str(e)}")
        return {
            'success': False,
            'message': f'Erro durante o processamento: {str(e)}',
            'error': str(e),
            'processamento_id': processamento.id
        }





# Removido: função duplicada - usar organizar_arquivos_extraidos de utils.py


# Removido: função duplicada - usar organizar_subdiretorios_se_necessario de utils.py


# Removido: função duplicada - usar mover_arquivos_processados de utils.py


# Removido: função não utilizada - processar_por_tipo_paralelo não é importada em lugar nenhum 