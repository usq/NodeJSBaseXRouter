$(document).ready(function() {
    var transmissionSpeed = 30;
    var master = false
    var cv = $("#cv")
    var ctx = cv[0].getContext("2d");
    var ip = "131.159.200.108"
    //loop
    var player = {y:0}
    var other = {y:0}
    var ball = {x:200, y:200}
    var ballvec = {x:0, y:0}
    var direction = 0;
    var speed = 8;
    var rad = 4;

    $(document).keyup(function(e){ direction = 0;});
    $(document).keydown(function(e){
	if (e.keyCode == 40) {
	    //down
	    direction = 1;
	} else if (e.keyCode == 38) {
	    //up
	    direction = -1;
	} else {
	    direction = 0;
	}
    });
    
    var clientid = -1;
        var ws = $.websocket("ws://" + ip + ":8080/",{

	open: function() {
	    console.log('connected')

	    var timer = setInterval(function(){
		//draw player
		//ctx.clearRect(0,0,400,400);
		ctx.fillStyle = "#FFFFFF"
		ctx.fillRect(0,0,400,400);
		player.y += direction * speed;

		if (master) {
		    ball.x += ballvec.x
		    ball.y += ballvec.y

		    if (ball.y <= 0) {
			ballvec.y = Math.abs(ballvec.y)
			ball.y = 1
			
		    } else if ( ball.y >= 400) {
			ballvec.y = - Math.abs(ballvec.y)
			ball.y = 399
		    }

		    if (ball.x <= 0 || ball.x >= 400) {
			ball.x = 200
			ball.y = 200
			ballvec.x = (Math.random() - 0.5)* -4
			ballvec.y = Math.random() * 5 - 0.25
		    }

		    if (ball.y >= player.y &&
			ball.y <= (player.y + 50) &&
			ball.x < 21 && ball.x >= 9)
		    {
			ballvec.x = Math.abs(ballvec.x)
			ballvec.y += Math.random()*0.5 -1
			ball.x = 21
			console.log(ballvec)
		    }
		    
		    if (ball.y >= other.y &&
			ball.y <= (other.y + 50) &&
			ball.x > 400 - 10 - 11 && ball.x < 400 - 10)
		    {
			ballvec.x = -Math.abs(ballvec.x)
			ballvec.y += Math.random()*0.5 -1
			ball.x = 400 - 21
			console.log(ballvec)
		    }
		    

		}
		ctx.fillStyle = "#000000"
		ctx.fillRect(10,player.y,10,50)

		ctx.fillRect(400-10-10,other.y,10,50)
		
		ctx.beginPath()
		ctx.arc(ball.x, ball.y, rad, 2 * Math.PI, false )
		ctx.fill()


		send()
	    }, transmissionSpeed);

	},
	events: {
	    idmsg:function(x) {
		clientid = x.content.idm
		
		master = (x.content.c % 2 == 1)
		if(master) {
		    ballvec.x = -1
		}
		console.log(x)
		//		$('#response').html('client id: ' + clientid);
	    },
	    msg:function(message) {
		var p = message.content
		other.y = p.py
		if (master == false) {
		    ball.y = p.by
		    ball.x = 400 - p.bx
		}
		
	    }
	}
    });

    
    function send() {
	ws.send('payload', {py:player.y, bx: ball.x, by:ball.y});
    }


});
