import json
from channels.generic.websocket import WebsocketConsumer
from .connection import ConnectionMixin
from .disconnect import DisconnectMixin
from .receive import ReceiveMixin
from .messages import MessageMixin
from .users import UserMixin
from .bloquer import BloquerUserMixin
from chat.models import Room, User
import time

class ChatConsumer(
    ConnectionMixin, 
    DisconnectMixin, 
    ReceiveMixin, 
    MessageMixin,
    UserMixin,
    BloquerUserMixin,
    WebsocketConsumer):
    
    def connect(self):
        super().connect()  
        
# When private chat is accepted
async def accept_private_chat(self, data):
    sender_id = data['sender_id']
    sender = User.objects.get(id=sender_id)
    receiver = self.user
    
    # Create or get private room
    room_name = f'private_{sender.id}_{receiver.id}_{int(time.time())}'
    room = Room.objects.create(
        name=room_name,
        is_private=True,
        status='accepted'
    )
    # Add both users to the room
    room.users.add(sender, receiver)
    room.save()