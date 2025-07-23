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
from .env import ATTR_FIN_DIR_INPUT, ATTR_FIN_DIR_IMGS
from .app import (
    processar_incremental,
    verificar_totais,
    corrigir_totalizadores_duplicados,
    dismiss_entry,
    fix_entry,
)


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
    from .history import CommandHistory

    # Prepara argumentos para o histórico - inclui TODOS os argumentos
    arguments = {"force": force, "entry": entry, "backup": backup, "parallel": parallel, "max_workers": max_workers}

    try:
        if parallel:
            # Configura Django antes de importar módulos que usam modelos
            import os
            import django
            os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'wa_fin_ctrl.settings')
            django.setup()
            
            # Usa processamento paralelo
            from .apps.core.parallel_processor import processar_incremental_paralelo
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
    - Extrai texto via OCR e registra em ocr-extract.xml
    - Atualiza {ATTR_FIN_ARQ_CALCULO} (somente entradas PDF)
    """
    from .history import CommandHistory

    # Prepara argumentos para o histórico - inclui TODOS os argumentos
    arguments = {"force": force, "entry": entry, "backup": backup}

    try:
        from .app import processar_pdfs

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
    - Extrai texto via OCR e registra em ocr-extract.xml
    - Atualiza {ATTR_FIN_ARQ_CALCULO} (somente entradas IMG)
    """
    from .history import CommandHistory

    # Prepara argumentos para o histórico - inclui TODOS os argumentos
    arguments = {"force": force, "entry": entry, "backup": backup}

    try:
        from .app import processar_imgs

        processar_imgs(force=force, entry=entry, backup=backup)

        # Registra sucesso no histórico
        history = CommandHistory()
        history.record_command("processar_img", arguments, True)

    except Exception as e:
        # Registra falha no histórico
        history = CommandHistory()
        history.record_command("processar_img", arguments, False)
        raise e


@cli.command()
@click.argument("csv_file", type=click.Path(exists=True))
def verificar(csv_file):
    """Executa verificação dos totais no CSV informado."""
    verificar_totais(csv_file)


@cli.command()
@click.argument("csv_file", type=click.Path(exists=True))
def corrigir(csv_file):
    """Corrige totalizadores duplicados no CSV informado."""
    from .history import CommandHistory

    arguments = {"csv_file": csv_file}

    sucesso = corrigir_totalizadores_duplicados(csv_file)

    # Registra no histórico
    history = CommandHistory()
    history.record_command("corrigir", arguments, sucesso)

    exit(0 if sucesso else 1)


@cli.command()
def teste():
    """Executa testes automatizados de ponta a ponta."""
    from .test import executar_todos_testes

    sucesso = executar_todos_testes()
    exit(0 if sucesso else 1)


@cli.command()
def prestacao():
    """Gera planilha no formato da Justiça (função removida)."""
    print("A função gerar_formato_justica foi removida.")
    exit(0)


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
    from .history import CommandHistory

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
    """Marca uma entrada como desconsiderada (dismiss) em todos os arquivos CSV."""
    from .history import CommandHistory

    # Prepara argumentos para o histórico
    arguments = {"data_hora": data_hora}

    # Executa o comando
    sucesso = dismiss_entry(data_hora)

    # Registra no histórico
    history = CommandHistory()
    history.record_command("dismiss", arguments, sucesso)

    exit(0 if sucesso else 1)


@cli.command()
@click.option(
    "--host", default="127.0.0.1", help="Host para servir a API (padrão: 127.0.0.1)"
)
@click.option("--port", default=8000, help="Porta para servir a API (padrão: 8000)")
@click.option(
    "--reload", is_flag=True, help="Habilita reload automático durante desenvolvimento"
)
@click.option(
    "--auto-reload", is_flag=True, help="Força reload automático após comandos críticos"
)
def api(host, port, reload, auto_reload):
    """Inicia o servidor da API REST FastAPI."""
    import uvicorn
    from .api import app

    print(f"🚀 Iniciando API REST em http://{host}:{port}")
    print(f"📚 Documentação: http://{host}:{port}/docs")
    print(f"🔍 Health check: http://{host}:{port}/health")
    print(f"📊 Página principal: http://{host}:{port}/")
    print(f"📋 Lista de relatórios: http://{host}:{port}/api/reports")
    print(f"ℹ️  Info da API: http://{host}:{port}/api/info")
    if auto_reload:
        print(f"🔄 Auto-reload habilitado após comandos críticos")
    print("⏹️  Pressione Ctrl+C para parar o servidor")

    uvicorn.run("wa_fin_ctrl.api:app", host=host, port=port, reload=reload)





@cli.command()
@click.option("--command", type=str, help="Filtrar por comando específico")
@click.option("--limit", type=int, help="Limitar número de registros")
@click.option("--json", is_flag=True, help="Saída em formato JSON")
@click.option("--recent", type=int, help="Mostrar comandos das últimas N horas")
@click.option("--stats", is_flag=True, help="Mostrar estatísticas do histórico")
@click.option("--clear", is_flag=True, help="Limpar todo o histórico")
def history(command, limit, json, recent, stats, clear):
    """Exibe o histórico de comandos executados."""
    from .history import CommandHistory

    history_manager = CommandHistory()

    # Comando para limpar histórico
    if clear:
        history_manager.clear_history()
        return

    # Comando para mostrar estatísticas
    if stats:
        stats_data = history_manager.get_statistics()
        if json:
            import json as json_module

            print(json_module.dumps(stats_data, ensure_ascii=False, indent=2))
        else:
            print("📊 Estatísticas do Histórico:")
            print(f"  Total de comandos: {stats_data['total_commands']}")
            print(f"  Comandos bem-sucedidos: {stats_data['successful_commands']}")
            print(f"  Comandos com falha: {stats_data['failed_commands']}")
            print(f"  Primeiro comando: {stats_data['first_command']}")
            print(f"  Último comando: {stats_data['last_command']}")
            print("\n  Tipos de comando:")
            for cmd, count in stats_data["command_types"].items():
                print(f"    {cmd}: {count}")
        return

    # Obter histórico
    if recent:
        entries = history_manager.get_recent_commands(recent)
    elif command:
        entries = history_manager.get_command_history(command, limit)
    else:
        entries = history_manager.get_history(limit)

    if not entries:
        print("📭 Nenhum registro encontrado no histórico.")
        return

    if json:
        import json as json_module

        print(json_module.dumps(entries, ensure_ascii=False, indent=2))
    else:
        print(f"📋 Histórico de Comandos ({len(entries)} registros): ")
        print("-" * 80)

        for entry in entries:
            timestamp = entry["execution"]
            cmd = entry["command"]
            success = "✅" if entry["success"] else "❌"

            print(f"[{entry['index']}] {timestamp} - {cmd} {success}")

            # Mostrar argumentos de forma legível
            args = entry["arguments"]
            if args:
                print("  Argumentos:")
                for key, value in args.items():
                    if isinstance(value, bool):
                        value_str = "Sim" if value else "Não"
                    else:
                        value_str = str(value)
                    print(f"    {key}: {value_str}")
            print()


if __name__ == "__main__":
    cli()
