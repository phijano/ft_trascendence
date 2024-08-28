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

function showCustomizationOptions() {
	stop();
	document.getElementById("bSettings").disabled = true;
    document.getElementById("dCustomizationOptions").hidden = false;
	hideTournament();
	hideOneVsOne();
}

function hideCustomizationOptions() {
	document.getElementById("bSettings").disabled = false;
    document.getElementById("dCustomizationOptions").hidden = true;
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

function startOneVsOne() {
    applySettings();
	hideTournament();
    hideCustomizationOptions();
    setOneVsOne();
}

function startTournamentMode() {
    applySettings();
	hideOneVsOne();
    hideCustomizationOptions();
    setTournament();
}

function hideTournament() {
	document.getElementById("bTournament").disabled = false;
	document.getElementById("dTournamentSettings").hidden = true;
}

function hideOneVsOne() {
	document.getElementById("dOneVsOneSettings").hidden = true;
	document.getElementById("bNormalGame").disabled = false;
	document.getElementById("board").style.visibility = "hidden";
	document.getElementById("dMatchPlayers").hidden = true;
	document.getElementById("dStartGame").hidden = true;
	document.getElementById("dWinner").hidden = true;
}

function addRegisteredPlayer() {

	const nick = document.getElementById("hNick").value;
	if (nick) {
		tournament.addPlayer(nick);
		document.getElementById("tPlayers").value = nick;
	}
}

function setTournament() {

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

	if (gameMode == "normal")
	{
		matchType = "Single Match"
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
	if (nick) {
		if (nick == lPlayer) {
			saveMatchResult(lPlayer, "", rPlayer, lPlayerScore, rPlayerScore, matchType);
		}
		else if (nick == rPlayer) {
			saveMatchResult("", rPlayer, lPlayer, lPlayerScore, rPlayerScore, matchType);
		}		
	}

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

function advance() {
	tournament.advance()
	showPlayers(tournament.matchPlayers);
}

function setOneVsOne() {
	stop();
	document.getElementById("bNormalGame").disabled = true;
	document.getElementById("dOneVsOneSettings").hidden = false;
//	document.getElementById("dMatchPlayers").hidden = false;
//	document.getElementById("board").style.visibility = "visible";
	gameMode = "normal";
}

function createGame() {
	const nick = document.getElementById("hNick").value;
	const profileId = document.getElementById("hProfileId").value;

	host = true;
	sendMessageServer({player: profileId,  app: "pong", action: "create", config: gameConfig});
	document.getElementById("lLeftPlayer").innerHTML = nick;
	document.getElementById("lRightPlayer").innerHTML = "?";
	document.getElementById("dMatchPlayers").hidden = false;
	document.getElementById("board").style.visibility = "visible";
}

function joinGame() {
	const nick = document.getElementById("hNick").value;
	const profileId = document.getElementById("hProfileId").value;

	host = false;
	sendMessageServer({player: profileId,  app: "pong", action: "join"});
	document.getElementById("lLeftPlayer").innerHTML = "?";
	document.getElementById("lRightPlayer").innerHTML = nick;
	document.getElementById("dMatchPlayers").hidden = false;
	document.getElementById("board").style.visibility = "visible";
}

let start = true
function serverPongMessage(message){ 
	if (message.type == "game.update") {
		updateServerData(message);
		if (start) {
			serverGameLoop();
			start = false;
	}
		console.log(message.app);
	} else if (message.type == "find_opponent") {
		if (host) {
			document.getElementById("lRightPlayer").innerHTML = message.opponent_nick;
		} else {	
			document.getElementById("lLeftPlayer").innerHTML = message.opponent_nick;
		}
		//config overwrite user config I think, fix this
		initPong(message.config);
		console.log(message.config);
	}
	else if (message.type == "end_game"){
		console.log("stop")
		updateServerData(message);
		drawServerData();
		stop();
		start = true
	}
	else if (message.type == "opponent_drop")
	{
		console.log(message.app);
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

window.remoteSetOneVsOne = setOneVsOne;
window.remoteCreateGame = createGame;
window.remoteJoinGame = joinGame;
window.serverPongMessage = serverPongMessage;


window.remoteEndMatch = endMatch;
window.remoteSetTournament = setTournament;
window.remoteSelectNumPlayers = selectNumPlayers;
window.remoteAddPlayer = addPlayer;
window.remoteStartTournament = startTournament;
window.remoteStartPong = startPong;
window.remoteAdvance = advance;
window.remoteEndTournament = endTournament;

window.remoteShowCustomizationOptions = showCustomizationOptions;
window.remoteStartOneVsOne = startOneVsOne;
window.remoteStartTournamentMode = startTournamentMode;
