from asgiref.sync import async_to_sync

class DisconnectMixin:
    def disconnect(self, close_code):
        print(f'Disconnect user: {self.username}')
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )