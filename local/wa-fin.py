#!/usr/bin/env python3
# wa-fin.py
# Caminho relativo ao projeto: wa-fin.py
# Ponto de entrada principal para o sistema de processamento de comprovantes financeiros
"""
Ponto de entrada principal para o sistema de processamento de comprovantes financeiros.
Este arquivo importa e executa a interface de linha de comando do módulo wa_fin_ctrl.
"""

import sys
from pathlib import Path

# Adiciona o diretório src ao path para importar o módulo wa_fin_ctrl
sys.path.insert(0, str(Path(__file__).parent / "src"))

from wa_fin_ctrl.cli import cli

if __name__ == "__main__":
    cli() 