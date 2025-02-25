/***************************************
   DYNAMIC P5 TENNIS GAME EXAMPLE
   - Uses grid indices (0..gridSize-1)
   - Automatically splits width into
     'gridSize' columns (cellSize)
   - Positions the row of squares
     in the vertical center (offsetY)
***************************************/

let gridSize = 26;    // Number of columns
let player1 = 5;      // Starting position (grid index)
let player2 = 20;     // Starting position (grid index)

// Movement limits for players (grid indices)
let player1MinPos = 2;
let player1MaxPos = 12;
let player2MinPos = 13;
let player2MaxPos = 23;

// Ball & speed variables
let ball = 0;             
let ballDirection = 0;    
let ballSpeed = 5;        
let ballTimer = 0;        
let speedDecayRate = 0.3;
let maxSpeed = 16;       

// Bounce mechanics
let bounceActive = false; 
let bounceWindow = 40;    
let firstRally = true;    
let gameOver = false;

// Keyboard / input states
let movementStartFrame = 0;
let tapCount = 0;
let wPressed = false;
let iPressed = false;
let finalTapCount = 0;
let aPressed = false;
let dPressed = false;
let jPressed = false;
let lPressed = false;
// control force 
let lastChar = '';

// Debug
let debugText = "";

function setup() {
  // Canvas: full width, 200px tall (adjust as you like)
  createCanvas(windowWidth, 200);
  textSize(16);
  frameRate(30);
  resetRally();
}

// Automatically resize the canvas when window changes
function windowResized() {
  resizeCanvas(windowWidth, 200);
}

function draw() {
  background(61, 145, 35);

  // Calculate cell size (width / gridSize)
  let cellSize = width / gridSize;
  // Place everything in a single horizontal row, centered vertically
  let offsetY = (height - cellSize) / 2;

  if (!gameOver) {
    // Draw the court & update player positions if the game is ongoing
    drawCourt(cellSize, offsetY);
    updatePlayerPositions();
  }

  // Draw players, ball, and check for bounce every frame
  drawPlayers(cellSize, offsetY);
  drawBall(cellSize, offsetY);
  checkBounce();

  // Show debug text
  fill(255);
  textSize(12);
  text(debugText, 10, 15);

  // If game over, show message in center & stop the loop
  if (gameOver) {
    fill(255, 0, 0);
    textAlign(CENTER, CENTER);
    textSize(20);
    text(debugText, width / 2, height / 2);
    noLoop();
  }
}

// -- PLAYER MOVEMENT ----------------------------------------

function updatePlayerPositions() {
  // Move player 1 (left player)
  if (aPressed && player1 > player1MinPos) {
    player1--;
  }
  if (dPressed && player1 < player1MaxPos) {
    player1++;
  }

  // Move player 2 (right player)
  if (jPressed && player2 > player2MinPos) {
    player2--;
  }
  if (lPressed && player2 < player2MaxPos) {
    player2++;
  }
}

function keyPressed() {
  if (gameOver) return;

  let pressedKey = key.toLowerCase();

  // Movement controls
  if (pressedKey === 'a') aPressed = true;
  if (pressedKey === 'd') dPressed = true;
  if (pressedKey === 'j') jPressed = true;
  if (pressedKey === 'l') lPressed = true;

  // Bounce controls
  if (pressedKey === 'w') {
    wPressed = true;
    if (ballDirection === -1 && !bounceActive) {
      tapCount = min(parseInt(lastChar) + 1, 10);
      updateDebugText();
    }
  }
  if (pressedKey === 'i') {
    iPressed = true;
    if (ballDirection === 1 && !bounceActive) {
      tapCount = min(parseInt(lastChar) + 1, 10);
      updateDebugText();
    }
  }
  // map slider 
  lastChar = key;  
}

function keyReleased() {
  let releasedKey = key.toLowerCase();

  // Movement controls
  if (releasedKey === 'a') aPressed = false;
  if (releasedKey === 'd') dPressed = false;
  if (releasedKey === 'j') jPressed = false;
  if (releasedKey === 'l') lPressed = false;

  // Bounce controls
  if (releasedKey === 'w') wPressed = false;
  if (releasedKey === 'i') iPressed = false;
}

// -- DRAWING ------------------------------------------------

function drawCourt(cellSize, offsetY) {
  noStroke();
  fill(61, 120, 30);
  for (let i = 0; i < gridSize; i++) {
    // Each cell is cellSize wide/tall; slight padding for effect
    rect(i * cellSize, offsetY, cellSize - 2, cellSize - 2);
  }
}

