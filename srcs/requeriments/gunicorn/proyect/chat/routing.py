from django.urls import path
from chat.consumers.chat_consumer import ChatConsumer

websocket_urlpatterns = [
    path('wss/chat/<str:room_name>/', ChatConsumer.as_asgi()),  # Para sala publica
    path('wss/chat/private/<int:room_id>/', ChatConsumer.as_asgi()),  # Esta es la nueva
]

