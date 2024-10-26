from asgiref.sync import async_to_sync

class ConnectionMixin:
    def connect(self):
        self.id = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'chat_%s' % self.id
        self.user = self.scope['user']

        if self.user.is_authenticated:
            self.username = self.user.username

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name, self.channel_name
        )
        self.accept()
        self.fetch_last_messages()
        self.send_connected_users()