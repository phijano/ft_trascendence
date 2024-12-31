from asgiref.sync import async_to_sync
from chat.consumers.users import connected_users_by_room
from chat.models import Room

class ConnectionMixin:
    def connect(self):
        # Get the room and channel group
        route_kwargs = self.scope['url_route']['kwargs']
        self.id = route_kwargs.get('room_id', route_kwargs.get('room_name'))
        self.is_private = 'private' in self.scope['url_route']['kwargs']
        
        if self.is_private:
            self.room = Room.objects.get(id=self.id)
            self.room_group_name = f'private_chat_{self.id}'
        else:
            self.room_group_name = f'chat_{self.id}'
        
        # Get current user
        self.user = self.scope['user']

        # Check if user is authenticated
        if self.user.is_authenticated:
            self.username = self.user.username
            # Manage connected users by room
            if self.id not in connected_users_by_room:
                connected_users_by_room[self.id] = set()
            connected_users_by_room[self.id].add(self.user)

            # Add user to channel group
            async_to_sync(self.channel_layer.group_add)(
                self.room_group_name,
                self.channel_name
            )
            
            # Add user to their own channel group
            async_to_sync(self.channel_layer.group_add)(
                f'user_{self.user.id}',
                self.channel_name
            )
        
        self.accept() # Accept websocket connection
        self.fetch_last_messages() # Send last messages
        self.broadcast_user_list()  # Notify all users