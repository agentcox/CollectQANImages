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
	var imageFiles = fs.readdirSync('images/');
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
	return 'images/' + latestFileName;
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
	fs.rename(tempimagepath, 'images/' + getDateImageName());
}

var getDateImageName = function() {
	return '' + moment().valueOf() + '.jpg';
}

exports.captureimage = function () {
	var request = http.get(options, function(res){
		var imagedata = '';
		res.setEncoding('binary');

		res.on('data', function(chunk){
			imagedata += chunk;
		})

		res.on('end', function(){
			fs.writeFile('temp.jpg', imagedata,  'binary', function(err){
				if (err) throw err
			})
			//console.log('Written temp, comparing...');  //remove comparison as it's not working
			//if(compareImageFiles('temp.jpg', getLastImage()) == false) {
				console.log('Image is new! Saving.');
				writeFinalImage('temp.jpg');
			//}
		})
	})
}