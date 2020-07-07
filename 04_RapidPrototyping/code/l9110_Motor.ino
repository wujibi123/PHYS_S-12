const int A1A = 3;  // define pin 3 for A-1A
const int A1B = 4;  // define pin 4 for A-1B
const int analogInputPin = A0; // define A0 as analog input pin

void setup() {
  pinMode(A1A, OUTPUT); // specify these pins as outputs
  pinMode(A1B, OUTPUT); 
  pinMode(analogInputPin, INPUT);
  Serial.begin(9600);
}

void loop() {
  int analogNum = analogRead(analogInputPin);
  analogNum = analogNum / 100 - 5; // divide by 100 and subtract 5 to reduce the input to a -5 to 5 scale.
                                   // When divided by 102.3, the numbers would flicker at the ends, so I decided to go with 100.
  analogNum *= (255/5); // now scale the small numbers up to 255 (or -255).

  if (analogNum > 0) { // this means potentiometer is turned to the left, so turn left accordingly
    motorA('L', analogNum);
  }
  else if (analogNum < 0) { // turns right
    motorA('R', analogNum * -1); // needs to make the analogNum postive first.
  }
  else { // stops the motors if analog reading = 0
    analogWrite(A1A, 0);
    analogWrite(A1B, 0);
  }

  Serial.println(analogNum); // for debugging
  delay(1); // delay is for serial port readability, doesn't affect the motor too much
  
}


/*
 * This is a custom function to drive Motor A indefinitely
 * inputs: direction (L/R), speed (int between 0 and 255)
 * outputs: motor control
 */
void motorA(char d, int s) {
  if(d =='L'){
    analogWrite(A1A, 0);
    analogWrite(A1B, s);
  } else if (d =='R'){
    analogWrite(A1A, s);
    analogWrite(A1B, 0);    
  }
}
