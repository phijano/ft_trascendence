import json
from chat.models import *
from userManagement.models import Profile
from asgiref.sync import async_to_sync
from django.contrib.auth.models import User

class ReceiveMixin:
    def receive(self, text_data):
        try:
            data = json.loads(text_data)

            if data['type'] == 'block_user':
                self.block_user(data['user_id'])
            elif data['type'] == 'unblock_user':
                self.unblock_user(data['user_id'])
            elif data['type'] == 'private_chat_request':
                self.handle_private_chat_request(data)
            else:
                self.handle_message(data)

        except json.JSONDecodeError as e:
            print('Error al decodificar el mensaje: ', e)
        except KeyError as e:
            print('Error al obtener el mensaje: ', e)
        except Exception as e:
            print('Error: ', e)

    # ? función para manejar la solicitud de chat privado
    def handle_private_chat_request(self, data):
        # Verifica que 'target_user_id' esté en 'data'
        target_user_id = data.get('target_user_id')
        if not target_user_id:
            print("Error: 'target_user_id' no está presente en los datos recibidos.")
            return

        # Obtiene el usuario objetivo
        target_user = User.objects.get(id=target_user_id)
        sender = self.user

        # Envía notificación al usuario objetivo a través de WebSocket
        async_to_sync(self.channel_layer.group_send)(
            f'user_{target_user.id}',
            {
                'type': 'private_chat_notification',
                'message': f'{sender.username} te ha enviado una solicitud de chat privado.',
                'sender_id': sender.id,
                'username': sender.username,
                'target_user_id': target_user_id,
            }
        )

    def handle_accept_private_chat(self, data):
        # Maneja la aceptación de una invitación
        sender_id = data['sender_id']
        sender = User.objects.get(id=sender_id)
        receiver = self.user

        # Notifica al remitente que su invitación fue aceptada
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'private_chat_accepted',
                'message': f'{receiver.username} ha aceptado tu solicitud de chat privado.',
                'receiver_id': receiver.id,
                'sender_id': sender_id,
            }
        )

    def handle_message(self, data):
        message = data['message']

        if self.user.is_authenticated:
            sender_id = self.scope['user'].id
            sender_profile = Profile.objects.get(user_id=sender_id)
            sender_avatar = sender_profile.avatar.url if sender_profile.avatar else None
        else:
            sender_id = None
            sender_avatar = None

        # Verificar si el usuario está bloqueado
        if self.is_user_blocked(sender_id):
            self.send_blocked_notification()
            return

        if sender_id:
            self.save_message(sender_id, message)
            self.send_chat_message(message, sender_id, sender_avatar)
        else:
            print('Usuario no autenticado')

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
