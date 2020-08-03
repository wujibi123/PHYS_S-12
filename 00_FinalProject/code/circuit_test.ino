#include <WiFi.h>                                 // esp32 library
#include <FirebaseESP32.h>                        // firebase library
#include <ESP32Servo.h>                           // Servo Library
#include <Wire.h>                                 // SPI library
#include <SPI.h>                                  // SPI library
#include <Adafruit_Sensor.h>                      // Adafruit Unified Sensor Library
#include <Adafruit_BNO055.h>                      // Adafruit BNO055 IMU Sensor Library
#include <utility/imumaths.h>                     // Helper library for calibrating data of IMU
#include <Adafruit_BMP280.h>                      // Adafruit BMP280 IMU Sensor Library

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
Adafruit_BNO055 bno = Adafruit_BNO055(55, 0x28); // IMU, sensor id = 55, address = 0x28
/*------------------Pressure Sensor Setup-------------------------*/
Adafruit_BMP280 bmp; // Pressure Sensor, deafult I2C, address = 0x76

Adafruit_Sensor *bmp_temp = bmp.getTemperatureSensor();
Adafruit_Sensor *bmp_pressure = bmp.getPressureSensor();

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

    /* Initialise the IMU sensor */
  if(!bno.begin())
  {
    /* There was a problem detecting the BNO055 ... check your connections */
    Serial.print("Ooops, no BNO055 detected ... Check your wiring or I2C ADDR!");
    while(1);
  }

  /* Initialise the Pressure sensor */
  if (!bmp.begin(0x76)) { // setting address = 0x76
    Serial.println(F("Could not find a valid BMP280 sensor, check wiring!"));
    while (1) delay(10);
  }

  /* Default settings of pressure Sensor from datasheet. */
  bmp.setSampling(Adafruit_BMP280::MODE_NORMAL,     /* Operating Mode. */
                  Adafruit_BMP280::SAMPLING_X2,     /* Temp. oversampling */
                  Adafruit_BMP280::SAMPLING_X16,    /* Pressure oversampling */
                  Adafruit_BMP280::FILTER_X16,      /* Filtering. */
                  Adafruit_BMP280::STANDBY_MS_500); /* Standby time. */
  
  delay(1000);
    
  bno.setExtCrystalUse(true);
}

void loop() {

  Firebase.get(firebaseData, root + "Motors/Servo/Data");                     // get led status input from firebase
  int servoAngle = firebaseData.intData();                        // change to e.g. intData() or boolData()
  myservo.write(servoAngle);                          // sets the servo position according to the database
  Serial.println(servoAngle);

  Serial.println("Stuck #1");

  Firebase.setDouble(firebaseData, root + "Sensors/Temperature/Data", getTemp()); // update database with temperature
  Serial.println("Stuck #2");

  /* TESTING CODE. FIX IN FUTURE*//* TESTING CODE. FIX IN FUTURE*//* TESTING CODE. FIX IN FUTURE*/
  /* Get a new sensor event */ 
  sensors_event_t imu_event, pressure_event; 
  Serial.println("Stuck #3");
  bno.getEvent(&imu_event); // IMU Event
  Serial.println("Stuck #4");
  bmp_pressure->getEvent(&pressure_event); // Pressure Sensor Event
  Serial.println("Stuck #5");
  
  /* Display data of IMU */
  Serial.print("X: ");
  Serial.print(imu_event.orientation.x, 4);
  Serial.print("\tY: ");
  Serial.print(imu_event.orientation.y, 4);
  Serial.print("\tZ: ");
  Serial.print(imu_event.orientation.z, 4);
  Serial.println("");

  /* Display data of Pressure Sensor */
  Serial.print(F("Pressure = "));
  Serial.print(pressure_event.pressure);
  Serial.println(" hPa");
  Serial.println("");
  /* TESTING CODE. FIX IN FUTURE*//* TESTING CODE. FIX IN FUTURE*//* TESTING CODE. FIX IN FUTURE*/
  
  
  
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
