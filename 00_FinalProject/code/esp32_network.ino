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

  // Set initial data to 0
  Firebase.setDouble(firebaseData, root + "Sensors/Temperature/Data", 0); // Celsius
  
  // Problems with the Adafruit Unified Sensor Library. Not recieving Humidity Data
  Firebase.setDouble(firebaseData, root + "Sensors/Humidity/Data", 0); // percent
  
  Firebase.setDouble(firebaseData, root + "Sensors/Altitute/Data", 0); // Meters
  
  // Problems with the Adafruit Unified Sensor Library. Not recieving Acceleration data
  Firebase.setDouble(firebaseData, root + "Sensors/Acceleration/Data/X", 0); // m/s^2 
  Firebase.setDouble(firebaseData, root + "Sensors/Acceleration/Data/Y", 0);
  Firebase.setDouble(firebaseData, root + "Sensors/Acceleration/Data/Z", 0);
  
  Firebase.setDouble(firebaseData, root + "Sensors/Orientation/Data/X", 0); // degrees
  Firebase.setDouble(firebaseData, root + "Sensors/Orientation/Data/Y", 0);
  Firebase.setDouble(firebaseData, root + "Sensors/Orientation/Data/Z", 0);

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

  Firebase.get(firebaseData, root + "Motors/Servo/Data");                     // get servo status input from firebase
  int servoAngle = firebaseData.intData();
  myservo.write(servoAngle);                          // sets the servo position according to the database
  Serial.println(servoAngle);

  Firebase.setDouble(firebaseData, root + "Sensors/Temperature/Data", getTemp()); // update database with temperature

  /* TESTING CODE. FIX IN FUTURE*//* TESTING CODE. FIX IN FUTURE*//* TESTING CODE. FIX IN FUTURE*/
  /* Get a new sensor event */ 
  sensors_event_t imu_event, pressure_event; 
  bno.getEvent(&imu_event); // IMU Event
  bmp_pressure->getEvent(&pressure_event); // Pressure Sensor Event
  
  /* Display data of IMU */
  Firebase.setDouble(firebaseData, root + "Sensors/Orientation/Data/X", imu_event.orientation.x); // update database with x value of orientation
  Firebase.setDouble(firebaseData, root + "Sensors/Orientation/Data/Y", imu_event.orientation.y); // update database with y value of orientation
  Firebase.setDouble(firebaseData, root + "Sensors/Orientation/Data/Z", imu_event.orientation.z); // update database with z value of orientation

  /* Problems with the Adafruit Unified Sensor Library. Not recieving Acceleration data
  Firebase.setDouble(firebaseData, root + "Sensors/Acceleration/Data/X", imu_event.acceleration.x); // update database with x value of Acceleration
  Firebase.setDouble(firebaseData, root + "Sensors/Acceleration/Data/Y", imu_event.acceleration.y); // update database with y value of Acceleration
  Firebase.setDouble(firebaseData, root + "Sensors/Acceleration/Data/Z", imu_event.acceleration.z); // update database with z value of Acceleration
  */

  /* Display data of Pressure Sensor */ 
  /* Problems with the Adafruit Unified Sensor Library. Not recieving Humidity Data
  Firebase.setDouble(firebaseData, root + "Sensors/Humidity/Data", pressure_event.relative_humidity); // update database with humidity
  */
  Firebase.get(firebaseData, root + "WeatherAPI/SeaLevelPressure/Data");  // get servo status input from firebase
  int seaLevelPressure = firebaseData.doubleData() / 100; // Convert from Pa to hPa by dividing by 100
  Firebase.setDouble(firebaseData, root + "Sensors/Altitude/Data", bmp.readAltitude(seaLevelPressure)); // meters

  /* TESTING CODE. FIX IN FUTURE*//* TESTING CODE. FIX IN FUTURE*//* TESTING CODE. FIX IN FUTURE*/

  bool isCalibrated = calibrate(); // want to add this to the data base later
  
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

bool calibrate() {
  // Device Callibration. Returns true if completely calibrated
  /* Get the four calibration values (0..3) */
  /* Any sensor data reporting 0 should be ignored, */
  /* 3 means 'fully calibrated" */
  uint8_t system, gyro, accel, mag;
  system = gyro = accel = mag = 0;
  bno.getCalibration(&system, &gyro, &accel, &mag);
  
  /* Display the individual values */
  Serial.print("Sys:");
  Serial.print(system);
  Serial.print(" G:");
  Serial.print(gyro);
  Serial.print(" A:");
  Serial.print(accel);
  Serial.print(" M:");
  Serial.println(mag);

  if (system == 3 && system == gyro == accel == mag) {
    return true;
  } else {
    return false;
  }
}
