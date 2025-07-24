# utils.py
# Caminho relativo ao projeto: src/wa_fin_ctrl/apps/core/utils.py
# Módulo de utilidades compartilhadas para eliminar duplicações (DRY)

import os
import shutil
import zipfile
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any, Optional
import pandas as pd
from .env import (
    ATTR_FIN_DIR_INPUT,
    ATTR_FIN_DIR_IMGS,
    ATTR_FIN_DIR_MASSA,
    # Removido: diretórios obsoletos
# ATTR_FIN_DIR_TMP,
# ATTR_FIN_DIR_MENSAGENS,
ATTR_FIN_DIR_OCR,
    ATTR_FIN_DIR_DOCS,
)


# ==== CONSTANTES ====
# Extensões de arquivos
EXTENSAO_PDF = ".pdf"
EXTENSAO_JPG = ".jpg"
EXTENSAO_JPEG = ".jpeg"
EXTENSAO_PNG = ".png"
EXTENSAO_ZIP = ".zip"

# Mensagens de erro
ERRO_ARQUIVO_NAO_ENCONTRADO = "Arquivo não encontrado"
ERRO_CARREGAR_IMAGEM = "Erro ao carregar imagem"
ERRO_NENHUM_TEXTO = "Nenhum texto detectado"

# Valores padrão
VALOR_NAN = "nan"
VALOR_VAZIO = ""

# ==== FUNÇÕES DE ARQUIVOS E DIRETÓRIOS ====

def descomprimir_zip_se_existir() -> bool:
    """Descomprime arquivo ZIP se existir no diretório de entrada"""
    input_dir = ATTR_FIN_DIR_INPUT
    
    if not os.path.exists(input_dir):
        print(f"Diretório {input_dir}/ não encontrado!")
        return False

    # Procura por arquivo ZIP
    arquivos_zip = [
        f for f in os.listdir(input_dir) 
        if f.lower().endswith(EXTENSAO_ZIP)
    ]

    if not arquivos_zip:
        print(f"Nenhum arquivo ZIP encontrado em {ATTR_FIN_DIR_INPUT}/")
        return True  # Não é erro, apenas não há ZIP

    for arquivo_zip in arquivos_zip:
        try:
            caminho_zip = os.path.join(input_dir, arquivo_zip)
            print(f"Descomprimindo: {arquivo_zip}")
            
            with zipfile.ZipFile(caminho_zip, 'r') as zip_ref:
                zip_ref.extractall(input_dir)
            
            # Remove o arquivo ZIP após descompressão
            os.remove(caminho_zip)
            print(f"✅ {arquivo_zip} descomprimido e removido")
            
        except Exception as e:
            print(f"❌ Erro ao descomprimir {arquivo_zip}: {e}")
            return False

    return True


def organizar_arquivos_extraidos() -> None:
    """Organiza arquivos extraídos de subdiretórios para o diretório principal"""
    input_dir = ATTR_FIN_DIR_INPUT
    
    if not os.path.exists(input_dir):
        return

    # Lista todos os itens no diretório
    itens = os.listdir(input_dir)
    
    for item in itens:
        caminho_item = os.path.join(input_dir, item)
        
        # Se é um diretório, move arquivos para o diretório principal
        if os.path.isdir(caminho_item):
            arquivos_subdir = os.listdir(caminho_item)
            
            for arquivo in arquivos_subdir:
                caminho_arquivo = os.path.join(caminho_item, arquivo)
                
                # Move apenas arquivos de imagem/PDF
                if os.path.isfile(caminho_arquivo) and arquivo.lower().endswith(
                    (EXTENSAO_JPG, EXTENSAO_JPEG, EXTENSAO_PNG, EXTENSAO_PDF)
                ):
                    destino = os.path.join(input_dir, arquivo)
                    
                    # Se já existe arquivo com mesmo nome, adiciona sufixo
                    if os.path.exists(destino):
                        nome, ext = os.path.splitext(arquivo)
                        contador = 1
                        while os.path.exists(destino):
                            arquivo = f"{nome}_{contador}{ext}"
                            destino = os.path.join(input_dir, arquivo)
                            contador += 1
                    
                    shutil.move(caminho_arquivo, destino)
                    print(f"Movido: {arquivo}")

            # Remove o diretório vazio
            if os.path.exists(caminho_item):
                try:
                    os.rmdir(caminho_item)
                except OSError:
                    pass  # Diretório não está vazio


