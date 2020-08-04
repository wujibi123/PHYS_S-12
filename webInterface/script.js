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
function getWeather() {
	axios.get('https://api.weather.gov/stations/KBOS/observations/latest')
		.then(response => {
			console.log("Getting Weather Data");
			document.getElementById("time").innerHTML = "Time: " +  response.data.properties.timestamp;
			document.getElementById("temp").innerHTML = "Outside Temperature (Celsius): " +  response.data.properties.temperature.value;
			document.getElementById("wind").innerHTML = "Wind Direction (degree): " +  response.data.properties.windDirection.value + ", Wind Speed (km/h): " +  response.data.properties.windSpeed.value;;
			document.getElementById("humid").innerHTML = "Humidity (percent): " +  response.data.properties.relativeHumidity.value;
		})
		.catch(error => {
			console.error(error);
			document.getElementById("time").innerHTML = "Error"
		});
}

function updateServo(){
	var angle = document.getElementById('angle').value * 1.0;
	console.log("Current Angle" + angle);
	ref.update({
		"Motors/Servo/Data": angle
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
let x; // x-coordinate
let mousePct = 0.5;
let pct = 0.5; // Percentage traveled (0.0 to 1.0)
let servoAngle = 90; // servo angle

let dataBeginY; // y coordinate of data line beginnings
let dataEndY; // y coordinate of data line ends
let dataDistance; // distance between beginning and end
let rateOfChange = 0.1; // rate of change of data
let dataStrokeWeight;

let tempY = 0;
let maxTemp = 200; // Celcius
let tempBeginX;
let tempData = 0;

function preload() {
	uBuntu = loadFont('../assets/Ubuntu-C.ttf');
	servo = loadImage('../assets/servo_art.png');
}

function setup() {
  createCanvas(displayWidth, displayHeight);
  textFont(uBuntu);
  textSize(displayWidth/80);
  textAlign(CENTER, CENTER);

  beginX = displayWidth/2 - displayWidth/6; // Initial x-coordinate
  endX = displayWidth/2 + displayWidth/6; // Final x-coordinate
  distX = endX - beginX;// X-axis distance to move
  radius = displayWidth/6; // radius of the circle the object is moving along
  x = displayWidth/2; // default x coordinate

  dataBeginY = 3 * displayHeight/4; // initiation for data lines
  dataEndY = displayHeight/4;
  dataDistance = dataBeginY - dataEndY;
  dataStrokeWeight = displayWidth/30;

  tempBeginX = displayWidth/6;
}

function draw() {
  background('#effefc');

  /******* SERVO MOTOR ******/
  fill('#effefc');
  stroke('#ff5d00');
  strokeWeight(displayWidth/50);
  arc(displayWidth/2, displayHeight/2, displayWidth/3, displayWidth/3, PI, 0);
  if (mouseIsPressed) {
    halfPct = abs(mousePct - 0.5); // percent traveled along each half circle
    tempX = (mouseX - displayWidth/2) * (halfPct * 4) + displayWidth/2;
    x = constrain(tempX, beginX, endX);
    mousePct = (constrain(mouseX, beginX, endX) - beginX)/(endX - beginX); // mouse position relative to the curve
    pct = (x - beginX)/(endX - beginX); // circle positon relative to the curve
  }
  y = displayHeight/2 - sqrt(pow(radius, 2) - pow(displayWidth/2 - x, 2)); // use equation of circle to get Y coordinate
  noStroke();
  fill(0);
  ellipse(x, y, displayWidth/30, displayWidth/30);
  
  servoAngle = 180 * pct;
  image(servo, displayWidth / 2 - 132, displayHeight / 2 - 148, distX, 880 * (distX/1013)); // original img is 1013 × 880
  /******* SERVO MOTOR ******/

  /******* Temperature ******/
  stroke('#ff5d00');
  strokeWeight(displayWidth / 30);

  // Get Temp data from database
  var tempRef = firebase.database().ref("/Sensors/Temperature/Data");
  var prevTempData = tempData;

  tempRef.once('value', function(tempDataSnapshot) {
		tempData = tempDataSnapshot.val();
  });// 200 total

  // Draw Temperature Data
  let tempPct = tempData/maxTemp;
  let tempY = dataBeginY - tempPct * dataDistance; // y coord of temperautre data

  let prevTempPct = prevTempData/maxTemp;
  let prevTempY = dataBeginY - prevTempPct * dataDistance;

  console.log("Temp: " + tempData);
  console.log("Temp pct: " + tempPct);
  console.log("TempY: " + tempY);

  console.log("Prev Temp: " + prevTempData);
  console.log("Prev Temp pct: " + prevTempPct);
  console.log("Prev TempY: " + prevTempY);

  drawline(tempY, prevTempY);

  // Drawing the Outline of the Data
  line(tempBeginX - dataStrokeWeight/2, dataBeginY, tempBeginX - dataStrokeWeight/2, dataEndY);
  line(tempBeginX + dataStrokeWeight/2, dataBeginY, tempBeginX + dataStrokeWeight/2, dataEndY);
  noFill();
  arc(tempBeginX, dataBeginY, dataStrokeWeight, dataStrokeWeight, 0, PI);
  arc(tempBeginX, dataEndY, dataStrokeWeight, dataStrokeWeight, PI, 0);

  // Writing down temperature in text
  noStroke();
  fill(0);
  text(tempData, tempBeginX, tempPct * dataDistance + dataStrokeWeight);
  text("Temperature (C)",tempBeginX , dataBeginY + dataStrokeWeight);
}

function drawline(newY, oldY) {
  line(tempBeginX, dataBeginY, tempBeginX, oldY);
  while (oldY < newY) {
    line(tempBeginX, dataBeginY, tempBeginX, oldY);
    oldY += rateOfChange;
  }
  while (oldY > newY) {
    line(tempBeginX, dataBeginY, tempBeginX, oldY);
    oldY -= rateOfChange;
  }
}