import json
from channels.generic.websocket import WebsocketConsumer
from .connection import ConnectionMixin
from .disconnect import DisconnectMixin
from .receive import ReceiveMixin
from .messages import MessageMixin
from .users import UserMixin
from .bloquer import BloquerUserMixin

class ChatConsumer(
    ConnectionMixin, 
    DisconnectMixin, 
    ReceiveMixin, 
    MessageMixin,
    UserMixin,
    BloquerUserMixin,
    WebsocketConsumer):
    # Puedes dejar el método `connect` aquí o moverlo a ConnectionMixin
    def connect(self):
        super().connect()  # Llama a la implementación en ConnectionMixin