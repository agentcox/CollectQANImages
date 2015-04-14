var express 	= require('express');
var fs 			= require('fs');
var request 	= require('request');
var http		= require('http');
var moment		= require('moment');
var path 		= require('path');

exports.renderImages = function() {
	var items = [];
	
	var imageFiles = fs.readdirSync('public/images/');
	imageFiles.forEach(function (file) {
		
		if(path.extname(file) === '.jpg')
		{
			items.push({'filename':'/images/'+file, 'date':(path.basename(file, path.extname(file)))})
		}
	})

	return items;
}