//server.js

var express 	= require('express');
var fs 			= require('fs');
var request 	= require('request');
var http		= require('http');
var cheerio 	= require('cheerio');
var schedule 	= require('node-schedule');
var imgcapture 	= require('./imgcapture.js');
var app     	= express();

app.get('/capture', function(req, res){

	url = 'http://cooperisland-bvi.com/QAN_webcam.php';
	console.log(url);
})

var schedjob = schedule.scheduleJob('*/20 * * * *', function(){
	console.log('Grabbing an image, son');
	imgcapture.captureimage();
});

imgcapture.captureimage();

app.listen('8081')
console.log('We are listening on 8081');
exports = module.exports = app;