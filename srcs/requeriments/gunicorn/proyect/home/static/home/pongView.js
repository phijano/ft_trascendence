import Tournament from "./Tournament.js"

const tournament = new Tournament();

let host;
let playing = false
let ready = false
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

function startTournamentMode() {
    applySettings();
	hideLocal();
	hideRemote();
    hideCustomizationOptions();
    setTournament();
}

function showCustomizationOptions() {
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
	setOpponent();
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


function setOpponent() {
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

function setDifficulty() {
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

function startPong()
{
	document.getElementById("sOpponent").disabled = true;
	document.getElementById("sDifficulty").disabled = true;
	document.getElementById("dStartGame").hidden = true;
	document.getElementById("board").style.visibility = "visible";
	document.getElementById("dMatchPlayers").hidden = false;
	document.getElementById("dWinner").hidden = true;
	start(gameConfig);
}

function endMatch(lPlayerScore, rPlayerScore) {
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
	else if (gameMode == "tournament")
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
	try {
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
				console.log(e)
			}
		}
	} catch (e){
		console.log(e)
	}
}

//tournament

function selectNumPlayers() {
	const numPlayers = document.getElementById("sNumPlayers");
	const showPlayers = document.getElementById("tPlayers");

	tournament.reset();
	document.getElementById("iNick").style.visibility = "visible";	
	document.getElementById("bRegisterPlayer").style.visibility = "visible";
	document.getElementById("bCreate").style.visibility = "hidden";
	showPlayers.value = "";
	addRegisteredPlayer();
}

function addPlayer() {
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

function startTournament() {
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

function endTournament() {
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

function advance() {
	tournament.advance()
	showPlayers(tournament.matchPlayers);
}

//remote game

async function createGame() {
	const nick = document.getElementById("hNick").value;
	const profileId = document.getElementById("hProfileId").value;

	dropGame();
	await sleep(1);
	host = true;
	sendMessageServer({player: profileId,  app: "pong", action: "create", privateGame:"no", config: gameConfig, date: Date.now()});
	document.getElementById("lLeftPlayer").innerHTML = nick;
	document.getElementById("lRightPlayer").innerHTML = "?";
	document.getElementById("dMatchPlayers").hidden = false;
	initPong(gameConfig);
	document.getElementById("board").style.visibility = "visible";
	document.getElementById("dWinner").hidden = true;
	document.getElementById("dGameMessage").hidden = true;
}

async function joinGame() {
	const nick = document.getElementById("hNick").value;
	const profileId = document.getElementById("hProfileId").value;

	dropGame();
	await sleep(1);
	host = false;
	sendMessageServer({player: profileId,  app: "pong", action: "join", privateGame:"no", date: Date.now()});
	document.getElementById("lLeftPlayer").innerHTML = "?";
	document.getElementById("lRightPlayer").innerHTML = nick;
	document.getElementById("dMatchPlayers").hidden = false;
	initPong(gameConfig);
	document.getElementById("board").style.visibility = "visible";
	document.getElementById("dWinner").hidden = true;
	document.getElementById("dGameMessage").hidden = true;
}

async function createPrivateGame() {
	const nick = document.getElementById("hNick").value;
	const profileId = document.getElementById("hProfileId").value;

	dropGame();
	await sleep(1);
	host = true;
	sendMessageServer({player: profileId,  app: "pong", action: "create", privateGame:"yes", config: gameConfig, date: Date.now()});
	document.getElementById("lLeftPlayer").innerHTML = nick;
	document.getElementById("lRightPlayer").innerHTML = "waiting..";
	document.getElementById("dMatchPlayers").hidden = false;
	initPong(gameConfig);
	document.getElementById("board").style.visibility = "visible";
	document.getElementById("dWinner").hidden = true;
	document.getElementById("dGameMessage").hidden = true;
}

async function joinPrivateGame(hostId) {
	const nick = document.getElementById("hNick").value;
	const profileId = document.getElementById("hProfileId").value;

	dropGame();
	await sleep(1);
	host = false;
	sendMessageServer({player: profileId,  app: "pong", action: "join", privateGame:"yes", opponent:hostId, date: Date.now()});
	document.getElementById("lLeftPlayer").innerHTML = "waiting";
	document.getElementById("lRightPlayer").innerHTML = nick;
	document.getElementById("dMatchPlayers").hidden = false;
	initPong(gameConfig);
	document.getElementById("board").style.visibility = "visible";
	document.getElementById("dWinner").hidden = true;
	document.getElementById("dGameMessage").hidden = true;
}


function serverPongMessage(message){ 
	if (message.type == "game.update") {
		updateServerData(message);
		if (ready) {
			startPongRemote();
			playing = true;
			ready = false;
		}
	} else if (message.type == "find.opponent") {
		if (host) {
			document.getElementById("lRightPlayer").innerHTML = message.opponent_nick;
		} else {	
			document.getElementById("lLeftPlayer").innerHTML = message.opponent_nick;
		}
		initPong(message.config);
		console.log(message.config);
		ready = true;
	} else if (message.type == "end.game") {
		console.log("stop")
		updateServerData(message);
		drawServerData();
		stopPongRemote();
		playing = false;
		endMatch(message.lPlayer.score, message.rPlayer.score);

	} else if (message.type == "drop.game") {
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


const sleep = function(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function dropGame() {
	if (playing) {
		const profileId = document.getElementById("hProfileId").value;
		sendMessageServer({player: profileId,  app: "pong", action: "drop", date: Date.now()});
		stopPongRemote();
		playing = false;
	}
}


function setRules() {
	document.getElementById("dSidePanel").hidden = false;
}

function showRules() {
	const sidePanel = document.getElementById("dSidePanel");

	sidePanel.style.transition = "0.5s, border 0s, color 0s 0.5s";
	sidePanel.style.color = "black";
	sidePanel.style.borderWidth = "2px";
	sidePanel.style.width = "250px";
}

function closeRules() {
	const sidePanel = document.getElementById("dSidePanel");
	sidePanel.style.width = "0";
	sidePanel.style.transition = "0.5s, border 0.1s 0.5s ,color 0s";
	sidePanel.style.borderWidth = "0px";
	sidePanel.style.color="white";
}


//menu
window.pongStartLocal = startLocal
window.pongStartRemote = startRemote;
window.pongStartTournamentMode = startTournamentMode;
window.pongShowCustomizationOptions = showCustomizationOptions;

//local game
window.pongSetOpponent = setOpponent;
window.pongSetDifficulty = setDifficulty;
window.pongStartPong = startPong;
window.pongEndMatch = endMatch;

//tournament
window.pongSelectNumPlayers = selectNumPlayers;
window.pongAddPlayer = addPlayer;
window.pongStartTournament = startTournament;
window.pongAdvance = advance;
window.pongEndTournament = endTournament;

//remote game
window.pongCreateGame = createGame;
window.pongCreatePrivateGame = createPrivateGame;
window.pongJoinGame = joinGame;
window.pongJoinPrivateGame = joinPrivateGame;
window.serverPongMessage = serverPongMessage;
window.dropGame = dropGame;

//rules

window.pongSetRules = setRules;
window.pongShowRules = showRules;
window.pongCloseRules = closeRules;

