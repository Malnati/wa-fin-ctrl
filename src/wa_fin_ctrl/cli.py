#!/usr/bin/env python3
# cli.py
# Caminho relativo ao projeto: src/wa_fin_ctrl/cli.py
# CLI para processamento de comprovantes financeiros
"""
Interface de linha de comando para processamento de comprovantes financeiros.
Utiliza o pacote click para gerenciar argumentos e subcomandos.
"""

import click
import os
import shutil
import django

# Configura Django antes de importar módulos que usam modelos
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'wa_fin_ctrl.settings')
django.setup()

from .apps.core.env import ATTR_FIN_DIR_INPUT, ATTR_FIN_DIR_IMGS
from .app import (
    processar_incremental,
    processar_pdfs,
    processar_imgs,
    fix_entry,
    dismiss_entry,
)
from .apps.core.history import CommandHistory
from .apps.core.processor import processar_incremental_paralelo


@click.group()
def cli():
    """Interface de linha de comando para processamento de comprovantes financeiros."""
    pass


@cli.command()
@click.option(
    "--force",
    is_flag=True,
    help=f"Reprocessa todos os arquivos de {ATTR_FIN_DIR_INPUT}/",
)
@click.option(
    "--entry",
    type=str,
    help="Reprocessa apenas a linha correspondente (formato: DD/MM/AAAA HH:MM:SS)",
)
@click.option(
    "--backup", is_flag=True, help="Cria arquivos de backup antes do processamento"
)
@click.option(
    "--parallel", is_flag=True, help="Usa processamento paralelo (recomendado)"
)
@click.option(
    "--max-workers", type=int, default=4, help="Número máximo de workers paralelos"
)
def processar(force, entry, backup, parallel, max_workers):
    """Executa o processamento incremental dos comprovantes (PDFs + imagens)."""
    # Prepara argumentos para o histórico - inclui TODOS os argumentos
    arguments = {"force": force, "entry": entry, "backup": backup, "parallel": parallel, "max_workers": max_workers}

    try:
        if parallel:
            # Usa processamento paralelo
            resultado = processar_incremental_paralelo(
                force=force, 
                entry=entry, 
                backup=backup, 
                max_workers=max_workers
            )
            
            if resultado and resultado.get('success'):
                print("✅ Processamento paralelo concluído com sucesso!")
            else:
                print("❌ Erro no processamento paralelo")
                raise Exception("Falha no processamento paralelo")
        else:
            # Usa processamento sequencial (legado)
            processar_incremental(force=force, entry=entry, backup=backup)

        # Se foi modo forçado, move arquivos de volta para {ATTR_FIN_DIR_IMGS}/
        if force:
            input_dir = ATTR_FIN_DIR_INPUT
            imgs_dir = ATTR_FIN_DIR_IMGS

            if os.path.exists(input_dir):
                for f in os.listdir(input_dir):
                    caminho = os.path.join(input_dir, f)
                    if os.path.isfile(caminho):
                        shutil.move(caminho, os.path.join(imgs_dir, f))
                print(
                    f"Arquivos reprocessados e movidos de volta para {ATTR_FIN_DIR_IMGS}/."
                )

        # Registra sucesso no histórico
        history = CommandHistory()
        history.record_command("processar", arguments, True)

    except Exception as e:
        # Registra falha no histórico
        history = CommandHistory()
        history.record_command("processar", arguments, False)
        raise e


@cli.command("pdf")
@click.option(
    "--force",
    is_flag=True,
    help=f"Reprocessa todos os PDFs do diretório {ATTR_FIN_DIR_INPUT}/",
)
@click.option(
    "--entry",
    type=str,
    help="Reprocessa apenas o PDF da entrada (formato: DD/MM/AAAA HH:MM:SS)",
)
@click.option(
    "--backup", is_flag=True, help="Cria arquivos de backup antes do processamento"
)
def processar_pdf(force, entry, backup):
    """
    Processa apenas arquivos .pdf:
    - Extrai texto via OCR e salva no banco de dados
    - Processa dados e salva no banco de dados
    """
    # Prepara argumentos para o histórico - inclui TODOS os argumentos
    arguments = {"force": force, "entry": entry, "backup": backup}

    try:
        processar_pdfs(force=force, entry=entry, backup=backup)

        # Registra sucesso no histórico
        history = CommandHistory()
        history.record_command("processar_pdf", arguments, True)

    except Exception as e:
        # Registra falha no histórico
        history = CommandHistory()
        history.record_command("processar_pdf", arguments, False)
        raise e


