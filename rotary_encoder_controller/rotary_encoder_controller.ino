/*

This is a simple example that allows you to connect 4 buttons and a rotary encoder to your Arduino.
The Arduino acts as a keyboard by outputting button presses.

You will need this table to figure the code for the characters you are trying to output.
http://www.asciitable.com/

*/

#include <Keyboard.h>      // include library that let's Arduino act as a keyboard
#include <RotaryEncoder.h> // include rotary encoder library

// Setup a RoraryEncoder for pins A0 and A1:
RotaryEncoder encoder(A0, A2);
int buttonPin = 2; // Pin connected to the button on the rotary encoder
int buttonState = 0; // Variable to store the state of the button
int powerlevelchar = 0;


// some useful values
#define OFF 0
#define ON 1

// start by assuming no buttons are pressed
bool keyA = OFF;


void setup()
{

  // connect to serial port for debugging
  pinMode(buttonPin, INPUT_PULLUP); // Enable internal pull-up resistor
  pinMode(A1, INPUT);

  Serial.begin(57600);


  // start the keyboard
  Keyboard.begin();
}

void loop()
{
  // Read the encoder and output its value
  /////////////////////////////////////////
  static int pos = 0;
  encoder.tick();

  int newPos = encoder.getPosition();
  if (pos != newPos)
  {
  Serial.print(newPos);
  Serial.println();

     if (newPos > pos)
     {
      Keyboard.write(100); // d
     }

     if (newPos < pos)
     {
       Keyboard.write(97); // A
     }

     pos = newPos;
   }

  // All the key presses happen here
  //////////////////////////////////////////////


}