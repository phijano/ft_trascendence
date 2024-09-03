import Tournament from "./Tournament.js"

const tournament = new Tournament();

let host;

let gameMode;
let opponent;
let difficulty;

let gameConfig = // Initialize to normal settings
{
	playAI : false,
	msAIcalcRefresh: 1000,
	playerHeight: 50,
	startSpeed: 7.5,
	speedUpMultiple: 1.02,
	playerSpeed: 5,
	pointsToWin: 3,
	ballSide: 10,
	allowPowerUp: false,
	boardWidth: 700,
	boardHeight: 500
}

function applySettings() {
    gameConfig.playerHeight = parseFloat(document.getElementById("playerSize").value);
    gameConfig.startSpeed = parseFloat(document.getElementById("ballSpeed").value);
    gameConfig.playerSpeed = parseFloat(document.getElementById("playerSpeed").value);
    gameConfig.speedUpMultiple = parseFloat(document.getElementById("ballSpeedUp").value);
	gameConfig.pointsToWin = parseInt(document.getElementById("pointsToWin").value);
	gameConfig.ballSide = parseFloat(document.getElementById("ballSize").value);
	gameConfig.allowPowerUp = document.getElementById("allowFreezeFlip").checked;

	let boardSize = document.getElementById("boardSize").value;
	switch (boardSize) 
	{
        case "small":
            gameConfig.boardWidth = 500;
            gameConfig.boardHeight = 400;
            break;
        case "normal":
            gameConfig.boardWidth = 700;
            gameConfig.boardHeight = 500;
            break;
        case "big":
            gameConfig.boardWidth = 900;
            gameConfig.boardHeight = 700;
            break;
        default:
            gameConfig.boardWidth = 700;
            gameConfig.boardHeight = 500;
            break;
    }
}

//menu

function startLocal() {
    applySettings();
	hideRemote();
	hideTournament();
    hideCustomizationOptions();
    setLocal();
}

function startRemote() {
    applySettings();
	hideLocal();
	hideTournament();
    hideCustomizationOptions();
    setRemote();
}

function regStartTournamentMode() {
    applySettings();
	hideLocal();
	hideRemote();
    hideCustomizationOptions();
    setTournament();
}

function regShowCustomizationOptions() {
	dropGame();
	stop();
	hideLocal();	
	hideRemote();
	hideTournament();
	document.getElementById("bSettings").disabled = true;
    document.getElementById("dCustomizationOptions").hidden = false;
}

function hideLocal() {
	document.getElementById("dLocalSettings").hidden = true;
	document.getElementById("bLocalGame").disabled = false;
	document.getElementById("board").style.visibility = "hidden";
	document.getElementById("dMatchPlayers").hidden = true;
	document.getElementById("dStartGame").hidden = true;
	document.getElementById("dWinner").hidden = true;
}

function hideRemote() {
	document.getElementById("dRemoteSettings").hidden = true;
	document.getElementById("bRemoteGame").disabled = false;
	document.getElementById("board").style.visibility = "hidden";
	document.getElementById("dMatchPlayers").hidden = true;
	document.getElementById("dStartGame").hidden = true;
	document.getElementById("dWinner").hidden = true;
	document.getElementById("dGameMessage").hidden = true;

}

function hideTournament() {
	document.getElementById("bTournament").disabled = false;
	document.getElementById("dTournamentSettings").hidden = true;
}

function hideCustomizationOptions() {
	document.getElementById("bSettings").disabled = false;
    document.getElementById("dCustomizationOptions").hidden = true;
}

function setLocal() {
	dropGame()
	document.getElementById("bLocalGame").disabled = true;
	document.getElementById("dLocalSettings").hidden = false;
	document.getElementById("dMatchPlayers").hidden = false;
	document.getElementById("dStartGame").hidden = false;
	document.getElementById("sOpponent").disabled = false;
	document.getElementById("sDifficulty").disabled = false;
	document.getElementById("board").style.visibility = "visible";
	gameMode = "local";
	regSetOpponent();
}

