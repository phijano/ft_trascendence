from asgiref.sync import async_to_sync
from chat.models import *
import json

# Usar un diccionario para mantener usuarios por sala
connected_users_by_room = {}

class UserMixin:
    def send_connected_users(self):
        connected_users = self.get_connected_users()
        self.send(text_data=json.dumps({
            'type': 'user_list',
            'users': connected_users
        }))

    def get_connected_users(self):
        # Obtener usuarios conectados solo de la sala actual
        room_users = connected_users_by_room.get(self.id, set())
        user_list = []
        for user in room_users:
            user_dict = {
                'id': user.id,
                'username': user.username
            }
            user_list.append(user_dict)
        return user_list

    def broadcast_user_list(self):
        # Enviar lista actualizada a todos los usuarios en la sala
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'user_list_message',
                'users': self.get_connected_users()
            }
        )

    def user_list_message(self, event):
        self.send(text_data=json.dumps({
            'type': 'user_list',
            'users': event['users']
        }))

    def game_invitation(self, event):
        self.send(text_data=json.dumps({
            'type': 'game_invitation',
            'message': event['message'],
            'match_id': event['match_id'],
            'sender_id': event['sender_id'],
            'username': event['username'],
            'target_user_id': event['target_user_id'],
        }))

    def game_invitation_declined(self, event):
        self.send(text_data=json.dumps({
            'type': 'game_invitation_declined',
            'message': event['message'],
            'match_id': event['match_id'],
            'sender_id': event['sender_id'],
        }))