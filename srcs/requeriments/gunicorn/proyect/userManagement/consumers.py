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
    private_channel = False
    tour_game_channel = False
    tournament_info_chanel = False
    tournament_channel = False
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
    #tournament
    tournament_announcer = False
    joined_tour = False
    tournament_id = 0
    game_type = ""
    game_active = False
    num_players = 0
    active_players = 0
    tournament_filled = False
    players_status = {}
    match_players = ""
    tournament_players = ""
    players_order = ""
    tournament_config = ""
    tournament = ""
    tournament_matches = "" #
    drop = False

    @database_sync_to_async
    def get_user_profile(self, user):
        return userManagement.models.Profile.objects.get(user_id=user)

    @database_sync_to_async
    def get_profile_by_id(self, profile_id):
        return userManagement.models.Profile.objects.get(id=profile_id)

    @database_sync_to_async
    def get_user_by_user_id(self, user_id):
        return userManagement.models.User.objects.get(id=user_id)

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

    @database_sync_to_async
    def save_tournament(self, tournament):
        tournament.save()

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
            user_profile.connections = 0
            await self.save_profile(user_profile)
            if self.host_channel or self.private_channel or self.tour_game_channel:
                group = "host"
                if self.private_channel:
                    group = "private"
                elif self.tour_game_channel:
                    group = "privtour"
                if self.host:
                    group += self.profile_id
                else:
                    group += self.opponent
                if self.playing:
                    self.playing = False
                    await self.channel_layer.group_send(
                        group,
                        {
                            "type":"drop.game" ,
                            "player":self.profile_id,
                        }
                    )
                await self.channel_layer.group_discard(group, self.channel_name)
            if self.games_channel:
                await self.channel_layer.group_discard("games", self.channel_name)
            if self.tournament_announcer:
                if self.active_players > 1:
                    host = "none"
                    for key, status in self.players_status.items():
                        if key != str(self.profile_id) and status != "drop":
                            host = key
                    if host != "none":
                        group = "tour" + self.tournament_id
                        await self.channel_layer.group_send(
                            group,
                            {
                                "type": "tour.players",
                                "player": self.profile_id,
                                "message":"newhost",
                                "host": host
                            }
                        )
                        self.tournament_announcer = False
                        await asyncio.sleep(1)
                else:
                    await self.channel_layer.group_send(
                        "tournaments",
                        {
                            "type":"tournament.message",
                            "message":"update",
                            "tournament": self.tournament_id,
                            "size": self.num_players,
                            "active": self.num_players
                        }
                    )
            if self.tournament_info_chanel:
                await self.channel_layer.group_discard("tournaments", self.channel_name)
            if self.tournament_channel:
                group = "tour" + self.tournament_id
                await self.channel_layer.group_send(
                    group,
                    {
                        "type": "tour.players",
                        "player": self.profile_id,
                        "message":"drop",
                    }
                )
                await self.channel_layer.group_discard(group, self.channel_name)
 
    async def receive(self, text_data):
        json_data = json.loads(text_data)
        if json_data.get("app", "") == "pong":
            await self.userActions(json_data)

    async def userActions(self, json_data):
        action = json_data.get("action", "")
        private = json_data.get("privateGame","")
        group = ""
        communication = ""
        if action == "create":
            self.creating_game = json_data.get("date", "")
            self.opponent = ""
            self.host = True
            self.pong_config = json_data.get("config","")
            self.pong_config["startSpeed"] /= 15
            self.pong_config["playerSpeed"] /= 15
            if private == "yes": 
                await self.channel_layer.group_add("private" + self.profile_id, self.channel_name)
                self.private_channel = True
                group = "private" + self.profile_id
                communication = "opponent.message"
            else:
                await self.channel_layer.group_add("games", self.channel_name)
                self.games_channel = True
                await self.channel_layer.group_add("host" + self.profile_id, self.channel_name)
                self.host_channel = True
                group = "games"
                communication = "players.message"
            await self.channel_layer.group_send(
                group,
                {
                    "type":communication, 
                    "player":self.profile_id,
                    "message":"created"
                }
            )
        elif action == "join":
            self.opponent = ""
            self.host = False
            if private == "yes":
                opponent_user = await self.get_user_by_user_id(json_data.get("opponent",""))
                opponent_profile = await self.get_user_profile(opponent_user)
                self.opponent = str(opponent_profile.id)
                await self.channel_layer.group_add("private" + self.opponent, self.channel_name)
                self.private_channel = True
                group = "private" + self.opponent
                communication = "opponent.message"
            else:
                await self.channel_layer.group_add("games", self.channel_name)
                self.games_channel = True
                group = "games"
                communication = "players.message"
            await self.channel_layer.group_send(
                group,
                {
                    "type":communication ,
                    "player":self.profile_id, 
                    "message":"join"
                }
            )
        elif action == "drop":
            if self.games_channel:
                if  json_data.get("date", "") > self.creating_game:
                    await self.channel_layer.group_discard("games", self.channel_name)
                    self.games_channel = False
            if self.host_channel or self.private_channel or self.tour_game_channel:
                group = "host"
                if self.private_channel:
                    group = "private"
                elif self.tour_game_channel:
                    group = "privtour"
                if self.host:
                    group += self.profile_id
                else:
                    group += self.opponent
                if self.playing:
                    self.drop = True
                    await self.channel_layer.group_send(
                        group,
                        {
                            "type":"drop.game" ,
                            "player":self.profile_id,
                            "date":str(json_data.get("date", "")),
                        }
                    )
                if json_data.get("date", "") > self.creating_game or self.private_channel or self.tour_game_channel:
                    await self.channel_layer.group_discard(group, self.channel_name)
                    self.host_channel = False
                    self.private_channel = False
                    self.tour_game_channel = False

        elif action == "keys":
            group = "host"
            if self.private_channel:
                group = "private"
            elif self.tour_game_channel:
                group = "privtour"
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
        elif action == "infoTournament":
            await self.channel_layer.group_add("tournaments", self.channel_name)
            self.tournament_info_chanel = True
            await self.channel_layer.group_send(
                "tournaments",
                {
                    "type":"tournament.message",
                    "message":"info"
                }
            )
        elif action == "stopInfoTournament":
            await self.channel_layer.group_discard("tournaments", self.channel_name)
            self.tournament_info_chanel = False
        elif action == "createTournament":
            self.players_status = {str(self.profile_id): "ready"}
            self.num_players = int(json_data.get("size", ""))
            tournament = pong.models.Tournament()
            tournament.size = self.num_players
            await self.save_tournament(tournament)
            self.tournament_id = str(tournament.id)
            self.active_players = 1
            profile = await self.get_user_profile(self.scope['user'])
            self.tournament_players = {self.profile_id:profile.nick}
            self.tournament_announcer = True
            self.tournament_config = json_data.get("config","")
            self.tournament_config["startSpeed"] /= 15
            self.tournament_config["playerSpeed"] /= 15
            group = "tour" + self.tournament_id
            await self.channel_layer.group_add(group, self.channel_name)
            self.tournament_channel = True
            await self.channel_layer.group_send(
                "tournaments",
                {
                    "type":"tournament.message",
                    "message":"update",
                    "tournament": self.tournament_id,
                    "size": self.num_players,
                    "active": self.active_players
                }
            )

        elif action == "joinTournament":
            self.tournament_id = str(json_data.get("tournament", ""))
            group = "tour" + self.tournament_id
            await self.channel_layer.group_add(group, self.channel_name)
            self.tournament_channel = True
            await self.channel_layer.group_send(
                group,
                {
                    "type":"tour.players",
                    "player": self.profile_id,
                    "message":"join",
                }
            )
        elif action == "ready":
            group = "tour" + str(self.tournament_id)
            await self.channel_layer.group_send(
                group,
                {
                    "type":"tour.players",
                    "player": self.profile_id,
                    "message":"ready",
                }
            )
        elif action == "notready":
            group = "tour" + str(self.tournament_id)
            await self.channel_layer.group_send(
                group,
                {
                    "type":"tour.players",
                    "player": self.profile_id,
                    "message":"notready",
                }
            )

    async def tour_players(self, event):
        if event["message"] == "join":
            if self.tournament_announcer:
                group = "tour" + self.tournament_id
                if self.active_players < self.num_players and str(event["player"]) not in self.tournament_players.keys():
                    self.players_status[str(event["player"])] = "ready"
                    self.active_players += 1
                    profile = await self.get_profile_by_id(event["player"])
                    self.tournament_players[str(profile.id)] = profile.nick
                    self.players_order = list(self.tournament_players.keys())
                    random.shuffle(self.players_order)
                    await self.channel_layer.group_send(
                        group,
                        {
                            "type":"tour.players",
                            "player": self.profile_id,
                            "message":"accepted",
                            "opponent": event["player"],
                            "players": self.tournament_players,
                            "config": self.tournament_config,
                            "status": self.players_status,
                            "num_players": self.num_players,
                            "active_players": self.active_players,
                            "order": self.players_order

                        }
                    )
                    await self.channel_layer.group_send(
                        "tournaments",
                        {
                            "type":"tournament.message",
                            "message":"update",
                            "tournament": self.tournament_id,
                            "size": self.num_players,
                            "active": self.active_players
                        }
                    )
                    if self.active_players == self.num_players:
                        self.tournament_filled = True
                        self.game_active = False
                        self.tournament = self.Tournament(self.tournament_players, self.players_order)
                        self.tournament.start()
                        self.match_players = self.tournament.get_match_players()
                        await self.channel_layer.group_send(
                            group,
                            {
                                "type": "tour.players",
                                "player": self.profile_id,
                                "message":"notification",
                                "players": self.match_players,
                            }
                        )
                        keys = list(self.match_players.keys())
                        self.tournament_matches = {str(keys[0]) + str(keys[1]):"wait"}
                        if self.players_status.get(keys[0]) == "ready" and self.players_status.get(keys[1]) == "ready":
                            self.tournament_matches[str(keys[0]) + str(keys[1])] = "started"
                            self.game_active = True
                            self.game_type = self.tournament.get_round_name()
                            await self.channel_layer.group_send(
                                group,
                                {
                                    "type": "tour.players",
                                    "player": self.profile_id,
                                    "message":"startgame",
                                    "gametype":self.game_type,
                                    "players": self.match_players,
                                }
                            )
                        else:
                            asyncio.create_task(self.countdown(keys[0], keys[1]))
                else:
                    await self.channel_layer.group_send(
                        group,
                        {
                            "type":"tour.players",
                            "player": self.profile_id,
                            "message":"full",
                            "opponent": event["player"],
                        }
                    )
        elif event["message"] == "accepted":
            if event["opponent"] == self.profile_id:
                self.joined_tour = True
                self.tournament_players = event["players"]
                self.tournament_config = event["config"]
                self.num_players = event["num_players"]
                await self.send(text_data=json.dumps(
                        {
                            "app":"pong",
                            "type":"joined.tournament",
                            "players":self.tournament_players,
                            "config":self.tournament_config,
                        }
                    )
                )
            if self.joined_tour:
                self.players_order = event["order"]
                self.tournament_players = event["players"]
                self.players_status = event["status"]
                self.active_players = event["active_players"]
                if self.active_players == self.num_players:
                    self.tournament_filled = True
                    self.game_active = False
                    self.tournament = self.Tournament(self.tournament_players, self.players_order)
                    self.tournament.start()
                    self.match_players = self.tournament.get_match_players()
                    keys = list(self.match_players.keys())
                    self.tournament_matches = {str(keys[0]) + str(keys[1]):"wait"}
        elif event["message"] == "notification":
            self.drop = False
            await self.send(text_data=json.dumps(
                    {
                        "app":"pong",
                        "type":"notification",
                        "players":event["players"],
                    }
                )
            )
            if self.joined_tour:
                keys = list(self.match_players.keys())
                self.tournament_matches[str(keys[0]) + str(keys[1])] = "wait"
                self.game_active = False
        elif event["message"] == "startgame":
            if self.joined_tour:
                keys = list(self.match_players.keys())
                self.tournament_matches[str(keys[0]) + str(keys[1])] = "started"
                self.game_active = True
            status = "view"
            self.game_type = event["gametype"]
            if str(self.profile_id) in event["players"].keys():
                group = "privtour" + list(event["players"].keys())[0]
                await self.channel_layer.group_add(group, self.channel_name)
                self.tour_game_channel = True
                if str(self.profile_id) == list(event["players"].keys())[0]:
                    status = "host"
                    self.host = True
                    self.opponent = list(event["players"].keys())[1]
                    self.pong_config = self.tournament_config
                else:
                    status = "guest"
                    self.host = False
                    self.opponent = list(event["players"].keys())[0]
                    self.playing = True
            await self.send(text_data=json.dumps(
                    {
                        "app":"pong",
                        "type":"tourgame",
                        "status": status,
                        "gametype": self.game_type,
                        "players":event["players"],
                    }
                )
            )
            if str(self.profile_id) == list(event["players"].keys())[0]:
                asyncio.create_task(self.pong_loop())

        elif event["message"] == "newhost":
            if event["host"] == self.profile_id:
                self.tournament_announcer = True
                self.joined_tournament = False
        elif event["message"] == "endgame":
            if self.tournament_announcer:
                group = "tour" + self.tournament_id
                await asyncio.sleep(10)
                self.tournament.set_winner(event["winner"])
                if self.tournament.advance():
                    self.match_players = self.tournament.get_match_players()
                    await self.channel_layer.group_send(
                        group,
                        {
                            "type": "tour.players",
                            "player": self.profile_id,
                            "message":"notification",
                            "players": self.match_players,
                        }
                    )
                    self.game_active = False
                    keys = list(self.match_players.keys())
                    self.tournament_matches[str(keys[0]) + str(keys[1])] = "wait"
                    if self.players_status.get(keys[0]) == "ready" and self.players_status.get(keys[1]) == "ready": 
                        self.tournament_matches[str(keys[0]) + str(keys[1])] = "started"
                        self.game_active = True
                        self.game_type = self.tournament.get_round_name()
                        await self.channel_layer.group_send(
                            group,
                            {
                                "type": "tour.players",
                                "player": self.profile_id,
                                "message":"startgame",
                                "gametype":self.game_type,
                                "players": self.match_players,
                            }
                        )
                    else:
                        asyncio.create_task(self.countdown(keys[0], keys[1]))
                else:
                    champion = self.tournament.get_champion()
                    if champion != False:
                        await self.channel_layer.group_send(
                            group,
                            {
                                "type": "tour.players",
                                "champion": self.tournament_players[champion],
                                "message":"champion",
                            }
                        )
                    await self.channel_layer.group_send(
                        group,
                        {
                            "type": "tour.players",
                            "player": self.profile_id,
                            "message":"endtour",
                        }
                    )
            elif self.joined_tour:
                self.tournament.set_winner(event["winner"])
                if self.tournament.advance():
                    self.match_players = self.tournament.get_match_players()



        elif event["message"] == "ready":
            if self.game_active == False and self.tournament_filled:
                self.players_status[str(event["player"])] = "ready"
                if self.tournament_announcer:
                    group = "tour" + self.tournament_id
                    keys = list(self.match_players.keys())
                    if self.players_status.get(keys[0]) == "ready" and self.players_status.get(keys[1]) == "ready":
                        self.tournament_matches[str(keys[0]) + str(keys[1])] = "started"
                        self.game_active = True
                        self.game_type = self.tournament.get_round_name()
                        await self.channel_layer.group_send(
                            group,
                            {
                                "type": "tour.players",
                                "player": self.profile_id,
                                "message":"startgame",
                                "gametype":self.game_type,
                                "players": self.match_players,
                            }
                        )
        elif event["message"] == "notready":
            if self.tournament_announcer or self.joined_tour:
                self.players_status[str(event["player"])] = "away"
        elif event["message"] == "drop":
            if self.tournament_announcer or self.joined_tour:
                self.players_status[str(event["player"])] = "drop"


        elif event["message"] == "champion":
            self.drop = False
            await self.send(text_data=json.dumps(
                    {
                        "app":"pong",
                        "type":"champion",
                        "champion":event["champion"],
                    }
                )
            )
        elif event["message"] == "eliminated":
            self.drop = False
            await self.send(text_data=json.dumps(
                    {
                        "app":"pong",
                        "type":"eliminated",
                        "loser":event["loser"],
                    }
                )
            )


        elif event["message"] == "endtour":
            self.tournament_announcer = False
            self.joined_tour = False
            self.tournament_filled = False
            await self.channel_layer.group_discard("tour" + self.tournament_id, self.channel_name)
            self.tournament_channel = False
            await self.channel_layer.group_discard("tournaments", self.channel_name)
            self.tournament_info_chanel = False



        elif event["message"] == "full":
            if event["opponent"] == self.profile_id:
                await self.channel_layer.group_discard("tour" + self.tournament_id, self.channel_name)
                self.tournament_channel = True
                await self.send(text_data=json.dumps(
                        {
                            "app":"pong",
                            "type":"full.tournament",
                        }
                    )
                )



    async def tournament_message(self, event):
        if event["message"] == "info":
            if self.tournament_announcer:
                await self.channel_layer.group_send(
                    "tournaments",
                    {
                        "type":"tournament.message",
                        "message":"update",
                        "tournament": self.tournament_id,
                        "size": self.num_players,
                        "active": self.active_players
                    }
                )
        elif event["message"] == "update":
            await self.send(text_data=json.dumps(
                    {
                        "app":"pong",
                        "type":"tournament.info",
                        "tournament": event["tournament"],
                        "size": event["size"],
                        "active":event["active"]
                    }
                )
            )

    async def players_message(self, event):
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
        if self.host:
            if event["message"] == "join":
                if not self.opponent:
                    self.opponent = event["player"]
                    profile = await self.get_user_profile(self.scope['user'])
                    self.profile_nick = profile.nick
                    group = "host"
                    if self.private_channel:
                        group = "private"
                    else:
                        await self.channel_layer.group_discard("games", self.channel_name)
                        self.games_channel = False
                    await self.channel_layer.group_send(
                        group + self.profile_id,
                        {
                            "type":"opponent.message",
                            "player":self.profile_id,
                            "nick":self.profile_nick,
                            "message":"accepted", 
                            "opponent": self.opponent,
                            "config":self.pong_config,
                        }
                    )
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
            elif event["message"] == "created":
                if self.profile_id != event["player"]:
                    await self.channel_layer.group_send(
                        "private" + event["player"] ,
                        {
                            "type":"opponent.message" ,
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
        try:
            await self.send(text_data=json.dumps(event))
        except:
            pass

    async def end_game(self, event):
        await self.send(text_data=json.dumps(event))
        if self.games_channel:
            await self.channel_layer.group_discard("games", self.channel_name)
            self.games_channel = False
        group = "host"
        if self.private_channel:
            group = "private"
        elif self.tour_game_channel:
            group = "privtour"
        if self.host:
            await self.channel_layer.group_discard(group + self.profile_id, self.channel_name)
        else:
            self.playing = False
            await self.channel_layer.group_discard(group + self.opponent, self.channel_name)
        self.host_channel = False
        self.private_channel = False
        self.tour_game_channel = False
        if self.tournament_channel and self.host:
            winner = self.profile_id
            if event["lPlayer"]["score"] < event["rPlayer"]["score"]:
                winner = self.opponent
            await self.channel_layer.group_send(
                "tour" + self.tournament_id,
                {
                    "type": "tour.players",
                    "player": self.profile_id,
                    "message":"endgame",
                    "winner":winner,
                }
            )

    async def drop_game(self, event):
        await self.send(text_data=json.dumps(event))
        self.playing = False
        if self.games_channel:
            if int(event["date"]) > self.creating_game:
                await self.channel_layer.group_discard("games", self.channel_name)
                self.games_channel = False
        if self.host_channel or self.private_channel:
            if int(event.get("date", self.creating_game + 1)) > self.creating_game:
                group = ""
                if self.private_channel:
                    group = "private"
                else:
                    group = "host"
                if self.host:
                    await self.channel_layer.group_discard(group + self.profile_id, self.channel_name)
                else:
                    await self.channel_layer.group_discard(group + self.opponent, self.channel_name)
                self.host_channel = False
                self.private_channel = False
        elif self.tour_game_channel:
            group = "privtour"
            winner = self.profile_id
            if self.host:
                await self.channel_layer.group_discard(group + self.profile_id, self.channel_name)
            else:
                await self.channel_layer.group_discard(group + self.opponent, self.channel_name)
            self.tour_game_channel = False
            if not self.drop:
                await self.channel_layer.group_send(
                    "tour" + self.tournament_id,
                    {
                        "type": "tour.players",
                        "player": self.profile_id,
                        "message":"endgame",
                        "winner":winner,
                    }
                )

    async def countdown(self, lPlayer, rPlayer):
        await asyncio.sleep(60)
        if self.tournament_matches[str(lPlayer) + str(rPlayer)] == "wait":
            winner = lPlayer
            loser_id = rPlayer
            if self.players_status.get(rPlayer) == "ready":
                winner = rPlayer
                loser_id = lPlayer
            await self.channel_layer.group_send(
                "tour" + self.tournament_id,
                {
                    "type": "tour.players",
                    "player": self.profile_id,
                    "message":"endgame",
                    "winner":winner,
                }
            )
            loser = self.tournament_players[str(loser_id)]
            await self.channel_layer.group_send(
                "tour" + self.tournament_id,
                {
                    "type": "tour.players",
                    "player": self.profile_id,
                    "message":"eliminated",
                    "loser":loser,
                }
            )

    async def pong_loop(self):
        self.initPong()
        self.playing = True
        while (self.playing):
            await self.updatePong()
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
        group = "host"
        if self.private_channel:
            group = "private"
        elif self.tour_game_channel:
            group = "privtour"
        await self.channel_layer.group_send(
            group + self.profile_id ,
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
            game = "Single Match"
            if self.tour_game_channel:
                game = "Tournament " + self.game_type
            await self.save_match(user_profile, guest_profile, self.lPlayer["score"], self.rPlayer["score"], game)
            await self.channel_layer.group_send(
            group + self.profile_id,
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
        group = "host"
        if self.private_channel:
            group = "private"
        elif self.tour_game_channel:
            group = "privtour"
        await self.channel_layer.group_send(
            group + self.profile_id ,
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
        
    class Tournament:
        def __init__(self, players, order):
            self.players = players
            self.rounds = []
            self.current_round = 0
            self.order = order

        def start(self):
            tour_round = self.Round(self.order)
            self.rounds.append(tour_round)

        def advance(self):
            if self.rounds[self.current_round].get_length() == 1:
                return False
            if self.rounds[self.current_round].is_finished():
                self.next_round()
            else:
                self.rounds[self.current_round].advance()
            return True
        
        def next_round(self):
            winners = self.rounds[self.current_round].get_winners()
            tour_round = self.Round(winners)
            self.rounds.append(tour_round)
            self.current_round += 1

        def set_winner(self, winner):
            self.rounds[self.current_round].set_winner(winner)

        def get_match_players(self):
            players = self.rounds[self.current_round].get_match_players()
            return {players[0]:self.players[players[0]], players[1]:self.players[players[1]], "lPlayer":players[0] , "rPlayer":players[1]}
        def get_champion(self):
            if self.rounds[self.current_round].get_length == 1:
                return False
            else:
                winners = self.rounds[self.current_round].get_winners()
                return winners[0]

        
        def get_round_name(self):
            length = self.rounds[self.current_round].get_length()
            if length == 1:
                return "Final"
            elif length == 2:
                return "Semifinal"
            elif length == 4:
                return "Quarter-final"
            elif length == 8:
                return "Round of 16"
            else:
                return "Match"

        class Round:
            def __init__(self, players):
                players_index = 0
                self.matches = []
                for i in range(int(len(players)/2)):
                    self.matches.append(self.Match(players[players_index], players[players_index + 1]))
                    players_index += 2
                self.current_match = 0

            def advance(self):
                self.current_match += 1

            def set_winner(self, winner):
                self.matches[self.current_match].set_winner(winner)

            def get_length(self):
                return len(self.matches)

            def is_finished(self):
                return self.current_match + 1 == len(self.matches)

            def get_match_players(self):
                return self.matches[self.current_match].get_players()

            def get_winners(self):
                winners = []
                for i in range(len(self.matches)):
                    winners.append(self.matches[i].get_winner())
                return winners

            class Match:

                def __init__(self, l_player, r_player):
                    self.winner = ""
                    self.l_player = l_player
                    self.r_player = r_player
        
                def set_winner(self, winner):
                    self.winner = winner

                def get_winner(self):
                    return self.winner

                def get_players(self):
                    return [self.l_player, self.r_player]

