# apps.py
# Caminho relativo ao projeto: src/wa_fin_ctrl/apps/core/apps.py
# Configuração do app core

from django.apps import AppConfig


class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'wa_fin_ctrl.apps.core'
    verbose_name = 'Core - Processamento Financeiro'
