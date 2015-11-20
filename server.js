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
  // TODO: limit to 2 concurrent connections
  console.log(io.sockets.sockets.length + " connections");

  playersState.push(
    {
      client: client,
      state: 'connected'
    }
  );
  console.log(playersState);

  client.on('playerReady', function() {
    setPlayerState(client, 'ready');

    if (allPlayersHaveState('ready')) {
      io.emit('startgame');
    }
  });

  client.on('levelLoaded', function() {
    setPlayerState(client, 'levelLoaded');

    if (allPlayersHaveState('levelLoaded')) {
      // send message to each client to spawn in level
      playersState[0].client.emit('spawn', {x: 320, y: 40});
      playersState[1].client.emit('spawn', {x: 320, y: 920});
    }
  });

  client.on('disconnect', function() {
    console.log('Client disconnected');
    var clientIndex = _.findIndex(playersState, {client: client});
    if (clientIndex > -1) {
      playersState.splice(clientIndex, 1);
    }
    console.log(io.sockets.sockets.length + " connections");
  });

});

function setPlayerState(client, state) {
  _.each(playersState, function(playerState) {
    if (playerState.client === client) {
      playerState.state = state;
    }
  });
}

function allPlayersHaveState(state) {
  var filteredPlayers = _.where(playersState, {state: state});
  console.log(filteredPlayers.length);
  console.log(playersState.length);
  return (filteredPlayers.length === playersState.length);
}