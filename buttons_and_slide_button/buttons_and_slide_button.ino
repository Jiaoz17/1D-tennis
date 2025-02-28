#include <Keyboard.h> 

// Useful values
#define OFF 0
#define ON 1

// Button states
bool keyC = OFF;
bool keyD = OFF;
bool keyE = OFF;
int powerlevelchar = 0;

// Debounce parameters
const unsigned long debounceDelay = 50;  

// Button 1 (existing)
const int buttonPin1 = 7;  
int buttonState1 = LOW;  
int lastButtonState1 = LOW;  
unsigned long lastDebounceTime1 = 0;  

// Button 2 (new)
const int buttonPin2 = 6;  
int buttonState2 = LOW;  
int lastButtonState2 = LOW;  
unsigned long lastDebounceTime2 = 0;  

// Button 3 (new)
const int buttonPin3 = 5;  
int buttonState3 = LOW;  
int lastButtonState3 = LOW;  
unsigned long lastDebounceTime3 = 0;  

void setup() {
  Serial.begin(57600);
  pinMode(A1, INPUT); // If using analog sensor, try INPUT_ANALOG on some boards
  pinMode(buttonPin1, INPUT_PULLUP);
  pinMode(buttonPin2, INPUT_PULLUP);
  pinMode(buttonPin3, INPUT_PULLUP);

  Keyboard.begin();
}

void loop() {
  debounceButton(buttonPin1, buttonState1, lastButtonState1, lastDebounceTime1, keyC, [] {
    findpowerlevel();
    Keyboard.write(powerlevelchar);
    Keyboard.write('w'); // Send 'w' instead of 119
  });

  debounceButton(buttonPin2, buttonState2, lastButtonState2, lastDebounceTime2, keyD, [] {
    Keyboard.write('d'); // Send 'd' instead of 100
  });

  debounceButton(buttonPin3, buttonState3, lastButtonState3, lastDebounceTime3, keyE, [] {
    Keyboard.write('a'); // Send 'a' instead of 97
  });
}

// Generic debounce function for buttons
void debounceButton(int pin, int &buttonState, int &lastButtonState, unsigned long &lastDebounceTime, bool &keyState, void (*action)()) {
  int reading = digitalRead(pin);

  if (reading != lastButtonState) {
    lastDebounceTime = millis();
  }

  if ((millis() - lastDebounceTime) > debounceDelay) {
    if (reading != buttonState) {
      buttonState = reading;

      if (buttonState == HIGH && keyState == OFF) {
        keyState = ON;
        action();  // Execute the passed function
      }

      if (buttonState == LOW) {
        keyState = OFF;  // Fix: Reset state when button is released
      }
    }
  }

  lastButtonState = reading;
}

// Function to find power level from analog input
void findpowerlevel() {
  int sliderVal = analogRead(A1);
  int powerlevel = map(sliderVal, 0, 1023, 1, 5);
  Serial.println(powerlevel);

  switch (powerlevel) {
    case 1: powerlevelchar = '1'; break;
    case 2: powerlevelchar = '2'; break;
    case 3: powerlevelchar = '3'; break;
    case 4: powerlevelchar = '4'; break;
    case 5: powerlevelchar = '5'; break;
  }
}


