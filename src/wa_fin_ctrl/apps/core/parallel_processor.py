# parallel_processor.py
# Caminho relativo ao projeto: src/wa_fin_ctrl/apps/core/parallel_processor.py
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
        if not _descomprimir_zip_se_existir():
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
        _organizar_subdiretorios_se_necessario()
        
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
        arquivos_movidos = _mover_arquivos_processados()
        
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


def _descomprimir_zip_se_existir():
    """Verifica se existe apenas um arquivo ZIP no diretório de entrada e o descomprime"""
    input_dir = ATTR_FIN_DIR_INPUT

    # Verifica se o diretório input existe
    if not os.path.exists(input_dir):
        print(f"Diretório {ATTR_FIN_DIR_INPUT} não encontrado!")
        return False

    # Lista todos os arquivos no diretório de entrada
    todos_arquivos = os.listdir(input_dir)

    # Filtra apenas arquivos ZIP
    arquivos_zip = [f for f in todos_arquivos if f.lower().endswith(".zip")]

    # Verifica se existe apenas um arquivo ZIP
    if len(arquivos_zip) == 0:
        print(f"Nenhum arquivo ZIP encontrado em {ATTR_FIN_DIR_INPUT}/")
        return True  # Não é erro, apenas não há ZIP para processar

    if len(arquivos_zip) > 1:
        print(
            f"Encontrados {len(arquivos_zip)} arquivos ZIP em {ATTR_FIN_DIR_INPUT}/. Deve haver apenas um."
        )
        print(f"Arquivos ZIP encontrados: {arquivos_zip}")
        return False

    # Se chegou aqui, existe exatamente um arquivo ZIP
    arquivo_zip = arquivos_zip[0]
    caminho_zip = os.path.join(input_dir, arquivo_zip)

    print(f"Encontrado arquivo ZIP: {arquivo_zip}")
    print("Descomprimindo arquivo ZIP...")

    try:
        # Descomprime o arquivo ZIP
        with zipfile.ZipFile(caminho_zip, "r") as zip_ref:
            # Lista o conteúdo do ZIP antes de extrair
            lista_arquivos = zip_ref.namelist()
            print(f"Arquivos no ZIP: {len(lista_arquivos)} itens")

            # Extrai todos os arquivos para o diretório de entrada
            zip_ref.extractall(input_dir)

            print(f"✅ Arquivo ZIP descomprimido com sucesso!")
            print(f"Extraídos {len(lista_arquivos)} itens para {input_dir}/")

        # Remove o arquivo ZIP após descompressão bem-sucedida
        os.remove(caminho_zip)
        print(f"Arquivo ZIP {arquivo_zip} removido após descompressão")

        # Organiza arquivos extraídos - move tudo para o diretório de entrada diretamente
        _organizar_arquivos_extraidos()

        return True

    except zipfile.BadZipFile:
        print(f"❌ Erro: {arquivo_zip} não é um arquivo ZIP válido")
        return False
    except Exception as e:
        print(f"❌ Erro ao descomprimir {arquivo_zip}: {str(e)}")
        return False


