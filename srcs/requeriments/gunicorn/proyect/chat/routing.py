from django.urls import path
from chat.consumers.chat_consumer import ChatConsumer

websocket_urlpatterns = [
    path('wss/chat/<str:room_name>/', ChatConsumer.as_asgi()),  # For public room
    path('wss/chat/private/<int:room_id>/', ChatConsumer.as_asgi()),  # This is the new one
]

