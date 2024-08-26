import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Profile

class WebConsumer(AsyncWebsocketConsumer):

    profile_id = ""
    profile_nick = ""
    status = ""
    opponent = ""
    opponent_nick = ""
    pong_config = ""
    ongoing = True
    loop = 0


    @database_sync_to_async
    def get_user_profile(self, user):
        return Profile.objects.get(user_id=user)

    @database_sync_to_async
    def get_opponent_profile(self, opponent_id):
        return Profile.objects.get(id=opponent_id)

    @database_sync_to_async
    def save_profile(self, profile):
        profile.save()

    async def connect(self):
        if self.scope['user'].is_authenticated:
            user_profile = await self.get_user_profile(self.scope['user'])
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
            user_profile = await self.get_user_profile(self.scope['user'])
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
            self.pong_config = json_data.get("config","")
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
            if event["message"] == "join":
                await self.channel_layer.group_send(
                    "games",
                    {
                        "type":"players.message" ,
                        "player":self.profile_id, 
                        "message":"accepted"
                    }
                )
        else:
            if event["message"] == "created" or event["message"] == "accepted":
                await self.channel_layer.group_discard("games", self.channel_name)
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
        if self.status == "host":
            if event["message"] == "join":
                if not self.opponent:
                    self.opponent = event["player"]
                    profile = await self.get_user_profile(self.scope['user'])
                    self.profile_nick = profile.nick
                    await self.channel_layer.group_send(
                        "host" + self.profile_id ,
                        {
                            "type":"opponent.message" ,
                            "player":self.profile_id,
                            "nick":self.profile_nick,
                            "message":"accepted", 
                            "opponent": self.opponent,
                            "config":self.pong_config,
                        }
                    )
                    await self.channel_layer.group_discard("games", self.channel_name)
                    profile = await self.get_opponent_profile(self.opponent)
                    self.opponent_nick = profile.nick
                    await self.send(text_data=json.dumps(
                            {
                                "app":"pong",
                                "type":"find_opponent",
                                "opponent_nick":self.opponent_nick,
                                "config":self.pong_config,
                            }
                        )
                    )
                    asyncio.create_task(self.pong_loop())
                else:
                    await self.channel_layer.group_send(
                        "host" + self.profile_id ,
                        {
                            "type":"opponent.message" ,
                            "player":self.profile_id, 
                            "message":"full", 
                            "opponent": event["player"]
                        }
                    )
        else:
            if event["message"] == "accepted":
                if self.profile_id == event["opponent"]:
                    await self.send(text_data=json.dumps(
                            {
                                "app":"pong",
                                "type":"find_opponent",
                                "opponent_nick":event["nick"],
                                "config":event["config"],
                            }
                        )
                    )
            elif event["message"] == "full":
                if self.profile_id == event["opponent"]:
                    await self.channel_layer.group_discard("host" + event["player"], self.channel_name)
                    await self.channel_layer.group_add("games", self.channel_name)
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

    async def pong_loop(self):
        while (self.ongoing):
            print("update")
            self.loop += 1;
            if self.loop == 10:
                self.ongoing = False
            await asyncio.sleep(0.05)
        return
