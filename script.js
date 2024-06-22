const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

const ballRadius = 7;
const initialBallSpeed = 6; // Vitesse constante de la balle
let x, y, dx, dy;
const paddleHeight = 20;
const paddleWidth = 100;
let paddleX = (canvas.width - paddleWidth) / 2;
let paddleY = 20;
let rightPressed = false;
let leftPressed = false;

const brickWidth = 30;
const brickHeight = 16;
const brickPadding = 2;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

let score = 0;
let isGameOver = false;
let isBallSticky = false; // Variable pour suivre si la balle est sticky
let isBallStuck = false; // Variable pour suivre si la balle est collée au paddle
let stickyDx, stickyDy; // Variables pour sauvegarder l'état de la balle
let ballOffsetX; // Variable pour sauvegarder la distance entre la balle et le centre du paddle

const brickColors = [
    { color: 'orange', weakenedColors: ['white'], resistance: 2 },
    { color: 'pink', weakenedColors: [], resistance: 1 },
    { color: 'green', weakenedColors: [], resistance: 1 },
    { color: 'blue', weakenedColors: ['lightblue', 'darkblue'], resistance: 3 }
];

const maps = [
    [
        [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
        [3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3],
        [3, 2, 1, 1, 1, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 3],
        [3, 2, 2, 2, 1, 2, 1, 2, 2, 2, 1, 2, 2, 1, 2, 1, 2, 2, 3],
        [3, 2, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2, 1, 2, 2, 2, 1, 2, 3],
        [3, 2, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 3],
        [3, 2, 2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2, 3],
        [3, 2, 1, 1, 1, 2, 1, 2, 2, 2, 1, 2, 1, 2, 2, 2, 1, 2, 3],
        [3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3],
        [3, 3, 3, 3, 3, 3, 3, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    ],
    [
        [2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
        [1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
        [2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
        [1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
        [2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
        [1, 2, 1, 2, 1, 2, 1, 2, 1, 2]
    ],
    [
        [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
        [4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4],
        [4, 3, 2, 2, 2, 3, 2, 3, 3, 3, 2, 3, 3, 3, 2, 3, 3, 3, 4],
        [4, 3, 3, 3, 2, 3, 2, 3, 3, 3, 2, 3, 3, 2, 3, 2, 3, 3, 4],
        [4, 3, 3, 2, 2, 3, 2, 3, 3, 3, 2, 3, 2, 3, 3, 3, 2, 3, 4],
        [4, 3, 3, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 2, 2, 2, 2, 3, 4],
        [4, 3, 3, 3, 2, 3, 2, 2, 3, 2, 2, 3, 2, 3, 3, 3, 2, 3, 4],
        [4, 3, 2, 2, 2, 3, 2, 3, 3, 3, 2, 3, 2, 3, 3, 3, 2, 3, 4],
        [4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4],
        [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4]
    ]
];

let customMap = maps[0];

document.getElementById("mapSelect").addEventListener("change", function() {
    customMap = maps[this.value];
    initializeBricks();
});

function initializeBricks() {
    bricks = [];
    for(let c = 0; c < customMap[0].length; c++) {
        bricks[c] = [];
        for(let r = 0; r < customMap.length; r++) {
            const brickType = customMap[r][c];
            if (brickType > 0) {
                const brickColor = brickColors[brickType - 1];
                bricks[c][r] = { 
                    x: 0, 
                    y: 0, 
                    status: brickColor.resistance, // La résistance initiale de la brique
                    color: brickColor.color,
                    weakenedColors: brickColor.weakenedColors
                };
            } else {
                bricks[c][r] = null;
            }
        }
    }
    resetBall();
    draw();
}


function resetBall() {
    x = canvas.width / 2;
    y = canvas.height - 30;
    dx = initialBallSpeed / Math.sqrt(2);
    dy = -initialBallSpeed / Math.sqrt(2);
    isBallStuck = false;
    isBallSticky = false;
    isGameOver = false;
}

function resetGame() {
    document.removeEventListener("click", resetGame);
    document.removeEventListener("keydown", resetGame);
    score = 0;
    initializeBricks();
}

function checkGameOver() {
    if (y + dy > canvas.height - ballRadius) {
        isGameOver = true;
        displayMessage("Game Over! Recommencer ?");
    } else if (bricks.every(column => column.every(brick => !brick || brick.status === 0))) {
        isGameOver = true;
        displayMessage("Bravo ! Recommencer ?");
    }
}

function displayMessage(message) {
    ctx.font = "24px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.textAlign = "center";
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
    document.addEventListener("click", resetGame);
    document.addEventListener("keydown", resetGame);
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
    if(e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = true;
    } else if(e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = true;
    } else if(e.key === "k" || e.key === "K") {
        isBallSticky = !isBallSticky; // Activer le mode sticky
    } else if(e.key === " " && isBallStuck) { // Relancer la balle
        isBallStuck = false;
        let hitPos = (x - paddleX) / paddleWidth;
        if(hitPos < 0.2) {
            dx = -1; dy = -2;  // Extrême gauche
        } else if(hitPos < 0.4) {
            dx = -0.5; dy = -2;  // Gauche
        } else if(hitPos < 0.6) {
            dx = 0; dy = -2;   // Centre
        } else if(hitPos < 0.8) {
            dx = 0.5; dy = -2;   // Droite
        } else {
            dx = 1; dy = -2;   // Extrême droite
        }
        let speed = Math.sqrt(dx * dx + dy * dy);
        dx = (dx / speed) * initialBallSpeed;
        dy = (dy / speed) * initialBallSpeed;
    }
}

function keyUpHandler(e) {
    if(e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = false;
    } else if(e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = false;
    }
}


function collisionDetection() {
    for(let c = 0; c < customMap[0].length; c++) {
        for(let r = 0; r < customMap.length; r++) {
            const b = bricks[c][r];
            if(b && b.status > 0) {
                if(x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                    if (x + dx > b.x + brickWidth || x + dx < b.x) {
                        dx = -dx;
                    } else {
                        dy = -dy;
                    }
                    b.status--; // Réduire la résistance de la brique
                    if (b.status === 0) {
                        score++; // Augmenter le score si la brique est détruite
                    }
                }
            }
        }
    }
}


function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Score: " + score, 8, 20);
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight - paddleY, paddleWidth, paddleHeight);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    for(let c = 0; c < customMap[0].length; c++) {
        for(let r = 0; r < customMap.length; r++) {
            if(bricks[c][r] && bricks[c][r].status > 0) {
                const brick = bricks[c][r];
                const brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
                const brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
                brick.x = brickX;
                brick.y = brickY;

                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                
                // Déterminer la couleur en fonction de la résistance actuelle
                let colorIndex = brick.weakenedColors.length - brick.status;
                ctx.fillStyle = (colorIndex >= 0 && colorIndex < brick.weakenedColors.length) ? 
                                brick.weakenedColors[colorIndex] : brick.color;
                
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}


function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    collisionDetection();
    checkGameOver();

    if (!isGameOver) {
        if(isBallStuck) {
            // La balle reste collée au paddle
            // x = paddleX + paddleWidth / 2 ;
            console.log(ballOffsetX);
            x = paddleX + ballOffsetX;
            y = canvas.height - paddleHeight - paddleY - ballRadius;
            
        } else {
            if(x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
                dx = -dx;
            }
            if(y + dy < ballRadius) {
                dy = -dy;
            } else if(y + dy > canvas.height - ballRadius - paddleHeight - paddleY &&
                    y + dy < canvas.height - paddleY &&
                    x > paddleX && x < paddleX + paddleWidth) {
                if(isBallSticky) {
                    isBallStuck = true;
                    ballOffsetX = x - paddleX; // Sauvegarder la distance entre la balle et le paddle
                    stickyDx = dx;
                    stickyDy = dy;
                    dx = 0;
                    dy = 0;
                } else {
                    let hitPos = (x - paddleX) / paddleWidth;

                    if(hitPos < 0.2) {
                        dx = -1; dy = -2;
                    } else if(hitPos < 0.4) {
                        dx = -0.5; dy = -2;
                    } else if(hitPos < 0.6) {
                        dx = 0; dy = -2;
                    } else if(hitPos < 0.8) {
                        dx = 0.5; dy = -2;
                    } else {
                        dx = 1; dy = -2;
                    }

                    let speed = Math.sqrt(dx * dx + dy * dy);
                    dx = (dx / speed) * initialBallSpeed;
                    dy = (dy / speed) * initialBallSpeed;
                }
            } else if(y + dy > canvas.height - ballRadius) {
                isGameOver = true;
                displayMessage("Game Over! Recommencer ?");
            }

            x += dx;
            y += dy;
        }

        if(rightPressed && paddleX < canvas.width - paddleWidth) {
            paddleX += 7;
        } else if(leftPressed && paddleX > 0) {
            paddleX -= 7;
        }

        requestAnimationFrame(draw);
    }
}


initializeBricks();
draw();
