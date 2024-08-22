import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Profile

class WebConsumer(AsyncWebsocketConsumer):

    @database_sync_to_async
    def get_profile(self, user):
        return Profile.objects.get(user_id=user)

    @database_sync_to_async
    def save_profile(self, profile):
        profile.save()

    async def connect(self):
        if self.scope['user'].is_authenticated:
            user_profile = await self.get_profile(self.scope['user'])
            user_profile.connections = user_profile.connections + 1
            await self.save_profile(user_profile)
            await self.accept() 
            print("connected")
        else:
            print("rejected")
            await self.close()

    async def disconnect(self, close_code):
        if self.scope['user'].is_authenticated:
            user_profile = await self.get_profile(self.scope['user'])
            user_profile.connections = user_profile.connections - 1
            await self.save_profile(user_profile)
            print("disconnected")
    
    async def receive(self, text_data):
        print(text_data)
        json_data = json.loads(text_data)
        if json_data.get("app", "") == "pong":
            self.pong(json_data)
        print("comunicating")

    async def pong(self, json_data):
        action = json_data.get("action", "")
        if action == "create":
            print("creating game")
            await self.channel_layer.group_add("", self)
        elif action == "join":
            print("join game")
        elif action == "drop":
            print("drop game")