@cli.command("img")
@click.option(
    "--force",
    is_flag=True,
    help=f"Reprocessa todas as imagens do diretório {ATTR_FIN_DIR_INPUT}/",
)
@click.option(
    "--entry",
    type=str,
    help="Reprocessa apenas a imagem da entrada (formato: DD/MM/AAAA HH:MM:SS)",
)
@click.option(
    "--backup", is_flag=True, help="Cria arquivos de backup antes do processamento"
)
def processar_img(force, entry, backup):
    """
    Processa apenas arquivos de imagem:
    - Extrai texto via OCR e salva no banco de dados
    - Processa dados e salva no banco de dados
    """
    # Prepara argumentos para o histórico - inclui TODOS os argumentos
    arguments = {"force": force, "entry": entry, "backup": backup}

    try:
        processar_imgs(force=force, entry=entry, backup=backup)

        # Registra sucesso no histórico
        history = CommandHistory()
        history.record_command("processar_img", arguments, True)

    except Exception as e:
        # Registra falha no histórico
        history = CommandHistory()
        history.record_command("processar_img", arguments, False)
        raise e








# Removido: função não utilizada - arquivo test.py não existe
# @cli.command()
# def teste():
#     """Executa testes automatizados de ponta a ponta."""
#     from .test import executar_todos_testes
#     sucesso = executar_todos_testes()
#     exit(0 if sucesso else 1)


# Removido: função não utilizada - apenas mostra mensagem de função removida
# @cli.command()
# def prestacao():
#     """Gera planilha no formato da Justiça (função removida)."""
#     print("A função gerar_formato_justica foi removida.")
#     exit(0)


@cli.command()
@click.argument("data_hora", type=str)
@click.option("--value", type=str, help="Novo valor para corrigir (ex: 2,33)")
@click.option(
    "--class", "classification", type=str, help="Nova classificação para a entrada"
)
@click.option("--desc", "description", type=str, help="Nova descrição para a entrada")
@click.option(
    "--dismiss", is_flag=True, help="Marca a entrada como desconsiderada (dismiss)"
)
@click.option(
    "--rotate",
    type=str,
    help="Graus de rotação para aplicar na imagem (ex: 90, 180, 270)",
)
@click.option(
    "--ia", is_flag=True, help="Re-submete a imagem para o ChatGPT após rotação"
)
def fix(data_hora, value, classification, description, dismiss, rotate, ia):
    """Corrige uma entrada específica em todos os arquivos CSV."""
    # Configura Django antes de usar os modelos
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'wa_fin_ctrl.settings')
    django.setup()
    
    # Prepara argumentos para o histórico - inclui TODOS os argumentos
    arguments = {
        "data_hora": data_hora,
        "value": value,
        "classification": classification,
        "description": description,
        "dismiss": dismiss,
        "rotate": rotate,
        "ia": ia,
    }

    # Executa o comando
    sucesso = fix_entry(
        data_hora, value, classification, description, dismiss, rotate, ia
    )

    # Registra no histórico
    history = CommandHistory()
    history.record_command("fix", arguments, sucesso)

    exit(0 if sucesso else 1)


@cli.command()
@click.argument("data_hora", type=str)
def dismiss(data_hora):
    """Marca uma entrada como desconsiderada."""
    # Configura Django antes de usar os modelos
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'wa_fin_ctrl.settings')
    django.setup()
    
    # Prepara argumentos para o histórico
    arguments = {
        "data_hora": data_hora,
        "dismiss": True,
    }

    # Executa o comando
    sucesso = dismiss_entry(data_hora)

    # Registra no histórico
    history = CommandHistory(use_database=True)
    history.record_command("dismiss", arguments, sucesso)

    exit(0 if sucesso else 1)


