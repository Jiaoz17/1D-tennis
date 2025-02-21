let gridSize = 26;  
// Broaden player movement ranges to half court each
let player1MinPos = 1;
let player1MaxPos = 12;  // Extended to almost half court
let player2MinPos = 13;  // Starts after half court
let player2MaxPos = 24;  // Extended to near end

let ball = 0;      
let ballDirection = 0; 
let ballSpeed = 5;    
let ballTimer = 0;     
let initialBallSpeed = 3;  // Fast initial speed after bounce
let speedDecayRate = 0.2;  // How quickly ball slows down

let bounceActive = false; 
let bounceWindow = 40;   

let firstRally = true;  
let gameOver = false;
let gameOverReason = "";

// Keep existing variable declarations...

function moveBall() {
  if (frameCount - ballTimer === ballSpeed) {
    movementStartFrame = frameCount;
    updateDebugText();
    
    // Gradually slow down the ball
    ballSpeed = min(ballSpeed + speedDecayRate, 15);
  }

  ball += ballDirection;
  ballTimer = frameCount;
  
  // Check if ball has stopped in the middle
  if (ballSpeed >= 15) {
    let middlePoint = floor(gridSize/2);
    gameOver = true;
    if (ball < middlePoint) {
      gameOverReason = "Ball stopped - Left player loses!";
    } else {
      gameOverReason = "Ball stopped - Right player loses!";
    }
    return;
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

function draw() {
  background(0);
  updatePlayerPositions();
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
    text(gameOverReason || "Game Over!", width/2, height/2);
    noLoop();
    return;
  }
}

function performBounce(player) {
  console.log("Performing bounce with tap count:", finalTapCount);
  
  if (finalTapCount > 0) {
    // Initial speed is always fast
    ballSpeed = initialBallSpeed;
    
    // Adjust decay rate based on tap count
    // More taps = slower decay
    speedDecayRate = map(finalTapCount, 1, 10, 0.4, 0.1);
    speedDecayRate = constrain(speedDecayRate, 0.1, 0.4);
    console.log("Speed decay rate:", speedDecayRate);
  } else {
    // No taps = fast initial speed but quick decay
    ballSpeed = initialBallSpeed;
    speedDecayRate = 0.5;  // Decays very quickly
  }
  
  debugText = `Taps: ${finalTapCount}, Speed: ${ballSpeed} (${player} player)`;
  
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
  gameOverReason = "";
  
  // Reset player positions randomly within their extended boundaries
  player1 = floor(random(player1MinPos, player1MaxPos + 1));
  player2 = floor(random(player2MinPos, player2MaxPos + 1));
  
  if (firstRally) {
    ballDirection = random() < 0.5 ? -1 : 1;
  }
  
  // Reset ball speed variables
  ballSpeed = initialBallSpeed;
  speedDecayRate = 0.2;
}

// Rest of the code remains the same...