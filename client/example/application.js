
$(document).ready(function() {
    
    var endpoint = new Endpoint()
    
    endpoint.start(undefined, function(response){
		response.transform("transformation.xsl", function(transformedResp){
	    	$("#response").append(transformedResp.raw)
		});
    });

    function sendResponseText() {
	var text = $("#responsemessage").val()

	endpoint.POST("http://localhost:8081/postmessage", {message: text, clientid:1}, function(serverresponse){
		
	    serverresponse.transform("transformation.xsl", function(transformedResp){
		console.log("response to my post")
		$("#response").append(transformedResp.raw)
	    })	    
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


