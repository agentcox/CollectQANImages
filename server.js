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
var mysql 		= require('mysql');

app.set('view engine', 'jade');
app.set('port', (process.env.PORT || 8081));
app.use(express.static(__dirname + '/public'));

var connection = mysql.createConnection({
  host     : process.env.RDS_HOSTNAME,
  user     : process.env.RDS_USERNAME,
  password : process.env.RDS_PASSWORD,
  port 	   : process.env.RDS_PORT,
  database : process.env.RDS_DATABASE
});

connection.connect(function(req, res){
	app.listen(app.get('port'))
	console.log('We are listening on ' + app.get('port'));
	exports = module.exports = app;
})

var schedjob = schedule.scheduleJob('*/45 * * * *', function(){
	console.log('Grabbing an image, son');
	imgcapture.captureimage(connection);
});

app.get('/', function(req, res){
	imagedisplayer.renderImages(connection, req, res);
})