let gridSize = 26;  
// Players can now move within a range
let player1 = 5;    
let player2 = 20;   
// Add movement limits for players
let player1MinPos = 2;
let player1MaxPos = 12;
let player2MinPos = 13;
let player2MaxPos = 23;

let ball = 0;      
let ballDirection = 0; 
let ballSpeed = 5;    
let ballTimer = 0;     
let speedDecayRate = 0.15; // How quickly ball slows down
let maxSpeed = 12;       // Maximum (slowest) speed before dying

let bounceActive = false; 
let bounceWindow = 40;   

let firstRally = true;  
let gameOver = false;

let movementStartFrame = 0;
let tapCount = 0;
let wPressed = false;
let iPressed = false;
let finalTapCount = 0;

// Add movement key states
let aPressed = false;
let dPressed = false;
let jPressed = false;
let lPressed = false;

let debugText = "";

function setup() {
  createCanvas(520, 60);  
  textSize(16);
  frameRate(30);
  resetRally();
}

function draw() {
  background(61, 145, 35);
  
  // Only draw court if game is not over
  if (!gameOver) {
    drawCourt();
  }
  
  // Always draw players and ball
  drawPlayers();
  drawBall();
  checkBounce();
  
  fill(255);
  textSize(12);
  text(debugText, 10, 15);
  
  if (gameOver) {
    fill(255, 0, 0);
    textAlign(CENTER, CENTER);
    textSize(20);
    text(debugText, width/2, height/2);
    noLoop();
  }
}

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

function drawCourt() {
  noStroke();
  fill(61, 120, 30);
  for (let i = 0; i < gridSize; i++) {
    rect(i * 20, 20, 18, 18);
  }
}

function drawPlayers() {
  fill(181, 42, 42);
  rect(player1 * 20, 20, 18, 18);
  fill(42, 107, 181);
  rect(player2 * 20, 20, 18, 18);
}

function drawBall() {
  if (ball >= 0) {
    fill(255, 187, 0);
    rect(ball * 20, 20, 18, 18);
    
    if (!bounceActive && frameCount - ballTimer >= ballSpeed) {
      moveBall();
    }
  }
}

function moveBall() {
  if (frameCount - ballTimer >= ballSpeed) {
    movementStartFrame = frameCount;
    
    // Gradually slow down the ball (increase ballSpeed value)
    ballSpeed = min(ballSpeed + speedDecayRate, maxSpeed);
    console.log("Current speed:", ballSpeed);
    
    // Check if ball becomes too slow
    if (ballSpeed >= maxSpeed) {
      gameOver = true;
      let middlePoint = floor(gridSize/2);
      if (ball < middlePoint) {
        debugText = "Ball Stopped in Left Field - Left Player Loses!";
      } else {
        debugText = "Ball Stopped in Right Field - Right Player Loses!";
      }
      return;
    }
    
    ball += ballDirection;
    ballTimer = frameCount;
    updateDebugText();
  }
  
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
      tapCount = min(tapCount + 1, 10);
      console.log("Left player tap count:", tapCount);
      updateDebugText();
    }
  }
  if (pressedKey === 'i') {
    iPressed = true;
    if (ballDirection === 1 && !bounceActive) {
      tapCount = min(tapCount + 1, 10);
      console.log("Right player tap count:", tapCount);
      updateDebugText();
    }
  }
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

function updateDebugText() {
  let currentPlayer = ballDirection === -1 ? "left" : "right";
  debugText = `Taps: ${tapCount}, Speed: ${ballSpeed.toFixed(1)} (${currentPlayer} player)`;
}

function checkBounce() {
  if (bounceActive) {
    if (ball === player1 && wPressed) {
      performBounce('left');
    }
    else if (ball === player2 && iPressed) {
      performBounce('right');
    }
    else if (frameCount - ballTimer >= bounceWindow) {
      gameOver = true;
      // Identify which player missed the ball
      if (ball === player1) {
        debugText = "Left Player Missed - Game Over!";
      } else {
        debugText = "Right Player Missed - Game Over!";
      }
    }
  }
}

function performBounce(player) {
  console.log("Performing bounce with tap count:", finalTapCount);
  
  // Initial speed based on tap count (more taps = faster initial speed)
  if (finalTapCount > 0) {
    ballSpeed = floor(map(finalTapCount, 1, 10, 8, 2));
    ballSpeed = constrain(ballSpeed, 2, 8);
    
    // Adjust decay rate based on tap count (more taps = slower decay)
    speedDecayRate = map(finalTapCount, 1, 10, 0.5, 0.2);
    speedDecayRate = constrain(speedDecayRate, 0.2, 0.5);
    console.log("Initial speed:", ballSpeed, "Decay rate:", speedDecayRate);
  } else {
    ballSpeed = 8;  // Slowest initial speed
    speedDecayRate = 0.5; // Fast decay
  }
  
  debugText = `Taps: ${finalTapCount}, Speed: ${ballSpeed.toFixed(1)} (${player} player)`;
  
  ballDirection *= -1;
  ball += ballDirection;
  
  bounceActive = false;
  ballTimer = frameCount;
  movementStartFrame = frameCount;
  tapCount = 0;
  finalTapCount = 0;
  
  firstRally = false;
}

function resetRally() {
  ball = floor(gridSize/2);
  ballTimer = frameCount;
  bounceActive = false;
  movementStartFrame = frameCount;
  tapCount = 0;
  finalTapCount = 0;
  
  // Reset all key states
  wPressed = false;
  iPressed = false;
  aPressed = false;
  dPressed = false;
  jPressed = false;
  lPressed = false;
  
  debugText = "";
  
  // Reset player positions randomly within their boundaries
  player1 = floor(random(player1MinPos, player1MaxPos -5));
  player2 = floor(random(player2MinPos + 5, player2MaxPos + 1));
  
  if (firstRally) {
    ballDirection = random() < 0.5 ? -1 : 1;
  }
  
  // Initial speed and decay rate
  ballSpeed = 5;
  speedDecayRate = 0.15;
}