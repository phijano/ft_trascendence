from channels.generic.websocket import WebsocketConsumer
from .models import Profile

class WebConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()
        user_profile = Profile.objects.get(user_id=self.scope['user'])
        user_profile.connections = user_profile.connections + 1
        user_profile.save()
        print("connected: ")
    def disconnect(self, close_code):
        user_profile = Profile.objects.get(user_id=self.scope['user'])
        user_profile.connections = user_profile.connections - 1
        user_profile.save()
        print("disconnected")
    def receive(self, text_data):
        print("comunicating")
