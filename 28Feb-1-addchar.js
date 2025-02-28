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

// Crowd variables
let spectatorSize;  
let childSize;      
let eyeSize;        
let crowdRows = 2;  

// add left player test
let leftPlayerForce = 0;      // Store the force value for left player
let lastInputValue = "";      // Store the last input string from slider

// Debug
let debugText = "";

//for handle slider 
function parseSliderInput(inputString) {
    // This function extracts numeric values from inputs like "7w", "125w", etc.
    
    inputString = String(inputString);
    
    // Extract all numeric characters from the input
    let numericPart = inputString.match(/\d+/);
    
    if (numericPart) {
      // Return the first sequence of numbers found
      return parseInt(numericPart[0]);
    }
    
    // If no numeric part found, return 0 (default)
    return 0;
  }


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
  text("Game controls: Left player (W,A,D) - Right player (I,J,L)", 10, 15);

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
      finalTapCount = tapCount;
      ballTimer = frameCount; // Reset timer for bounce window
    } 
    // Right player can only bounce ball moving LEFT (towards them)
    else if (ballDirection === 1 && ball >= player2 && ball < player2 + 1) {
      ball = player2; // Set ball position to player
      bounceActive = true;
      finalTapCount = tapCount;
      ballTimer = frameCount; // Reset timer for bounce window
    }
  }
}

// Handle the result of a bounce (hit or miss)
function handleBounce() {
  if (bounceActive) {
    // Left player hits the ball
    if (ball === 2 && wPressed && firstRally) {
      firstRally = false;
      performBounce("left");
      debugText = "Game started! Left player served.";
    }
    // Right player hits the ball
    else if (ball === 23 && iPressed && firstRally) {
      firstRally = false;
      performBounce("right");
      debugText = "Game started! Right player served.";
    }
    // Regular gameplay after first serve
    else if (!firstRally) {
      if (ball === player1 && wPressed) {
        performBounce("left");
      } else if (ball === player2 && iPressed) {
        performBounce("right");
      } else if (frameCount - ballTimer >= bounceWindow) {
        // Player missed - ball continues in same direction
        bounceActive = false;
        
        // Force the ball to continue past the player in the ORIGINAL direction
        if (ball === player1) {
          ball = player1 - 1; // Continue left past player1
          ballDirection = -1; // Ensure direction is left
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
  if (firstRally) return;
  
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
    if (player === "left") {
        // Use the parsed force value for left player
        if (leftPlayerForce > 0) {
          // Map force to appropriate speed and decay rate
          // For slider input, we might want different mapping as values can be much higher
          
          // Calculate ball speed - capped at reasonable limits
          // Use a logarithmic scale for higher values to prevent extreme speeds
          let cappedForce = Math.min(leftPlayerForce, 100); // Prevent extremely high values
          
          if (cappedForce <= 10) {
            // For 1-10 range, use the original mapping
            ballSpeed = floor(map(cappedForce, 1, 10, 8, 2));
          } else {
            // For values > 10, use a logarithmic scale
            // This makes each increment less impactful as values get higher
            ballSpeed = floor(map(Math.log10(cappedForce), 1, 2, 2, 1));
          }
          
          // Ensure speed stays within reasonable bounds
          ballSpeed = constrain(ballSpeed, 1, 8);
          
          // Similar approach for decay rate
          if (cappedForce <= 10) {
            speedDecayRate = map(cappedForce, 1, 10, 0.5, 0.2);
          } else {
            speedDecayRate = map(Math.log10(cappedForce), 1, 2, 0.2, 0.1);
          }
          
          speedDecayRate = constrain(speedDecayRate, 0.1, 0.5);
          
          // Update debug text
          debugText = `Force: ${leftPlayerForce}, Speed: ${ballSpeed.toFixed(1)} (left player)`;
        } else {
          // Default if no force was specified
          ballSpeed = 8;
          speedDecayRate = 0.5;
          debugText = `Default force, Speed: ${ballSpeed.toFixed(1)} (left player)`;
        }
      } else {
        // Right player still uses tap count (unchanged)
        if (finalTapCount > 0) {
          ballSpeed = floor(map(finalTapCount, 1, 10, 8, 2));
          ballSpeed = constrain(ballSpeed, 2, 8);
          speedDecayRate = map(finalTapCount, 1, 10, 0.5, 0.2);
          speedDecayRate = constrain(speedDecayRate, 0.2, 0.5);
          
          // Update debug text
          debugText = `Taps: ${finalTapCount}, Speed: ${ballSpeed.toFixed(1)} (right player)`;
        } else {
          ballSpeed = 8;
          speedDecayRate = 0.5;
          debugText = `Default taps, Speed: ${ballSpeed.toFixed(1)} (right player)`;
        }
      }

  // Update debug text
  debugText = `Taps: ${finalTapCount}, Speed: ${ballSpeed.toFixed(1)} (${player} player)`;
  
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
// a potential function add to deal with 7w as character 
function processSliderInput(input) {
  if (input.includes('w')) {
    leftPlayerForce = parseSliderInput(input);
    debugText = `Left player force set to: ${leftPlayerForce} from slider input`;
    
    // Also set wPressed to true to trigger the hit
    wPressed = true;
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
  // Add this debug line to see what keys are being detected
  console.log("Key pressed:", key, "keyCode:", keyCode);

  // Movement controls
  if (pressedKey === 'a') aPressed = true;
  if (pressedKey === 'd') dPressed = true;
  if (pressedKey === 'j') jPressed = true;
  if (pressedKey === 'l') lPressed = true;


  /* === NEW CODE FOR SLIDER INPUT === */
  // When a key is pressed, check if it's part of a valid slider input pattern
  // This could be a number followed by 'w' or just 'w'
  
  if (pressedKey === 'w') {
  wPressed = true;
    
    // If we already have some input stored, treat it as a complete slider input
    if (lastInputValue.length > 0) {
      //Parse the stored input to extract the force value
      leftPlayerForce = parseSliderInput(lastInputValue);
      
      // Clear the stored input after parsing
      lastInputValue = "";
      
      debugText = `Left player force set to: ${leftPlayerForce} from slider input`;
    }
  }
  // If the key is a digit, add it to our input buffer
  else if (key >= '0' && key <= '9') {
    lastInputValue += key;
    debugText = `Input building: ${lastInputValue} (waiting for W)`;
  }
  /* === END OF NEW CODE === */


  
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
  let currentPlayer = (ballDirection === -1) ? "left" : "right";
  debugText = `Taps: ${tapCount}, Speed: ${ballSpeed.toFixed(1)} (${currentPlayer} player)`;
}

function resetRally() {
  // Fixed player positions
  player1 = 1;
  player2 = 24;
  
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
  
  // Set appropriate debug text based on ball position
  if (ball === 2) {
    debugText = "Game starts when left player presses W";
  } else {
    debugText = "Game starts when right player presses I";
  }
}