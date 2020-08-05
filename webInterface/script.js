// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyDJfZDE9dTVltl0PWkOnxRG6gapHoDhW8k",
    authDomain: "hot-air-balloon-interface.firebaseapp.com",
    databaseURL: "https://hot-air-balloon-interface.firebaseio.com",
    projectId: "hot-air-balloon-interface",
    storageBucket: "hot-air-balloon-interface.appspot.com",
    messagingSenderId: "270661976089",
    appId: "1:270661976089:web:6189cae23d08252161aa88",
    measurementId: "G-SLLF9YV2F4"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

//*************

// Get a database reference
var ref = firebase.database().ref("/");

// Update Time every second
setInterval(updateTime, 1000);

// Updating temperature value
updateData(firebase.database().ref("/Sensors/Temperature/Data"), "tempDisplay");

// Updating Orientation
updateOrientation(firebase.database().ref("/Sensors/Orientation/Data"));

// Updating Altitude
updateData(firebase.database().ref("/Sensors/Altitude/Data"), "altDisplay");

// Sending API data to the database every minute
setInterval(updateSeaLevelPressure, 60000);



// ****************  FUNCTIONS  *****************
function getWeatherString() {
	// Returns a formatted String of the weather
	axios.get('https://api.weather.gov/stations/KBOS/observations/latest')
		.then(response => {
			console.log("Getting Weather Data");
			return
			"Time Of Observation: " +  response.data.properties.timestamp + "\n" +
			"Outside Temperature: " +  response.data.properties.temperature.value + "Celsius\n" +
			"Wind Direction: " +  response.data.properties.windDirection.value + " Degrees" + "\n" +
			"Wind Speed: " +  response.data.properties.windSpeed.value + "km/h" + "\n" +
			"Humidity: " +  response.data.properties.relativeHumidity.value + " %";
		})
		.catch(error => {
			console.error(error);
			return "error";
		});
}

function updateServo(angle){
	console.log("Current Angle: " + angle);
	ref.update({
		"Motors/Servo/Data": angle
	});
}

function getTemperature() {
  var tempRef = firebase.database().ref("Sensors/Temperature/Data");
  tempRef.once('value', function(tempDataSnapshot) {
		return tempDataSnapshot.val();
  });
}

function updateSeaLevelPressure(){
	// Sending API data about sea level pressure to the database
	axios.get('https://api.weather.gov/stations/KBOS/observations/latest')
		.then(response => {
			var pressure = response.data.properties.seaLevelPressure.value;
			console.log("Current Sea level pressure: " + pressure);
			ref.update({
				"WeatherAPI/SeaLevelPressure/Data": pressure
			});
		})
		.catch(error => {
			console.error(error);
			document.getElementById("time").innerHTML = "Error"
		});
}
function updateTime(){
	// updates time
	var d = new Date();
  	document.getElementById("timeDisplay").innerHTML = d.toLocaleTimeString();
}

function updateData(tempRef, htmlID){
	// gets data in the databse at tempRef and updates the website according to the htmlID
	// can only handle simple data, no vectors or arrays
	tempRef.on('value', function(tempDataSnapshot) {
		var tempData = tempDataSnapshot.val();
		return tempData;
	});
}

function updateOrientation(tempRef) {
	// gets orientation frmo databse and updates the website
	// tempRef = the reference of the data
	tempRef.on('value', function(tempDataSnapshot) {
		var x = tempDataSnapshot.child("X").val();
		var y = tempDataSnapshot.child("Y").val();
		var z = tempDataSnapshot.child("Z").val();
		document.getElementById("oriDisplay").innerHTML = "X: " + x + ", Y: " + y + ", Z: " + z;
	});
}


/***********************p5.js*****************************/
let beginX; // Initial x-coordinate
let endX; // Final x-coordinate
let distX;// X-axis distance to move
let radius; // radius of the circle the object is moving along
let mousePct = 0.5;
let pct = 0.5; // Percentage traveled (0.0 to 1.0)
let servoAngle = 90; // servo angle
let servoCoordinates = [];

function preload() {
	uBuntu = loadFont('../assets/Ubuntu-C.ttf');
	servo = loadImage('../assets/servo_art.png');
}

function setup() {
  createCanvas(displayWidth, displayHeight);
  angleMode(DEGREES); // Change the mode to DEGREES

  textFont(uBuntu);
  textSize(displayWidth/80);
  textAlign(CENTER, CENTER);

  /**** Servo Motor ***/
  beginX = displayWidth / 2 - displayWidth / 6; // Initial x-coordinate of curve
  endX = displayWidth / 2 + displayWidth / 6; // Final x-coordinate of curve
  beginY = displayHeight/2; // Initial y-coordinate of curve
  endY = abs(endX - beginX)/2; // Final y-coordinate of curve
  distX = endX - beginX;// X-axis distance to move
  radius = displayWidth/6; // radius of the circle the object is moving along

  /******** Temperature Data *******/
  let dataBeginY = 3 * displayHeight/4; // initiation for data lines
  let dataEndY = displayHeight/4;
  let dataStrokeWeight = displayWidth/30;
  let dataFrameRate = 60;
  tempDataLine = new dataLine(displayWidth/6, dataBeginY, dataEndY, 0, 200, dataStrokeWeight, dataFrameRate);
}

function draw() {
  background('#effefc');

  /******* SERVO MOTOR ******/
  fill('#effefc');
  stroke('#ff5d00');
  strokeWeight(displayWidth/50);
  arc(displayWidth/2, displayHeight/2, displayWidth/3, displayWidth/3, 180, 0);
  if (mouseIsPressed) {
  	// making a coordinate plane with center at the center of the page
    servoCoordinates[0] = mouseX - displayWidth/2;
    servoCoordinates[1] = -(mouseY - displayHeight/2);
    servoAngle = -atan(servoCoordinates[1]/servoCoordinates[0]);
    if (servoCoordinates[0] > 0 && servoCoordinates[1] > 0) {
      servoAngle = 180 +(servoAngle)
    } else if (servoCoordinates[0] > 0 && servoCoordinates[1] < 0) {
      servoAngle *= -1;
    }
  }

  if (servoAngle > 0) {
	  y = -radius*sin(servoAngle) + displayHeight/2;
	  x = -radius*cos(servoAngle) + displayWidth/2;
	  updateServo(servoAngle);
  } else {
    y = displayHeight/2;
    if (mouseX > displayWidth/2) {
      x = displayWidth/2 + displayWidth/6;
      updateServo(180);
    } else {
      x = displayWidth/2 - displayWidth/6;
      updateServo(0);
    }
  }

  noStroke();
  fill(0);
  ellipse(x, y, displayWidth/30, displayWidth/30);
  
  image(servo, displayWidth / 2 - 132, displayHeight / 2 - 148, distX, 880 * (distX/1013)); // original img is 1013 × 880
  /******* SERVO MOTOR ******/

  /******* Temperature ******/
  // Get Temp data from database
  tempDataLine.update(getTemperature());
  // Update the Data
  tempDataLine.show();
}