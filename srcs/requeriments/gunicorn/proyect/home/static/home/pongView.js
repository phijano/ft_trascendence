import Tournament from "./Tournament.js"

const tournament = new Tournament();

let host;
let playing = false
let ready = false
let gameMode;
let opponent;
let difficulty;

let remoteTournaments = new Object();
let remoteTourConfig = "";
let remoteTourGamePlayers= "";
let remoteTourGameHost = false;
let joinedRemoteTournament = false;
let viewingRemoteTournament = false;
let tournamentOngoing = false;
let notificatedRemoteTournament = false;
let finalMatch = false;

let currentToast;

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
    // Obtén el valor de la opción seleccionada
    const selectedOption = document.querySelector("#sOpponentContainer .option.selected");
    const selectedValue = selectedOption ? selectedOption.getAttribute("data-value") : null;

	hide3D();
    // Ejecuta acciones según la opción seleccionada
    if (selectedValue === "1"){  // Multiplayer seleccionado
		show_multi();
    } else if (selectedValue === "2") {  // 3D seleccionado
		show_3D();
	} else 
	{  // Cualquier otro valor
		hideMultiplayer();
		hide3D();
		setLocal();
	}
}


function startRemote() {
    applySettings();
	hideLocal();
	hideTournament();
    hideCustomizationOptions();
	hideMultiplayer();
	hide3D();
    setRemote();
}

function startTournamentMode() {
    applySettings();
	hideLocal();
	hideRemote();
    hideCustomizationOptions();
	hideMultiplayer();
	hide3D();
    setTournament();
}

function startTournamentRemoteMode() {
    applySettings();
	hideLocal();
	hideRemote();
    hideCustomizationOptions();
	hideMultiplayer();
	hide3D();
	gameMode = "remoteTour"
	if (joinedRemoteTournament)
	{
		console.log("joined");
		viewingRemoteTournament = true;
		showRemoteTournament();
	}
	else {
		console.log("not created/joined");
		setRemoteTournament();
	}
}

function showCustomizationOptions() {
	dropGame();
	stop();
	hideLocal();	
	hideRemote();
	hideTournament();
	hideMultiplayer();
	hide3D();
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
	document.getElementById("chooseIndicator").hidden = true;
}

function hideRemote() {
	document.getElementById("dRemoteSettings").hidden = true;
	document.getElementById("bRemoteGame").disabled = false;
	document.getElementById("board").style.visibility = "hidden";
	document.getElementById("dMatchPlayers").hidden = true;
	document.getElementById("dStartGame").hidden = true;
	document.getElementById("dWinner").hidden = true;
	document.getElementById("dGameMessage").hidden = true;
	document.getElementById("chooseIndicator").hidden = true;
}

function hideTournament() {
	viewingRemoteTournament = false;
	document.getElementById("bTournament").disabled = false;
	document.getElementById("dTournamentSettings").hidden = true;
	document.getElementById("dTournamentsMessage").hidden = true;

	document.getElementById("chooseIndicator").hidden = true;
}

function hideMultiplayer() {
	document.getElementById("dMultiplayerSettings").hidden = true;
}

function hide3D() {
	document.getElementById("d3Dsettings").hidden = true;
}

