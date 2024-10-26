import json
from chat.models import Message
from chat.models import Block
from userManagement.models import Profile

class MessageMixin:
    def fetch_last_messages(self):
        last_messages = Message.objects.filter(room__name=self.id).order_by('-timestamp')[:3]
        for message in reversed(last_messages):
            msg_user_id = message.user
            user_profile = Profile.objects.get(user_id=msg_user_id)
            user_avatar = user_profile.avatar.url if user_profile.avatar else None
            self.send(text_data=json.dumps({
                'message': message.content,
                'username': message.user.username,
                'avatar': user_avatar,
            }))

    def chat_message(self, event):
        message = event['message']
        username = event['username']
        sender_id = event['sender_id']
        avatar = event['avatar']
        current_user_id = self.scope['user'].id

        # Verificar bloqueos entre el remitente y el receptor
        if Block.objects.filter(blocker_id=current_user_id, blocked_id=sender_id).exists() or \
           Block.objects.filter(blocker_id=sender_id, blocked_id=current_user_id).exists():
            print(f'Mensaje bloqueado entre {self.user.username} y {username}')
            return

        if sender_id != current_user_id:
            self.send(text_data=json.dumps({
                'type': 'chat_message',
                'message': message,
                'username': username,
                'avatar': avatar,
            }))