function drawPlayers(cellSize, offsetY) {
  // Left player
  fill(181, 42, 42);
  rect(player1 * cellSize, offsetY, cellSize - 2, cellSize - 2);

  // Right player
  fill(42, 107, 181);
  rect(player2 * cellSize, offsetY, cellSize - 2, cellSize - 2);
}

function drawBall(cellSize, offsetY) {
  if (ball >= 0) {
    fill(255, 187, 0);
    rect(ball * cellSize, offsetY, cellSize - 2, cellSize - 2);

    // Move the ball over time if not in bounce mode
    if (!bounceActive && frameCount - ballTimer >= ballSpeed) {
      moveBall();
    }
  }
}

// -- BALL MOVEMENT & BOUNCE ---------------------------------

function moveBall() {
  // Time to move?
  if (frameCount - ballTimer >= ballSpeed) {
    movementStartFrame = frameCount;

    // Gradually slow down the ball (increase ballSpeed)
    ballSpeed = min(ballSpeed + speedDecayRate, maxSpeed);

    // Check if ball becomes too slow
    if (ballSpeed >= maxSpeed) {
      gameOver = true;
      let middlePoint = floor(gridSize / 2);
      if (ball < middlePoint) {
        debugText = "Ball Stopped in Left Field - Left Player Loses!";
      } else {
        debugText = "Ball Stopped in Right Field - Right Player Loses!";
      }
      return;
    }

    // Move the ball left or right
    ball += ballDirection;
    ballTimer = frameCount;
    updateDebugText();
  }

  // If ball hits a player's position, activate bounce
  if (ballDirection === -1 && ball <= player1) {
    ball = player1;
    bounceActive = true;
    finalTapCount = tapCount;
  } else if (ballDirection === 1 && ball >= player2) {
    ball = player2;
    bounceActive = true;
    finalTapCount = tapCount;
  }
}

function checkBounce() {
  if (bounceActive) {
    // Left player bounce
    if (ball === player1 && wPressed) {
      performBounce("left");
    }
    // Right player bounce
    else if (ball === player2 && iPressed) {
      performBounce("right");
    }
    // If too much time passes, that player missed
    else if (frameCount - ballTimer >= bounceWindow) {
      gameOver = true;
      if (ball === player1) {
        debugText = "Left Player Missed - Game Over!";
      } else {
        debugText = "Right Player Missed - Game Over!";
      }
    }
  }
}

function performBounce(player) {
  // More taps = faster initial speed & slower decay
  if (finalTapCount > 0) {
    ballSpeed = floor(map(finalTapCount, 1, 10, 8, 2));
    ballSpeed = constrain(ballSpeed, 2, 8);

    speedDecayRate = map(finalTapCount, 1, 10, 0.5, 0.2);
    speedDecayRate = constrain(speedDecayRate, 0.2, 0.5);
  } else {
    // No taps means a slower speed & faster decay
    ballSpeed = 8;
    speedDecayRate = 0.5;
  }

  debugText = `Taps: ${finalTapCount}, Speed: ${ballSpeed.toFixed(1)} (${player} player)`;

  // Reverse ball direction & move one space
  ballDirection *= -1;
  ball += ballDirection;

  bounceActive = false;
  ballTimer = frameCount;
  movementStartFrame = frameCount;
  tapCount = 0;
  finalTapCount = 0;
  firstRally = false;
}

// -- UTILITY & RESET ----------------------------------------

function updateDebugText() {
  let currentPlayer = (ballDirection === -1) ? "left" : "right";
  debugText = `Taps: ${tapCount}, Speed: ${ballSpeed.toFixed(1)} (${currentPlayer} player)`;
}

function resetRally() {
  ball = floor(gridSize / 2);
  ballTimer = frameCount;
  bounceActive = false;
  movementStartFrame = frameCount;
  tapCount = 0;
  finalTapCount = 0;
  
  // Reset states
  wPressed = false;
  iPressed = false;
  aPressed = false;
  dPressed = false;
  jPressed = false;
  lPressed = false;
  
  debugText = "";

  // Randomly place players within their boundaries
  player1 = floor(random(player1MinPos, player1MaxPos - 5));
  player2 = floor(random(player2MinPos + 5, player2MaxPos + 1));
  
  // Random direction for first rally
  if (firstRally) {
    ballDirection = (random() < 0.5) ? -1 : 1;
  }
  
  // Reset ball speed and decay
  ballSpeed = 5;
  speedDecayRate = 0.15;
}
