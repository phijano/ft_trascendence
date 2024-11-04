from asgiref.sync import async_to_sync
from chat.consumers.users import connected_users_by_room

class DisconnectMixin:
    def disconnect(self, close_code):
        print(f'Disconnect user: {self.username}')
        if hasattr(self, 'user') and self.user.is_authenticated:
            # Remover usuario de la sala específica
            if self.id in connected_users_by_room:
                connected_users_by_room[self.id].discard(self.user)
                # Si la sala está vacía, eliminarla
                if not connected_users_by_room[self.id]:
                    del connected_users_by_room[self.id]
            
            # Notificar a todos los usuarios en la sala
            self.broadcast_user_list()

        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )
        async_to_sync(self.channel_layer.group_discard)(
            f'user_{self.user.id}',
            self.channel_name
        )