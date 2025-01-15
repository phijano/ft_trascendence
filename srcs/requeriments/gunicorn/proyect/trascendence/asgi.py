"""
ASGI config for trascendence project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trascendence.settings')
django.setup()  # <-- Asegura que Django haya cargado antes de importar rutas

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator
from userManagement.routing import websocket_urlpatterns as user_ws_urlpatterns
from chat.routing import websocket_urlpatterns as chat_ws_urlpatterns

websocket_urlpatterns = user_ws_urlpatterns + chat_ws_urlpatterns

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AllowedHostsOriginValidator(
        AuthMiddlewareStack(URLRouter(websocket_urlpatterns))
    ),
})
