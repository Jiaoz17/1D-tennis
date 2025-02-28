
#include <Keyboard.h> 

// some useful values
#define OFF 0
#define ON 1

// start by assuming no buttons are pressed
bool keyC = OFF;
int powerlevelchar = 0;

unsigned long lastDebounceTime = 0;  // the last time the output pin was toggled
unsigned long debounceDelay = 50;  
const int buttonPin = 15;  // the number of the pushbutton pin
int buttonState;            // the current reading from the input pin
int lastButtonState = LOW;  


void setup() {
  // put your setup code here, to run once:
  Serial.begin(57600);
  pinMode(A1, INPUT);
  pinMode(15, INPUT_PULLUP);


  Keyboard.begin();

}

void loop() {
  // put your main code here, to run repeatedly:
    int reading = digitalRead(buttonPin);
    
    if (reading != lastButtonState) {
    // reset the debouncing timer
    lastDebounceTime = millis();
    }
    if ((millis() - lastDebounceTime) > debounceDelay) {
    // whatever the reading is at, it's been there for longer than the debounce
    // delay, so take it as the actual current state:

    // if the button state has changed:
    if (reading != buttonState) {
      buttonState = reading;

      // only toggle the LED if the new button state is HIGH
      if ((buttonState == HIGH) && keyC == OFF)
    {
        keyC = ON;
        findpowerlevel();
        Keyboard.write(powerlevelchar);
        Keyboard.write(105); // W
      }
      if (buttonState == LOW)
      {
        keyC = OFF;
      }
    }
  }
  lastButtonState = reading;

}

void findpowerlevel(){
  int sliderVal = analogRead(A1);
  int powerlevel = map(sliderVal, 0, 1023, 1, 5);
  Serial.println(powerlevel);
  Serial.println(powerlevel);
  switch (powerlevel) {
      case 1:
          powerlevelchar = 49; // 1
          break;
      case 2:
          powerlevelchar = 50; // 2
          break;
      case 3:
          powerlevelchar = 51; // 3
          break;
      case 4:
          powerlevelchar = 52; // 4
          break;
      case 5:
          powerlevelchar = 53; // 5
          break;
  }
}
