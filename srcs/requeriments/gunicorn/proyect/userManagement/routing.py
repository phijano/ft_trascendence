from django.urls import path
from .consumers import WebConsumer

websocket_urlpatterns = [

    path("wss", WebConsumer.as_asgi()),
]
