//imgcapture.js

var express 	= require('express');
var fs 			= require('fs');
var request 	= require('request');
var http		= require('http');
var moment		= require('moment');
var path 		= require('path');
var checksum	= require('checksum');

var options = {
	host: 'cooperisland-bvi.com',
	port: 80,
	path: '/current.jpg' 
}


var getLastImage = function() {
	var latestFileStamp = 0;
	var latestFileName = '';

	// go into images folder
	var imageFiles = fs.readdirSync('public/images/');
	imageFiles.forEach(function (file) {
		console.log('Found old file ' + file);
		var curFileStamp = parseInt(path.basename(file, path.extname(file)));
		if(curFileStamp > latestFileStamp)
		{
			latestFileStamp = curFileStamp;
			latestFileName = file;
		}
	})
	console.log('Latest file is ' + latestFileName);
	return 'public/images/' + latestFileName;
}

var compareImageFiles = function(a, b) {
	if(a == null || b == null || a == '' || b == ''){
		console.log("Compare image files - at least one filename is blank!");
		return false;
	}

	var files = [a, b];
	var hashes = [];
	files.forEach(function (file) {
		console.log('Processing ' + file);
		hashes.push(getFileHash(file));
	})

	console.log('Comparing hashes: ' + a + ' vs. ' + b);
	
	while(hashes[0] == null && hashes[1] == null){
		//console.log('Waiting for hashes...');
	}

	console.log('' + hashes[0] + ' vs. ' + hashes[1]);
	return (hashes[0] === hashes[1]);
}

var getFileHash = function(filename) {
	console.log('getFileHash on ' + filename);
	checksum.file(filename, function (err, sum) {
		if(err) throw err
	   console.log(sum);
	})
}

var writeFinalImage = function(tempimagepath) {
	fs.rename(tempimagepath, 'public/images/' + getDateImageName());
}

var getDateImageName = function() {
	return '' + moment().valueOf() + '.jpg';
}

var writeToDB = function(connection, timestamp, buffer) {

	connection.query("SELECT imagedatasize as imagedata_size, timestamp as timestamp FROM qanImages WHERE timestamp=(select MAX(timestamp) from qanImages)", function(er, results, fields){
		console.log("Comparing this image size " + buffer.length + " to size " + results[0].imagedata_size + " from timestamp " + results[0].timestamp);
		if(results != null && results[0].imagedata_size == buffer.length){
			console.log("Image has same size as most recent image. Discarding.");
		}
		else{
			console.log("Image has different size as most recent image. Writing image to db.");
		    var writeQuery = "INSERT INTO qanImages SET ?",
		        values = {
		            timestamp: timestamp,
		            imagedatasize: buffer.length,
		            imagedata: new Buffer(buffer, 'binary')
		        };

		    //console.log("Connection = " + connection);
		    connection.query(writeQuery, values, function (er, da) {
		        if(er)throw er;
		    });
		}
	});
}

exports.captureimage = function (connection) {
	var request = http.get(options, function(res){
		var imagedata = '';
		res.setEncoding('binary');

		res.on('data', function(chunk){
			imagedata += chunk;
		})

		res.on('end', function(){
			writeToDB(connection, moment().valueOf(), imagedata)
		})
	})
}