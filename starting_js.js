let gridSize= 21; // Total number of pixels (must be odd for a center gap)
let leftBound = Math.floor(gridSize / 2) - 1;
let rightBound = Math.ceil(gridSize / 2);
let player1, player2, ball, ballDirection;
let ballSpeed = 10; // Frames per move
let ballTimer = 0;
let ballTravelDistance = 6; // Distance ball moves per hit
let ballSteps = 0;
let score1 = 0, score2 = 0;
let gameOver = false;
let servingPlayer = 1;

function setup() {
  createCanvas(420, 60);
  textSize(16);
  frameRate(30); // Ensuring the game updates properly
  resetRound();
}

function draw() {
  background(0);
  drawCourt();
  drawPlayers();
  drawBall();
  drawScore();
  if (gameOver) {
    fill(255, 0, 0);
    textAlign(CENTER, CENTER);
    text(`Player ${score1 === 5 ? 1 : 2} Wins!`, width / 2, height / 2);
    noLoop();
  }
}

function drawCourt() {
  fill(255);
  for (let i = 0; i < gridSize; i++) {
    if (i !== leftBound && i !== rightBound) {
      rect(i * 20, 20, 18, 18);
    }
  }
}

function drawPlayers() {
  fill(255, 0, 0);
  rect(player1 * 20, 20, 18, 18);
  rect(player2 * 20, 20, 18, 18);
}

function drawBall() {
  if (ball >= 0) {
    fill(0, 255, 0);
    rect(ball * 20, 20, 18, 18);
    if (frameCount - ballTimer >= ballSpeed && ballSteps > 0) {
      ball += ballDirection;
      ballTimer = frameCount;
      ballSteps--;
      if (ballSteps === 0) checkScoringCondition();
    }
  }
}

function drawScore() {
  fill(255);
  textAlign(LEFT, TOP);
  text(`P1: ${score1}`, 10, 10);
  textAlign(RIGHT, TOP);
  text(`P2: ${score2}`, width - 10, 10);
}

function keyPressed() {
  if (!gameOver) {
    if (key === 'a' && player1 > 0) player1--;
    if (key === 'd' && player1 < leftBound - 1) player1++;
    if (key === 'j' && player2 > rightBound + 1) player2--;
    if (key === 'l' && player2 < gridSize - 1) player2++;
    if (key === 'w' && ball === -1 && servingPlayer === 1) launchBall(1);
    if (key === 'i' && ball === -1 && servingPlayer === 2) launchBall(-1);
  }
}

function launchBall(direction) {
  ball = direction === 1 ? leftBound - 1 : rightBound + 1;
  ballDirection = direction;
  ballTimer = frameCount;
  ballSteps = ballTravelDistance;
}

function checkScoringCondition() {
  if (ballSteps === 0) {
    if (ballDirection === -1) {
      if (ball === player1) {
        launchBall(1);
      } else {
        score2++;
        resetRound();
      }
    } else if (ballDirection === 1) {
      if (ball === player2) {
        launchBall(-1);
      } else {
        score1++;
        resetRound();
      }
    }
  }
}

function resetRound() {
  player1 = Math.floor(leftBound / 2);
  player2 = Math.floor((rightBound + gridSize) / 2);
  ball = -1;
  servingPlayer = (score1 + score2) % 2 === 0 ? 1 : 2;
  if (score1 === 5 || score2 === 5) gameOver = true;
}
