/*

This is a simple example that allows you to connect 4 buttons and a rotary encoder to your Arduino.
The Arduino acts as a keyboard by outputting button presses.

You will need this table to figure the code for the characters you are trying to output.
http://www.asciitable.com/

*/

#include <Keyboard.h>      // include library that let's Arduino act as a keyboard


// some useful values
#define OFF 0
#define ON 1

// start by assuming no buttons are pressed
bool keyA = OFF;
bool keyB = OFF;
bool keyX = OFF;
bool keyY = OFF;
bool keyZ = OFF;
bool keyC = OFF;

void setup()
{

  // connect to serial port for debugging
  Serial.begin(57600);

  // make pin 2 an input and turn on the
  // pullup resistor so it goes high unless
  // connected to ground:
  pinMode(4, INPUT_PULLUP);
  pinMode(7, INPUT_PULLUP);
  pinMode(8, INPUT_PULLUP);

  pinMode(15, INPUT_PULLUP);
  pinMode(14, INPUT_PULLUP);
  pinMode(16, INPUT_PULLUP);

  // start the keyboard
  Keyboard.begin();
}

void loop()
{

  // All the key presses happen here
  //////////////////////////////////////////////

  if ((digitalRead(4) == HIGH) && keyA == OFF)
  {
    keyA = ON;
    Keyboard.write(108); // A
  }
  if (digitalRead(4) == LOW)
  {
    keyA = OFF;
  }

  if ((digitalRead(7) == HIGH) && keyB == OFF)
  {
    keyB = ON;
    Keyboard.write(106); // D
  }
  if (digitalRead(7) == LOW)
  {
    keyB = OFF;
  }

  if ((digitalRead(8) == HIGH) && keyC == OFF)
  {
    keyC = ON;
    Keyboard.write(105); // W
  }
  if (digitalRead(8) == LOW)
  {
    keyC = OFF;
  }
////

    if ((digitalRead(16) == HIGH) && keyZ == OFF)
  {
    keyZ = ON;
    Keyboard.write(97); // L
  }
  if (digitalRead(16) == LOW)
  {
    keyZ = OFF;
  }

    if ((digitalRead(14) == HIGH) && keyX == OFF)
  {
    keyX = ON;
    Keyboard.write(100); // J
  }
  if (digitalRead(14) == LOW)
  {
    keyX = OFF;
  }

    if ((digitalRead(15) == HIGH) && keyY == OFF)
  {
    keyY = ON;
    Keyboard.write(119); // I
  }
  if (digitalRead(15) == LOW)
  {
    keyY = OFF;
  }



}