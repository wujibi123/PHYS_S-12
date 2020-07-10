#include <ESP32Servo.h>

Servo myservo;  // create servo object to control a servo

void setup() {
  myservo.attach(12);  // attaches the servo on pin 12 to the servo object
}

void loop() {
  for (int i = 0; i <= 180; i++) {
    myservo.write(i);
  }
  delay(2000);
}