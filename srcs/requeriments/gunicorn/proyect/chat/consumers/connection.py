from asgiref.sync import async_to_sync
from chat.consumers.users import connected_users_by_room

class ConnectionMixin:
    def connect(self):
        self.id = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'chat_%s' % self.id
        self.user = self.scope['user']

        if self.user.is_authenticated:
            self.username = self.user.username
            # Inicializar el conjunto para la sala si no existe
            if self.id not in connected_users_by_room:
                connected_users_by_room[self.id] = set()
            # Agregar usuario a la sala específica
            connected_users_by_room[self.id].add(self.user)

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )
        
        async_to_sync(self.channel_layer.group_add)(
            f'user_{self.user.id}',
            self.channel_name
        )
        
        self.accept()
        self.fetch_last_messages()
        self.broadcast_user_list()  # Notifica a todos los usuarios