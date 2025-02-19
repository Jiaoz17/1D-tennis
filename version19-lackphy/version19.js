let gridSize = 26;  
// Players can now move within a range
let player1 = 5;    
let player2 = 20;   
// Add movement limits for players
let player1MinPos = 2;
let player1MaxPos = 8;
let player2MinPos = 17;
let player2MaxPos = 23;

let ball = 0;      
let ballDirection = 0; 
let ballSpeed = 5;    
let ballTimer = 0;     

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
  background(0);
  updatePlayerPositions();  // New function to handle player movement
  drawCourt();
  drawPlayers();
  drawBall();
  checkBounce();
  
  fill(255);
  textSize(12);
  text(debugText, 10, 15);
  
  if (gameOver) {
    fill(255, 0, 0);
    textAlign(CENTER, CENTER);
    text("Game Over!", width/2, height/2);
    noLoop();
    return;
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
  fill(255);
  for (let i = 0; i < gridSize; i++) {
    rect(i * 20, 20, 18, 18);
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
    
    if (!bounceActive && frameCount - ballTimer >= ballSpeed) {
      moveBall();
    }
  }
}

function moveBall() {
  if (frameCount - ballTimer === ballSpeed) {
    movementStartFrame = frameCount;
    updateDebugText();
  }

  ball += ballDirection;
  ballTimer = frameCount;
  
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
  debugText = `Taps: ${tapCount}, Speed: ${ballSpeed} (${currentPlayer} player)`;
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
    }
  }
}

function performBounce(player) {
  console.log("Performing bounce with tap count:", finalTapCount);
  
  if (finalTapCount > 0) {
    ballSpeed = floor(map(finalTapCount, 1, 10, 10, 2));
    ballSpeed = constrain(ballSpeed, 2, 10);
    console.log("New ball speed:", ballSpeed);
  } else {
    ballSpeed = 10;
  }
  
  debugText = `Taps: ${finalTapCount}, New Speed: ${ballSpeed} (${player} player)`;
  
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
  player1 = floor(random(player1MinPos, player1MaxPos + 1));
  player2 = floor(random(player2MinPos, player2MaxPos + 1));
  
  if (firstRally) {
    ballDirection = random() < 0.5 ? -1 : 1;
  }
  ballSpeed = 5;
}