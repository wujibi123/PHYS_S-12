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
setInteral(updateTime, 1000);

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
		document.getElementById(htmlID).innerHTML = tempData;
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