from channels.generic.websocket import WebsocketConsumer
from .models import Profile

class WebConsumer(WebsocketConsumer):

    def connect(self):
        if self.scope['user'].is_authenticated:
            user_profile = Profile.objects.get(user_id=self.scope['user'])
            user_profile.connections = user_profile.connections + 1
            user_profile.save()
            print("connected")
            self.accept()
        else:
            print("rejected")
            self.close()

    def disconnect(self, close_code):
        if not self.scope['user'].is_anonymous:
            user_profile = Profile.objects.get(user_id=self.scope['user'])
            user_profile.connections = user_profile.connections - 1
            user_profile.save()
            print("disconnected")

    def receive(self, text_data):
        print("comunicating")
