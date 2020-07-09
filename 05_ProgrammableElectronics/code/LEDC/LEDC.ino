#include <Arduino.h>
#include <analogWrite.h>

const int inputPin = 12;
const int analogPin = DAC2;
int sensorVal = 1;

void setup() {
  pinMode(inputPin, INPUT);
}

void loop() {
  
  int prevSensorVal = sensorVal; // store the previous value of the pushbotton
  sensorVal = digitalRead(inputPin); //read the pushbutton value into a variable
  
  
  /*if (sensorVal > prevSensorVal) { // if button is pressed (bascially if it switches from off to on)
      for (int i = 255; i >= 0; i--) { // iterate 255 times, each time for 10 milliseconds. Total of 2.5 seconds.
      analogWrite(analogPin, i);
      delay(10);
      }
    } 
  else { // turn off when button is not pressed
      analogWrite(analogPin, 0);
  }
  delay(20); */

  analogWrite(analogPin, 255);
  // The button is really jittery, so the delay is to prevent the board from picking up its random signals.
}
