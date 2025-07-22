# routing.py
# Caminho relativo ao projeto: src/wa_fin_ctrl/apps/core/routing.py
# Configuração de rotas WebSocket para o app core

from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/$', consumers.ConnectionManagerConsumer.as_asgi()),
] 