let gridSize = 27;    
let player1 = 2;      
let player2 = 23;     

// Movement limits for players (grid indices)
let player1MinPos = 0;
let player1MaxPos = 12;
let player2MinPos = 14;
let player2MaxPos = 26;

// Ball & speed variables
let ball = 0;             
let ballDirection = 0;    
let ballSpeed = 5;        
let ballTimer = 0;        
let speedDecayRate = 0.15;
let maxSpeed = 15;       

// Bounce mechanics
let bounceActive = false; 
let bounceWindow = 20;    
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
let crowdRows = 2;  
let sideRows = 6;   // Number of rows for U-shape sides

// Add these variables at the top of the file with the other game variables
let winAnimation = false;
let winningPlayer = ""; // "left" or "right"
let animationStartTime = 0;
let animationDuration = 3000; // 3 seconds in milliseconds
let flickerRate = 150; // milliseconds between flicker
let lastFlickerTime = 0;
let courtVisible = true;

// Debug
let debugText = "";
let textColor = [61, 14, 35]; 

function setup() {
  createCanvas(windowWidth, windowHeight);
  textSize(16);
  frameRate(30);
  resetRally();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}


function draw() {
  
  background(61, 145, 35);
  
  // Calculate dimensions
  // Add more margin by reducing the cell size
  let maxCellSize = min(width / (gridSize + 12), height / (12 + 12));
  let cellSize = maxCellSize;
  let fieldWidth = cellSize * gridSize;
  let courtStartX = (width - fieldWidth) / 2;
  let fieldHeight = cellSize; // Single row height
  
  spectatorSize = cellSize;
  
  let courtOffsetY = height / 2;
  
  // Position crowd at the edges of the screen
  let topCrowdY = 0; // At the very top edge
  let bottomCrowdY = height - (spectatorSize * 1.2); // At the very bottom edge

  // Draw white border squares first
  fill(255);
  noStroke();
  
  // ONE row of white squares above the court (changed from two)
  for (let i = 0; i < gridSize; i++) {
    rect(courtStartX + i * cellSize, courtOffsetY - cellSize * 1.5, cellSize - 2, cellSize - 2);
  }
  
  // ONE row of white squares below the court (changed from two)
  for (let i = 0; i < gridSize; i++) {
    rect(courtStartX + i * cellSize, courtOffsetY + cellSize * 0.5, cellSize - 2, cellSize - 2);
  }
  
  // Calculate vertical positions for end lines
  // We now need 3 squares (one for the playing line, one above, one below)
  let verticalStart = -1;
  let verticalCount = 3;
  
  // Left column - 3 white squares with middle one at playing line
  for (let i = 0; i < verticalCount; i++) {
    // Position squares so the middle one (i=1) aligns with the playing line (courtOffsetY - cellSize/2)
    let yPos = courtOffsetY - cellSize/2 + (verticalStart + i) * cellSize;
    rect(courtStartX - cellSize, yPos, cellSize - 2, cellSize - 2);
  }
  
  // Right column - 3 white squares with middle one at playing line
  for (let i = 0; i < verticalCount; i++) {
    // Position squares so the middle one (i=1) aligns with the playing line (courtOffsetY - cellSize/2)
    let yPos = courtOffsetY - cellSize/2 + (verticalStart + i) * cellSize;
    rect(courtStartX + fieldWidth, yPos, cellSize - 2, cellSize - 2);
  }
  
  // Check if we're in win animation state
  if (winAnimation) {
    // Check if animation time is over
    if (millis() - animationStartTime > animationDuration) {
      winAnimation = false;
    } else {
      // Handle the flicker effect
      if (millis() - lastFlickerTime > flickerRate) {
        courtVisible = !courtVisible;
        lastFlickerTime = millis();
      }
      
        // Draw court with winning player color
        drawWinCourt(cellSize, courtOffsetY, courtStartX, courtVisible);
      }
    } else {
      // Regular court drawing
      drawCourt(cellSize, courtOffsetY);
    }
  
    if (!gameOver) {
      updatePlayerPositions();
    }
  
    // Only draw players and ball if not in win animation
    if (!winAnimation) {
      drawPlayers(cellSize, courtOffsetY);
      drawBall(cellSize, courtOffsetY);
    }
  
    // Draw crowd, players and ball
    drawUShapedCrowd(cellSize, topCrowdY, bottomCrowdY, width, height);
  
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
    fill(textColor[0], textColor[1], textColor[2]);
    textSize(10);
    text(`Ball: ${ball.toFixed(1)}, Dir: ${ballDirection}, Last hit: ${lastHitPlayer}`, 10, 450);
    text(`Slider Input: ${sliderInputBuffer}`, 10, 480);
  }
  
  // Draw the ball 
  drawBall(cellSize, courtOffsetY);

  // Main debug text - center large text for important messages
  textAlign(LEFT, CENTER);
  fill(textColor[0], textColor[1], textColor[2]);
  textSize(10);
  text(debugText, 10, 500);
  
  // Reset text alignment for other text
  textAlign(LEFT, TOP);
  fill(textColor[0], textColor[1], textColor[2]);
  textSize(12);
  text("Game controls: Left player (patterns like 5w4w3w2w=fastest, 2w=slowest, A, D) - Right player (I, J, L)", 10, 520);

  if (gameOver) {
    // Display game over message prominently
    fill(textColor[0], textColor[1], textColor[2]);
    textAlign(CENTER, CENTER);
    textSize(10);
    text(debugText, width / 2, height / 2-80);
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
  
  // Draw middle line using a white square - exactly at position gridSize/2
  let middlePos = Math.floor(gridSize/2);
  fill(255);
  rect(courtStartX + middlePos * cellSize, offsetY - cellSize/2, cellSize - 2, cellSize - 2);
  
  // Log court dimensions to ensure they're equal
  console.log(`Court dimensions: Left side: ${middlePos} squares, Right side: ${gridSize - middlePos - 1} squares`);
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

function drawWinCourt(cellSize, offsetY, courtStartX, visible) {
  if (!visible) return; // Skip drawing when flickering
  
  noStroke();
  
  // Determine the fill color based on the winning player
  if (winningPlayer === "left") {
    fill(181, 42, 42); // Red for left player
  } else {
    fill(42, 107, 181); // Blue for right player
  }
  
  // Draw all court squares with winning color
  for (let i = 0; i < gridSize; i++) {
    rect(courtStartX + i * cellSize, offsetY - cellSize/2, cellSize - 2, cellSize - 2);
  }
  
  // Keep the middle line white
  let middlePos = Math.floor(gridSize/2);
  fill(255);
  rect(courtStartX + middlePos * cellSize, offsetY - cellSize/2, cellSize - 2, cellSize - 2);
}

function getBallColor() {
  // Map the ball speed to a brightness value
  // ballSpeed ranges from initial value (5) to maxSpeed (15)
  // Lower ballSpeed = faster ball movement
  
  // Invert the scale so lower values (faster) give brighter colors
  // Map from [maxSpeed, initialSpeed] to [0.3, 1.0] for brightness
  let brightness = map(ballSpeed, maxSpeed, 5, 0.3, 1.0);
  brightness = constrain(brightness, 0.3, 1.0);
  
  // Use the brightness to adjust the ball's yellow color
  // Base yellow color: 255, 187, 0
  let r = 255 * brightness;
  let g = 187 * brightness;
  let b = 0;  // Keep blue at 0 for pure yellow
  
  return [r, g, b];
}

function drawBall(cellSize, offsetY) {
  let fieldWidth = cellSize * gridSize;
  let courtStartX = (width - fieldWidth) / 2;

   // Get color based on ball speed
  let ballColor = getBallColor();
  
  // Apply the color
  fill(ballColor[0], ballColor[1], ballColor[2]);

  
  // Calculate the ball's position without constraining it
  let ballX = courtStartX + ball * cellSize;
  rect(ballX, offsetY - cellSize/2, cellSize - 2, cellSize - 2);
}

function drawUShapedCrowd(cellSize, topY, bottomY, screenWidth, screenHeight) {
  let spacing = spectatorSize * 1.2;
  let pixelSpacing = spectatorSize * 2.1; // Width of two spectators together
  
  // Calculate if ball is in left or right half
  let inLeftHalf = ball < gridSize / 2;
  
  // Draw U-shaped crowd with spectators grouped in pairs
  
  // Top row (horizontal part of U) - at the very top edge
  for (let i = 0; i < screenWidth; i += pixelSpacing) {
    // Draw grouped spectators (left and right spectator in each group)
    // Determine which half they're in for brightness
    let isInLeftHalf = i < screenWidth / 2;
    
    // Left spectator in group
    let leftBrightness = (isInLeftHalf && inLeftHalf) || (!isInLeftHalf && !inLeftHalf) ? 1.3 : 0.7;
    fill(181 * leftBrightness, 42 * leftBrightness, 42 * leftBrightness); // Red team
    rect(i, topY, spectatorSize, spectatorSize);
    
    // Right spectator in group
    let rightBrightness = (isInLeftHalf && inLeftHalf) || (!isInLeftHalf && !inLeftHalf) ? 1.3 : 0.7;
    fill(181 * rightBrightness, 42 * rightBrightness, 42 * rightBrightness); // Red team
    rect(i + spectatorSize * 1.1, topY, spectatorSize, spectatorSize);
  }
  
  // Bottom row (horizontal part of U) - at the very bottom edge
  for (let i = 0; i < screenWidth; i += pixelSpacing) {
    // Determine which half they're in for brightness
    let isInLeftHalf = i < screenWidth / 2;
    
    // Left spectator in group
    let leftBrightness = (isInLeftHalf && inLeftHalf) || (!isInLeftHalf && !inLeftHalf) ? 1.3 : 0.7;
    fill(42 * leftBrightness, 107 * leftBrightness, 181 * leftBrightness); // Blue team
    rect(i, bottomY, spectatorSize, spectatorSize);
    
    // Right spectator in group
    let rightBrightness = (isInLeftHalf && inLeftHalf) || (!isInLeftHalf && !inLeftHalf) ? 1.3 : 0.7;
    fill(42 * rightBrightness, 107 * rightBrightness, 181 * rightBrightness); // Blue team
    rect(i + spectatorSize * 1.1, bottomY, spectatorSize, spectatorSize);
  }
  
  // Left vertical part of the U
  for (let i = 0; i < sideRows; i++) {
    // Draw left side from top to bottom
    let yPos = topY + spectatorSize + i * spacing;
    
    // Alternate between red (top half) and blue (bottom half)
    let isTopHalf = yPos < screenHeight / 2;
    let brightness = inLeftHalf ? 1.3 : 0.7;
    
    if (isTopHalf) {
      // Red team on top half
      fill(181 * brightness, 42 * brightness, 42 * brightness);
    } else {
      // Blue team on bottom half
      fill(42 * brightness, 107 * brightness, 181 * brightness);
    }
    
    // Left spectator in group
    rect(0, yPos, spectatorSize, spectatorSize);
    
    // Right spectator in group
    rect(spectatorSize * 1.1, yPos, spectatorSize, spectatorSize);
  }
  
  // Right vertical part of the U
  for (let i = 0; i < sideRows; i++) {
    // Draw right side from top to bottom
    let yPos = topY + spectatorSize + i * spacing;
    
    // Alternate between red (top half) and blue (bottom half)
    let isTopHalf = yPos < screenHeight / 2;
    let brightness = inLeftHalf ? 0.7 : 1.3;
    
    if (isTopHalf) {
      // Red team on top half
      fill(181 * brightness, 42 * brightness, 42 * brightness);
    } else {
      // Blue team on bottom half
      fill(42 * brightness, 107 * brightness, 181 * brightness);
    }
    
    // Position at right edge of screen
    let xPos = screenWidth - spectatorSize * 2.2;
    
    // Left spectator in group
    rect(xPos, yPos, spectatorSize, spectatorSize);
    
    // Right spectator in group
    rect(xPos + spectatorSize * 1.1, yPos, spectatorSize, spectatorSize);
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
    if (ball === 3 && (key === 'w' || key === 'W') && firstRally) {
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
  
  // Ball goes outside field - ALLOW IT TO CONTINUE MOVING VISUALLY
  // but trigger game over condition
  if (ball < 0 || ball >= gridSize) {
    if (!ballOutsideField) {
      ballOutsideField = true;
      
      // Allow the ball to continue moving for a few more frames
      // before stopping the game completely
      setTimeout(() => {
        gameOver = true;
        determineGameOutcome();
      }, 300); // Short delay to see the ball move out
    }
    // Don't return here - this allows the ball to keep moving visually
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
   // Start the win animation
  winAnimation = true;
  animationStartTime = millis();
  lastFlickerTime = millis();
  courtVisible = true;
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

  // Movement contr
  if ((pressedKey === 'a')  && player1 > player1MinPos) player1--;
  if ((pressedKey === 'd') && player1 < player1MaxPos) player1++;
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
  // Reset states
  player1 = 2;
  player2 = 24;
  
  // Always clear the slider input buffer when resetting
  sliderInputBuffer = "";
  sliderForceValue = 0;
  
  // Randomly place ball at either player1+1 or player2-1
  if (random() < 0.5) {
    ball = 3;  // Next to left player
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
  if (ball === 3) {
    debugText = "Game starts when left player enters a pattern like 5w4w3w2w (fastest) or 2w (slowest)";
  } else {
    debugText = "Game starts when right player presses I";
  }
  
   // Reset win animation
  winAnimation = false;
  winningPlayer = "";
}