function setTournament() {
	dropGame();
	stop();
	gameConfig.playAI = false;
	gameMode = "tournament";
	document.getElementById("bTournament").disabled = true;
	document.getElementById("dTournamentSettings").hidden = false;
	document.getElementById("sNumPlayers").style.visibility = "visible";
	document.getElementById("lNickWarning").style.visibility = "hidden";
	document.getElementById("iNick").style.visibility = "visible";
	document.getElementById("bRegisterPlayer").style.visibility = "visible";
	document.getElementById("tPlayers").style.visibility = "visible";
	document.getElementById("tPlayers").value = "";
	document.getElementById("bCreate").style.visibility = "hidden";
	tournament.reset();
	addRegisteredPlayer();
}

function setRemote() {
	stop();
	document.getElementById("bRemoteGame").disabled = true;
	document.getElementById("dRemoteSettings").hidden = false;
	document.getElementById("dGameMessage").hidden = true;
	gameMode = "remote";
}

// local game

function addRegisteredPlayer() {

	const nick = document.getElementById("hNick").value;
	if (nick) {
		tournament.addPlayer(nick);
		document.getElementById("tPlayers").value = nick;
	}
}


function regSetOpponent() {
	const sDifficulty = document.getElementById("sDifficulty");

	opponent = Number(document.getElementById("sOpponent").value);
	const nick = document.getElementById("hNick").value;
	console.log(nick);
	if (nick) {
		document.getElementById("lLeftPlayer").innerHTML = nick;
	}
	else {
		document.getElementById("lLeftPlayer").innerHTML = "Player 1";
	}
	if (opponent) {
		sDifficulty.style.visibility = "visible";
		gameConfig.playAI = true;
		setDifficulty();
	}
	else {
		sDifficulty.style.visibility = "hidden";
		gameConfig.playAI = false;
		document.getElementById("lRightPlayer").innerHTML = "Player 2";	
	}
	showPlayers();
}

function regSetDifficulty() {
	difficulty = Number(document.getElementById("sDifficulty").value);
	switch (difficulty) {
		case 0:
			document.getElementById("lRightPlayer").innerHTML = "AI - Easy";
			gameConfig.msAIcalcRefresh = 1200;
			break;
		case 1:
			document.getElementById("lRightPlayer").innerHTML = "AI - Medium";
			gameConfig.msAIcalcRefresh = 1000;
			break;
		case 2:
			document.getElementById("lRightPlayer").innerHTML = "AI - Hard";
			gameConfig.msAIcalcRefresh = 700;	
			break;
		case 3:
			document.getElementById("lRightPlayer").innerHTML = "AI - Impossible";	
			gameConfig.msAIcalcRefresh = 100;
			break;
		default:
			document.getElementById("lRightPlayer").innerHTML = "AI - Medium";
			gameConfig.msAIcalcRefresh = 1000;
			break;
	}
	showPlayers();
}

function showPlayers(players) {
	document.getElementById("dWinner").hidden = true;
	document.getElementById("dAdvance").hidden = true;
	if (gameMode == "tournament")
	{
		document.getElementById("lLeftPlayer").innerHTML = players[0];
		document.getElementById("lRightPlayer").innerHTML = players[1];
	}
	document.getElementById("dStartGame").hidden= false;
	document.getElementById("dMatchPlayers").hidden = false;
	initPong(gameConfig);
}

function regStartPong()
{
	document.getElementById("sOpponent").disabled = true;
	document.getElementById("sDifficulty").disabled = true;
	document.getElementById("dStartGame").hidden = true;
	document.getElementById("board").style.visibility = "visible";
	document.getElementById("dMatchPlayers").hidden = false;
	document.getElementById("dWinner").hidden = true;
	start(gameConfig, true);
}

