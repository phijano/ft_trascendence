import Tournament from "./Tournament.js"

const tournament = new Tournament();

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
}

function selectNumPlayers() {
	const numPlayers = document.getElementById("sNumPlayers");
	const showPlayers = document.getElementById("tPlayers");

	tournament.reset();
	document.getElementById("iNick").style.visibility = "visible";	
	document.getElementById("bRegisterPlayer").style.visibility = "visible";
	document.getElementById("bCreate").style.visibility = "hidden";
	showPlayers.value = "";
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


	console.log(lPlayerScore + " " + rPlayerScore)
	console.log(lPlayerScore + " " + rPlayerScore)

	if (lPlayerScore > rPlayerScore)
		winner.innerHTML = document.getElementById("lLeftPlayer").innerHTML;
	else
		winner.innerHTML = document.getElementById("lRightPlayer").innerHTML;

	document.getElementById("dMatchPlayers").hidden = true;
	document.getElementById("dWinner").hidden = false;

	if (gameMode == "normal")
	{
		document.getElementById("sOpponent").disabled = false;
		document.getElementById("sDifficulty").disabled = false;
		document.getElementById("dStartGame").hidden = false;
	}
	else
	{
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
	document.getElementById("dMatchPlayers").hidden = false;
	document.getElementById("dStartGame").hidden = false;
	document.getElementById("sOpponent").disabled = false;
	document.getElementById("sDifficulty").disabled = false;
	document.getElementById("board").style.visibility = "visible";
	gameMode = "normal";
	setOpponent();
}

function setOpponent() {
	const sDifficulty = document.getElementById("sDifficulty");

	opponent = Number(document.getElementById("sOpponent").value);
	document.getElementById("lLeftPlayer").innerHTML = "Player 1";
	if (opponent)
	{
		sDifficulty.style.visibility = "visible";
		gameConfig.playAI = true;
		setDifficulty();
	}
	else
	{
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


window.setRules = setRules;
window.showRules = showRules;
window.closeRules = closeRules;

window.setOneVsOne = setOneVsOne;
window.setOpponent = setOpponent;
window.setDifficulty = setDifficulty;
window.endMatch = endMatch;
window.setTournament = setTournament;
window.selectNumPlayers = selectNumPlayers;
window.addPlayer = addPlayer;
window.startTournament = startTournament;
window.startPong = startPong;
window.advance = advance;
window.endTournament = endTournament;

window.showCustomizationOptions = showCustomizationOptions;
window.startOneVsOne = startOneVsOne;
window.startTournamentMode = startTournamentMode;
