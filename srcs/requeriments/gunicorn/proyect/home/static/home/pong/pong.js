//frame id
let id;

// Board
let board;
let context;

const boardWidth = 700;
const boardHeight = 500;
const xMargin = 10; // Margin from paddle to side of board

const ballSide = 10;

const startSpeed = 7.5;
const speedUpMultiple = 1.02;
const serveSpeedMultiple = 0.4;

let startRadAngle = getRandomBetween((-Math.PI/4), (Math.PI/4));

let xStartVel = startSpeed * Math.cos(startRadAngle) * getRandomEitherOr(-1, 1);
let yStartVel = startSpeed * Math.sin(startRadAngle);


let ball = 
{
    x : boardWidth / 2 - ballSide / 2,
    y : boardHeight / 2 - ballSide / 2,
    width : ballSide,
    height : ballSide,
    xVel : xStartVel,
    yVel : yStartVel,
    speed : startSpeed,
    serve : true
}

let keyState = 
{
    w: false,
    s: false,
    up: false,  // ArrowUp
    down: false // ArrowDown
};

const playerHeight = 50;
const playerWidth = 10;
const playerSpeed = 5;

// Left player
let Lplayer =
{
    x : xMargin,
    y : boardHeight/2 - playerHeight/2,
    width : playerWidth,
    height : playerHeight,
    speed : 0,
    score: 0
};

// Right player
let Rplayer =
{
    x : boardWidth - playerWidth - xMargin,
    y : boardHeight/2 - playerHeight/2,
    width : playerWidth,
    height : playerHeight,
    speed : 0,
    score : 0
};


let AImargin;
let predictedY;
let playAI; // Weird behaviour, doesnt work otherwise

function start(playAIparam, msAIcalcRefresh)
{
    playAI = playAIparam;
    Lplayer.score = 0;
    Rplayer.score = 0;

    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d");

    // draw players
    context.fillStyle = "turquoise";
    context.fillRect(Lplayer.x, Lplayer.y, Lplayer.width, Lplayer.height);
    context.fillRect(Rplayer.x, Rplayer.y, Rplayer.width, Rplayer.height);

    requestAnimationFrame(update);
    document.addEventListener("keydown", keyDownHandler);
    document.addEventListener("keyup", keyUpHandler);

    if (playAI)
    {
        setInterval(function() 
        { predictedY = predictFinalYPos(ball); }, msAIcalcRefresh);
    }
}

//To be able to use it with buttons
window.start = start;

function update()
{
    id = requestAnimationFrame(update);
    context.clearRect(0, 0, board.width, board.height);
    context.fillStyle = "turquoise";
    
    Lplayer.y += Lplayer.speed;
    Rplayer.y += Rplayer.speed;

    let yMax = board.height - playerHeight;
    fixOutOfBounds(Lplayer, yMax);
    fixOutOfBounds(Rplayer, yMax);

    context.fillRect(Lplayer.x, Lplayer.y, Lplayer.width, Lplayer.height);
    context.fillRect(Rplayer.x, Rplayer.y, Rplayer.width, Rplayer.height);

    // ball
    context.fillStyle = "white";
    if (ball.serve)
    {
        ball.x += ball.xVel * serveSpeedMultiple;
        ball.y += ball.yVel * serveSpeedMultiple;
    }
    else
    {
        ball.x += ball.xVel;
        ball.y += ball.yVel;
    }
    context.fillRect(ball.x, ball.y, ball.width, ball.height);

    handlePaddleHit(ball, Lplayer);
    if (handlePaddleHit(ball, Rplayer))
        ball.xVel *= -1;
        
    // Bounce of top & bottom
    if (ball.y <= 0 || (ball.y + ball.height >= board.height))
        ball.yVel *= -1;

    if (playAI)
        simulateAIInput();

    // Point scored, player who conceded serves
    if (ball.x < 0)
    {
        Rplayer.score++;
        resetGame(-1);
    }

    if (ball.x + ball.width > board.width)
    {
        Lplayer.score++;
        resetGame(1);
    }

    context.font = "45px sans-serif";
    context.fillText(Lplayer.score, board.width/5, 45);
    context.fillText(Rplayer.score, board.width/5 * 4 -45, 45);

    // Draw middle line
    for (let i = 10; i < board.height; i+=25)
        context.fillRect(board.width/2 - 10, i, 5, 5);

    if (Rplayer.score == 2 || Lplayer.score == 2) // Games to 2 for faster debugging
    {
        stop();
        endMatch(Lplayer.score, Rplayer.score);
    }
}

function stop() {

	if (id)
		cancelAnimationFrame(id);
}

window.stop = stop;

function fixOutOfBounds(player, yMax)
{
    if (player.y < 0)
        player.y = 0;
    else if (player.y > yMax)
        player.y = yMax;
}

function keyDownHandler(event)
{
    if (event.code == "KeyW")
    {
        Lplayer.speed = -playerSpeed;
        keyState.w = true;
    }
    else if (event.code == "KeyS")
    {
        Lplayer.speed = playerSpeed;
        keyState.s = true;
    }
    if (event.code == "ArrowUp")
    {
        Rplayer.speed = -playerSpeed;
        keyState.up = true;
    }
    else if (event.code == "ArrowDown")
    {
        Rplayer.speed = playerSpeed;
        keyState.down = true;
    }
}

