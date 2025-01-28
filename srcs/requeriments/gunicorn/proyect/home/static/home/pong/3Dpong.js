let scene, camera, renderer;
let paddle1, paddle2, ball;
let player1Score = 0, player2Score = 0;
let player1Speed = 0, player2Speed = 0;
let ballSpeed = { x: 5, y: 5 };
let timeLeft;
let gameInterval;
let playing = false;
let initialized = false;
let paddle_speed = 0;


function generateRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePositiveNegative() {
    if (Math.random() < 0.5)
        return -1;
    else
        return 1;
}


function init() {
    // Asigna una velocidad y dirección aleatoria de la pelota

    let ball_speed = parseFloat(document.getElementById("ballSpeed").value);
    paddle_speed = parseFloat(document.getElementById("playerSpeed").value);

    ballSpeed.x = generatePositiveNegative() * ball_speed * 0.5;
    ballSpeed.y = generatePositiveNegative() * ball_speed * 0.5;

    // Crear escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // Configurar cámara
    //camera = new THREE.OrthographicCamera(-400, 400, 350, -350, 1, 1000);
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 500;

    // Crear renderizador
    let boardSize = document.getElementById("boardSize").value;
    renderer = new THREE.WebGLRenderer();

    switch (boardSize) {
        case 'small':
            renderer.setSize(600, 500);
            break;
        case 'normal':
            renderer.setSize(700, 600);
            break;
        case 'big':
            renderer.setSize(800, 700);
            break;
    }

    //renderer.setSize(800, 700);

    const canvasContainer = document.getElementById('d3DpongCanvas');
    canvasContainer.innerHTML = '';
    canvasContainer.appendChild(renderer.domElement);


    // Llamar a la función para agregar luces
    addLights();

    // Crear terreno de juego
    let fieldGeometry;
    switch (boardSize) {
        case 'small':
            fieldGeometry = new THREE.PlaneGeometry(600, 500);
        case 'normal':
            fieldGeometry = new THREE.PlaneGeometry(700, 600);
        case 'big':
            fieldGeometry = new THREE.PlaneGeometry(800, 700);
        }

    const fieldMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
    scene.add(field);

    // Crear paletas
    let paddle_size = parseFloat(document.getElementById("playerSize").value);
    const paddleGeometry = new THREE.BoxGeometry(20, paddle_size * 2, 1000);
    const paddleMaterial = new THREE.MeshPhongMaterial({ color: 0x00ffff });
    paddle1 = new THREE.Mesh(paddleGeometry, paddleMaterial);
    paddle1.position.set(-370, 0, 0);
    scene.add(paddle1);

    paddle2 = new THREE.Mesh(paddleGeometry, paddleMaterial);
    paddle2.position.set(370, 0, 0);
    scene.add(paddle2);

    // Crear pelota
    let ball_size = parseFloat(document.getElementById("ballSize").value);
    const ballGeometry = new THREE.SphereGeometry(ball_size, 32, 32);
    const ballMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
    ball = new THREE.Mesh(ballGeometry, ballMaterial);
    scene.add(ball);

    if (initialized)
        {
            console.log('3D Pong game already started brother');
            return;
        } // Evitar múltiples inicializaciones
    

    console.log('3D Pong game started');
    initialized = true;

    // Iniciar juego
    timeLeft = parseFloat(document.getElementById("countdown").value);
    console.log('Time: ' + timeLeft);

    gameInterval = setInterval(updateTimer, 1000);

    animate();
}

function addLights() {
    // Luz ambiental para iluminar suavemente toda la escena
    const ambientLight = new THREE.AmbientLight(0x404040, 1.2); // Luz suave pero con menos intensidad
    scene.add(ambientLight);

    // Luz direccional principal simulando el sol, con sombras suaves
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(200, 500, 300); // Ajusta la posición para iluminar de manera oblicua
    directionalLight.castShadow = true; // Habilitar sombras
    directionalLight.shadow.mapSize.width = 2048;  // Mayor resolución para sombras suaves
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 1500;
    scene.add(directionalLight);

    // Luz puntual que crea un foco brillante en el centro del campo de juego
    // const pointLight = new THREE.PointLight(0xffdd88, 1.5, 800);  // Luz cálida y brillante
    // pointLight.position.set(0, 0, 400); // Cerca del centro, arriba de la cancha
    // pointLight.castShadow = true; // Habilitar sombras
    // scene.add(pointLight);

    // Otra luz puntual para acentuar los bordes y dar un efecto más dramático
    // const backLight = new THREE.PointLight(0x88aaff, 1.0, 1000); // Luz más fría para contraste
    // backLight.position.set(0, -500, 300); // Desde atrás y abajo
    // scene.add(backLight);
}

