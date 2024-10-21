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
	hideMultiplayer();
    setRemote();
}

function startTournamentMode() {
    applySettings();
	hideLocal();
	hideRemote();
    hideCustomizationOptions();
	hideMultiplayer();
    setTournament();
}

function showCustomizationOptions() {
	dropGame();
	stop();
	hideLocal();	
	hideRemote();
	hideTournament();
	hideMultiplayer();
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
	document.getElementById("bTournament").disabled = false;
	document.getElementById("dTournamentSettings").hidden = true;
	document.getElementById("chooseIndicator").hidden = true;
}

function hideMultiplayer() {
	document.getElementById("dMultiplayerSettings").hidden = true;
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
	sendMessageServer({player: profileId,  app: "pong", action: "create", config: gameConfig, date: Date.now()});
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
	sendMessageServer({player: profileId,  app: "pong", action: "join", date: Date.now()});
	document.getElementById("lLeftPlayer").innerHTML = "?";
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
		document.getElementById("dMultiplayerSettings").hidden = true;
		pongStartLocal();
    } else if (value === '2') {
        difficultyContainer.classList.add('visible');
        localSettingsContainer.classList.remove('centered');
		document.getElementById("dMultiplayerSettings").hidden = true;
		pongStartLocal();
    } else if (value === '1') {
		difficultyContainer.classList.remove('visible');
        localSettingsContainer.classList.add('centered');
		document.getElementById("bLocalGame").disabled = false;
		document.getElementById("board").style.visibility = "hidden";
		document.getElementById("dMatchPlayers").hidden = true;
		document.getElementById("dStartGame").hidden = true;
		document.getElementById("dWinner").hidden = true;
		document.getElementById("chooseIndicator").hidden = true;

		document.getElementById("dMultiplayerSettings").hidden = false;
	}

	
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

//remote game
window.pongCreateGame = createGame;
window.pongJoinGame = joinGame;
window.serverPongMessage = serverPongMessage;
window.dropGame = dropGame;

//rules

window.pongSetRules = setRules;
window.pongToggleRules = toggleRules;
//window.pongShowRules = showRules;
//window.pongCloseRules = closeRules;






//###########################################################MULTIPLAYER######################################################################


window.pongStartMultiReady = startMultiReady;

