#include <WiFi.h>                                 // esp32 library
#include <FirebaseESP32.h>                        // firebase library
#include <ESP32Servo.h>                           // Servo Library

/*------------------Networking Setup-------------------------*/
#define FIREBASE_HOST "hot-air-balloon-interface.firebaseio.com"  // the project name address from firebase id
#define FIREBASE_AUTH "nHbBKIfnPXpnGnkQgbITKXTZVDGhhxSAm2gNAP97"                          // the secret key generated from firebase
#define WIFI_SSID "Penny"                                // input your home or public wifi name
#define WIFI_PASSWORD "Penny2017Bi"                            // password of wifi ssid

String root = "/";

//Define FirebaseESP32 data object
FirebaseData firebaseData;

/*------------------Thermistor Setup-------------------------*/
// the value of the 'other' resistor
#define SERIESRESISTOR 10000    
// how many samples to take and average, more takes longer
// but is more 'smooth'
#define NUMSAMPLES 5
// What pin to connect the sensor to
#define THERMISTORPIN A2


/*------------------IMU Setup-------------------------*/

/*------------------Altimeter Setup-------------------------*/

/*------------------Servo Setup-------------------------*/
Servo myservo;  // create servo object to control a servo
#define SERVOPIN 12

void setup() {
  Serial.begin(9600);
  analogReadResolution(12); // All analogInput are in 12 bits (0 - 4096)
  delay(1000);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);                          // try to connect with wifi

  Serial.print("Connecting to ");
  Serial.print(WIFI_SSID);
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }

  Serial.println();
  Serial.print("Connected to ");
  Serial.println(WIFI_SSID);
  Serial.print("IP Address is : ");
  Serial.println(WiFi.localIP());                                // print local IP address
  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);                  // connect to firebase
  Firebase.reconnectWiFi(true);

  // Set initial data to 0. Not sure if some of these will be in "double", I'll fix this once I start testing the sensors
  Firebase.setDouble(firebaseData, root + "Sensors/Temperature/Data", 0);
  Firebase.setDouble(firebaseData, root + "Sensors/Humidity/Data", 0);
  Firebase.setDouble(firebaseData, root + "Sensors/Altitute/Data", 0);
  Firebase.setDouble(firebaseData, root + "Sensors/Velocity/Data", 0);
  Firebase.setDouble(firebaseData, root + "Sensors/Orientation/Data", 0);

  Firebase.setInt(firebaseData, root + "Motors/Servo/Data", 0); // set initial Servo angle to 0. (from 0 to 180)

  myservo.attach(SERVOPIN); // attach servo to pin
}

void loop() {

  Firebase.get(firebaseData, root + "Motors/Servo/Data");                     // get led status input from firebase
  int servoAngle = firebaseData.intData();                        // change to e.g. intData() or boolData()
  myservo.write(servoAngle);                          // sets the servo position according to the database
  Serial.println(servoAngle);

  Firebase.setDouble(firebaseData, root + "Sensors/Temperature/Data", getTemp()); // update database with temperature

  delay(1000);                                 // not strictly necessary
}

double getTemp() {
  double average = 0;
 
  // take N samples in a row, with a slight delay
  for (int i=0; i< NUMSAMPLES; i++) {
   average += analogRead(THERMISTORPIN);
   delay(10);
  }
  average /= NUMSAMPLES;
  // convert the value to resistance
  average = 4095 / average - 1;
  average = SERIESRESISTOR / average;
  
  // convert resistance to temperature
  average = -22.1 * log(average) + 224;
 
  return average;
}

