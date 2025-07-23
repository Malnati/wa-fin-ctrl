# template.py
# Caminho relativo ao projeto: src/wa_fin_ctrl/template.py
# Utilitário de templates do projeto
import os
from jinja2 import Environment, FileSystemLoader

# Define onde os templates estão (pasta templates/ na raiz do projeto)
TEMPLATES_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "templates"
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
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(html)