function regEndMatch(lPlayerScore, rPlayerScore) {
	const winner = document.getElementById("lWinner");
	const lPlayer = document.getElementById("lLeftPlayer").innerHTML;
	const rPlayer = document.getElementById("lRightPlayer").innerHTML;
	let matchType;

	console.log(lPlayerScore + " " + rPlayerScore)
	console.log(lPlayerScore + " " + rPlayerScore)

	if (lPlayerScore > rPlayerScore)
		winner.innerHTML = lPlayer;
	else
		winner.innerHTML = rPlayer;

	document.getElementById("dMatchPlayers").hidden = true;
	document.getElementById("dWinner").hidden = false;

	if (gameMode == "local")
	{
		matchType = "Single Match";
		document.getElementById("sOpponent").disabled = false;
		document.getElementById("sDifficulty").disabled = false;
		document.getElementById("dStartGame").hidden = false;
	}
	else
	{
		matchType = "Tournament " + tournament.roundName;
		tournament.addResult(winner.innerHTML, lPlayerScore, rPlayerScore);
		if (tournament.champion)
		{
			document.getElementById("dMatchPlayers").hidden = true;
			document.getElementById("dWinner").hidden = true;
			document.getElementById("dAdvance").hidden = true;
			document.getElementById("board").style.visibility = "hidden";
			document.getElementById("dChampion").hidden = false;
			document.getElementById("lChampion").innerHTML = winner.innerHTML;
		}
		else
		{
			document.getElementById("dAdvance").hidden = false;
		}
	}
	const nick = document.getElementById("hNick").value;
	if (nick && gameMode != "remote") {
		if (nick == lPlayer) {
			saveMatchResult(lPlayer, "", rPlayer, lPlayerScore, rPlayerScore, matchType);
		}
		else if (nick == rPlayer) {
			saveMatchResult("", rPlayer, lPlayer, lPlayerScore, rPlayerScore, matchType);
		}
	}

}

async function saveMatchResult(lplayer, rplayer, opponent, pl_score, op_score, match_type ) {

	const resp = await fetch('/userManagement/login', {
			method: 'GET',
			credentials: 'same-origin'
	});
	if (resp.ok) {

		console.log("match saving");
		const formdata = new FormData();

		formdata.append("left_player", lplayer);
		formdata.append("right_player", rplayer);
		formdata.append("opponent_name", opponent);
		formdata.append("player_score", pl_score);
		formdata.append("opponent_score", op_score);
		formdata.append("match_type", match_type);
		formdata.append("csrfmiddlewaretoken", document.getElementsByName("csrfmiddlewaretoken")[0].value);

		try {
			const response = await fetch("/pongApp/saveMatch", {
				method: "POST",
				credentials: 'same-origin',
				body: formdata,

			});
			if (response.ok) {
				console.log("match saved?");
			}
			else{
				console.log(await response.json());
			}
		} catch (e) {
			console.error(e)
		}
	}
}

//tournament

function regSelectNumPlayers() {
	const numPlayers = document.getElementById("sNumPlayers");
	const showPlayers = document.getElementById("tPlayers");

	tournament.reset();
	document.getElementById("iNick").style.visibility = "visible";	
	document.getElementById("bRegisterPlayer").style.visibility = "visible";
	document.getElementById("bCreate").style.visibility = "hidden";
	showPlayers.value = "";
	addRegisteredPlayer();
}

function regAddPlayer() {
	const nick = document.getElementById("iNick");
	const showPlayers = document.getElementById("tPlayers");
	const register = document.getElementById("bRegisterPlayer");
	const numPlayers = document.getElementById("sNumPlayers");
	const lNickWarning = document.getElementById("lNickWarning");

	//validate nick
	if (nick.value.length < 3)
	{
		nick.style.borderColor = "red";
		lNickWarning.innerHTML = "Nick too short";
		lNickWarning.style.visibility = "visible";
		return;
	}
	else if (!tournament.addPlayer(nick.value))
	{
		nick.style.borderColor = "red";
		lNickWarning.innerHTML = "Nick already used";	
		lNickWarning.style.visibility = "visible";
		return;
	}
	else
		lNickWarning.style.visibility = "hidden";
	nick.style.borderColor = "";
	showPlayers.value = showPlayers.value ? showPlayers.value + "\n" + nick.value : nick.value;
	nick.value  = null;
	nick.focus();
	if (tournament.length == numPlayers.value)
	{
		nick.style.visibility = "hidden";
		register.style.visibility = "hidden";
		document.getElementById("bCreate").style.visibility = "visible";
	}
}

function regStartTournament() {
	document.getElementById("dStartOptions").hidden = true;
	document.getElementById("bTournament").disabled = false;
	document.getElementById("dEndTournament").hidden = false;
	document.getElementById("dTournamentSettings").hidden = true;
	tournament.startTournament();
	console.log(tournament.matchPlayers);
	showPlayers(tournament.matchPlayers);
	document.getElementById("board").style.visibility = "visible";
	document.getElementById("dGameMessage").hidden = true;
}

