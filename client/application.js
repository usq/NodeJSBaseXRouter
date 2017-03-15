
$(document).ready(function() {
    
    var gateway = new Endpoint()
    gateway.start(undefined, function(response){
	response.transform("transformation.xsl", function(transformedResp){
	    console.log("websocket response")
	    $("#response").append(transformedResp.raw)
	})
	
    });

    function sendResponseText() {
	var text = $("#responsemessage").val()
	gateway.POST("http://localhost:8081/postmessage", {message: text, clientid:1}, function(serverresponse){
	    console.log("HHEEEERE")
	    console.log(serverresponse)
	});
    }
    
    $('#sendbutton').click(function() {
	console.log("here")
	sendResponseText()

    });

    $('#resetbutton').click(function() {
	$.get("http://localhost:8081/initdb")
    });

    $("#responsemessage").keyup(function (e) {
	if (e.keyCode == 13) { // 13 = enter
	    sendResponseText()
	    $("#responsemessage").val("") //clear after sending message
	}
    });
    
});


