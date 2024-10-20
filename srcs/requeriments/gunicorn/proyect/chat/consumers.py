import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync

class ChatConsumer(WebsocketConsumer):

    def connect(self):
        # Obtener el nombre de la sala desde la URL
        self.id = self.scope['url_route']['kwargs']['room_name']

        # Crear un nombre de grupo para el canal de chat
        self.room_group_name = 'chat_%s' % self.id
        
        # Obtener el usuario desde el scope
        self.user = self.scope['user']

        # Nombre de la sala y hash de la sala
        print('conexion establecida al room: ', self.room_group_name)
        print("channel_name: ", self.channel_name)

        # Agregar el canal del usuario al grupo de la sala
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )
    
        # Aceptar la conexión WebSocket
        self.accept()

    def disconnect(self, close_code):
        # Remover el canal del usuario del grupo de la sala
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

    def receive(self, text_data):
        print('Mensaje recibido')

        try:
            text_data_json = json.loads(text_data)
            message = text_data_json['message']

            # Obtenemos el nombre de usuario
            if self.user.is_authenticated:
                sender_id = self.scope['user'].id
            else:
                None

            if sender_id:
                async_to_sync(self.channel_layer.group_send)(
                    self.room_group_name, {
                        'type': 'chat_message',
                        'message': message,
                        'username': self.user.username,
                        'sender_id': sender_id,
                    }
                )
            else:
                print('Usuario no autenticado')

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

        # Enviar mensaje a WebSocket
        current_user_id = self.scope['user'].id
        if sender_id != current_user_id:
            self.send(text_data=json.dumps({
                'message': message,
                'username': username,
            }))
