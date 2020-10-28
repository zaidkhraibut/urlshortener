'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cors = require('cors');
const dns = require('dns');
var app = express();

var port = process.env.PORT || 3000;

console.log("*****Add MONGODB*****")
console.log("*****Add MONGODB*****")
console.log("*****Add MONGODB*****")
console.log("*****Add MONGODB*****")

app.use(bodyParser.urlencoded({extended: false}))

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

const Schema = mongoose.Schema;

var siteSchema = new mongoose.Schema({
  url : String,
	url_id : Number
});

var idTrackerSchema = new mongoose.Schema({
	id : Number
})

var Site = mongoose.model('Site', siteSchema)
var IdTracker = mongoose.model('IdTracker', idTrackerSchema);
var idtracker = new IdTracker({id: 1})


var createUrlId = function() {
	
}

var createAndSaveSite = function(siteUrl) {
	console.log((Site.exists({url: siteUrl})))
  Site.exists({url: siteUrl}, (err,result) => {
		if (err) { console.log(err) }
		if (result) {
			Site.findOne({url: siteUrl}, (err,data)=> {
				return (data.url);
			});
		} else {
			Site.countDocuments({}, (err,data) => { 
				var site = new Site({url: siteUrl, url_id: (data+1)})
				site.save();
				console.log("***New Site added to db***")
				return site;
			});		
		}
	});
};

 
app.post("/api/shorturl/new", function (req, res) {
	var siteUrl = req.body.url
	var replacedUrl;
	const REPLACE_REGEX = /^https?:\/\//i;
	if (REPLACE_REGEX.test(siteUrl)) {
		var replacedUrl = siteUrl.replace(REPLACE_REGEX, '')
	} else {
		res.json({error: "Invalid Hostname"});
		return;
	}
	console.log(siteUrl);
	dns.lookup(replacedUrl, (err,address) => {
	err ? 
	res.json({error: "Invalid Hostname"}) :
	Site.exists({url: siteUrl}, (err,result) => {
		if (err) { console.log(err) }
		if (result) {
			Site.findOne({url: siteUrl}, (err,data)=> {
				res.json({url: data.url, url_id: data.url_id});
				console.log(`${data.url_id} - ${data.url} *** returned`)
			});
		} else {
			Site.countDocuments({}, (err,data) => { 
				var site = new Site({url: siteUrl, url_id: (data+1)})
				site.save();
				console.log("***New Site added to db***")
				console.log(site)
				res.json({url: site.url, url_id: site.url_id});
			});		
			}
		});
	})
});

app.get("/api/shorturl/:route", function (req, res) {
	var route = req.params.route;
	Site.findOne({url_id: route}, (err,result) => {
		res.redirect(result.url);
	})
})

app.listen(port, function () {
  console.log('Node.js listening ...');
});
