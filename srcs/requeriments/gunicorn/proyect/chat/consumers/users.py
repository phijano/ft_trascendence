from chat.models import *
import json

class UserMixin:
    def send_connected_users(self):
        connected_users = self.get_connected_users()
        self.send(text_data=json.dumps({
            'type': 'user_list',
            'users': connected_users
        }))

    def get_connected_users(self):
        room = Room.objects.get(name=self.id)
        # Obtener todos los usuarios relacionados con el objeto room
        users = room.users.all()

        # Create a list of dictionaries with 'id' and 'username' for each user
        user_list = []
        for user in users:
            user_dict = {
            'id': user.id,
            'username': user.username
            }
            user_list.append(user_dict)

        # Return the list of dictionaries
        return user_list