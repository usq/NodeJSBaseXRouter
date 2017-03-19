var __domParser = new DOMParser();

function Response(fromResponse) {
    this.raw = fromResponse.xml;
    this.domNode = __domParser.parseFromString(fromResponse.xml, "application/xml")

    var that = this
    this.transform = function(stylesheetURL, callback) {

	$.get(stylesheetURL, function(resp, other){
	    xsltProcessor = new XSLTProcessor();
	    xsltProcessor.importStylesheet(resp);
	    resultDocument = xsltProcessor.transformToFragment(that.domNode, document);
	    var serialized = new XMLSerializer().serializeToString(resultDocument);

	    callback(new Response({xml: serialized}))
	});
    }
    this.htmlNode = function() {
	return __domParser.parseFromString(that.raw, "text/html")
    }
}

function randomId() {
    return window.crypto.getRandomValues(new Uint32Array(1))[0]
}

function Endpoint() {
    return {
	configuration : {
	    router_host : "localhost",
	    router_ws_port: 8887
	},
	__callbacks: {},
	callback: undefined,
	start : function(config, callback) {
	    //configuration handling
	    if (config !== undefined) {
		if (config.router_host !== undefined && config.router_host.length > 0) {
		    this.configuration.router_host = config.router_host
		}
		if (config.router_ws_port !== undefined && config.router_ws_port > 0) {
		    this.configuration.router_ws_port = config.router_ws_port
		}
	    }
	    this.callback = callback;

	    //open the websocket
	    var that = this
	    var ws = $.websocket("ws://" + this.configuration.router_host
				 + ":" + this.configuration.router_ws_port + "/",
				 {
				     open: function() {
					 console.log("connected websocket")
				     },
				     events: {
					 //default answer
					 xmlresponse: function(response) {
					     var resp = new Response(response)
					     console.log(response.rid)
					     var foundCallback = that.__callbacks[response.rid]
					     if (foundCallback == undefined) {
						 //was from someone else,
						 console.log("general message, forward")
						 that.callback(resp)
					     } else {
						 console.log("returning to specific handler")
						 foundCallback(resp)
					     }
					     
					 }
				     }
				 });
	},
	GET: function(url, callback) {
	    $.get(url, function(resp, other) {
		if(callback != undefined) {
		    callback(resp)
		}		
	    });
	},
	PUT: function(url, data, callback) {
	    var wrappedMessage = { 'payload': data }
	    $.ajax({
		type: 'PUT',
		url: url,
		data: JSON.stringify (wrappedMessage),
		contentType: "application/json",
		dataType: 'json',
		success: function(data) {
		    if(callback != undefined) {
			callback(data)
		    }
		}
	    });
	},
	POST: function(url, data, callback) {
	    console.log("got post to " + url)
	    var randomID = randomId()
	    console.log("create random id: " + randomID)
	    this.__callbacks[randomID] = callback
	    var wrappedMessage = { 'payload': data, 'rid': randomID}
    	    $.ajax({
		type: 'POST',
		url: url,
		data: JSON.stringify (wrappedMessage),
		contentType: "application/json",
		dataType: 'json',
		success: function(data) {
		    if(callback != undefined) {
			callback(data)
		    }
		}
	    });	    
	},
	DELETE: function(url, callback) {
	    $.ajax({
		type: 'DELETE',
		url: url,
		success: function(data) {
		    if(callback != undefined) {
			callback(data)
		    }		    
		}
	    });	
	}
    }
}
