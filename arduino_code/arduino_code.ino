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
    Keyboard.write(97); // A
  }
  if (digitalRead(4) == LOW)
  {
    keyA = OFF;
  }

  if ((digitalRead(7) == HIGH) && keyB == OFF)
  {
    keyB = ON;
    Keyboard.write(100); // D
  }
  if (digitalRead(7) == LOW)
  {
    keyB = OFF;
  }

  if ((digitalRead(8) == HIGH) && keyX == OFF)
  {
    keyX = ON;
    Keyboard.write(119); // W
  }
  if (digitalRead(8) == LOW)
  {
    keyX = OFF;
  }

}