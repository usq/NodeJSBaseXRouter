$(document).ready(function() {
    var ip = "131.159.200.108"
    var clientid
    var ws = $.websocket("ws://" + ip + ":8080/",{    
	open: function() {
	    $('#response').html('Connected');
	},
	events: {
	    idmsg:function(x) {
		clientid = x.content.idm
		$('#response').html('client id: ' + clientid);
	    },
	    
	    msg:function(message) {
		var el = $('#response')
		el.append('<br/>' + message.content);
		el.scrollTop(el[0].scrollHeight);
	    }
	}
    });

    function send() {
	let clientResponse = $("#responsemessage").val();
	let responseObject = {'textresponse': clientResponse, 'clientid' : clientid };
	ws.send('message', responseObject);
	$("#responsemessage").val("");
    }
    
    $('#sendbutton').click(function() {
	send();
    });

    $("#responsemessage").keyup(function (e) {
	if (e.keyCode == 13) {
	    send();
	}
    })
});
