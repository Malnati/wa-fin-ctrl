#!/usr/bin/env python3
# cli.py
# Caminho relativo ao projeto: cli.py
# Interface de linha de comando para processamento de comprovantes financeiros
"""
Interface de linha de comando para processamento de comprovantes financeiros.
Utiliza o pacote click para gerenciar argumentos e subcomandos.
"""

import click
import os
import shutil
from env import *
from app import (
    processar_incremental, 
    verificar_totais, 
    corrigir_totalizadores_duplicados, 
    executar_testes_e2e
)

@click.group()
def cli():
    """Interface de linha de comando para processamento de comprovantes financeiros."""
    pass

@cli.command()
@click.option('--force', is_flag=True, help='Reprocessa todos os arquivos de input/')
@click.option('--entry', type=str, help='Reprocessa apenas a linha correspondente (formato: DD/MM/AAAA HH:MM:SS)')
def processar(force, entry):
    """Executa o processamento incremental dos comprovantes (PDFs + imagens)."""
    processar_incremental(force=force, entry=entry)
    
    # Se foi modo forçado, move arquivos de volta para imgs/
    if force:
        input_dir = ATTR_FIN_DIR_INPUT
        imgs_dir = ATTR_FIN_DIR_IMGS
        
        if os.path.exists(input_dir):
            for f in os.listdir(input_dir):
                caminho = os.path.join(input_dir, f)
                if os.path.isfile(caminho):
                    shutil.move(caminho, os.path.join(imgs_dir, f))
            print("Arquivos reprocessados e movidos de volta para imgs/.")

@cli.command('pdf')
@click.option('--force', is_flag=True, help='Reprocessa todos os PDFs do diretório input/')
@click.option('--entry', type=str, help='Reprocessa apenas o PDF da entrada (formato: DD/MM/AAAA HH:MM:SS)')
def processar_pdf(force, entry):
    """
    Processa apenas arquivos .pdf:
    - Extrai texto via OCR e registra em ocr-extract.xml
    - Atualiza mensagens/calculo.csv (somente entradas PDF)
    """
    from app import processar_pdfs
    processar_pdfs(force=force, entry=entry)

@cli.command('img')
@click.option('--force', is_flag=True, help='Reprocessa todas as imagens do diretório input/')
@click.option('--entry', type=str, help='Reprocessa apenas a imagem da entrada (formato: DD/MM/AAAA HH:MM:SS)')
def processar_img(force, entry):
    """
    Processa apenas arquivos de imagem:
    - Extrai texto via OCR e registra em ocr-extract.xml
    - Atualiza mensagens/calculo.csv (somente entradas IMG)
    """
    from app import processar_imgs
    processar_imgs(force=force, entry=entry)

@cli.command()
@click.argument('csv_file', type=click.Path(exists=True))
def verificar(csv_file):
    """Executa verificação dos totais no CSV informado."""
    verificar_totais(csv_file)

@cli.command()
@click.argument('csv_file', type=click.Path(exists=True))
def corrigir(csv_file):
    """Corrige totalizadores duplicados no CSV informado."""
    sucesso = corrigir_totalizadores_duplicados(csv_file)
    exit(0 if sucesso else 1)

@cli.command()
def teste():
    """Executa testes automatizados de ponta a ponta."""
    sucesso = executar_testes_e2e()
    exit(0 if sucesso else 1)

@cli.command()
def prestacao():
    """Gera planilha no formato da Justiça (função removida)."""
    print("A função gerar_formato_justica foi removida.")
    exit(0)

if __name__ == '__main__':
    cli() 