def _organizar_arquivos_extraidos():
    """Move arquivos de subdiretórios para o diretório de entrada diretamente e remove diretórios desnecessários"""
    input_dir = ATTR_FIN_DIR_INPUT
    extensoes_validas = (".jpg", ".jpeg", ".png", ".pdf", ".txt")

    arquivos_movidos = 0
    diretorios_removidos = 0

    # Percorre todos os itens no diretório de entrada
    for item in os.listdir(input_dir):
        caminho_item = os.path.join(input_dir, item)

        # Se é um diretório
        if os.path.isdir(caminho_item):
            # Ignora diretório __MACOSX (arquivos do macOS)
            if item.startswith("__MACOSX"):
                print(f"Removendo diretório __MACOSX: {item}")
                shutil.rmtree(caminho_item)
                diretorios_removidos += 1
                continue

            # Para outros diretórios, move arquivos válidos para o diretório de entrada
            print(f"Processando subdiretório: {item}")
            for arquivo in os.listdir(caminho_item):
                caminho_arquivo = os.path.join(caminho_item, arquivo)

                # Se é um arquivo e tem extensão válida
                if os.path.isfile(caminho_arquivo) and arquivo.lower().endswith(
                    extensoes_validas
                ):
                    destino = os.path.join(input_dir, arquivo)

                    # Se já existe arquivo com mesmo nome, adiciona sufixo
                    contador = 1
                    arquivo_original = arquivo
                    while os.path.exists(destino):
                        nome, ext = os.path.splitext(arquivo_original)
                        arquivo = f"{nome}_{contador}{ext}"
                        destino = os.path.join(input_dir, arquivo)
                        contador += 1

                    # Move o arquivo
                    shutil.move(caminho_arquivo, destino)
                    print(f"Movido: {item}/{arquivo_original} -> {arquivo}")
                    arquivos_movidos += 1

            # Remove o diretório vazio
            try:
                os.rmdir(caminho_item)
                diretorios_removidos += 1
            except OSError:
                print(f"⚠️  Diretório {item} não pôde ser removido (não está vazio)")

    if arquivos_movidos > 0:
        print(f"✅ {arquivos_movidos} arquivos movidos para {input_dir}/")
    if diretorios_removidos > 0:
        print(f"✅ {diretorios_removidos} diretórios removidos")


def _organizar_subdiretorios_se_necessario():
    """Verifica se há subdiretórios no diretório de entrada e organiza arquivos se necessário"""
    input_dir = ATTR_FIN_DIR_INPUT

    if not os.path.exists(input_dir):
        return

    # Verifica se há subdiretórios
    subdiretorios = [
        item
        for item in os.listdir(input_dir)
        if os.path.isdir(os.path.join(input_dir, item))
    ]

    if not subdiretorios:
        print(f"Nenhum subdiretório encontrado em {ATTR_FIN_DIR_INPUT}/")
        return

    print(f"Subdiretórios encontrados: {subdiretorios}")

    # Organiza arquivos dos subdiretórios
    _organizar_arquivos_extraidos()


def _mover_arquivos_processados():
    """Move arquivos processados do diretório de entrada para o diretório de imagens"""
    input_dir = ATTR_FIN_DIR_INPUT
    imgs_dir = ATTR_FIN_DIR_IMGS
    
    # Garante que o diretório de imagens existe
    if not os.path.exists(imgs_dir):
        os.makedirs(imgs_dir, exist_ok=True)
        print(f"Diretório {imgs_dir}/ criado")
    
    # Lista arquivos de imagem e PDF no diretório de entrada
    extensoes_imagem = (".jpg", ".jpeg", ".png", ".pdf")
    arquivos_input = [
        f for f in os.listdir(input_dir) 
        if os.path.isfile(os.path.join(input_dir, f)) and f.lower().endswith(extensoes_imagem)
    ]
    
    if not arquivos_input:
        print(f"Nenhum arquivo para mover de {input_dir}/")
        return 0
    
    arquivos_movidos = 0
    for arquivo in arquivos_input:
        origem = os.path.join(input_dir, arquivo)
        destino = os.path.join(imgs_dir, arquivo)
        
        # Se já existe arquivo com mesmo nome no diretório de imagens, adiciona sufixo
        contador = 1
        arquivo_original = arquivo
        while os.path.exists(destino):
            nome, ext = os.path.splitext(arquivo_original)
            arquivo = f"{nome}_{contador}{ext}"
            destino = os.path.join(imgs_dir, arquivo)
            contador += 1
        
        try:
            shutil.move(origem, destino)
            print(f"Movido: {arquivo_original} -> {imgs_dir}/")
            arquivos_movidos += 1
        except Exception as e:
            print(f"❌ Erro ao mover {arquivo_original}: {str(e)}")
    
    # Verifica se ainda há arquivos no diretório de entrada
    arquivos_restantes = os.listdir(input_dir)
    if not arquivos_restantes:
        print(f"✅ Diretório {input_dir}/ está vazio - processamento concluído")
    else:
        print(f"⚠️  Arquivos restantes em {input_dir}/: {arquivos_restantes}")
    
    print(f"✅ {arquivos_movidos} arquivos movidos para {imgs_dir}/")
    return arquivos_movidos


