import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
from .models import *
from userManagement.models import Profile

class ChatConsumer(WebsocketConsumer):

    # Definimos una lista de usuarios conectados
    connected_users = []

    def connect(self):
        # Obtener el nombre de la sala desde la URL
        self.id = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'chat_%s' % self.id
        self.user = self.scope['user']

        if self.user.is_authenticated:
            self.username = self.user.username
        else:
            None

        # Agregar al usuario autenticado a la lista de conectados si no está ya
        if self.username and self.username not in self.connected_users:
            self.connected_users.append(self.username)


        # Agregar el canal del usuario al grupo de la sala
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )

        # Aceptar la conexión WebSocket
        self.accept()

        # Enviamos la lista de usuarios conectados
        self.send_user_list()

        # Recuperar los últimos 3 mensajes de la sala
        last_messages = Message.objects.filter(room__name=self.id).order_by('-timestamp')[:3]
        for message in reversed(last_messages):
            msg_user_id = message.user
            user_profile = Profile.objects.get(user_id = msg_user_id) 
            user_avatar = user_profile.avatar.url if user_profile.avatar else None 
            self.send(text_data=json.dumps({
                'type': 'chat_message',
                'message': message.content,
                'username': message.user.username,
                'avatar': user_avatar, 
            }))

    def disconnect(self, close_code):
        # Remover al usuario de la lista de conectados
        if self.username in self.connected_users:
            self.connected_users.remove(self.username)

        # Actualizar la lista de usuarios conectados
        self.send_user_list()

        # Salir del grupo de la sala pública
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

    # Enviar la lista de usuarios conectados a todos en la sala pública
    def send_user_list(self):
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name, {
                'type': 'user_list',
                'users': self.connected_users,
            }
        )

    # Enviar la lista de usuarios conectados
    def user_list(self, event):
        self.send(text_data=json.dumps({
            'type': "user_list",
            'users': event['users'],
        }))

    def receive(self, text_data):
        try:
            # Decodificar el mensaje
            text_data_json = json.loads(text_data)
            event_type = text_data_json.get('type', '')

            if event_type == 'chat_message':
                message = text_data_json['message']

                # Obtenemos el nombre de usuario
                if self.user.is_authenticated:
                    sender_id = self.scope['user'].id
                    sender_profile = Profile.objects.get(user_id=sender_id)
                    sender_avatar = sender_profile.avatar.url if sender_profile.avatar else None
                else:
                    sender_id = None
                    sender_avatar = None
            
                if sender_id:
                    room = Room.objects.get(name=self.id)
                    message_save = Message.objects.create(
                        user_id=sender_id,
                        content=message,
                        room=room,
                    )
                    message_save.save()


                    # Enviar mensaje al grupo de la sala
                    async_to_sync(self.channel_layer.group_send)(
                        self.room_group_name, {
                            'type': 'chat_message',
                            'message': message,
                            'username': self.user.username,
                            'sender_id': sender_id,
                            'avatar': sender_avatar,
                        }
                    )
                else:
                    print('Usuario no autenticado')
            elif event_type == 'user_list':
                # Este evento se maneja del lado del cliente
                pass

        except json.JSONDecodeError as e:
            print('Error al decodificar el mensaje: ', e)
        except KeyError as e:
            print('Error al obtener el mensaje: ', e)
        except Exception as e:
            print('Error: ', e)

    def chat_message(self, event):
        message = event['message']
        username = event['username']
        sender_id = event['sender_id']
        avatar = event['avatar']

        # Enviar mensaje a WebSocket
        current_user_id = self.scope['user'].id
        if sender_id != current_user_id:
            self.send(text_data=json.dumps({
                'type': 'chat_message',
                'message': message,
                'username': username,
                'avatar': avatar,
            }))
