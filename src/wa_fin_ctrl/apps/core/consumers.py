# consumers.py
# Caminho relativo ao projeto: src/wa_fin_ctrl/apps/core/consumers.py
# Consumidores WebSocket para comunicação em tempo real

import json
import time
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


class ConnectionManagerConsumer(AsyncWebsocketConsumer):
    """
    Consumer WebSocket para gerenciar conexões e enviar notificações em tempo real.
    Equivalente ao ConnectionManager da API FastAPI.
    """
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.room_group_name = "notifications"
    
    async def connect(self):
        """
        Aceita a conexão WebSocket e adiciona ao grupo de notificações.
        """
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
        
        # Envia mensagem de confirmação
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': 'Conectado ao WebSocket',
            'timestamp': time.time()
        }))
    
    async def disconnect(self, close_code):
        """
        Remove a conexão do grupo quando desconecta.
        """
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        """
        Recebe mensagens do cliente e faz echo para teste.
        """
        try:
            text_data_json = json.loads(text_data)
            message = text_data_json.get('message', text_data)
            
            # Echo para teste (equivalente ao comportamento da API FastAPI)
            await self.send(text_data=json.dumps({
                'type': 'echo',
                'message': f'Echo: {message}',
                'timestamp': time.time()
            }))
            
        except json.JSONDecodeError:
            # Se não for JSON válido, trata como texto simples
            await self.send(text_data=json.dumps({
                'type': 'echo',
                'message': f'Echo: {text_data}',
                'timestamp': time.time()
            }))
    
    async def notification_message(self, event):
        """
        Envia notificação para todos os clientes conectados.
        """
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'message': event['message'],
            'timestamp': time.time()
        }))
    
    async def reload_message(self, event):
        """
        Envia comando de reload para todos os clientes conectados.
        """
        await self.send(text_data=json.dumps({
            'type': 'reload',
            'message': 'reload',
            'timestamp': time.time()
        }))


# Função utilitária para enviar notificações
async def broadcast_notification(message: str):
    """
    Envia notificação para todos os clientes WebSocket conectados.
    """
    channel_layer = get_channel_layer()
    await channel_layer.group_send(
        "notifications",
        {
            'type': 'notification_message',
            'message': message
        }
    )


async def broadcast_reload():
    """
    Envia comando de reload para todos os clientes WebSocket conectados.
    """
    channel_layer = get_channel_layer()
    await channel_layer.group_send(
        "notifications",
        {
            'type': 'reload_message',
            'message': 'reload'
        }
    )


def broadcast_reload_sync():
    """
    Versão síncrona para enviar comando de reload.
    """
    try:
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "notifications",
            {
                'type': 'reload_message',
                'message': 'reload'
            }
        )
    except Exception as e:
        print(f"Erro ao enviar notificação WebSocket síncrona: {e}") 