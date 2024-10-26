import json
from chat.models import *
from userManagement.models import Profile
from asgiref.sync import async_to_sync

class ReceiveMixin:
    def receive(self, text_data):
        try:
            data = json.loads(text_data)
            self.handle_message(data)

            """ if data['type'] == 'block_user':
                self.block_user(data['user_id'])
            elif data['type'] == 'unblock_user':
                self.unblock_user(data['user_id'])
            else:
                self.handle_message(data) """

        except json.JSONDecodeError as e:
            print('Error al decodificar el mensaje: ', e)
        except KeyError as e:
            print('Error al obtener el mensaje: ', e)
        except Exception as e:
            print('Error: ', e)

    def handle_message(self, data):
        message = data['message']

        if self.user.is_authenticated:
            sender_id = self.scope['user'].id
            sender_profile = Profile.objects.get(user_id=sender_id)
            sender_avatar = sender_profile.avatar.url if sender_profile.avatar else None
        else:
            sender_id = None
            sender_avatar = None

        if sender_id:
            self.save_message(sender_id, message)
            self.send_chat_message(message, sender_id, sender_avatar)
        else:
            print('Usuario no autenticado')

        # Verificar si el usuario está bloqueado
        if self.is_user_blocked(sender_id):
            self.send_blocked_notification()
            return

        # Guardar mensaje en la base de datos y Enviar mensaje al grupo de la sala
        self.save_message(sender_id, message)
        self.send_chat_message(message, sender_id, self.get_avatar(sender_id))

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

    import json
from chat.models import Message
from chat.models import Block
from userManagement.models import Profile

class MessageMixin:
    def fetch_last_messages(self):
        last_messages = Message.objects.filter(room__name=self.id).order_by('-timestamp')[:3]
        for message in reversed(last_messages):
            msg_user_id = message.user
            user_profile = Profile.objects.get(user_id=msg_user_id)
            user_avatar = user_profile.avatar.url if user_profile.avatar else None
            self.send(text_data=json.dumps({
                'message': message.content,
                'username': message.user.username,
                'avatar': user_avatar,
            }))