function regEndTournament() {
	stop();
	document.getElementById("board").style.visibility = "hidden";
	document.getElementById("dStartOptions").hidden = false;
	document.getElementById("dEndTournament").hidden = true;
	document.getElementById("dMatchPlayers").hidden = true;
	document.getElementById("dWinner").hidden = true;
	document.getElementById("dStartGame").hidden = true;
	document.getElementById("dAdvance").hidden = true;
	document.getElementById("dChampion").hidden = true;
}

function regAdvance() {
	tournament.advance()
	showPlayers(tournament.matchPlayers);
}

//remote game

function createGame() {
	const nick = document.getElementById("hNick").value;
	const profileId = document.getElementById("hProfileId").value;

	host = true;
	sendMessageServer({player: profileId,  app: "pong", action: "create", config: gameConfig});
	document.getElementById("lLeftPlayer").innerHTML = nick;
	document.getElementById("lRightPlayer").innerHTML = "?";
	document.getElementById("dMatchPlayers").hidden = false;
	initPong(gameConfig);
	document.getElementById("board").style.visibility = "visible";
	document.getElementById("dWinner").hidden = true;
	document.getElementById("dGameMessage").hidden = true;
}

function joinGame() {
	const nick = document.getElementById("hNick").value;
	const profileId = document.getElementById("hProfileId").value;

	host = false;
	sendMessageServer({player: profileId,  app: "pong", action: "join"});
	document.getElementById("lLeftPlayer").innerHTML = "?";
	document.getElementById("lRightPlayer").innerHTML = nick;
	document.getElementById("dMatchPlayers").hidden = false;
	initPong(gameConfig);
	document.getElementById("board").style.visibility = "visible";
	document.getElementById("dWinner").hidden = true;
	document.getElementById("dGameMessage").hidden = true;
}

let playing = false
function serverPongMessage(message){ 
	if (message.type == "game.update") {
		updateServerData(message);
		if (!playing) {
			startPongRemote();
			playing = true;
		}
	} else if (message.type == "find.opponent") {
		if (host) {
			document.getElementById("lRightPlayer").innerHTML = message.opponent_nick;
		} else {	
			document.getElementById("lLeftPlayer").innerHTML = message.opponent_nick;
		}
		//config overwrite user config I think, fix this
		initPong(message.config);
		console.log(message.config);
	} else if (message.type == "end.game") {
		console.log("stop")
		updateServerData(message);
		drawServerData();
		stopPongRemote();
		playing = false;
		regEndMatch(message.lPlayer.score, message.rPlayer.score);

	}
	else if (message.type == "drop.game")
	{
		const profileId = document.getElementById("hProfileId").value;
		const winner = document.getElementById("lWinner");
		const lPlayer = document.getElementById("lLeftPlayer").innerHTML;
		const rPlayer = document.getElementById("lRightPlayer").innerHTML;
		const gameMessage = document.getElementById("lGameMessage");

		if (message.player != profileId) {
			if (host) {
				winner.innerHTML = lPlayer;
			} else {
				winner.innerHTML = rPlayer;
			}
			gameMessage.innerHTML = "Opponent left game.";
			document.getElementById("dMatchPlayers").hidden = true;
			document.getElementById("dWinner").hidden = false;
			document.getElementById("dGameMessage").hidden = false;
		}
		playing = false;
		stopPongRemote();
	}
}

function dropGame() {
	if (playing) {
		const profileId = document.getElementById("hProfileId").value;
		sendMessageServer({player: profileId,  app: "pong", action: "drop"});
		stopPongRemote();
		playing = false;
	}
}

//menu
window.remoteStartLocal = startLocal
window.remoteStartRemote = startRemote;
window.remoteStartTournamentMode = regStartTournamentMode;
window.remoteShowCustomizationOptions = regShowCustomizationOptions;

//local game
window.remoteSetOpponent = regSetOpponent;
window.remoteSetDifficulty = regSetDifficulty;
window.remoteStartPong = regStartPong;
window.remoteEndMatch = regEndMatch;

//tournament
window.remoteSelectNumPlayers = regSelectNumPlayers;
window.remoteAddPlayer = regAddPlayer;
window.remoteStartTournament = regStartTournament;
window.remoteAdvance = regAdvance;
window.remoteEndTournament = regEndTournament;

//remote game
window.remoteCreateGame = createGame;
window.remoteJoinGame = joinGame;
window.serverPongMessage = serverPongMessage;
window.dropGame = dropGame;