function startMultiReady() {

	const startButton = document.getElementById('start-button-multi');
	startButton.style.display = 'none';

    const canvas = document.getElementById('pongCanvas');

	canvas.width = 600;  // Ancho del canvas
	canvas.height = 600;

	if (!canvas) {
        console.error("Canvas not found!");
        return;
    }

	const ctx = canvas.getContext('2d');


	//window.pongStartMulti = startMulti;

	let ball;

	let paddle1;
	let paddle2;
	let paddle3;
	let paddle4;

	let player1Score = 0;
	let player2Score = 0;
	let player3Score = 0;
	let player4Score = 0;

	let countdown = 20;
	document.getElementById('timeCountdown').textContent = countdown;

	let intervalDraw;
	let intervalTime;

	let timeEnd = false;

	function generateRandom(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	function generatePositiveNegative() {
		if (Math.random() < 0.5)
			return -1;
		else
			return 1;
	}

	function drawBall() {
		ctx.beginPath();
		ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
		ctx.fillStyle = '#fff';
		ctx.fill();
		ctx.closePath();
	}

	function drawPaddle(x, y, width, height) {
		ctx.fillStyle = 'cyan';
		ctx.fillRect(x, y, width, height);
	}

	function moveBallMulti() {
		ball.x += ball.dx;
		ball.y += ball.dy;

		/* REBOTE EN LAS PAREDES SUPERIOR E INFERIOR
		if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
			ball.dy = -ball.dy;
		}*/

		if (ball.y - ball.radius <= 0) {
			player2Score++;
			updateScore();
			resetBall();
		} else if (ball.y + ball.radius >= canvas.height) {
			player4Score++;
			updateScore();
			resetBall();
		} else if (ball.x + ball.radius >= canvas.width) {
			player3Score++;
			updateScore();
			resetBall();
		} else if (ball.x - ball.radius <= 0) {
			player1Score++;
			updateScore();
			resetBall();
		}

		if (ball.x - ball.radius <= paddle1.x + paddle1.width && ball.y >= paddle1.y && ball.y <= paddle1.y + paddle1.height) {
			ball.dx = -ball.dx;
		} else if (ball.x + ball.radius >= paddle3.x && ball.y >= paddle3.y && ball.y <= paddle3.y + paddle3.height) {
			ball.dx = -ball.dx;
		} else if (ball.y - ball.radius <= paddle2.y + paddle2.height && ball.x >= paddle2.x && ball.x <= paddle2.x + paddle2.width) {
			ball.dy = -ball.dy;
		} else if (ball.y + ball.radius >= paddle4.y && ball.x >= paddle4.x && ball.x <= paddle4.x + paddle4.width) {
			ball.dy = -ball.dy;
		}
	}

	function resetBall() {
		ball.x = canvas.width / 2;
		ball.y = canvas.height / 2;
		//ball.dx = -ball.dx;

		// Asigna una velocidad y dirección aleatoria de la pelota
		ball.dx = generatePositiveNegative() * generateRandom(4, 6);
		ball.dy = generatePositiveNegative() * generateRandom(4, 6);
	}

	function movePaddles() {
		if (paddle1.moveUp && paddle1.y > 0) {
			paddle1.y -= paddle1.dy;
		} else if (paddle1.moveDown && paddle1.y + paddle1.height < canvas.height) {
			paddle1.y += paddle1.dy;
		}

		if (paddle3.moveUp && paddle3.y > 0) {
			paddle3.y -= paddle3.dy;
		} else if (paddle3.moveDown && paddle3.y + paddle3.height < canvas.height) {
			paddle3.y += paddle3.dy;
		}

		if (paddle2.moveLeft && paddle2.x > 0) {
			paddle2.x -= paddle2.dx;
		} else if (paddle2.moveRight && paddle2.x + paddle2.width < canvas.width) {
			paddle2.x += paddle2.dx;
		}

		if (paddle4.moveLeft && paddle4.x > 0) {
			paddle4.x -= paddle4.dx;
		} else if (paddle4.moveRight && paddle4.x + paddle4.width < canvas.width) {
			paddle4.x += paddle4.dx;
		}
	}

	function updateScore() {
		document.getElementById('player1Score').textContent = player1Score;
		document.getElementById('player2Score').textContent = player2Score;
		document.getElementById('player3Score').textContent = player3Score;
		document.getElementById('player4Score').textContent = player4Score;
	}

	function draw() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		drawBall();
		drawPaddle(paddle1.x, paddle1.y, paddle1.width, paddle1.height);
		drawPaddle(paddle3.x, paddle3.y, paddle3.width, paddle3.height);
		drawPaddle(paddle2.x, paddle2.y, paddle2.width, paddle2.height);
		drawPaddle(paddle4.x, paddle4.y, paddle4.width, paddle4.height);
		moveBallMulti();
		movePaddles();
	}

	function setAll() {
		player1Score = 0;
		player2Score = 0;
		player3Score = 0;
		player4Score = 0;
		updateScore();

		countdown = 20;
		document.getElementById('timeCountdown').textContent = countdown;

		ball = {
			x: canvas.width / 2,
			y: canvas.height / 2,
			radius: 10,
			dx: generatePositiveNegative() * generateRandom(4, 6),
			dy: generatePositiveNegative() * generateRandom(4, 6)
		};

		paddle1 = {
			width: 10,
			height: 100,
			x: 0,
			y: canvas.height / 2 - 50,
			dy: 8,
			moveUp: false,
			moveDown: false
		};

		paddle3 = {
			width: 10,
			height: 100,
			x: canvas.width - 10,
			y: canvas.height / 2 - 50,
			dy: 8,
			moveUp: false,
			moveDown: false
		};

		paddle2 = {
			width: 100,
			height: 10,
			x: canvas.width / 2 - 50,
			y: 0,
			dx: 8,
			moveLeft: false,
			moveRight: false
		}

		paddle4 = {
			width: 100,
			height: 10,
			x: canvas.width / 2 - 50,
			y: canvas.height - 10,
			dx: 8,
			moveLeft: false,
			moveRight: false
		}
	}

	function startMulti() {
		intervalDraw = setInterval(draw, 1000 / 60); // 60 FPS
		intervalTime = setInterval(updateCountdown, 1000);

		setAll();
	}

	function drawWinnerMessage(winner) {
		ctx.font = "48px Arial";
		ctx.fillStyle = "#fff";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		if (winner != 0) {
			ctx.fillText("PLAYER " + winner + " WINS!", canvas.width / 2, canvas.height / 2);
		} else {
			ctx.fillText("TIE!", canvas.width / 2, canvas.height / 2);
		}
	}

	function declareWinner() {
		let playerLowerScore = 1000;
		let indexWinner = -1;
		let tie = false;
		let scores = [player1Score, player2Score, player3Score, player4Score];

		for (let i = 0; i < 4; i++) {
			if (scores[i] < playerLowerScore) {
				playerLowerScore = scores[i];
				indexWinner = i;
			}
		}

		for (let i = 0; i < 4; i++) {
			if (scores[i] == scores[indexWinner] && i != indexWinner) {
				tie = true;
			}
		}

		//alert ("TIE = " + tie + "    INDEX WINNER = " + indexWinner);

		if (tie == true) {
			drawWinnerMessage(0);
		} else {
			drawWinnerMessage(indexWinner + 1);
		}
	}

	function updateCountdown() {
		const timeCountdownElement = document.getElementById('timeCountdown');
		
		// Decrementa el valor de la cuenta atrás
		//timeCountdownElement.textContent = countdownValue;
		countdown--;
		document.getElementById('timeCountdown').textContent = countdown;
		
		// Si la cuenta llega a cero, detén la cuenta atrás
		if (countdown <= 0) {
			clearInterval(intervalTime);
			clearInterval(intervalDraw);
			timeCountdownElement.textContent = "¡END!";
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			declareWinner();
		}
	}

	// Listeners para las teclas
	document.addEventListener('keydown', function(event) {
		switch (event.key) {
			case '1':
				paddle2.moveLeft = true;
				break;
			case '2':
				paddle2.moveRight = true;
				break;
			case '9':
				paddle4.moveLeft = true;
				break;
			case '0':
				paddle4.moveRight = true;
				break;
			case 'w':
			case 'W':
				paddle1.moveUp = true;
				break;
			case 's':
			case 'S':
				paddle1.moveDown = true;
				break;
			case 'ArrowUp':
				paddle3.moveUp = true;
				break;
			case 'ArrowDown':
				paddle3.moveDown = true;
				break;
		}
	});

	document.addEventListener('keyup', function(event) {
		switch (event.key) {
			case '1':
				paddle2.moveLeft = false;
				break;
			case '2':
				paddle2.moveRight = false;
				break;
			case '9':
				paddle4.moveLeft = false;
				break;
			case '0':
				paddle4.moveRight = false;
				break;
			case 'w':
			case 'W':
				paddle1.moveUp = false;
				break;
			case 's':
			case 'S':
				paddle1.moveDown = false;
				break;
			case 'ArrowUp':
				paddle3.moveUp = false;
				break;
			case 'ArrowDown':
				paddle3.moveDown = false;
				break;
		}
	});

	startMulti();
}
// Inicia el juego

