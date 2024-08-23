import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Profile

class WebConsumer(AsyncWebsocketConsumer):

    profile_id = ""
    status = ""
    opponent = ""

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
            self.profile_id = str(user_profile.id)
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
            await self.userActions(json_data)
        print("comunicating")

    async def userActions(self, json_data):
        action = json_data.get("action", "")
        if action == "create":
            print("creating game")
            self.status = "host"
            await self.channel_layer.group_add("games", self.channel_name)
            await self.channel_layer.group_add("host" + self.profile_id, self.channel_name)
            await self.channel_layer.group_send(
                "games",
                {
                    "type":"players.message", 
                    "player":self.profile_id, 
                    "message":"created"
                }
            )
        elif action == "join":
            print("join game")
            self.status = "guest"
            await self.channel_layer.group_add("games", self.channel_name)
            await self.channel_layer.group_send(
                "games",
                {
                    "type":"players.message" ,
                    "player":self.profile_id, 
                    "message":"join"
                }
            )
        elif action == "drop":
            print("drop game")

    async def players_message(self, event):
        print(event)
        if self.status == "host":
            if event["player"] != self.profile_id:
                if event["message"] == "join":
                    await self.channel_layer.group_send(
                        "games",
                        {
                            "type":"players.message" ,
                            "player":self.profile_id, 
                            "message":"accepted"
                        }
                    )
        elif self.status == "guest":
            if event["player"] != self.profile_id:
                if event["message"] == "created" or event["message"] == "accepted":
                    await self.channel_layer.group_add(
                        "host" + event["player"], 
                        self.channel_name
                    )
                    await self.channel_layer.group_send(
                        "host" + event["player"] ,
                        {
                            "type":"opponent.message" ,
                            "player":self.profile_id, 
                            "message":"join"
                        }
                    )
                       
    async def opponent_message(self, event):
        if event["player"] != self.profile_id:
            if event["message"] == "join":
                if self.status == "host": 
                    if not self.opponent:
                        self.opponent = event["player"]
                        await self.channel_layer.group_send(
                            "host" + self.profile_id ,
                            {
                                "type":"opponent.message" ,
                                "player":self.profile_id, 
                                "message":"accepted", 
                                "opponent": self.opponent
                            }
                        )
                        await self.channel_layer.group_discard("games", self.channel_name)
                    else:
                        await self.channel_layer.group_send(
                            "host" + self.profile_id ,
                            {
                                "type":"opponent.message" ,
                                "player":self.profile_id, 
                                "message":"drop", 
                                "opponent": event["player"]
                            }
                        )
            elif event["message"] == "drop":
                if event["opponent"] == self.profile_id:
                    await self.channel_layer.group_discard("host" + event["player"], self.channel_name)
                    await self.channel_layer.group_send(
                        "games",
                        {
                            "type":"players.message" ,
                            "player":self.profile_id, 
                            "message":"join"
                        }
                    )
        print(event)

    async def game_message(self, event):
        return
