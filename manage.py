# manage.py
# Caminho relativo ao projeto: manage.py
# Utilitário de linha de comando do Django para tarefas administrativas

#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys
from pathlib import Path
from django.core.management import execute_from_command_line

def main():
    """Run administrative tasks."""
    # Adiciona o diretório src ao PYTHONPATH
    project_root = Path(__file__).resolve().parent
    src_path = project_root / "src"
    if str(src_path) not in sys.path:
        sys.path.insert(0, str(src_path))
    
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "wa_fin_ctrl.settings")
    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()