def processar_por_tipo_paralelo(tipo='todos', force=False, max_workers=4):
    """
    Processa arquivos por tipo específico em paralelo.
    
    Args:
        tipo: 'pdf', 'img', ou 'todos'
        force: Se True, reprocessa todos os arquivos
        max_workers: Número máximo de workers paralelos
    
    Returns:
        dict: Resultado do processamento
    """
    print(f"=== INICIANDO PROCESSAMENTO PARALELO DE {tipo.upper()} ===")
    
    # Cria registro de processamento
    processamento = Processamento.objects.create(
        tipo='force' if force else 'incremental',
        status='em_andamento',
        data_hora_inicio=timezone.now()
    )
    
    try:
        # Busca arquivos por tipo
        input_dir = Path(ATTR_FIN_DIR_INPUT)
        if not input_dir.exists():
            raise Exception(f"Diretório {ATTR_FIN_DIR_INPUT} não encontrado!")
        
        if tipo == 'pdf':
            extensoes = ['.pdf']
            tipo_processamento = 'PDFs'
        elif tipo == 'img':
            extensoes = ['.jpg', '.jpeg', '.png']
            tipo_processamento = 'Imagens'
        else:
            extensoes = ['.jpg', '.jpeg', '.png', '.pdf']
            tipo_processamento = 'Todos os arquivos'
        
        arquivos = [
            f for f in input_dir.iterdir()
            if f.is_file() and f.suffix.lower() in extensoes
        ]
        
        if not arquivos:
            print(f"Nenhum {tipo_processamento.lower()} encontrado para processar.")
            processamento.status = 'concluido'
            processamento.mensagem = f"Nenhum {tipo_processamento.lower()} encontrado"
            processamento.save()
            return {
                'success': True,
                'message': f'Nenhum {tipo_processamento.lower()} encontrado para processar',
                'arquivos_processados': 0,
                'arquivos_erro': 0
            }
        
        print(f"Encontrados {len(arquivos)} {tipo_processamento.lower()} para processar")
        
        # Processa arquivos em paralelo
        resultados = []
        with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
            future_to_arquivo = {
                executor.submit(processar_arquivo_individual, str(arquivo), processamento.id, force): arquivo
                for arquivo in arquivos
            }
            
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
        
        # Atualiza estatísticas
        arquivos_processados = len([r for r in resultados if r['success'] and not r.get('skipped')])
        arquivos_erro = len([r for r in resultados if not r['success']])
        arquivos_pulados = len([r for r in resultados if r.get('skipped')])
        
        processamento.status = 'concluido'
        processamento.data_hora_fim = timezone.now()
        processamento.arquivos_processados = arquivos_processados
        processamento.arquivos_erro = arquivos_erro
        processamento.mensagem = f"Processamento de {tipo_processamento} concluído: {arquivos_processados} processados, {arquivos_erro} erros, {arquivos_pulados} pulados"
        processamento.save()
        
        print(f"\n=== RESUMO DO PROCESSAMENTO DE {tipo_processamento.upper()} ===")
        print(f"✅ Arquivos processados: {arquivos_processados}")
        print(f"❌ Arquivos com erro: {arquivos_erro}")
        print(f"⏭️  Arquivos pulados: {arquivos_pulados}")
        print(f"📊 Total de arquivos: {len(arquivos)}")
        
        return {
            'success': True,
            'message': f'Processamento de {tipo_processamento} concluído com sucesso',
            'arquivos_processados': arquivos_processados,
            'arquivos_erro': arquivos_erro,
            'arquivos_pulados': arquivos_pulados,
            'total_arquivos': len(arquivos),
            'processamento_id': processamento.id
        }
        
    except Exception as e:
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