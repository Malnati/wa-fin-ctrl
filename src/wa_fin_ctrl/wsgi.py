# wsgi.py
# Caminho relativo ao projeto: src/wa_fin_ctrl/wsgi.py
# Configuração WSGI do projeto Django

"""
WSGI config for wa_fin_ctrl project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "wa_fin_ctrl.settings")

application = get_wsgi_application()
