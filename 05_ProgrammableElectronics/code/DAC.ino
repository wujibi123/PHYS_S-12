#include <Arduino.h>
#include <analogWrite.h>
#include <driver/dac.h>

int sensorVal = 1;

void setup() {
  dac_output_enable(DAC_CHANNEL_2);
}

void loop() {
  
  int prevSensorVal = sensorVal; // store the previous value of the pushbotton
  sensorVal = digitalRead(inputPin); //read the pushbutton value into a variable
  
  
  if (sensorVal > prevSensorVal) { // if button is pressed (bascially if it switches from off to on)
      for (int i = 255; i >= 0; i--) { // iterate 255 times, each time for 10 milliseconds. Total of 2.5 seconds.
       dac_output_voltage(DAC_CHANNEL_2, i);
      delay(1);
      Serial.println("Shining");
      }
    } 
  else { // turn off when button is not pressed
       dac_output_voltage(DAC_CHANNEL_2, 0);
  }
  delay(20);
  // The button is really jittery, so the delay is to prevent the board from picking up its random signals.
}
