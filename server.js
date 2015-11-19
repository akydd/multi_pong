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
  console.log(playersState);

  client.on('playerReady', function() {
    markPlayerAsReady(client.id);

    if (allPlayersAreReady() === true) {
      io.emit('startgame');
    }
  });

  client.on('disconnect', function() {
    console.log('Client disconnected');
    var clientIndex = _.findIndex(playersState, {id: client.id});
    if (clientIndex > -1) {
      playersState.splice(clientIndex, 1);
    }
    console.log(io.sockets.sockets.length + " connections");
  });

});

function markPlayerAsReady(clientId) {
  _.each(playersState, function(playerState) {
    if (playerState.id === clientId) {
      playerState.ready = true;
    }
  });
  console.log(playersState);
}

function allPlayersAreReady() {
  var readyPlayers = _.where(playersState, {ready: true});
  console.log(readyPlayers.length);
  console.log(playersState.length);
  return (readyPlayers.length === playersState.length);
}