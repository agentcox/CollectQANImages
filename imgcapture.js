//imgcapture.js

var express 	= require('express');
var fs 			= require('fs');
var request 	= require('request');
var http		= require('http');
var moment		= require('moment');
var path 		= require('path');
var checksum	= require('checksum');


var writeToDB = function(connection, dbtablename, timestamp, buffer) {

	if(buffer.length < 10000){
		console.log("Buffer length < 10,000 bytes - image corrupt, discarding.");
		return;
	}

	connection.query("SELECT imagedatasize as imagedata_size, timestamp as timestamp FROM " + dbtablename + " WHERE timestamp=(select MAX(timestamp) from " + dbtablename + " )", function(er, results, fields){
		console.log("Comparing this image size " + buffer.length + " to size " + results[0].imagedata_size + " from timestamp " + results[0].timestamp);
		if(results != null && results[0].imagedata_size == buffer.length){
			console.log("Image has same size as most recent image. Discarding.");
		}
		else{
			console.log("Image has different size as most recent image. Writing image to db.");
		    var writeQuery = "INSERT INTO " + dbtablename + " SET ?",
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

exports.captureimage = function (connection, dbtablename, options) {
	var request = http.get(options, function(res){
		var imagedata = '';
		res.setEncoding('binary');

		res.on('data', function(chunk){
			imagedata += chunk;
		})

		res.on('end', function(){
			writeToDB(connection, dbtablename, moment().valueOf(), imagedata)
		})
	})
}