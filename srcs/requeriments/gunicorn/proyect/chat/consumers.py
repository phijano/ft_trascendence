import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
from .models import *
from userManagement.models import Profile

class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.id = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.id}'
        self.user = self.scope['user']

        if self.user.is_authenticated:
            self.username = self.user.username

        async_to_sync(self.channel_layer.group_add)(self.room_group_name, self.channel_name)

        self.accept()
        self.fetch_last_messages()
        self.send_connected_users()

    def disconnect(self, close_code):
        print(f'Disconnect user: {self.username}')
        async_to_sync(self.channel_layer.group_discard)(self.room_group_name, self.channel_name)
        self.send_connected_users()

    def receive(self, text_data):
        try:
            data = json.loads(text_data)

            if data['type'] == 'block_user':
                self.block_user(data['user_id'])
            elif data['type'] == 'unblock_user':
                self.unblock_user(data['user_id'])
            else:
                self.handle_message(data)

        except json.JSONDecodeError as e:
            print('Error al decodificar el mensaje: ', e)
        except KeyError as e:
            print('Error al obtener el mensaje: ', e)
        except Exception as e:
            print('Error: ', e)

    def handle_message(self, data):
        message = data['message']
        sender_id = self.scope['user'].id

        if not self.user.is_authenticated:
            print('Usuario no autenticado')
            return

        # Verificar si el usuario está bloqueado
        if self.is_user_blocked(sender_id):
            self.send_blocked_notification()
            return

        # Guardar mensaje en la base de datos
        self.save_message(sender_id, message)

        # Enviar mensaje al grupo de la sala
        self.send_chat_message(message, sender_id, self.get_avatar(sender_id))

    def send_connected_users(self):
        connected_users = self.get_connected_users()
        self.send(text_data=json.dumps({
            'type': 'user_list',
            'users': connected_users
        }))

    def get_connected_users(self):
        room = Room.objects.get(name=self.id)
        return [{'id': user.id, 'username': user.username} for user in room.users.all()]

    def fetch_last_messages(self):
        last_messages = Message.objects.filter(room__name=self.id).order_by('-timestamp')[:3]
        for message in reversed(last_messages):
            # Solo enviar mensajes que no sean de usuarios bloqueados
            if not self.is_user_blocked(message.user.id):
                self.send_last_message(message)

    def send_last_message(self, message):
        user_profile = Profile.objects.get(user_id=message.user.id)
        user_avatar = user_profile.avatar.url if user_profile.avatar else None
        self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': message.content,
            'username': message.user.username,
            'avatar': user_avatar,
        }))

    def get_avatar(self, user_id):
        sender_profile = Profile.objects.get(user_id=user_id)
        return sender_profile.avatar.url if sender_profile.avatar else None

    def is_user_blocked(self, sender_id):
        return Block.objects.filter(blocker=self.user, blocked_id=sender_id).exists()

    def block_user(self, blocked_user_id):
        Block.objects.get_or_create(blocker=self.user, blocked_id=blocked_user_id)
        print('Usuario bloqueado')

    def unblock_user(self, blocked_user_id):
        Block.objects.filter(blocker=self.user, blocked_id=blocked_user_id).delete()
        print('Usuario desbloqueado')

    def send_blocked_notification(self):
        self.send(text_data=json.dumps({
            'type': 'error',
            'message': 'Estás bloqueado para enviar mensajes en este chat.',
        }))

    def save_message(self, sender_id, message):
        room = Room.objects.get(name=self.id)
        Message.objects.create(user_id=sender_id, content=message, room=room)

    def send_chat_message(self, message, sender_id, avatar):
        async_to_sync(self.channel_layer.group_send)(self.room_group_name, {
            'type': 'chat_message',
            'message': message,
            'username': self.user.username,
            'sender_id': sender_id,
            'avatar': avatar,
        })

    def chat_message(self, event):
        message = event['message']
        username = event['username']
        sender_id = event['sender_id']
        avatar = event['avatar']

        current_user_id = self.scope['user'].id

        # No enviar mensajes a uno mismo
        if sender_id == current_user_id:
            return

        # Verificar bloqueos entre el remitente y el receptor
        if Block.objects.filter(blocker_id=current_user_id, blocked_id=sender_id).exists() or \
           Block.objects.filter(blocker_id=sender_id, blocked_id=current_user_id).exists():
            print(f'Mensaje bloqueado entre {self.user.username} y {username}')
            return

        # Enviar el mensaje a WebSocket
        self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': message,
            'username': username,
            'avatar': avatar,
        }))
