var express = require('express')
  , app = express(app)
  , server = require('http').createServer(app)
  , io = require('socket.io')(server)
  , _ = require('underscore');


// serve static files from the current directory
app.use(express.static(__dirname));

server.listen(8000);

var playersState = [];

// Handle socket connection
io.on('connection', function(client) {
  console.log('Client connected...');
  console.log(io.sockets.sockets.length + " connections");

  playersState.push(
    {
      id: client.id,
      ready: false
    }
  );

  client.on('playerReady', function() {
    markPlayerAsReady(client.id);

    if (allPlayersAreReady()) {
      io.emit('startgame');
    }
  });

  client.on('disconnect', function() {
    console.log('Client disconnected');
    console.log(io.sockets.sockets.length + " connections");
  });

});

function markPlayerAsReady(clientId) {
  // TODO
}

function allPlayersAreReady() {
  // TODO
  return false;
}