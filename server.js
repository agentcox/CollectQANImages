//server.js

var express 	= require('express');
var fs 			= require('fs');
var request 	= require('request');
var http		= require('http');
var cheerio 	= require('cheerio');
var schedule 	= require('node-schedule');
var imgcapture 	= require('./imgcapture.js');
var jade		= require('jade');
var imagedisplayer = require('./imagedisplayer.js');
var app     	= express();

app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
	var items = imagedisplayer.renderImages();
	res.render('home', { title: 'QAN Camera Log', items: items });
})

var schedjob = schedule.scheduleJob('*/20 * * * *', function(){
	console.log('Grabbing an image, son');
	imgcapture.captureimage();
});

imgcapture.captureimage();

app.listen('8081')
console.log('We are listening on 8081');
exports = module.exports = app;