function animate() {
    requestAnimationFrame(animate);

    if (playing == true)
    {              
        // Movimiento de las paletas
        paddle1.position.y += player1Speed;
        paddle2.position.y += player2Speed;
        
        // Mantener las paletas dentro de los límites
        paddle1.position.y = Math.max(-300, Math.min(300, paddle1.position.y));
        paddle2.position.y = Math.max(-300, Math.min(300, paddle2.position.y));
        
        const speedUp = parseFloat(document.getElementById("ballSpeedUp").value);

        // Movimiento de la pelota
        ball.position.x += ballSpeed.x * speedUp;
        ball.position.y += ballSpeed.y * speedUp;
        
        // Rebote en las paredes superior e inferior
        if (ball.position.y >= 340 || ball.position.y <= -340) {
            ballSpeed.y = -ballSpeed.y;
        }
        
        // Colisión con las paletas
        if (ball.position.x <= -350 && ball.position.y >= paddle1.position.y - 50 && ball.position.y <= paddle1.position.y + 50) {
            ballSpeed.x = -ballSpeed.x;
        }
        if (ball.position.x >= 350 && ball.position.y >= paddle2.position.y - 50 && ball.position.y <= paddle2.position.y + 50) {
            ballSpeed.x = -ballSpeed.x;
        }
        
        // Puntaje para los jugadores
        if (ball.position.x <= -400) {
            player2Score++;
            document.getElementById('player2-score').textContent = `Player 2: ${player2Score}`;
            resetBall();
        }
        if (ball.position.x >= 400) {
            player1Score++;
            document.getElementById('player1-score').textContent = `Player 1: ${player1Score}`;
            resetBall();
        }
        
        renderer.render(scene, camera);
    } else {
        renderer.render(scene, camera);
    }
}
    
function resetBall() {
    ball.position.set(0, 0, 0);
    //ballSpeed.x = -ballSpeed.x;
    let ball_speed = parseFloat(document.getElementById("ballSpeed").value);

    ballSpeed.x = generatePositiveNegative() * ball_speed * 0.5;
    ballSpeed.y = generatePositiveNegative() * ball_speed * 0.5;
}

function updateTimer() {
    if (playing == true) {
        timeLeft--;
        document.getElementById('timer').textContent = `Time: ${timeLeft}`;
        if (timeLeft <= 0) {
            clearInterval(gameInterval);
            playing = false;
            endGame();
        }
    }
}

function endGame() {
    let result;
    if (player1Score > player2Score) {
        result = 'Player 1 wins';
    } else if (player2Score > player1Score) {
        result = 'Player 2 wins';
    } else {
        result = 'TIE';
    }
    
    // Cargar la fuente de manera asincrónica
/*     const loader = new THREE.FontLoader();
    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function(font) {
        const textGeometry = new THREE.TextGeometry(result, {
            font: font,
            size: 50,
            height: 5,
        });
        
        const textMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textGeometry.computeBoundingBox(); // Calcular la caja delimitadora
        const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x; // Ancho del texto
        textMesh.position.set(-textWidth / 2, 0, 0); // Centrar en el eje X
        //textMesh.position.set(-200, 0, 0);
        textMesh.name = 'resultText';
        scene.add(textMesh);

    });
 */
    const scoreContainer = document.getElementById("d3Dscoreboard");
    const winnerMessage = document.getElementById("d3DwinnerMessage");
    const winnerText = document.getElementById("d3DwinnerText");

    scoreContainer.style.display = "none";

    if (result === 'Player 1 wins') {
        winnerText.textContent = 'WINNER Player1';
    }
    else if (result === 'Player 2 wins') {
        winnerText.textContent = 'WINNER Player2';
    }
    else {
        winnerText.textContent = 'TIE';
    }
    winnerMessage.style.display = "block";


    const startButton = document.getElementById('start-button-3D');
    startButton.style.display = "block";
}

function startGame() {

	const startButton = document.getElementById('start-button-3D');
	startButton.style.display = 'none';

    const winnerMessage = document.getElementById("d3DwinnerMessage");
    winnerMessage.style.display = "none";

    const scoreContainer = document.getElementById("d3Dscoreboard");
    scoreContainer.style.display = "block";

    // Restablecer puntuaciones
    player1Score = 0;
    player2Score = 0;
    document.getElementById('player1-score').textContent = 'Player 1: 0';
    document.getElementById('player2-score').textContent = 'Player 2: 0';

    // Restablecer temporizador
    timeLeft = parseFloat(document.getElementById("countdown").value);
    document.getElementById('timer').textContent = `Time: ${timeLeft}`;

    // Resetear posiciones de las paletas
    paddle1.position.set(-370, 0, 0);
    paddle2.position.set(370, 0, 0);

    // Resetear la posición de la pelota
    resetBall();

    // Eliminar el texto de resultado si existe
    const oldResult = scene.getObjectByName('resultText');
    if (oldResult) {
        scene.remove(oldResult);
        
        // 2. Liberar la geometría
        if (oldResult.geometry) {
            oldResult.geometry.dispose();
        }

        // 3. Liberar el material
        if (oldResult.material) {
            oldResult.material.dispose();
        }
    }

    // Reiniciar el temporizador
    clearInterval(gameInterval); // Detener cualquier temporizador existente
    gameInterval = setInterval(updateTimer, 1000); // Iniciar un nuevo temporizador

    // Iniciar el juego
    playing = true;
}

// Control de teclas para jugadores
window.addEventListener('keydown', (event) => {

    switch (event.key) {
        case 'w':
            player1Speed = paddle_speed;
            break;
        case 's':
            player1Speed = -paddle_speed;
            break;
        case 'ArrowUp':
            player2Speed = paddle_speed;
            event.preventDefault();
            break;
        case 'ArrowDown':
            player2Speed = -paddle_speed;
            event.preventDefault();
            break;
    }
});

window.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'w':
        case 's':
            player1Speed = 0;
            break;
        case 'ArrowUp':
        case 'ArrowDown':
            player2Speed = 0;
            break;
    }
});



window.pongInit_3D = init;
window.pongStartGame_3D = startGame;