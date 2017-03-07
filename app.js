/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.co
var metadataCount = 0;
var Client = require('ibmiotf');
var express = require('express');
	request = require('request'),
	
	_= require('lodash');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server
var app = express();

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// Iot Credentials 
// --------------------
var config = {
 "org" : "2c3wgz",
 "id" : "Denzel_IOT",
 "domain": "internetofthings.ibmcloud.com",
 "type" : "DC-iot",
 "auth-method": "token",
 "auth-token" : "7048419193"
 };

var deviceClient = new Client.IotfDevice(config);
deviceClient.connect();

// Device Connection
// -------------------

deviceClient.on('connect', function () {
  console.log("Device Connected");
  
});


deviceClient.on("error", function (err) {
    console.log("Error : **************************************************************************************************************************************************"+err);
});

// -------------------

app.get('/process_get', function(req, res) {
	// prepare output in json format
	response = {
		latitude:req.query.latitude,
		longitude:req.query.longitude
	};
	
	setInterval(function(){
	  getWeather();
	}, 15000);
})

function getWeather(){
	var callURL = "https://8d06e217-8e7e-49ca-91d9-8f1dd6f85d88:TAao24v59K@twcservice.mybluemix.net/api/weather/v1/geocode/"+response.latitude+"/"+response.longitude+"/forecast/hourly/48hour.json?units=m&language=en-US";
	
	request.get(callURL, {
		json: true
	},
	function (error, response, body) {
		// Avoid cases where JSON property is undefined - application crashes
		// Console Output is only for reference
		// THE APPLICATION MUST BE STOPPED, CALLS WILL CONTINUE FOREVER!!!
		if(body.hasOwnProperty('forecasts')) {
		  console.log(metadataCount + " - The Parsed MetaData: ", body.forecasts[0]);
		  deviceClient.publish("status","json", JSON.stringify(body.forecasts[0]));
		  ++metadataCount;
		}
	});
	
}

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on ", appEnv.url);
});