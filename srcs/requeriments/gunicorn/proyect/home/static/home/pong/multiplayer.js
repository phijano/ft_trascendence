
function startMultiReady() {


	const startButton = document.getElementById('start-button-multi');
	startButton.style.display = 'none';

	const scoreContainer = document.getElementById("multiplayerSpans");
	scoreContainer.style.display = "block";

	const winnerMessage = document.getElementById("winnerMessage");
	winnerMessage.style.display = "none";

    const canvas = document.getElementById('pongCanvas');


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
		const speedUpMultiple = parseFloat(document.getElementById("ballSpeedUp").value); 

		ball.x += ball.dx * speedUpMultiple;
		ball.y += ball.dy * speedUpMultiple;

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
		let ball_speed = parseFloat(document.getElementById("ballSpeed").value) / 15;

		ball.dx = generatePositiveNegative() * generateRandom(4, 6) * ball_speed;
		ball.dy = generatePositiveNegative() * generateRandom(4, 6) * ball_speed;
	}

	function movePaddles() {
		if (paddle1.moveUp && paddle1.y > 0) {
			paddle1.y = Math.max(0, paddle1.y - paddle1.dy);
		} else if (paddle1.moveDown && paddle1.y + paddle1.height < canvas.height) {
			paddle1.y = Math.min(canvas.height - paddle1.height, paddle1.y + paddle1.dy);
		}

		if (paddle3.moveUp && paddle3.y > 0) {
			paddle3.y = Math.max(0, paddle3.y - paddle3.dy);
		} else if (paddle3.moveDown && paddle3.y + paddle3.height < canvas.height) {
			paddle3.y = Math.min(canvas.height - paddle3.height, paddle3.y + paddle3.dy);
		}

		if (paddle2.moveLeft && paddle2.x > 0) {
			paddle2.x = Math.max(0, paddle2.x - paddle2.dx);
		} else if (paddle2.moveRight && paddle2.x + paddle2.width < canvas.width) {
			paddle2.x = Math.min(canvas.width - paddle2.width, paddle2.x + paddle2.dx);
		}

		if (paddle4.moveLeft && paddle4.x > 0) {
			paddle4.x = Math.max(0, paddle4.x - paddle4.dx);
		} else if (paddle4.moveRight && paddle4.x + paddle4.width < canvas.width) {
			paddle4.x = Math.min(canvas.width - paddle4.width, paddle4.x + paddle4.dx);
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

		countdown = parseFloat(document.getElementById("countdown").value);
		document.getElementById('timeCountdown').textContent = countdown;

		let paddle_size = parseFloat(document.getElementById("playerSize").value); 
		let paddle_speed = parseFloat(document.getElementById("playerSpeed").value);
		let ball_size = parseFloat(document.getElementById("ballSize").value);
		let ball_speed = parseFloat(document.getElementById("ballSpeed").value) / 15;

		ball = {
			x: canvas.width / 2,
			y: canvas.height / 2,
			radius: ball_size / 2,
			dx: generatePositiveNegative() * generateRandom(4, 6) * ball_speed,
			dy: generatePositiveNegative() * generateRandom(4, 6) * ball_speed
		};

		paddle1 = {
			width: 10,
			height: paddle_size,
			x: 0,
			y: canvas.height / 2 - paddle_size / 2,
			dy: paddle_speed,
			moveUp: false,
			moveDown: false
		};

		paddle3 = {
			width: 10,
			height: paddle_size,
			x: canvas.width - 10,
			y: canvas.height / 2 - paddle_size / 2,
			dy: paddle_speed,
			moveUp: false,
			moveDown: false
		};

		paddle2 = {
			width: paddle_size,
			height: 10,
			x: canvas.width / 2 - paddle_size / 2,
			y: 0,
			dx: paddle_speed,
			moveLeft: false,
			moveRight: false
		}

		paddle4 = {
			width: paddle_size,
			height: 10,
			x: canvas.width / 2 - paddle_size / 2,
			y: canvas.height - 10,
			dx: paddle_speed,
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
/* 		ctx.font = "48px Arial";
		ctx.fillStyle = "#fff";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		if (winner != 0) {
			ctx.fillText("PLAYER " + winner + " WINS!", canvas.width / 2, canvas.height / 2);
		} else {
			ctx.fillText("TIE!", canvas.width / 2, canvas.height / 2);
		} */

		const scoreContainer = document.getElementById("multiplayerSpans");
		const winnerMessage = document.getElementById("winnerMessage");
		const winnerText = document.getElementById("winnerText");
	
		// Ocultar el contenedor de puntuación
		scoreContainer.style.display = "none";
	
		// Mostrar el mensaje del ganador
		winnerMessage.style.display = "block";
		if (winner != 0) {
			winnerText.textContent = "WINNER Player " + winner;
		} else {
			winnerText.textContent = "TIE!";
		}
		const startButton = document.getElementById('start-button-multi');
		startButton.style.display = "block";

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
				event.preventDefault();
				break;
			case 'ArrowDown':
				paddle3.moveDown = true;
				event.preventDefault();
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

window.pongStartMultiReady = startMultiReady;
