var __domParser = new DOMParser();


function createResponseFromXML(xmlDocument) {
    var serialized = new XMLSerializer().serializeToString(xmlDocument);
    return new Response({xml: serialized });
}

function Response(fromResponse) {
    this.raw = fromResponse.xml;
    this.domNode = __domParser.parseFromString(fromResponse.xml, "application/xml")

    var that = this

    this.transform = function(stylesheetURL, params, callback) {
	console.log("requresting url " + stylesheetURL)
	$.get(stylesheetURL, function(resp, other){
	    xsltProcessor = new XSLTProcessor();
	    xsltProcessor.importStylesheet(resp);

	    for (k in params) {
		console.log("setting " + k + " to " + params[k])
		xsltProcessor.setParameter(null, k, params[k]);
	    }
	    
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
	    host : "localhost",
	    ws_port: 8080
	},
	__callbacks: {},
	callback: undefined,
	start : function(config, messagesToSubscribe, callback) {

	    //configuration handling
	    if (config !== undefined) {
		if (config.host !== undefined && config.host.length > 0) {
		    this.configuration.host = config.host
		}
		if (config.ws_port !== undefined && config.ws_port > 0) {
		    this.configuration.ws_port = config.ws_port
		}
	    }
	    this.callback = callback;

	    //open the websocket
	    var that = this
	    document["__endpoint"] = this	    
	    var ws = $.websocket("ws://" + this.configuration.host
				 + ":" + this.configuration.ws_port + "/",
				 {
				     open: function() {
					 console.log("connected websocket")
					 this.send("subscribe", messagesToSubscribe)
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
	GETXML: function(url, callback) {
	    $.get(url, function(resp, other) {
		if(callback != undefined) {
		    console.log(resp)
		    var response = createResponseFromXML(resp)
		    callback(response)
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
	POST: function(url, data, channel, callback) {
	    console.log("got post to " + url)
	    var randomID = randomId()
	    this.__callbacks[randomID] = callback
	    var wrappedMessage = { 'payload': data, 'rid': randomID, "channel": channel}
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
		},
		error: function (responseData, textStatus, errorThrown) {
		    console.log(responseData)
		    console.log(textStatus)
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
