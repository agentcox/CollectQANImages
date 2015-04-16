var express 	= require('express');
var fs 			= require('fs');
var request 	= require('request');
var http		= require('http');
var moment		= require('moment');
var path 		= require('path');

var writingSignalCount = 0;

exports.renderImages = function(connection, req, res) {
	console.log('Attempting to grab images from DB...');
	countForWritingSignal(connection, function(){
		var query = connection.query('SELECT timestamp, imagedata FROM qanImages');
		query
		  .on('error', function(err) {
		    // Handle error, an 'end' event will be emitted after this as well
		  })
		  .on('fields', function(fields) {
		    // the field packets for the rows to follow
		  })
		  .on('result', function(row) {
		    // Pausing the connnection is useful if your processing involves I/O
		    console.log('Got a DB result!');
		    connection.pause();

		    writeRowToDiskCache(row, function() {
		      connection.resume();
		    });
		  })
		  .on('end', function() {
		    // all rows have been received
		    waitSignal(function(){
		    	displayImagesFromDiskCache(req, res)
		    });
		  });
	})
}

var countForWritingSignal = function(connection, callback){
	connection.query('SELECT COUNT(*) AS imagesCount FROM qanImages', function (error, results, fields) {
	  // error will be an Error if one occurred during the query
	  // results will contain the results of the query
	  // fields will contain information about the returned results fields (if any)
	  writingSignalCount = results[0].imagesCount;
	  console.log('Initial writing signal count: ' + writingSignalCount);
	  callback();
	});
	
}

var waitSignal = function(callback){
	while(writingSignalCount > 0){
		//wut
		console.log('Awaiting write complete signal...');
	}
	callback();
}

var writeRowToDiskCache = function(row, callback) {
	console.log('Write signal array size: ' + writingSignalCount);

	var timestamp = row.timestamp;
	var imagedata = row.imagedata;

	var filename = 'public/images/' + timestamp + '.jpg';

	console.log('Found image ' + timestamp + ' in DB. Checking exists...');
	fs.exists(filename, function (exists) {
  		if(!exists){
  			console.log('Does not exist in cache! Writing...');
  			fs.writeFileSync(filename, imagedata,  'binary');
  		}else{
  			console.log('Already exists in cache, Skipping...');
  		}
	});
	//done writing!
	writingSignalCount--;
	callback();
}

var displayImagesFromDiskCache = function(req, res) {
	var items = [];

	var imageFiles = fs.readdirSync('public/images/');
	imageFiles.forEach(function (file) {
		console.log('Pushing cache file ' + file);
		if(path.extname(file) === '.jpg')
		{
			items.push({'filename':'/images/'+file, 'date':(path.basename(file, path.extname(file)))})
		}
	})

	res.render('home', { title: 'QAN Camera Log', items: items });
}