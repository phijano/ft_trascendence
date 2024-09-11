import json
import asyncio
import math
import random
import userManagement
import pong
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

class WebConsumer(AsyncWebsocketConsumer):


    profile_id = ""
    profile_nick = ""
    host = False
    opponent = ""
    opponent_nick = ""
    #channels
    games_channel = False
    host_channel = False
    #pong
    creating_game = 0
    pong_config = ""
    playing = False
    lPlayer = ""
    rPlayer = ""
    keyState = ""
    ball = ""
    width = ""
    yMax = ""
    serveSpeedMultiple = 0.3

    @database_sync_to_async
    def get_user_profile(self, user):
        return userManagement.models.Profile.objects.get(user_id=user)

    @database_sync_to_async
    def get_profile_by_id(self, profile_id):
        return userManagement.models.Profile.objects.get(id=profile_id)

    @database_sync_to_async
    def save_profile(self, profile):
        profile.save()

    @database_sync_to_async
    def save_match(self, lProfile, rProfile, lScore, rScore, match_type):
        match = pong.models.Match()
        match.player = lProfile
        match.opponent = rProfile
        match.player_score = lScore
        match.opponent_score = rScore
        match.match_type = match_type
        match.save()

    async def connect(self):
        if self.scope['user'].is_authenticated:
            user_profile = await self.get_user_profile(self.scope['user'])
            user_profile.connections = user_profile.connections + 1
            self.profile_id = str(user_profile.id)
            await self.save_profile(user_profile)
            await self.accept() 
        else:
            await self.close()

    async def disconnect(self, close_code):
        if self.scope['user'].is_authenticated:
            user_profile = await self.get_user_profile(self.scope['user'])
            user_profile.connections = user_profile.connections - 1
            await self.save_profile(user_profile)
            if self.host_channel:
                if self.playing:
                    self.playing = False
                    group = "host"
                    if self.host:
                        group += self.profile_id
                    else:
                        group += self.opponent
                    await self.channel_layer.group_send(
                        group,
                        {
                            "type":"drop.game" ,
                            "player":self.profile_id,
                        }
                    )
                if self.host:
                    await self.channel_layer.group_discard("host" + self.profile_id, self.channel_name)
                else:
                    await self.channel_layer.group_discard("host" + self.opponent, self.channel_name)
            if self.games_channel:
                await self.channel_layer.group_discard("games", self.channel_name)
 
    async def receive(self, text_data):
        json_data = json.loads(text_data)
        if json_data.get("app", "") == "pong":
            await self.userActions(json_data)

    async def userActions(self, json_data):
        print(json_data)
        print(json_data.get("date", ""))
        action = json_data.get("action", "")
        if action == "create":
            self.creating_game = json_data.get("date", "")
            self.opponent = ""
            self.host = True
            self.pong_config = json_data.get("config","")
            #
            self.pong_config["startSpeed"] /= 15
            self.pong_config["playerSpeed"] /= 15
            await self.channel_layer.group_add("games", self.channel_name)
            self.games_channel = True
            await self.channel_layer.group_add("host" + self.profile_id, self.channel_name)
            self.host_channel = True
            await self.channel_layer.group_send(
                "games",
                {
                    "type":"players.message", 
                    "player":self.profile_id,
                    "message":"created"
                }
            )
        elif action == "join":
            self.opponent = ""
            self.host = False
            await self.channel_layer.group_add("games", self.channel_name)
            self.games_channel = True
            await self.channel_layer.group_send(
                "games",
                {
                    "type":"players.message" ,
                    "player":self.profile_id, 
                    "message":"join"
                }
            )
        elif action == "drop":
            if self.games_channel:
                if  json_data.get("date", "") > self.creating_game:
                    print("discarting channel")
                    await self.channel_layer.group_discard("games", self.channel_name)
                    self.games_channel = False
            if self.host_channel:
                if self.playing:
                    group = "host"
                    if self.host:
                        group += self.profile_id
                    else:
                        group += self.opponent
                    await self.channel_layer.group_send(
                        group,
                        {
                            "type":"drop.game" ,
                            "player":self.profile_id,
                            "date":str(json_data.get("date", "")),
                        }
                    )
                if json_data.get("date", "") > self.creating_game:
                    if self.host:
                        await self.channel_layer.group_discard("host" + self.profile_id, self.channel_name)
                    else:
                        await self.channel_layer.group_discard("host" + self.opponent, self.channel_name)
                    self.host_channel = False
        elif action == "keys":
            group = "host"
            if self.host:
                group += self.profile_id
            else:
                group += self.opponent
            await self.channel_layer.group_send(
                group,
                {
                    "type":"keys.message" ,
                    "player":self.profile_id, 
                    "keys":json_data.get("keys", "")
                }
            )

    async def players_message(self, event):
        print(event)
        print(str(self.profile_id))
        if self.host:
            if event["message"] == "join":
                await self.channel_layer.group_send(
                    "games",
                    {
                        "type":"players.message" ,
                        "player":self.profile_id, 
                        "message":"created"
                    }
                )
        else:
            if event["message"] == "created":
                if not self.opponent:
                    self.opponent = event["player"]
                    await self.channel_layer.group_discard("games", self.channel_name)
                    self.games_channel = False
                    await self.channel_layer.group_add(
                        "host" + event["player"], 
                        self.channel_name
                    )
                    self.host_channel = True
                    await self.channel_layer.group_send(
                        "host" + event["player"] ,
                        {
                            "type":"opponent.message" ,
                            "player":self.profile_id, 
                            "message":"join"
                        }
                    )
                       
    async def opponent_message(self, event):
        print(event)
        print(str(self.profile_id))
        if self.host:
            if event["message"] == "join":
                if not self.opponent:
                    self.opponent = event["player"]
                    profile = await self.get_user_profile(self.scope['user'])
                    self.profile_nick = profile.nick
                    await self.channel_layer.group_send(
                        "host" + self.profile_id,
                        {
                            "type":"opponent.message",
                            "player":self.profile_id,
                            "nick":self.profile_nick,
                            "message":"accepted", 
                            "opponent": self.opponent,
                            "config":self.pong_config,
                        }
                    )
                    await self.channel_layer.group_discard("games", self.channel_name)
                    self.games_channel = False
                    profile = await self.get_profile_by_id(self.opponent)
                    self.opponent_nick = profile.nick
                    await self.send(text_data=json.dumps(
                            {
                                "app":"pong",
                                "type":"find.opponent",
                                "opponent_nick":self.opponent_nick,
                                "config":self.pong_config,
                            }
                        )
                    )
                    asyncio.create_task(self.pong_loop())
                else:
                    await self.channel_layer.group_send(
                        "host" + self.profile_id,
                        {
                            "type":"opponent.message",
                            "player":self.profile_id, 
                            "message":"full", 
                            "opponent": event["player"]
                        }
                    )
        else:
            if event["message"] == "accepted":
                if self.profile_id == event["opponent"]:
                    self.opponent = event["player"]
                    await self.send(text_data=json.dumps(
                            {
                                "app":"pong",
                                "type":"find.opponent",
                                "opponent_nick":event["nick"],
                                "config":event["config"],
                            }
                        )
                    )
                    self.playing = True
            elif event["message"] == "full":
                if self.profile_id == event["opponent"]:
                    await self.channel_layer.group_discard("host" + event["player"], self.channel_name)
                    self.host_channel = False
                    await self.channel_layer.group_add("games", self.channel_name)
                    self.games_channel = True
                    self.opponent = ""
                    await self.channel_layer.group_send(
                        "games",
                        {
                            "type":"players.message" ,
                            "player":self.profile_id, 
                            "message":"join"
                        }
                    )

    async def keys_message(self, event):
        if self.host:
            if event["player"] == self.profile_id:
                self.keyState["w"] = event["keys"]["w"]
                self.keyState["s"] = event["keys"]["s"]
                if self.pong_config["allowPowerUp"] and event["keys"]["lPowerUpUsed"] and not self.keyState["lPowerUpUsed"] and self.ball["xVel"] > 0:
                    self.keyState["lPowerUpUsed"] = event["keys"]["lPowerUpUsed"]
                    await self.powerUp()
                if self.keyState["w"]:
                    self.lPlayer["speed"] = -self.pong_config["playerSpeed"]
                elif self.keyState["s"]:
                    self.lPlayer["speed"] = self.pong_config["playerSpeed"]
                else:
                    self.lPlayer["speed"] = 0
                if self.keyState["s"]:
                    self.lPlayer["speed"] = self.pong_config["playerSpeed"]
                elif self.keyState["w"]:
                    self.lPlayer["speed"] = -self.pong_config["playerSpeed"]
                else:
                    self.lPlayer["speed"] = 0
            else:
                self.keyState["up"] = event["keys"]["up"]
                self.keyState["down"] = event["keys"]["down"]
                if self.pong_config["allowPowerUp"] and event["keys"]["rPowerUpUsed"] and not self.keyState["rPowerUpUsed"] and self.ball["xVel"] < 0:
                    self.keyState["rPowerUpUsed"] = event["keys"]["rPowerUpUsed"]
                    await self.powerUp()
                if self.keyState["up"]:
                    self.rPlayer["speed"] = -self.pong_config["playerSpeed"]
                elif self.keyState["down"]:
                    self.rPlayer["speed"] = self.pong_config["playerSpeed"]
                else:
                    self.rPlayer["speed"] = 0
                if self.keyState["down"]:
                    self.rPlayer["speed"] = self.pong_config["playerSpeed"]
                elif self.keyState["up"]:
                    self.rPlayer["speed"] = -self.pong_config["playerSpeed"]
                else:
                    self.rPlayer["speed"] = 0

    async def game_update(self, event):
        await self.send(text_data=json.dumps(event))

    async def end_game(self, event):
        print(event)
        print(str(self.profile_id))
        await self.send(text_data=json.dumps(event))
        if self.games_channel:
            await self.channel_layer.group_discard("games", self.channel_name)
            self.games_channel = False
        if self.host:
            await self.channel_layer.group_discard("host" + self.profile_id, self.channel_name)
        else:
            self.playing = False
            await self.channel_layer.group_discard("host" + self.opponent, self.channel_name)
        self.host_channel = False

    async def drop_game(self, event):
        print(event)
        print(str(self.profile_id))
        await self.send(text_data=json.dumps(event))
        self.playing = False
        if self.games_channel:
            if int(event["date"]) > self.creating_game:
                print("discarting channel")
                await self.channel_layer.group_discard("games", self.channel_name)
                self.games_channel = False
        if self.host_channel:
            if int(event["date"]) > self.creating_game:
                if self.host:
                    await self.channel_layer.group_discard("host" + self.profile_id, self.channel_name)
                else:
                    await self.channel_layer.group_discard("host" + self.opponent, self.channel_name)
                self.host_channel = False

    async def pong_loop(self):
        self.initPong()
        self.playing = True
        while (self.playing):
            await self.updatePong()
            #await asyncio.sleep(0.015) 
            await asyncio.sleep(0.001)
            if  self.keyState["powerUpInUse"] == True:
                await asyncio.sleep(0.75)
                self.keyState["powerUpInUse"] = False


    def initPong(self):
        self.width = self.pong_config["ballSide"] * 1.2
        self.yMax = self.pong_config["boardHeight"] - self.pong_config["playerHeight"]
        self.keyState = {
            "w": False,
            "s": False,
            "up": False,
            "down": False,
            "lPowerUpUsed": False,
            "rPowerUpUsed": False,
            "powerUpInUse": False,
        }
        self.lPlayer = {
            "x": self.width,
            "y":self.pong_config["boardHeight"]/2 - self.pong_config["playerHeight"]/2,
            "speed":0,
            "score":0,
        }
        self.rPlayer = {
            "x":self.pong_config["boardWidth"] - self.width * 2,
            "y":self.lPlayer["y"],
            "speed":0,
            "score":0,
        }
        self.resetPong(random.choice([-1,1]))

    def resetPong(self, direction):
        startRadAngle = random.uniform(-math.pi/4, math.pi/4)
        self.ball = {
            "x" : self.pong_config["boardWidth"]/2 - self.pong_config["ballSide"]/2,
            "y" : self.pong_config["boardHeight"]/2 - self.pong_config["ballSide"]/2,
            "xVel" : self.pong_config["startSpeed"] * math.cos(startRadAngle) * direction,
            "yVel" : self.pong_config["startSpeed"] * math.sin(startRadAngle),
            "speed" : self.pong_config["startSpeed"],
            "serve" : True,
        }
        self.keyState["lPowerUpUsed"] = False
        self.keyState["rPowerUpUsed"] = False

    async def updatePong(self):
        reset = 0
        self.lPlayer["y"] += self.lPlayer["speed"]
        self.rPlayer["y"] += self.rPlayer["speed"]
        self.fixOutOfBounds(self.lPlayer)
        self.fixOutOfBounds(self.rPlayer)
        if self.ball["serve"] and not self.keyState["powerUpInUse"]:
            self.ball["x"] +=  self.ball["xVel"] * self.serveSpeedMultiple
            self.ball["y"] +=  self.ball["yVel"] * self.serveSpeedMultiple
        elif not self.keyState["powerUpInUse"]:
            self.ball["x"] +=  self.ball["xVel"]
            self.ball["y"] +=  self.ball["yVel"]
        if self.ball["xVel"] < 0:
            self.handlePaddleHit(self.lPlayer)
        elif self.handlePaddleHit(self.rPlayer):
            self.ball["xVel"] *= -1
        if self.ball["y"] <= 0 or self.ball["y"] + self.pong_config["ballSide"] >= self.pong_config["boardHeight"]:
            self.ball["yVel"] *= -1
        if self.ball["x"] < 0:
            self.rPlayer["score"] += 1
            reset = -1
        elif self.ball["x"] + self.pong_config["ballSide"] > self.pong_config["boardWidth"]:
            self.lPlayer["score"] += 1
            reset = 1
        await self.channel_layer.group_send(
            "host" + self.profile_id ,
            {
                "type":"game.update" ,
                "lPlayer":self.lPlayer,
                "rPlayer":self.rPlayer,
                "ball":self.ball,
                "width":self.width,
                "powerUp":self.keyState["powerUpInUse"],
            }
        )
        if self.rPlayer["score"] == self.pong_config["pointsToWin"] or self.lPlayer["score"] == self.pong_config["pointsToWin"]:
            self.playing = False
            user_profile = await self.get_profile_by_id(self.profile_id)
            guest_profile = await self.get_profile_by_id(self.opponent)
            await self.save_match(user_profile, guest_profile, self.lPlayer["score"], self.rPlayer["score"], "Single Match")
            await self.channel_layer.group_send(
            "host" + self.profile_id,
                {
                    "app":"pong",
                    "type":"end.game",
                    "lPlayer":self.lPlayer,
                    "rPlayer":self.rPlayer,
                    "ball":self.ball,
                    "width":self.width, 
                    "powerUp":self.keyState["powerUpInUse"],
                }
            )
            print("end")
        if reset:
            self.resetPong(reset)

    def fixOutOfBounds(self, player):
        if player["y"] < 0:
            player["y"] = 0
        elif player["y"] > self.yMax:
            player["y"] = self.yMax
    
    def handlePaddleHit(self, player):
        if self.keyState["powerUpInUse"]:
            return
        if self.ball["x"] < player["x"] + self.width and self.ball["x"] + self.pong_config["ballSide"] > player["x"] and self.ball["y"] < player["y"] + self.pong_config["playerHeight"] and self.ball["y"] + self.pong_config["ballSide"] > player["y"]:
            collisionPoint = self.ball["y"] - player["y"] - self.pong_config["playerHeight"]/2 + self.pong_config["ballSide"]/2

            if collisionPoint > self.pong_config["playerHeight"]/2:
                collisionPoint = self.pong_config["playerHeight"]/2
            elif collisionPoint < -self.pong_config["playerHeight"]/2:
                collisionPoint = -self.pong_config["playerHeight"]/2

            collisionPoint /= self.pong_config["playerHeight"]/2
            radAngle = math.pi/4 * collisionPoint
            if self.ball["speed"] < 20:
                self.ball["speed"] *= self.pong_config["speedUpMultiple"]
            self.ball["xVel"] = self.ball["speed"] * math.cos(radAngle)
            self.ball["yVel"] = self.ball["speed"] * math.sin(radAngle)
            self.ball["serve"] = False
            return True
        return False

    async def powerUp(self):
        self.keyState["powerUpInUse"] = True
        await self.channel_layer.group_send(
            "host" + self.profile_id ,
            {
                "type":"game.update" ,
                "lPlayer":self.lPlayer,
                "rPlayer":self.rPlayer,
                "ball":self.ball,
                "width":self.width,
                "powerUp":self.keyState["powerUpInUse"],
            }
        )
        self.ball["yVel"] *= -1
