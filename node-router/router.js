var WebSocketServer = require('ws').Server
var wss = new WebSocketServer({ port: 8080 });
var http = require('http')
var request = require('request')
var express = require('express');
var server = express();
var cors = require('cors')
var connectedChannels = []

var fs = require('fs');
var path = require('path');
var configPath = path.join(__dirname, 'config.json');

var config = JSON.parse(fs.readFileSync(configPath));
console.log(configPath)

console.log(config)

function basexHost() {
    return config.basex_host + ":" + config.basex_port
}

var bodyParser = require('body-parser')
server.use( bodyParser.json() );
server.use(bodyParser.urlencoded({ 
    extended: true
})); 

server.use(cors())
server.options(config.cors, cors())

// Websocket
wss.on('connection', function connection(ws) {
    console.log("connection established, saving")
    connectedChannels.push(ws)
    ws.on("close", function(code, reason){
	connectedChannels.splice(connectedChannels.indexOf(ws), 1);
	console.log(connectedChannels.length + " are still connected");
    })
});
console.log("Websocket listening on " + config.router_websocket_port)

server.get('*', function(req, res){
    console.log("requested " + req.path + " forwarding to basex")

    get(req.path, function(resp){
	console.log("got basex answer: ")
	console.log(resp)
	jsonAnswer = JSON.stringify({'type':'xmlresponse', 'xml':resp})
	res.send(resp)
    });
})

server.post('*', function(req, res) {
    console.log("got post message")

    console.log("path: ")
    console.log(req.path)
    console.log("body: ")
    console.log(req.body)
    
    var randomid = req.body.rid
    var url = basexHost() + req.path
    
    console.log("forwarding post to " + url)
    
    request.post(url, { form: req.body.payload }, function (error, response, body) {
	if (error) {
	    console.log(error)
	}
	//do we need to send response at all here?
	res.send(response)
	var redirect = response.headers.location
	console.log("answer from xquery, redirect to " + redirect)
	
	get(redirect, function(resp) {
	    console.log("got redirect basex answer: ")
	    console.log(resp)
	    jsonAnswer = JSON.stringify({'type':'xmlresponse', 'xml':resp, "rid": randomid})

	    for (v in connectedChannels) {
	     	connectedChannels[v].send(jsonAnswer)
	    }
	});
    }
		);
    
});



function get(path, callback) {
    if (path.indexOf("favicon") != -1) { return callback("") }
    var fullPath = basexHost() + path
    console.log("get request to " + fullPath)
    request.get(fullPath, function (error, response, body){
		console.log("got answer from basex ")
		console.log(error)
		console.log(body)
		callback(body)
    });
}


server.listen(config.router_http_port, function () {
    console.log('Gateway listening on port ' + config.router_http_port);
});


