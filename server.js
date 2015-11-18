var express = require('express')
  , app = express(app)
  , server = require('http').createServer(app)
  , io = require('socket.io')(server);


// serve static files from the current directory
app.use(express.static(__dirname));

server.listen(8000);

io.on('connection', function(client) {
  console.log('Client connected...');

  client.on('join', function(data) {
    console.log(data);
  });
});