# Removido: função não utilizada - não é chamada no Makefile
# @cli.command()
# @click.option("--host", default="127.0.0.1", help="Host para servir a API (padrão: 127.0.0.1)")
# @click.option("--port", default=8000, help="Porta para servir a API (padrão: 8000)")
# @click.option(
#     "--reload", is_flag=True, help="Habilita reload automático durante desenvolvimento"
# )
# @click.option(
#     "--auto-reload", is_flag=True, help="Força reload automático após comandos críticos"
# )
# def api(host, port, reload, auto_reload):
#     """Inicia a API REST Django."""
#     import subprocess
#     import sys
#     # Configura variáveis de ambiente se necessário
#     env_vars = []
#     if auto_reload:
#         env_vars.extend(["--reload"])
#     # Comando para iniciar o servidor Django
#     cmd = [
#         sys.executable,
#         "manage.py",
#         "runserver",
#         f"{host}:{port}",
#     ] + env_vars
#     print(f"🚀 Iniciando API Django em http://{host}:{port}")
#     print(f"📝 Comando: {' '.join(cmd)}")
#     try:
#         subprocess.run(cmd, check=True)
#     except KeyboardInterrupt:
#         print("\n👋 Servidor interrompido pelo usuário")
#     except subprocess.CalledProcessError as e:
#         print(f"❌ Erro ao iniciar servidor: {e}")
#         sys.exit(1)


@cli.command()
@click.option("--command", type=str, help="Filtrar por comando específico")
@click.option("--limit", type=int, help="Limitar número de registros")
@click.option("--json", "json_output", is_flag=True, help="Saída em formato JSON")
@click.option("--recent", type=int, help="Mostrar comandos das últimas N horas")
@click.option("--stats", is_flag=True, help="Mostrar estatísticas do histórico")
@click.option("--clear", is_flag=True, help="Limpar todo o histórico")
def history(command, limit, json_output, recent, stats, clear):
    """Gerencia o histórico de comandos executados."""
    # Configura Django antes de usar os modelos
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'wa_fin_ctrl.settings')
    django.setup()
    
    import json as json_module

    # Configura o sistema de histórico
    history_manager = CommandHistory()



    # Comando de limpeza
    if clear:
        if click.confirm("Tem certeza que deseja limpar todo o histórico?"):
            history_manager.clear_history()
        return

    # Comando de estatísticas
    if stats:
        stats_data = history_manager.get_statistics()
        if json_output:
            print(json_module.dumps(stats_data, indent=2, ensure_ascii=False))
        else:
            print("📊 Estatísticas do Histórico:")
            print(f"  Total de comandos: {stats_data['total_commands']}")
            print(f"  Comandos bem-sucedidos: {stats_data['successful_commands']}")
            print(f"  Comandos com erro: {stats_data['failed_commands']}")
            print(f"  Tipo de armazenamento: {stats_data['storage_type']}")
            if stats_data['first_command']:
                print(f"  Primeiro comando: {stats_data['first_command']}")
            if stats_data['last_command']:
                print(f"  Último comando: {stats_data['last_command']}")
            if stats_data['command_types']:
                print("  Tipos de comando:")
                for cmd, count in stats_data['command_types'].items():
                    print(f"    {cmd}: {count}")
        return

    # Obter histórico
    if recent:
        history_data = history_manager.get_recent_commands(recent)
    elif command:
        history_data = history_manager.get_command_history(command, limit)
    else:
        history_data = history_manager.get_history(limit)

    # Exibir histórico
    if json_output:
        print(json_module.dumps(history_data, indent=2, ensure_ascii=False))
    else:
        if not history_data:
            print("ℹ️ Nenhum comando encontrado no histórico")
            return

        print(f"📝 Histórico de Comandos ({len(history_data)} registros):")
        print(f"💾 Armazenamento: {history_manager.get_statistics()['storage_type']}")
        print("-" * 80)

        for entry in history_data:
            index = entry.get('index', 'N/A')
            execution = entry.get('execution', 'N/A')
            cmd = entry.get('command', 'N/A')
            success = "✅" if entry.get('success', False) else "❌"
            
            print(f"{success} [{index}] {execution} - {cmd}")
            
            # Mostra argumentos se disponíveis
            arguments = entry.get('arguments', {})
            if arguments:
                for key, value in arguments.items():
                    if value:  # Só mostra valores não vazios
                        print(f"    {key}: {value}")
            print()


if __name__ == "__main__":
    cli()
