const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Game settings
const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 100;
const BALL_RADIUS = 12;
let paused = false;

// Paddles
const player = {
    x: 0 + 6,                                                               // Player paddle starts 6px from the left edge
    y: HEIGHT / 2 - PADDLE_HEIGHT / 2,                                      // Center the player paddle vertically
    width: PADDLE_WIDTH,                                                    // Paddle width
    height: PADDLE_HEIGHT,                                                  // Paddle height        
    color: '#0ff',                                                        // Paddle color     
    score: 0                                                                // Player score
};

const ai = {
    x: WIDTH - PADDLE_WIDTH - 6,
    y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    color: '#ff0',
    score: 0
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

// Difficulty
let difficultyLevel = 1;
const pointsPerLevel = 5;                                               // Increase difficulty every 5 points
const maxDifficultyLevel = 10;

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

function drawText(text, x, y, color, fontSize = 40) {
    ctx.fillStyle = color;
    ctx.font = `bold ${fontSize}px Arial`;
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

// Touch control for player paddle
canvas.addEventListener('touchstart', handleTouchMove, { passive: false });
canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

function handleTouchMove(evt) {
    evt.preventDefault(); // Prevent scrolling when touching the canvas

    const rect = canvas.getBoundingClientRect();
    const touch = evt.touches[0]; // Get the first touch point

    // Calculate touch Y relative to canvas top
    let touchY = touch.clientY - rect.top;

    // Center paddle on touch Y and clamp inside canvas
    player.y = touchY - player.height / 2;
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > HEIGHT) player.y = HEIGHT - player.height;
}

function pauseGame() {
      paused = !paused;
      if(!paused) requestAnimationFrame(loop);
}

// Collision detection
function collision(b, p) {
    return (
        b.x - b.radius < p.x + p.width &&
        b.x + b.radius > p.x &&
        b.y - b.radius < p.y + p.height &&
        b.y + b.radius > p.y
    );
}

// AI Movement
function moveAI() {
    // AI speed increases with difficulty
    const aiSpeed = 4 + (difficultyLevel - 1) * 0.5;
    let center = ai.y + ai.height / 2;
    if (ball.y < center - 10) {
        ai.y -= aiSpeed;
    } else if (ball.y > center + 10) {
        ai.y += aiSpeed;
    }
    // Clamp within canvas
    if (ai.y < 0) ai.y = 0;
    if (ai.y + ai.height > HEIGHT) ai.y = HEIGHT - ai.height;
}

// Reset ball to center and set velocity according to difficulty
function resetBall() {
    ball.x = WIDTH / 2;
    ball.y = HEIGHT / 2;
    ball.speed = 5 + (difficultyLevel - 1) * 0.7; // Increase ball speed with difficulty
    const directionX = Math.random() > 0.5 ? 1 : -1;
    const directionY = Math.random() > 0.5 ? 1 : -1;
    ball.velocityX = ball.speed * directionX;
    ball.velocityY = ball.speed * directionY;
}

// Update difficulty based on player's score
function updateDifficulty() {
    const newLevel = Math.min(maxDifficultyLevel, Math.floor(player.score / pointsPerLevel) + 1);
    if (newLevel !== difficultyLevel) {
        difficultyLevel = newLevel;
        // Reset ball speed to match new difficulty
        ball.speed = 5 + (difficultyLevel - 1) * 0.7;
        console.log(`Difficulty increased to level ${difficultyLevel}`);
    }
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

    // Left/right wall collision (score update)
    if (ball.x - ball.radius < 0) {
        // AI scores
        ai.score++;
        resetBall();
    } else if (ball.x + ball.radius > WIDTH) {
        // Player scores
        player.score++;
        updateDifficulty();
        resetBall();
    }

    moveAI();
}
// Update difficulty level based on player's score
// This function is called when the player scores to increase difficulty
// It checks the player's score and updates the difficulty level accordingly
// Called once when player scores to update difficulty
function updateDifficulty() {
    const newLevel = Math.min(maxDifficultyLevel, Math.floor(player.score / pointsPerLevel) + 1);
    if (newLevel !== difficultyLevel) {
        difficultyLevel = newLevel;
        // Update ball speed according to new difficulty
        ball.speed = 5 + (difficultyLevel - 1) * 0.7;
        resetBallVelocity();
        console.log(`Difficulty increased to level ${difficultyLevel}`);
    }
}

// Reset ball velocity based on current ball speed and random direction
function resetBallVelocity() {
    const directionX = Math.random() > 0.5 ? 1 : -1;
    const directionY = Math.random() > 0.5 ? 1 : -1;
    ball.velocityX = ball.speed * directionX;
    ball.velocityY = ball.speed * directionY;
}

// Reset ball position and velocity after a score
function resetBall() {
    ball.x = WIDTH / 2;
    ball.y = HEIGHT / 2;
    resetBallVelocity();
}

// AI paddle movement based on difficulty level only
function moveAI() {
    const aiSpeed = 4 + (difficultyLevel - 1) * 0.5; // Speed depends only on difficulty level
    const center = ai.y + ai.height / 2;

    if (ball.y < center - 10) {
        ai.y -= aiSpeed;
    } else if (ball.y > center + 10) {
        ai.y += aiSpeed;
    }

    // Clamp AI paddle within canvas
    if (ai.y < 0) ai.y = 0;
    if (ai.y + ai.height > HEIGHT) ai.y = HEIGHT - ai.height;
}
// AI paddle movement based on difficulty level only
function moveAI() {
    const aiSpeed = 4 + (difficultyLevel - 1) * 0.5; // Speed depends only on difficulty level
    const center = ai.y + ai.height / 2;

    if (ball.y < center - 10) {
        ai.y -= aiSpeed;
    } else if (ball.y > center + 10) {
        ai.y += aiSpeed;
    }

    // Clamp AI paddle within canvas
    if (ai.y < 0) ai.y = 0;
    if (ai.y + ai.height > HEIGHT) ai.y = HEIGHT - ai.height;
}   

// Render game objects and UI
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

    // Draw scores
    drawText(player.score, WIDTH / 4, 50, '#0ff');
    drawText(ai.score, 3 * WIDTH / 4, 50, '#ff0');

    // Draw difficulty level
    drawText(`Level: ${difficultyLevel}`, WIDTH / 2 - 60, HEIGHT - 30, '#fff', 24);
}

// Game loop
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// Event listener for pause functionality
document.addEventListener('keydown', function(event) {
    if (event.key === 'p' || event.key === 'P') {
        pauseGame();
    }
}); 

// Start the game
resetBall();
gameLoop();

