import json
from chat.models import Message
from chat.models import Block
from userManagement.models import Profile

class MessageMixin:
    def fetch_last_messages(self):
        last_messages = Message.objects.filter(room__name=self.id).order_by('-timestamp')[:3]
        for message in reversed(last_messages):
            # Only send messages that are not from blocked users
            if not self.is_user_blocked(message.user.id):
                self.send_last_message(message)

    def send_last_message(self, message):
        user_profile = Profile.objects.get(user_id=message.user.id)
        user_avatar = user_profile.avatar.url if user_profile.avatar else None
        self.send(text_data=json.dumps({
            'type': 'chat_message',
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

        # Check blocks between sender and receiver
        self.check_blocked(sender_id, username, current_user_id)
        
        if sender_id != current_user_id:
            self.send(text_data=json.dumps({
                'type': 'chat_message',
                'message': message,
                'username': username,
                'avatar': avatar,
            }))

    def private_chat_notification(self, event):
        self.send(text_data=json.dumps({
            'type': 'private_chat_notification',
            'message': event['message'],
            'sender_id': event['sender_id'],
            'username': event['username'],
        }))

    def private_chat_accepted(self, event):
        self.send(text_data=json.dumps({
            'type': 'private_chat_accepted',
            'message': event['message'],
            'room_id': event['room_id'],
            'room_name': event['room_name'],
            'username': event['username'],
            'target_username': event['target_username'],
        }))

    def private_chat_rejected(self, event):
        self.send(text_data=json.dumps({
            'type': 'private_chat_rejected',
            'message': event['message']
        }))