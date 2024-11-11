from asgiref.sync import async_to_sync
from chat.consumers.users import connected_users_by_room
from chat.models import Room

class ConnectionMixin:
    def connect(self):
        # Obtener la sala y el grupo de canales
        route_kwargs = self.scope['url_route']['kwargs']
        self.id = route_kwargs.get('room_id', route_kwargs.get('room_name'))
        self.is_private = 'private' in self.scope['url_route']['kwargs']
        
        if self.is_private:
            self.room = Room.objects.get(id=self.id)
            self.room_group_name = f'private_chat_{self.id}'
        else:
            self.room_group_name = f'chat_{self.id}'
        
        # Obtener el usuario actual
        self.user = self.scope['user']

        # Verificar si el usuario está autenticado
        if self.user.is_authenticated:
            self.username = self.user.username
            # Gestionar usuarios conectados por sala
            if self.id not in connected_users_by_room:
                connected_users_by_room[self.id] = set()
            connected_users_by_room[self.id].add(self.user)

            # Agregar el usuario al grupo de canales
            async_to_sync(self.channel_layer.group_add)(
                self.room_group_name,
                self.channel_name
            )
            
            # Agregar el usuario a su propio grupo de canales
            async_to_sync(self.channel_layer.group_add)(
                f'user_{self.user.id}',
                self.channel_name
            )
        
        self.accept() # Aceptar la conexión websocket
        self.fetch_last_messages() # Enviar los últimos mensajes
        self.broadcast_user_list()  # Notifica a todos los usuarios