const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const $sprite = document.querySelector('#sprite');
const $bricks = document.querySelector('#bricks');

canvas.width = 548;
canvas.height = 500;

/* Variables de nuestro juego */

/* VARIABLES DE LA PELOTA */
const ballRadius = 3;
// posicion de la pelota
let x = canvas.width / 2;
let y = canvas.height - 30;
// velocidad de la pelota
let dx = -3;
let dy = -3;

/* VARIABLES DE LA PALETA */
const PADDLE_SENSITIVITY = 8;

const paddleHeight = 10;
const paddleWidth = 50;

let paddleX = (canvas.width - paddleWidth) / 2;
let paddleY = canvas.height - paddleHeight - 10;

let rightPressed = false;
let leftPressed = false;

/* VARIABLES DE LOS LADRILLOS */
const brickRowCount = 9;
const brickColumnCount = 16;
const brickWidth = 32;
const brickHeight = 16;
const brickPadding = 0;
const brickOffsetTop = 80;
const brickOffsetLeft = 16;
const bricks = [];

const BRICK_STATUS = {
  ACTIVE: 1,
  DESTROYED: 0
};

for (let c = 0; c < brickColumnCount; c++) {
  bricks[c] = []; // inicializamos con un array vacio
  for (let r = 0; r < brickRowCount; r++) {
    const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
    const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
    const random = Math.floor(Math.random() * 8);
    bricks[c][r] = {
      x: brickX,
      y: brickY,
      status: BRICK_STATUS.ACTIVE,
      color: random
    };
  }
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.drawImage(
    $sprite, 29, 174, paddleWidth, paddleHeight, 
    paddleX, paddleY, paddleWidth, paddleHeight
  );
}

function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const currentBrick = bricks[c][r];
      if (currentBrick.status === BRICK_STATUS.DESTROYED) continue;
      const clipX = currentBrick.color * 32;
      ctx.drawImage(
        $bricks, clipX, 0, brickWidth, brickHeight, 
        currentBrick.x, currentBrick.y, brickWidth, brickHeight
      );
    }
  }
}

function drawUI() {
  ctx.fillText(`FPS: ${Math.round(framesPerSec)}`, 5, 10);
}

function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const currentBrick = bricks[c][r];
      if (currentBrick.status === BRICK_STATUS.DESTROYED) continue;

      const isBallSameXAsBrick = x > currentBrick.x && x < currentBrick.x + brickWidth;
      const isBallSameYAsBrick = y > currentBrick.y && y < currentBrick.y + brickHeight;

      if (isBallSameXAsBrick && isBallSameYAsBrick) {
        dy = -dy;
        currentBrick.status = BRICK_STATUS.DESTROYED;
      }
    }
  }
}

function ballMovement() {
  if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
    dx = -dx;
  }

  if (y + dy < ballRadius) {
    dy = -dy;
  }

  const isBallSameXAsPaddle = x > paddleX && x < paddleX + paddleWidth;
  const isBallTouchingPaddle = y + dy > paddleY;

  if (isBallSameXAsPaddle && isBallTouchingPaddle) {
    dy = -dy;
  } else if (y + dy > canvas.height - ballRadius) {
    gameOver = true;
    console.log('Game Over');
    document.location.reload();
  }

  x += dx;
  y += dy;
}

function paddleMovement() {
  if (rightPressed && paddleX < canvas.width - paddleWidth) {
    paddleX += PADDLE_SENSITIVITY;
  } else if (leftPressed && paddleX > 0) {
    paddleX -= PADDLE_SENSITIVITY;
  }
}

function cleanCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function initEvents() {
  document.addEventListener('keydown', keyDownHandler);
  document.addEventListener('keyup', keyUpHandler);

  function keyDownHandler(event) {
    const { key } = event;
    if (key === 'Right' || key === 'ArrowRight' || key.toLowerCase() === 'd') {
      rightPressed = true;
    } else if (key === 'Left' || key === 'ArrowLeft' || key.toLowerCase() === 'a') {
      leftPressed = true;
    }
  }

  function keyUpHandler(event) {
    const { key } = event;
    if (key === 'Right' || key === 'ArrowRight' || key.toLowerCase() === 'd') {
      rightPressed = false;
    } else if (key === 'Left' || key === 'ArrowLeft' || key.toLowerCase() === 'a') {
      leftPressed = false;
    }
  }
}

const fps = 60;
let msPrev = window.performance.now();
let msFPSPrev = window.performance.now() + 1000;
const msPerFrame = 1000 / fps;
let frames = 0;
let framesPerSec = fps;
let gameOver = false;

function draw() {
  if (gameOver) return;

  window.requestAnimationFrame(draw);

  const msNow = window.performance.now();
  const msPassed = msNow - msPrev;

  if (msPassed < msPerFrame) return;

  const excessTime = msPassed % msPerFrame;
  msPrev = msNow - excessTime;

  frames++;

  if (msFPSPrev < msNow) {
    msFPSPrev = window.performance.now() + 1000;
    framesPerSec = frames;
    frames = 0;
  }

  cleanCanvas();
  drawBall();
  drawPaddle();
  drawBricks();
  drawUI();

  collisionDetection();
  ballMovement();
  paddleMovement();
}

draw();
initEvents();