// Player stops when button is released/no longer pressed down FIX DOUBLE HOLD DOWN RELEASE
function keyUpHandler(event)
{
    if (event.code == "KeyW")
    {
        keyState.w = false;
        if (keyState.s == true)
            Lplayer.speed = playerSpeed;
        else
            Lplayer.speed = 0;
    }

    if (event.code == "KeyS")
    {
        keyState.s = false;
        if (keyState.w == true)
            Lplayer.speed = -playerSpeed;
        else
            Lplayer.speed = 0;
    }

    if (event.code == "ArrowUp")
    {
        keyState.up = false;
        if (keyState.down == true)
            Rplayer.speed = playerSpeed;
        else
            Rplayer.speed = 0;
    }

    if (event.code == "ArrowDown")
    {
        keyState.down = false;
        if (keyState.up == true)
            Rplayer.speed = -playerSpeed;
        else
            Rplayer.speed = 0;
    }
}

function handlePaddleHit(ball, player)
{
    if ((ball.x < player.x + player.width) &&  // The ball's top left corner doesn't reach the paddles top right corner
        (ball.x + ball.width > player.x) &&    // The ball's top right corner passes the paddles top left corner
        (ball.y < player.y + player.height) && // The ball's top left corner doesn't reach the paddles bottom left corner
        (ball.y + ball.height > player.y))     // The ball's bottom left corner passes the paddles top left corner
    {
        // Push to closest edge of paddle when it hits the bottom of the paddle
        if (ball.x < player.x)
            ball.x = player.x - ball.width;
        else if (ball.x + ball.width > player.x + player.width)
            ball.x = player.x + player.width;

        // Position of the middle of the ball in relation to the middle of the paddle (-playerHeight/2 - ballSide/2 & playerHeight/2 + ballside/2)
        let collisionPoint = ball.y - player.y - playerHeight/2 + ballSide/2;
        if (collisionPoint > playerHeight/2)
            collisionPoint = playerHeight/2;
        else if (collisionPoint < -playerHeight/2)
            collisionPoint = -playerHeight/2;

        // Convert to index between -1 & 1
        collisionPoint /= playerHeight/2;

        // Rebound angle, depends on where it hits the paddle
        // Max 45 deg, min -45 deg if it hits the edges
        let radAngle = (Math.PI/4) * collisionPoint;

        // Speed increases with every hit
        ball.speed *= speedUpMultiple;

        // x & y component calc, x speed is flipped for the ball to bounce
        ball.xVel = ball.speed * Math.cos(radAngle);
        ball.yVel = ball.speed * Math.sin(radAngle);
        ball.serve = false;
        return true;
    }
    return false;
}

function resetGame(direction)
{
    startRadAngle = getRandomBetween((-Math.PI/4), (Math.PI/4));
    xStartVel = startSpeed * Math.cos(startRadAngle) * direction;
    yStartVel = startSpeed * Math.sin(startRadAngle);

    ball = 
    {
        x : boardWidth / 2 - ballSide / 2,
        y : boardHeight / 2 - ballSide / 2,
        width : ballSide,
        height : ballSide,
        xVel : xStartVel,
        yVel : yStartVel,
        speed : startSpeed,
        serve : true
    }
}

function getRandomBetween(min, max) 
{
    return (Math.random() * (max - min) + min);
}

function getRandomEitherOr(value1, value2)
{
    if (Math.random() > 0.5)
        return (value1);
    else
        return (value2);
}

function predictFinalYPos(ball)
{
    // AImargin is used in simulateAIinput
    // The calculation is put into this function 
    // to avoid constant recalculation of a random value and thus the AI jittering
    // Randomness (AImargin) makes the AI hit at different angles
    // If you want it to sometimes miss, change the min value to negative
    // For it to regularly miss, the multiple has to be 0.3 or below
    // If getRandom returns -0.1 it only misses for very straight shots
    AImargin = playerHeight * getRandomBetween(-0.1, 0.45);

    if (ball.xVel < 0) // If ball is going away from AI
        return (boardHeight / 2 - ballSide / 2); // Prompt AI to go back to middle

    // Amount of times the screen refreshes before ball reaches other side: Length / xVel
    let refreshes = (boardWidth - xMargin - playerWidth - ball.x) / ball.xVel;
    let yMovement = (ball.yVel * refreshes) % (boardHeight*2);
    
    let distanceToBottom = boardHeight - ball.y;
    let distanceToTop = ball.y;
    let finalYPos = ball.y;

    for (let i = 0; i < 2; i++) 
    {
        // Bounce off top
        if (yMovement < 0 && yMovement < -distanceToTop)
        {
            yMovement += distanceToTop;
            yMovement *= -1; 
            finalYPos = 0;
        }
        // Bounce off bottom
        else if (yMovement > 0 && yMovement > distanceToBottom)
        {
            yMovement -= distanceToBottom;
            yMovement *= -1;
            finalYPos = boardHeight;
        }
    }
    finalYPos += yMovement;
    return (finalYPos);
}

function simulateAIInput() 
{
    if (predictedY < Rplayer.y + playerHeight - AImargin && predictedY > Rplayer.y + AImargin)
    {
        keyUpHandler({ code: "ArrowUp" });
        keyUpHandler({ code: "ArrowDown" });
    }
    else if (predictedY < Rplayer.y + playerHeight/2)
    {
        keyDownHandler({ code: "ArrowUp" });
        keyUpHandler({ code: "ArrowDown" });
    } 
    else if (predictedY > Rplayer.y + playerHeight/2) 
    {
        keyDownHandler({ code: "ArrowDown" });
        keyUpHandler({ code: "ArrowUp" });
    }
}