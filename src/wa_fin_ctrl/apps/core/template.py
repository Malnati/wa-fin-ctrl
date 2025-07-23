# template.py
# Caminho relativo ao projeto: src/wa_fin_ctrl/apps/core/template.py
# Módulo de renderização de templates

import os
from jinja2 import Environment, FileSystemLoader

# ==== CONSTANTES ====
# Diretórios
DIRETORIO_TEMPLATES = "templates"

# Configurações de arquivo
ENCODING_UTF8 = "utf-8"
MODO_ESCRITA = "w"

# Define onde os templates estão (pasta templates/ na raiz do projeto)
TEMPLATES_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))), DIRETORIO_TEMPLATES
)
env = Environment(loader=FileSystemLoader(TEMPLATES_DIR), autoescape=True)


class TemplateRenderer:
    @staticmethod
    def render(template_name: str, context: dict, output_path: str):
        """Renderiza um template Jinja2 e salva em arquivo."""
        template = env.get_template(template_name)
        html = template.render(**context)
        # Cria o diretório apenas se o output_path tiver um diretório
        output_dir = os.path.dirname(output_path)
        if output_dir:
            os.makedirs(output_dir, exist_ok=True)
        with open(output_path, MODO_ESCRITA, encoding=ENCODING_UTF8) as f:
            f.write(html)
