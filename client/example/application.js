
$(document).ready(function() {
    
    var config = {router_host : "localhost",router_ws_port: 8887};
    var endpoint = new Endpoint()
    
    endpoint.start(config, function(response){

		response.transform("transformation.xsl", function(transformedResp){

	    	var responseField = $('#response');
	    	responseField.append(transformedResp.raw)
	    	responseField.scrollTop(responseField[0].scrollHeight);
		});
    });

    function sendResponseText() {
		var text = $("#responsemessage").val()
		endpoint.POST("http://localhost:8081/postmessage", {message: text, clientid:1});
    }
    
    $('#sendbutton').click(function() {
		sendResponseText()
    });

    $("#responsemessage").keyup(function (e) {
		if (e.keyCode == 13) { // 13 = enter
		    sendResponseText()
	    	$("#responsemessage").val("") //clear after sending message
		}
    });

    $('#resetbutton').click(function() {
		$.get("http://localhost:8081/initdb")
    });
});
