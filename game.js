const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Game settings
const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 100;
const BALL_RADIUS = 12;

// Paddles
const player = {
    x: 0 + 6,
    y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    color: '#0ff'
};

const ai = {
    x: WIDTH - PADDLE_WIDTH - 6,
    y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    color: '#ff0'
};

// Ball
const ball = {
    x: WIDTH / 2,
    y: HEIGHT / 2,
    radius: BALL_RADIUS,
    speed: 5,
    velocityX: 5 * (Math.random() > 0.5 ? 1 : -1),
    velocityY: 5 * (Math.random() > 0.5 ? 1 : -1),
    color: '#fff'
};

// Utility
function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
}

function drawText(text, x, y, color) {
    ctx.fillStyle = color;
    ctx.font = "bold 40px Arial";
    ctx.fillText(text, x, y);
}

// Mouse control for player paddle
canvas.addEventListener('mousemove', function(evt) {
    const rect = canvas.getBoundingClientRect();
    let mouseY = evt.clientY - rect.top;
    player.y = mouseY - player.height / 2;

    // Clamp within canvas
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > HEIGHT) player.y = HEIGHT - player.height;
});

// Collision detection
function collision(b, p) {
    // Ball and paddle collision
    return (
        b.x - b.radius < p.x + p.width &&
        b.x + b.radius > p.x &&
        b.y - b.radius < p.y + p.height &&
        b.y + b.radius > p.y
    );
}

// AI Movement
function moveAI() {
    // Simple AI: move towards the ball
    let center = ai.y + ai.height / 2;
    if (ball.y < center - 10) {
        ai.y -= 4;
    } else if (ball.y > center + 10) {
        ai.y += 4;
    }
    // Clamp within canvas
    if (ai.y < 0) ai.y = 0;
    if (ai.y + ai.height > HEIGHT) ai.y = HEIGHT - ai.height;
}

// Reset ball to center
function resetBall() {
    ball.x = WIDTH / 2;
    ball.y = HEIGHT / 2;
    ball.velocityX = ball.speed * (Math.random() > 0.5 ? 1 : -1);
    ball.velocityY = ball.speed * (Math.random() > 0.5 ? 1 : -1);
}

// Update game objects
function update() {
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    // Wall collision (top/bottom)
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > HEIGHT) {
        ball.velocityY = -ball.velocityY;
    }

    // Player paddle collision
    if (collision(ball, player)) {
        ball.x = player.x + player.width + ball.radius;
        ball.velocityX = -ball.velocityX;
        // Add some randomness to ball's Y velocity
        let collidePoint = (ball.y - (player.y + player.height / 2)) / (player.height / 2);
        ball.velocityY = ball.speed * collidePoint;
    }

    // AI paddle collision
    if (collision(ball, ai)) {
        ball.x = ai.x - ball.radius;
        ball.velocityX = -ball.velocityX;
        let collidePoint = (ball.y - (ai.y + ai.height / 2)) / (ai.height / 2);
        ball.velocityY = ball.speed * collidePoint;
    }

    // Left/right wall collision (score)
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > WIDTH) {
        resetBall();
    }

    moveAI();
}

// Render game objects
function render() {
    // Clear
    drawRect(0, 0, WIDTH, HEIGHT, "#000");

    // Draw center line
    for (let i = 20; i < HEIGHT; i += 40) {
        drawRect(WIDTH / 2 - 2, i, 4, 20, "#fff2");
    }

    // Draw paddles and ball
    drawRect(player.x, player.y, player.width, player.height, player.color);
    drawRect(ai.x, ai.y, ai.width, ai.height, ai.color);
    drawCircle(ball.x, ball.y, ball.radius, ball.color);
}

// Game loop
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// Start
gameLoop();
