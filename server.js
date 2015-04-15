var express = require('express');
var app = express();
var JSON = require("JSON"); 

var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

app.use(express.static(__dirname + '/htdocs'));
app.get('/', function (req, res) {
  res.send('Hello World!');
});

// RPC end point
app.post('/ubus', function(req, res) {
  res.header('Content-Type', 'application/json');
  var data = req.body, err = null, rpcMethod;
	
	console.log(JSON.stringify(data)); 
	
  if (!err && data.jsonrpc !== '2.0') {
    onError({
      code: -32600,
      message: 'Bad Request. JSON RPC version is invalid or missing',
      data: null
    }, 400);
    return;
  }
	
	console.log("Call: "+data.method+" "+JSON.stringify(data.params)); 
});

var server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});