function hideCustomizationOptions() {
	document.getElementById("bSettings").disabled = false;
    document.getElementById("dCustomizationOptions").hidden = true;
	document.getElementById("chooseIndicator").hidden = true;
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

function setRemoteTournament() {
	dropGame();
	stop();
	document.getElementById("bTournament").disabled = true;
	document.getElementById("dTournamentSettings").hidden = false;
	document.getElementById("sNumPlayers").style.visibility = "visible";
	const tournamentsInfo = document.getElementById("dTournamentsInfo");
	tournamentsInfo.innerHTML = "";
	viewingRemoteTournament = true;
	sendMessageServer({app: "pong", action: "infoTournament"})
}

function showRemoteTournament() {
	
	const profileId = document.getElementById("hProfileId").value;
	if (notificatedRemoteTournament == true){
		notificatedRemoteTournament = false;
		let players = []
		for (var key in remoteTourGamePlayers) {
			players.push(remoteTourGamePlayers[key])
		}
		console.log("show_remote_playes");
		
		let lPlayer = remoteTourGamePlayers[remoteTourGamePlayers['lPlayer']];
		let rPlayer = remoteTourGamePlayers[remoteTourGamePlayers['rPlayer']];
		//let lPlayer = remoteTourGamePlayers[remoteTourGamePlayers['lPlayer']]
		
		//let rPlayer = remoteTourGamePlayers[remoteTourGamePlayers['rPlayer']]
		//conole.log("lplayer" + lPlayer);
		//console.log("rplayer" + rPlayer);
		document.getElementById("dTournamentsMessage").hidden = true;
//		document.getElementById("dStartOptions").hidden = true;
		document.getElementById("bTournament").disabled = false;
		document.getElementById("dTournamentSettings").hidden = true;
		document.getElementById("board").style.visibility = "visible";
		document.getElementById("dGameMessage").hidden = true;
		document.getElementById("dWinner").hidden = true;
		document.getElementById("dAdvance").hidden = true;
		document.getElementById("lLeftPlayer").innerHTML = lPlayer;
		document.getElementById("lRightPlayer").innerHTML = rPlayer;
		document.getElementById("dMatchPlayers").hidden = false;
		initPong(remoteTourConfig);
	}
	else if (tournamentOngoing) {
		console.log("ongoing")
		document.getElementById("bTournament").disabled = true;
		document.getElementById("dTournamentSettings").hidden = true;
		const tournamentsInfo = document.getElementById("dTournamentsInfo");
		tournamentsInfo.innerHTML = "";
		const tournamentsMessage = document.getElementById("dTournamentsMessage");
		tournamentsMessage.hidden = false
		tournamentsMessage.innerHTML = "<p>Waiting for next Match</p>";
//		document.getElementById("dStartOptions").hidden = true;
		document.getElementById("board").style.visibility = "hidden";
		document.getElementById("dGameMessage").hidden = true;
		document.getElementById("dWinner").hidden = true;
		document.getElementById("dAdvance").hidden = true;
		document.getElementById("dMatchPlayers").hidden = true;


	}
	else {
		console.log("notstarted")
		document.getElementById("bTournament").disabled = true;
		document.getElementById("dTournamentSettings").hidden = true;
		const tournamentsInfo = document.getElementById("dTournamentsInfo");
		tournamentsInfo.innerHTML = "";

		const tournamentsMessage = document.getElementById("dTournamentsMessage");
		tournamentsMessage.hidden = false
		tournamentsMessage.innerHTML = "<p>Waiting for Players to join</p>";
//		document.getElementById("dStartOptions").hidden = true;
		document.getElementById("board").style.visibility = "hidden";
		document.getElementById("dGameMessage").hidden = true;
		document.getElementById("dWinner").hidden = true;
		document.getElementById("dAdvance").hidden = true;
		document.getElementById("dMatchPlayers").hidden = true;
	}
	if (joinedRemoteTournament) {
		sendMessageServer({player: profileId, app: "pong", action: "ready"})
	}
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

	if (gameMode == "local") {
		matchType = "Single Match";
		document.getElementById("sOpponent").disabled = false;
		document.getElementById("sDifficulty").disabled = false;
		document.getElementById("dStartGame").hidden = false;
	}
	else if (gameMode == "tournament") {
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
	else if (gameMode == "remoteTour") {
		if (finalMatch) {
			document.getElementById("dMatchPlayers").hidden = true;
			document.getElementById("dWinner").hidden = true;
			document.getElementById("board").style.visibility = "hidden";
			document.getElementById("dChampion").hidden = false;
			document.getElementById("lChampion").innerHTML = winner.innerHTML;
		}
	}
	const nick = document.getElementById("hNick").value;
	if (nick && gameMode != "remote" && gameMode != "remoteTour") {
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


//remote tournament


function updateTournamentsInfo() {
	const tournamentsInfo = document.getElementById("dTournamentsInfo");
	let newInfo = "";

	for (var key in remoteTournaments){

		newInfo = newInfo + "<p> Tournament " + remoteTournaments[key][0] + "/" + remoteTournaments[key][1]  +"<button class=\"btn btn-danger btn-sm\" onclick=\"pongJoinRemoteTournament('"+ key +"')\">Join</button>" + "</p>";

		console.log(remoteTournaments[key]);
	}
	try {
	tournamentsInfo.innerHTML = newInfo;
	} catch (error) {
		console.log("tour update");
	}

}

function createRemoteTournament() {
	const numPlayers = document.getElementById("sNumPlayers");
	const profileId = document.getElementById("hProfileId").value;
	
	setNotificationId();
	remoteTourConfig = gameConfig;	
	console.log("created");
	joinedRemoteTournament = true;
	document.getElementById("dTournamentSettings").hidden = true;
	sendMessageServer({player: profileId, app: "pong", action: "createTournament", size: numPlayers.value, config: gameConfig})
	showRemoteTournament();
}

function joinRemoteTournament(tournamentId) {
	const profileId = document.getElementById("hProfileId").value;

	setNotificationId();
	console.log("joined");
	joinedRemoteTournament = true;
	document.getElementById("dTournamentSettings").hidden = true;
	sendMessageServer({player: profileId, app: "pong", action: "joinTournament", tournament: tournamentId});
	showRemoteTournament();
}

function setNotificationId() {
	const profileId = document.getElementById("hProfileId").value;
	const notificationId = document.getElementById("hNotificationId");
	
	if (notificationId == null) {
		const divNot = document.createElement('div');
		divNot.id = "dNotification";
		const hiddenId = document.createElement('input');
		hiddenId.id = "hNotificationId";
		hiddenId.hidden = true;
		hiddenId.value = profileId;
		divNot.append(hiddenId);
		document.body.appendChild(divNot);
	}
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
	else if (message.type == "tournament.info") {
		if (message.active == message.size)
			delete remoteTournaments[message.tournament]
		else
			remoteTournaments[message.tournament] = [message.active, message.size];
		console.log("tournament_info");
		updateTournamentsInfo();
		for (var key in remoteTournaments){
			console.log(remoteTournaments[key]);
		}
	}
	else if (message.type == "joined.tournament") {
		remoteTourConfig = message.config;
	}
	else if (message.type == "full.tournament") {
		joinedRemoteTournament = false;
		document.getElementById("dTournamentSettings").hidden = false;
		console.log("full");
	}
	else if (message.type == "notification"){
		const profileId = document.getElementById("hNotificationId").value;
		tournamentOngoing = true;
		remoteTourGamePlayers = message.players;
		console.log(message.players);
		for (var key in message.players) {
			if (key == profileId) {
				notification();
				notificatedRemoteTournament = true;

			}    
			console.log(key);
		}
		console.log("notification");
		if (viewingRemoteTournament == true) {
			showRemoteTournament();
		}
	}
	else if (message.type == "champion"){
		console.log("champion_notif")
		notification(message.champion);
		joinedRemoteTournament = false;
		tournamentOngoing = false;
	}
	else if (message.type == "tourgame"){
		ready = true;
		if (message.gametype == "Final") {
			finalMatch = true;
		} else {
			finalMatch = false;
		}

	}
	else if (message.type == "eliminated")
	{
		console.log("player_eliminated");
		notification(null, message.loser);
	}
}

function notification(champion, eliminated){
	if (!currentToast)
	{
		currentToast = document.createElement('div');
		currentToast.id = "dToast";
		currentToast.classList.add('toast-container', 'position-absolute', 'top-0', 'end-0', 'p-3');
	}
	const toast = document.createElement('div');
	toast.classList.add('toast', 'align-items-center', 'show');

	const toastHeader = document.createElement('div');
	toastHeader.classList.add('toast-header');

	const toastHeaderMessage = document.createElement('strong');
	if (champion) {
		console.log("champion");
		toastHeaderMessage.innerText = 'CHAMPION';
	}
	else if (eliminated) {	
		toastHeaderMessage.innerText = 'Player Eliminated';
	}
	else {
		toastHeaderMessage.innerText = 'Tournament Battle';
	}
	const toastHeaderClose = document.createElement('button');
	toastHeaderClose.classList.add('btn-close', 'text-end');
	toastHeaderClose.setAttribute('data-bs-dismiss','toast');
	toastHeaderClose.setAttribute('aria-label','Close');
	
	toastHeader.appendChild(toastHeaderMessage);
	toastHeader.appendChild(toastHeaderClose);

	const toastBody = document.createElement('div');
	toastBody.classList.add('toast-body', 'text-dark');
	if (champion) {

		const toastBodyMessage = document.createElement('strong');
		toastBodyMessage.innerText = champion;
		toastBody.appendChild(toastBodyMessage);
	}
	else if (eliminated) {
		const toastBodyMessage = document.createElement('strong');
		toastBodyMessage.innerText = eliminated;
		toastBody.appendChild(toastBodyMessage);
	}
	else {
		const toastBodyButton = document.createElement('button');

		toastBodyButton.classList.add('btn', 'btn-primary', 'btn-sm');
		toastBodyButton.innerText = 'Go to play';
		toastBodyButton.addEventListener('click', joinTournamentGame)

		toastBody.appendChild(toastBodyButton);
	}
	toast.appendChild(toastHeader);
	toast.appendChild(toastBody);

	currentToast.appendChild(toast);
	document.body.appendChild(currentToast);
}

async function joinTournamentGame() {
	currentToast.remove();
	if (viewingRemoteTournament == false) {
		await router("/pong");
		startTournamentRemoteMode();
	}
}


const sleep = function(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function dropGame() {
	viewingRemoteTournament = false;
	
	if (joinedRemoteTournament == false) {
		sendMessageServer({app: "pong", action: "stopinfoTournament"})
	}
	else {
		sendMessageServer({app: "pong", action: "notready"})
	}
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


function toggleRules() {
    const sidePanel = document.getElementById("dSidePanel");
    const header = document.querySelector('header'); // Seleccionar el elemento header
    const rulesButton = document.getElementById("bRules");
	const sidePanelHeight = sidePanel.scrollHeight;

	if (sidePanel.style.opacity === "1" || sidePanel.style.height === `${sidePanelHeight}px`) {
        // Ocultar el panel
        sidePanel.style.height = "0"; // Colapsa el panel
        sidePanel.style.opacity = "0"; // Hace el panel transparente
		rulesButton.style.top = "0px"; // Ajusta esta altura según la altura de tu navbar

    } else {
        // Mostrar el panel
		sidePanel.style.opacity = "1"; // Hace visible el panel
        sidePanel.style.borderWidth = "2px";
        sidePanel.style.height = `${sidePanelHeight}px`; // Cambia la altura para mostrar el panel
 
        // Mueve el botón "Rules" justo debajo del panel después de un pequeño retraso
        setTimeout(() => {
            rulesButton.style.top = `${sidePanelHeight}px`; // Ajusta esta altura según la altura del panel y la navbar
        }, 50); // Ajusta el retraso según sea necesario
    }
}


// function showRules() {
//     const sidePanel = document.getElementById("dSidePanel");
//     const header = document.querySelector('header'); // Seleccionar el elemento header
//     const headerHeight = header ? header.offsetHeight : 0; // Obtener la altura del header
// 	const rulesButton = document.getElementById("bRules");

//     sidePanel.style.transition = "height 0.5s, top 0.5s, border 0s, color 0s 0.5s";
//     sidePanel.style.color = "black";
//     sidePanel.style.borderWidth = "2px";
//     sidePanel.style.height = "250px"; // Cambia la altura para mostrar el panel
//     sidePanel.style.top = `${headerHeight}px`; // Mueve el panel a la vista, justo debajo del header
// 	sidePanel.style.visibility = "visible"; // Asegúrate de que el panel esté visible

//     setTimeout(() => {
//         rulesButton.style.top = "250px";
//     }, 50); // Ajusta el retraso según sea necesario
// }

// function closeRules() {
// 	const sidePanel = document.getElementById("dSidePanel");
//     const header = document.querySelector('header'); // Seleccionar el elemento header
//     const headerHeight = header ? header.offsetHeight : 0; // Obtener la altura del header
// 	const rulesButton = document.getElementById("bRules");

//     sidePanel.style.transition = "height 0.5s, top 0.5s, border 0s, color 0s, visibility 0s 0.3s";
//     sidePanel.style.height = "0"; // Cambia la altura para ocultar el panel
//     sidePanel.style.top = `${headerHeight}px`; // Mantiene el panel justo debajo del header
//     sidePanel.style.borderWidth = "0px";
//     sidePanel.style.color = "white";
// 	sidePanel.style.visibility = "hidden"

//     rulesButton.style.top = "0px";
// }


function moveBall(position) {
    const ball = document.getElementById('ball-pong');
	const remote =document.getElementById('bRemoteGame');

	ball.style.top = '0px';

    if (position === 'left') {
        ball.style.left = '0'; // Extremo izquierdo
	} else if (position === 'center_1') {
		ball.style.left = '30.83%'; 
	} else if (position === 'center') {
        if (remote.hidden){
			ball.style.left = '47.5%';
		} else {
			ball.style.left = '64.16%';
		}
    } else if (position === 'right') {
        ball.style.left = '95%'; // Extremo derecho
    }

}

function selectOption(element) {
    // Remove 'selected' class from all options
    const options = document.querySelectorAll('#sOpponentContainer .option');
    options.forEach(option => option.classList.remove('selected'));

    // Add 'selected' class to the clicked option
    element.classList.add('selected');

    // Update the hidden select element
    const selectElement = document.getElementById('sOpponent');
    selectElement.value = element.getAttribute('data-value');

    // Trigger the onchange event
    selectElement.dispatchEvent(new Event('change'));

    const value = element.getAttribute('data-value');
    const difficultyContainer = document.getElementById('sDifficultyContainer');
    const localSettingsContainer = document.getElementById('dLocalSettings');
    if (value === '0') {
        difficultyContainer.classList.remove('visible');
        localSettingsContainer.classList.add('centered');
		pongStartLocal();
    } else if (value === '1') { 
		show_multi();
	} else if (value === '2') {
		show_3D();
	} else if (value === '3') {
        difficultyContainer.classList.add('visible');
        localSettingsContainer.classList.remove('centered');
		pongStartLocal();
    } 
}

function show_3D(){
    const difficultyContainer = document.getElementById('sDifficultyContainer');
    const localSettingsContainer = document.getElementById('dLocalSettings');

	document.getElementById("dLocalSettings").hidden = false;
	difficultyContainer.classList.remove('visible');
	localSettingsContainer.classList.add('centered');
	document.getElementById("bLocalGame").disabled = false;
	document.getElementById("board").style.visibility = "hidden";
	document.getElementById("dMatchPlayers").hidden = true;
	document.getElementById("dStartGame").hidden = true;
	document.getElementById("dWinner").hidden = true;
	document.getElementById("chooseIndicator").hidden = true;
	canvasResize();
	document.getElementById("dMultiplayerSettings").hidden = true;
	document.getElementById("d3Dsettings").hidden = false;
	window.pongInit_3D();
}

function show_multi(){
    const difficultyContainer = document.getElementById('sDifficultyContainer');
    const localSettingsContainer = document.getElementById('dLocalSettings');

	document.getElementById("dLocalSettings").hidden = false;
	difficultyContainer.classList.remove('visible');
	localSettingsContainer.classList.add('centered');
	document.getElementById("bLocalGame").disabled = false;
	document.getElementById("board").style.visibility = "hidden";
	document.getElementById("dMatchPlayers").hidden = true;
	document.getElementById("dStartGame").hidden = true;
	document.getElementById("dWinner").hidden = true;
	document.getElementById("chooseIndicator").hidden = true;
	document.getElementById("d3Dsettings").hidden = true;
	canvasResize();
	document.getElementById("dMultiplayerSettings").hidden = false;

}

function selectDifficulty(element) {
	// Remove 'selected' class from all options
	const options = document.querySelectorAll('#sDifficultyContainer .option');
	options.forEach(option => option.classList.remove('selected'));

	// Add 'selected' class to the clicked option
	element.classList.add('selected');

	// Update the hidden select element
	const selectElement = document.getElementById('sDifficulty');
	selectElement.value = element.getAttribute('data-value');

	// Trigger the onchange event
	selectElement.dispatchEvent(new Event('change'));
}

function setNumPlayers(element) {
    // Remueve la clase 'selected' de todas las opciones
    const options = document.querySelectorAll('#sNumPlayersContainer .option');
    options.forEach(option => option.classList.remove('selected'));

    // Agrega la clase 'selected' al elemento clicado
    element.classList.add('selected');

    // Actualiza el valor del select oculto
    const select = document.getElementById('sNumPlayers');
    select.value = element.getAttribute('data-value');

	select.dispatchEvent(new Event('change'));
}


//menu
window.pongStartLocal = startLocal;
window.pongStartRemote = startRemote;
window.pongStartTournamentMode = startTournamentMode;
window.pongStartTournamentRemoteMode = startTournamentRemoteMode;
window.pongShowCustomizationOptions = showCustomizationOptions;
window.pongMoveball = moveBall;
window.pongSelectOption = selectOption;
window.pongSelectDifficulty = selectDifficulty;
window.pongSetNumPlayers = setNumPlayers;

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

//remote tournament
window.pongCreateRemoteTournament = createRemoteTournament
window.pongJoinRemoteTournament = joinRemoteTournament

//remote game
window.pongCreateGame = createGame;
window.pongCreatePrivateGame = createPrivateGame;
window.pongJoinGame = joinGame;
window.pongJoinPrivateGame = joinPrivateGame;
window.serverPongMessage = serverPongMessage;
window.dropGame = dropGame;

//rules

window.pongSetRules = setRules;
window.pongToggleRules = toggleRules;
//window.pongShowRules = showRules;
//window.pongCloseRules = closeRules;






//###########################################################MULTIPLAYER######################################################################


function canvasResize() {
	let canvas = document.getElementById("pongCanvas");
	let canvasSize = document.getElementById("boardSize").value;
	switch (canvasSize) 
	{
		case "small":
			canvas.width = 400;
			canvas.height = 400;
			canvas.style.width = "400px";
			canvas.style.height = "400px";
			break;
		case "normal":
			canvas.width = 600;
			canvas.height = 600;
			canvas.style.width = "600px";
			canvas.style.height = "600px";
			break;
		case "big":
			canvas.width = 800;
			canvas.height = 800;
			canvas.style.width = "800px";
			canvas.style.height = "800px";
			break;
		default:
			canvas.width = 600;
			canvas.height = 600;
			break;
	}
}
