var express = require("express");
var _ = require('underscore');
var app = express();
var fs = require('fs');
var moment = require('moment');
var port = 8080;

app.use(express.static(__dirname + '/public'));
app.engine('html', require('jade').__express);
var io = require('socket.io').listen(app.listen(port));
console.log("Listening on port " + port);
app.get("/", function(req, res){
    res.sendfile('client.html', {root: __dirname + '/public' });
});

var client = io.on('connection', function (socket) {
    socket.on('aaa', function(data) {
	socket.broadcast.volatile.emit("newData", data);
    });
    
});
