from django.urls import path
from chat.consumers.chat_consumer import ChatConsumer
from chat.consumers.private_chat_consumer import PrivateChatConsumer

websocket_urlpatterns = [
    path('ws/chat/<str:room_name>/', ChatConsumer.as_asgi()),  # Esta ya la tenías
    path('ws/chat/private/<int:room_id>/', PrivateChatConsumer.as_asgi()),  # Añadimos esta para privados
]

