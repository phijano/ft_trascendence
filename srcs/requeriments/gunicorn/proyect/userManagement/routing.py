from django.urls import path
from .consumers import WebConsumer

websocket_urlpatterns = [

    path("ws", WebConsumer.as_asgi()),
]
