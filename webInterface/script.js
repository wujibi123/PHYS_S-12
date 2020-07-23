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

	// Get a database reference to our blog
	var ref = firebase.database().ref("/");

	function updateServo(){
		var angle = document.getElementById('angle').value * 1.0;
		console.log("Current Angle" + angle);
		ref.update({
			"Motors/Servo/Data": angle
		});
	}

	var tempRef = firebase.database().ref("/Sensors/Temperature")
	ref.on('value', function(tempDataSnapshot) {
		double temp = tempDataSnapshot.val();
		document.getElementById("tempDisplay").innerHTML = temp;
	});