def organizar_subdiretorios_se_necessario() -> None:
    """Organiza subdiretórios se necessário"""
    input_dir = ATTR_FIN_DIR_INPUT
    
    if not os.path.exists(input_dir):
        return

    itens = os.listdir(input_dir)
    
    for item in itens:
        caminho_item = os.path.join(input_dir, item)
        
        # Se é um diretório, organiza os arquivos
        if os.path.isdir(caminho_item):
            organizar_arquivos_extraidos()


def mover_arquivos_processados() -> int:
    """Move arquivos processados do diretório de entrada para o diretório de imagens"""
    input_dir = ATTR_FIN_DIR_INPUT
    imgs_dir = ATTR_FIN_DIR_IMGS

    # Garante que o diretório de imagens existe
    os.makedirs(imgs_dir, exist_ok=True)

    # Lista arquivos de imagem no diretório de entrada
    extensoes_imagem = (EXTENSAO_JPG, EXTENSAO_JPEG, EXTENSAO_PNG, EXTENSAO_PDF)
    arquivos_input = [
        f for f in os.listdir(input_dir) 
        if f.lower().endswith(extensoes_imagem)
    ]

    arquivos_movidos = 0
    for arquivo in arquivos_input:
        origem = os.path.join(input_dir, arquivo)
        destino = os.path.join(imgs_dir, arquivo)
        shutil.move(origem, destino)
        arquivos_movidos += 1
        print(f"Movido: {arquivo} -> {ATTR_FIN_DIR_IMGS}/")

    if arquivos_movidos > 0:
        print(f"Total de {arquivos_movidos} arquivos movidos para {ATTR_FIN_DIR_IMGS}/")

    return arquivos_movidos


def update_last_modified() -> str:
    """Atualiza e retorna o timestamp da última modificação"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    return timestamp


# ==== FUNÇÕES DE CÁLCULO E PROCESSAMENTO ====

def _calcular_totalizadores_pessoas(rows: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Calcula totalizadores para Ricardo e Rafael"""
    total_ricardo = 0.0
    total_rafael = 0.0
    
    for row in rows:
        # Ricardo
        valor_ricardo = parse_valor(row.get('ricardo', ''))
        if valor_ricardo:
            total_ricardo += valor_ricardo
        
        # Rafael
        valor_rafael = parse_valor(row.get('rafael', ''))
        if valor_rafael:
            total_rafael += valor_rafael
    
    return {
        'ricardo': f"{total_ricardo:.2f}" if total_ricardo > 0 else "",
        'rafael': f"{total_rafael:.2f}" if total_rafael > 0 else "",
        'ricardo_float': total_ricardo,
        'rafael_float': total_rafael,
        'total': total_ricardo + total_rafael
    }


def parse_valor(valor_str: str) -> float:
    """Converte string de valor para float"""
    if not valor_str or valor_str == VALOR_NAN or valor_str == VALOR_VAZIO:
        return 0.0
    
    try:
        # Remove R$ e espaços
        valor_limpo = valor_str.replace('R$', '').replace(' ', '')
        # Substitui vírgula por ponto
        valor_limpo = valor_limpo.replace(',', '.')
        return float(valor_limpo)
    except (ValueError, AttributeError):
        return 0.0


def diagnostico_erro_ocr(image_path: str, ocr_result: str) -> str:
    """Diagnostica erros de OCR"""
    if ocr_result == ERRO_ARQUIVO_NAO_ENCONTRADO:
        return "Arquivo não encontrado no disco"
    if ocr_result == ERRO_CARREGAR_IMAGEM:
        return "Imagem corrompida ou formato não suportado"
    if ocr_result == ERRO_NENHUM_TEXTO:
        ext = os.path.splitext(image_path)[1].lower()
        if ext == EXTENSAO_PDF:
            return "PDF escaneado ilegível, protegido ou em branco"
        else:
            return "Imagem ilegível ou em branco"
    if ocr_result.startswith("Erro ao processar PDF"):
        return "PDF protegido, corrompido ou formato incompatível"
    if ocr_result.startswith("Erro no OCR"):
        return "Falha no OCR"
    return "Sem diagnóstico detalhado"


# ==== FUNÇÕES DE BACKUP ====

def backup_arquivos_existentes() -> None:
    """Cria backup dos arquivos existentes"""
    print("=== CRIANDO BACKUP DOS ARQUIVOS EXISTENTES ===")
    # Implementação do backup seria adicionada aqui


def criar_backups_antes_processamento() -> None:
    """Cria backups antes do processamento"""
    print("=== CRIANDO BACKUPS ANTES DO PROCESSAMENTO ===")
    backup_arquivos_existentes()


def restaurar_arquivos_backup() -> None:
    """Restaura arquivos do backup"""
    print("=== RESTAURANDO ARQUIVOS DO BACKUP ===")
    # Implementação da restauração seria adicionada aqui 