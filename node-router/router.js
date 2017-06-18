var WebSocketServer = require('ws').Server
var wss = new WebSocketServer({ port: 8080 });
var http = require('http')
var request = require('request')
var express = require('express');
var server = express();
var cors = require('cors')
server.use(cors());

var connectedChannels = []
// {signal:[channel]}
var subscribedChannels = {}

var fs = require('fs');
var path = require('path');
var configPath = path.join(__dirname, 'config.json');

var config = JSON.parse(fs.readFileSync(configPath));
console.log(configPath)

console.log(config)

function basexHost() {
    return config.basex_host + ":" + config.basex_port
}

//server.options(config.cors, cors())
var bodyParser = require('body-parser')
server.use( bodyParser.json() );
server.use(bodyParser.urlencoded({ 
    extended: true
})); 



// Websocket
wss.on('connection', function connection(ws) {
    console.log("connection established, saving")
    connectedChannels.push(ws)

    ws.on("message", function(message) {
	console.log("got ws message!")
	console.log(message)
	message = JSON.parse(message)
	
	if (message.type == "subscribe") {
	    for (s in message.data) {
		var signal = message.data[s]
		console.log("before subscription: ")
		console.log((subscribedChannels[signal] || []).length + " ws subscribed")
		subscribedChannels[signal] = subscribedChannels[signal] || []
		console.log("after subscription: ")
		subscribedChannels[signal].push(ws)
		console.log(subscribedChannels[signal].length + " ws subscribed")
		
	    }
	}
	    
    });
    
    ws.on("close", function(code, reason){

	for (c in subscribedChannels) {
	    var wsInChannel = subscribedChannels[c]
	    var index = wsInChannel.indexOf(ws)
	    if (index != -1) {
		console.log("removed ws from subscribers")
		subscribedChannels[c].splice(index, 1)
	    }
	}
	
	connectedChannels.splice(connectedChannels.indexOf(ws), 1);
	console.log("removed ws from connected channels")
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
    var channel = req.body.channel
    
    console.log("forwarding post to " + url)
    
    request.post(url, { form: req.body.payload }, function (error, response, body) {
	if (error) {
	    console.log(error)
	}
	//do we need to send response at all here?
	res.send(response)
	var redirect = response.headers.location
	console.log("answer from xquery, redirect to " + redirect)
	if (redirect == undefined) {
	    console.log("redirect is undefined, headers: ")
	    console.log(response.headers)
	    return
	}
	
	get(redirect, function(resp) {
	    console.log("got redirect basex answer: ")
	    console.log(resp)
	    jsonAnswer = JSON.stringify({'type':'xmlresponse', 'xml':resp, "rid": randomid})

	    if (channel == undefined) {
		console.log("no channel set, respond to all")
		for (v in connectedChannels) {
	     	    connectedChannels[v].send(jsonAnswer)
		}
	    } else {

		var wsToNotify = subscribedChannels[channel]
		console.log("notifying ws (" + (wsToNotify || []).length + ")registered to " + channel )		
		for (v in wsToNotify) {
		    wsToNotify[v].send(jsonAnswer);
		}
	    }

	});
    }
		);
    
});



function get(path, callback) {
    //if (path.indexOf("favicon") != -1) { return callback("") }

    var basex = basexHost()
    if (basex.charAt(basex.length - 1) != "/") {
	basex += "/"
    }

    if (path.charAt(0) == "/") {
	path = path.substr(1, path.length)
    }
    basex += path
	
    var fullPath = basex
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


