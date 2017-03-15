var express = require('express');
var cors = require('cors')

var app = express();

app.use(cors())
app.options('*', cors())

// Define the port to run on
app.set('port', 7000);
app.use(express.static('.'));

// Listen for requests
var server = app.listen(app.get('port'), function() {
  var port = server.address().port;
  console.log('clientserver ' + port);
});

