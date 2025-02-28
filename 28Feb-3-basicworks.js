let gridSize = 26;    // Number of grids 
let player1 = 2;      
let player2 = 23;     

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
let speedDecayRate = 0.15;
let maxSpeed = 15;       

// Bounce mechanics
let bounceActive = false; 
let bounceWindow = 40;    
let firstRally = true;    
let gameOver = false;
let lastHitPlayer = "none"; // Track the last player that hit the ball
let ballOutsideField = false; // Track if the ball goes outside the field

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

// Left player slider input system
let sliderInputBuffer = ""; // Buffer to collect the number+w inputs
let sliderForceValue = 0;   // The extracted force value

// Crowd variables
let spectatorSize;  
let childSize;      
let eyeSize;        
let crowdRows = 2;  

// Debug
let debugText = "";

function setup() {
  createCanvas(windowWidth, windowHeight);
  textSize(16);
  frameRate(30);
  resetRally();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// Put a clear debug message when checking state
function draw() {
  background(61, 145, 35);
  
  // Calculate dimensions
  let maxCellSize = min(width / (gridSize + 4), height / (12 + 4));
  let cellSize = maxCellSize;
  let fieldWidth = cellSize * gridSize;
  let courtStartX = (width - fieldWidth) / 2;
  let fieldHeight = cellSize * 5;
  
  spectatorSize = cellSize * 0.8;
  childSize = spectatorSize * 0.6;
  eyeSize = spectatorSize * 0.2;
  
  let courtOffsetY = height / 2;
  let topCrowdY = spectatorSize;
  let bottomCrowdY = height - (crowdRows * spectatorSize * 1.5);

  // Draw background field
  noStroke();
  fill(61, 120, 30);
  rect(courtStartX, courtOffsetY - fieldHeight/2, fieldWidth, fieldHeight);
  
  // Draw three field lines
  stroke(255);
  // Side 
  strokeWeight(1.5);
  line(courtStartX - cellSize/20, courtOffsetY - fieldHeight/2, courtStartX - cellSize/20, courtOffsetY + fieldHeight/2); // Left
  line(courtStartX + fieldWidth + cellSize/20, courtOffsetY - fieldHeight/2, courtStartX + fieldWidth + cellSize/20, courtOffsetY + fieldHeight/2); // Right
  // Middle
  strokeWeight(1.5);
  line(courtStartX + fieldWidth/2, courtOffsetY - fieldHeight/2, courtStartX + fieldWidth/2, courtOffsetY + fieldHeight/2); // Middle

  // Draw court squares on top
  drawCourt(cellSize, courtOffsetY);
  
  if (!gameOver) {
    updatePlayerPositions();
  }

  // Draw crowd, players and ball
  drawCrowd(cellSize, topCrowdY - crowdRows * spectatorSize, 'red', true);
  drawCrowd(cellSize, bottomCrowdY, 'blue', false);
  drawPlayers(cellSize, courtOffsetY);
  
  // Core game logic - handle in this order
  if (!gameOver) {
    // 1. Handle player inputs for bounces
    handleBounce();
    
    // 2. Check if ball meets a player
    checkPlayerCollision();
    
    // 3. Move the ball if it's time
    if (frameCount - ballTimer >= ballSpeed && !bounceActive) {
      moveBall();
    }
    
    // Show important game state info for debugging
    fill(255);
    textSize(10);
    text(`Ball: ${ball.toFixed(1)}, Dir: ${ballDirection}, Last hit: ${lastHitPlayer}`, 10, 30);
    text(`Slider Input: ${sliderInputBuffer}`, 10, 50);
  }
  
  // Draw the ball (after logic updates)
  drawBall(cellSize, courtOffsetY);

  // Main debug text - center large text for important messages
  textAlign(CENTER, CENTER);
  fill(255, 0, 0);
  textSize(24);
  text(debugText, width / 2, height / 2 - 50);
  
  // Reset text alignment for other text
  textAlign(LEFT, TOP);
  fill(255);
  textSize(12);
  text("Game controls: Left player (patterns like 5w4w3w2w=fastest, 2w=slowest, A, D) - Right player (I, J, L)", 10, 15);

  if (gameOver) {
    // Display game over message prominently
    fill(255, 0, 0);
    textAlign(CENTER, CENTER);
    textSize(32);
    text(debugText, width / 2, height / 2);
    
    textSize(16);
    fill(255);
    text("Press SPACE to restart", width / 2, height / 2 + 40);
    noLoop();
  }
}

function drawCourt(cellSize, offsetY) {
  let fieldWidth = cellSize * gridSize;
  let courtStartX = (width - fieldWidth) / 2;
  
  // Draw main court squares as a single sequence
  noStroke();
  fill(61, 130, 30); // Slightly lighter green for visibility
  for (let i = 0; i < gridSize; i++) {
    rect(courtStartX + i * cellSize, offsetY - cellSize/2, cellSize - 2, cellSize - 2);
  }
}

function drawPlayers(cellSize, offsetY) {
  let fieldWidth = cellSize * gridSize;
  let courtStartX = (width - fieldWidth) / 2;
  
  // Left player
  fill(181, 42, 42);
  rect(courtStartX + player1 * cellSize, offsetY - cellSize/2, cellSize - 2, cellSize - 2);

  // Right player (adjust for gap)
  fill(42, 107, 181);
  rect(courtStartX + player2 * cellSize, offsetY - cellSize/2, cellSize - 2, cellSize - 2);
}

function drawBall(cellSize, offsetY) {
  let fieldWidth = cellSize * gridSize;
  let courtStartX = (width - fieldWidth) / 2;
  
  // Check if ball is outside the field
  if (ball < 0 || ball >= gridSize) {
    ballOutsideField = true;
    fill(255, 0, 0); // Red ball for outside field
  } else {
    fill(255, 187, 0); // Normal yellow ball
  }
  
  // Draw the ball (constrained for visibility)
  let visibleBall = constrain(ball, -1, gridSize);
  rect(courtStartX + visibleBall * cellSize, offsetY - cellSize/2, cellSize - 2, cellSize - 2);
}

function drawCrowd(cellSize, startY, team, isTop) {
  let spacing = spectatorSize * 1.2;
  let spectatorsPerRow = gridSize;
  let fieldWidth = cellSize * gridSize;
  let startX = (width - (spectatorsPerRow * spacing)) / 2;
  
  for (let row = 0; row < crowdRows; row++) {
    for (let i = 0; i < spectatorsPerRow; i++) {
      let x = startX + (i * spacing);
      let y = startY + (row * spacing);
      
      // Draw adult spectator
      noStroke();
      fill(team === 'red' ? color(181, 42, 42) : color(42, 107, 181));
      rect(x, y, spectatorSize, spectatorSize);
      
      // Calculate eye positions based on ball position and goals
      let middlePoint = gridSize / 2;
      let lookingRight = true;
      
      // For red team (top)
      if (team === 'red') {
        lookingRight = ball < middlePoint;
      }
      // For blue team (bottom)
      else {
        lookingRight = ball > middlePoint;
      }
      
      let eyeSpacing = eyeSize * 2;
      let leftEyeX = x + spectatorSize * (lookingRight ? 0.4 : 0.2);
      let rightEyeX = leftEyeX + eyeSpacing;
      let eyeY = y + spectatorSize * 0.4;
      
      // Draw eyes
      fill(255);
      circle(leftEyeX, eyeY, eyeSize);
      circle(rightEyeX, eyeY, eyeSize);
      
      // Draw child if space allows
      if (i < spectatorsPerRow - 1) {
        let childX = x + spectatorSize + (spacing - childSize) / 2;
        let childY = y + (spectatorSize - childSize) / 2;
        fill(team === 'red' ? color(221, 82, 82) : color(82, 147, 221));
        rect(childX, childY, childSize, childSize);
      }
    }
  }
}

function updatePlayerPositions() {
  if (aPressed && player1 > player1MinPos) player1--;
  if (dPressed && player1 < player1MaxPos) player1++;
  if (jPressed && player2 > player2MinPos) player2--;
  if (lPressed && player2 < player2MaxPos) player2++;
}

// Separating the collision detection from the movement logic
function checkPlayerCollision() {
  // Only check for collisions if not already in bounce mode and not in first rally
  if (!bounceActive && !firstRally) {
    // CRITICAL FIX: Set explicit direction checks
    // Left player can only bounce ball moving RIGHT (towards them)
    if (ballDirection === -1 && ball <= player1 && ball > player1 - 1) {
      ball = player1; // Set ball position to player
      bounceActive = true;
      finalTapCount = sliderForceValue; // Use slider value instead of tap count
      ballTimer = frameCount; // Reset timer for bounce window
    } 
    // Right player can only bounce ball moving LEFT (towards them)
    else if (ballDirection === 1 && ball >= player2 && ball < player2 + 1) {
      ball = player2; // Set ball position to player
      bounceActive = true;
      finalTapCount = tapCount; // Right player still uses tap count
      ballTimer = frameCount; // Reset timer for bounce window
    }
  }
}

// Handle the result of a bounce (hit or miss)
function handleBounce() {
  if (bounceActive) {
    // Left player hits the ball
    if (ball === 2 && (key === 'w' || key === 'W') && firstRally) {
      firstRally = false;
      performBounce("left");
      sliderInputBuffer = ""; // Clear input buffer after serve
      debugText = "Game started! Left player served.";
    }
    // Right player hits the ball
    else if (ball === 23 && iPressed && firstRally) {
      firstRally = false;
      performBounce("right");
      sliderInputBuffer = ""; // Clear input buffer when right player serves
      debugText = "Game started! Right player served.";
    }
    // Regular gameplay after first serve
    else if (!firstRally) {
      // For left player, we check if the final 'w' was pressed
      if (ball === player1 && sliderInputBuffer.endsWith("w")) {
        performBounce("left");
        sliderInputBuffer = ""; // Clear the buffer after hit
      } else if (ball === player2 && iPressed) {
        performBounce("right");
        sliderInputBuffer = ""; // Clear slider input when right player hits
      } else if (frameCount - ballTimer >= bounceWindow) {
        // Player missed - ball continues in same direction
        bounceActive = false;
        
        // Force the ball to continue past the player in the ORIGINAL direction
        if (ball === player1) {
          ball = player1 - 1; // Continue left past player1
          ballDirection = -1; // Ensure direction is left
          sliderInputBuffer = ""; // Clear the buffer on miss
        } else if (ball === player2) {
          ball = player2 + 1; // Continue right past player2
          ballDirection = 1;  // Ensure direction is right
        }
        
        ballTimer = frameCount; // Reset timer for next movement frame
        
        // Debug the miss
        let missedPlayer = (ball < player1) ? "left" : "right";
        debugText = `${missedPlayer.charAt(0).toUpperCase() + missedPlayer.slice(1)} player missed! Ball continues.`;
      }
    }
  }
}

// Basic ball movement
function moveBall() {
  // Don't move the ball in the first rally until a player serves
  if (firstRally) {
    // Make sure to clear the input buffer during the first rally setup
    // to prevent accumulation of inputs
    if (frameCount % 60 === 0) { // Check periodically
      sliderInputBuffer = "";
    }
    return;
  }
  
  // Increase ball speed gradually
  ballSpeed = min(ballSpeed + speedDecayRate, maxSpeed);
  
  // Move the ball in its current direction
  ball += ballDirection;
  
  // Reset timer for next movement
  ballTimer = frameCount;
  
  // Update debug info
  updateDebugText();
  
  // Check for game ending conditions
  
  // Ball reaches max speed
  if (ballSpeed >= maxSpeed) {
    determineGameOutcome();
    return;
  }
  
  // Ball goes outside field - IMMEDIATELY determine game outcome
  if (ball < 0 || ball >= gridSize) {
    ballOutsideField = true; // Ensure this flag is set
    determineGameOutcome(); // Trigger game over
    return;
  }
}

function performBounce(player) {
  // Adjust ball speed based on the input value
  if (player === "left") {
    // For left player, use the pattern-based speed calculation
    
    // Get the number of complete sequences in the input
    let sequences = (sliderInputBuffer.match(/\d+w/g) || []);
    let sequenceCount = sequences.length;
    
    // Calculate speed based on pattern length and final value
    // Longer patterns = faster (smaller speed value)
    if (sequenceCount > 0) {
      // Map speed based on pattern complexity: 
      // 5w4w3w2w (4 sequences) will be fastest (smallest value)
      // 2w (1 sequence) will be slowest (largest value)
      ballSpeed = map(sequenceCount, 1, 4, 7, 1);
      ballSpeed = constrain(ballSpeed, 1, 7);
      
      // Longer patterns have faster acceleration (higher decay rate)
      speedDecayRate = map(sequenceCount, 1, 4, 0.2, 0.2);
      speedDecayRate = constrain(speedDecayRate, 0.2, 0.2);
    } else {
      ballSpeed = 7;
      speedDecayRate = 0.2;
    }
    
    // Update debug text for left player
    debugText = `Pattern: ${sliderInputBuffer}, Sequences: ${sequenceCount}, Speed: ${ballSpeed.toFixed(1)} (left player)`;
  } else {
    // For right player, use the tap count system as before
    if (finalTapCount > 0) {
      ballSpeed = floor(map(finalTapCount, 1, 10, 8, 2));
      ballSpeed = constrain(ballSpeed, 2, 8);
      speedDecayRate = map(finalTapCount, 1, 10, 0.5, 0.2);
      speedDecayRate = constrain(speedDecayRate, 0.2, 0.5);
    } else {
      ballSpeed = 8;
      speedDecayRate = 0.5;
    }
    // Update debug text for right player
    debugText = `Taps: ${finalTapCount}, Speed: ${ballSpeed.toFixed(1)} (right player)`;
  }
  
  // Store which player last hit the ball
  lastHitPlayer = player;

  // Reverse ball direction and move it one step
  ballDirection *= -1;
  ball += ballDirection;
  
  // Reset bounce state
  bounceActive = false;
  ballTimer = frameCount;
  movementStartFrame = frameCount;
  tapCount = 0;
  finalTapCount = 0;
  sliderForceValue = 0;
  firstRally = false;
}

function determineGameOutcome() {
  gameOver = true;
  
  if (ballOutsideField) {
    // Ball went outside the field - last player to hit loses
    if (lastHitPlayer === "left") {
      debugText = "Ball Out of Bounds! Left Player Loses! (Last to hit the ball)";
    } else if (lastHitPlayer === "right") {
      debugText = "Ball Out of Bounds! Right Player Loses! (Last to hit the ball)";
    } else {
      // No one hit the ball yet
      debugText = "Ball Out of Bounds! Game Over!";
    }
  } else if (ballSpeed >= maxSpeed) {
    // Ball reached max speed in the field - player who missed loses
    let middlePoint = floor(gridSize / 2);
    if (ball < middlePoint) {
      debugText = "Ball Stopped in Left Field - Left Player Loses!";
    } else {
      debugText = "Ball Stopped in Right Field - Right Player Loses!";
    }
  }
}

function keyPressed() {
  // Space bar to restart game
  if (key === ' ' && gameOver) {
    resetRally();
    gameOver = false;
    loop();
    return;
  }

  if (gameOver) return;

  let pressedKey = key.toLowerCase();

  // Movement controls
  if (pressedKey === 'a') aPressed = true;
  if (pressedKey === 'd') dPressed = true;
  if (pressedKey === 'j') jPressed = true;
  if (pressedKey === 'l') lPressed = true;

  // Handle number keys for left player's slider input (1-5)
  if (pressedKey >= '1' && pressedKey <= '5') {
    sliderInputBuffer += pressedKey;
    
    // Count the number of complete number+w sequences
    let sequenceCount = (sliderInputBuffer.match(/\d+w/g) || []).length;
    
    // Extract the latest number for the current sequence
    let lastDigit = pressedKey;
    sliderForceValue = parseInt(lastDigit);
    
    // Set a multiplier based on the number of complete sequences
    // This will make longer patterns result in faster speeds
    sliderForceValue = sliderForceValue + (sequenceCount * 2);
  }
  
  // Handle 'w' key for slider input
  if (pressedKey === 'w') {
    wPressed = true;
    sliderInputBuffer += 'w';
    
    // Update debug for left player's current input
    updateDebugText();
  }
  
  // Bounce controls for right player remain unchanged
  if (pressedKey === 'i') {
    iPressed = true;
    if (ballDirection === 1 && !bounceActive) {
      tapCount = min(tapCount + 1, 10);
      updateDebugText();
    }
  }
}

function keyReleased() {
  let releasedKey = key.toLowerCase();

  if (releasedKey === 'a') aPressed = false;
  if (releasedKey === 'd') dPressed = false;
  if (releasedKey === 'j') jPressed = false;
  if (releasedKey === 'l') lPressed = false;
  if (releasedKey === 'w') wPressed = false;
  if (releasedKey === 'i') iPressed = false;
}

function updateDebugText() {
  if (ballDirection === -1) {  // Left player's turn
    // Count the number of complete sequences
    let sequences = (sliderInputBuffer.match(/\d+w/g) || []);
    let sequenceCount = sequences.length;
    
    if (sliderInputBuffer) {
      // Create a more informative message about the pattern
      let speedIndicator = "";
      
      // Give feedback on current speed expectation
      if (sequenceCount === 0) {
        speedIndicator = "Need to finish with 'w'";
      } else if (sequenceCount === 1) {
        speedIndicator = "Slow";
      } else if (sequenceCount === 2) {
        speedIndicator = "Medium";
      } else if (sequenceCount === 3) {
        speedIndicator = "Fast";
      } else if (sequenceCount >= 4) {
        speedIndicator = "Very Fast";
      }
      
      debugText = `Pattern: ${sliderInputBuffer}, Sequences: ${sequenceCount}, ${speedIndicator} (left player)`;
    } else {
      debugText = `Enter pattern like 5w4w3w2w (fastest) or 2w (slowest) (left player)`;
    }
  } else {  // Right player's turn
    debugText = `Taps: ${tapCount}, Speed: ${ballSpeed.toFixed(1)} (right player)`;
  }
}

function resetRally() {
  // Fixed player positions
  player1 = 1;
  player2 = 24;
  
  // Always clear the slider input buffer when resetting
  sliderInputBuffer = "";
  sliderForceValue = 0;
  
  // Randomly place ball at either player1+1 or player2-1
  if (random() < 0.5) {
    ball = 2;  // Next to left player
    ballDirection = -1;  // Initially moving left (will be reversed when hit)
  } else {
    ball = 23; // Next to right player
    ballDirection = 1;   // Initially moving right (will be reversed when hit)
  }
  
  // Reset game states
  ballTimer = frameCount;
  bounceActive = true;  // Start in bounce mode, waiting for first hit
  movementStartFrame = frameCount;
  tapCount = 0;
  finalTapCount = 0;
  sliderInputBuffer = "";
  sliderForceValue = 0;
  ballOutsideField = false;
  lastHitPlayer = "none";
  gameOver = false;
  firstRally = true;
  
  // Reset input states
  wPressed = false;
  iPressed = false;
  aPressed = false;
  dPressed = false;
  jPressed = false;
  lPressed = false;
  
  // Reset ball speed and decay
  ballSpeed = 5;
  speedDecayRate = 0.15;
  
  // Make sure the input buffer is cleared when the game over screen is shown
  sliderInputBuffer = "";
  
  // Set appropriate debug text based on ball position
  if (ball === 2) {
    debugText = "Game starts when left player enters a pattern like 5w4w3w2w (fastest) or 2w (slowest)";
  } else {
    debugText = "Game starts when right player presses I";
  }
}