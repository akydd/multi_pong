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
      state: 'connected',
      dirty: false,
      posx: 320,
      dir: 0
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
    console.log('sending id ' + client.id);
    client.emit('setId', {id: client.id});

    if (allPlayersHaveState('levelLoaded')) {
      playersState[0].client.emit('spawnClient', {x: 320, y: 40});
      playersState[0].client.emit('spawnRemote', {x: 320, y: 920});

      playersState[1].client.emit('spawnClient', {x: 320, y: 920});
      playersState[1].client.emit('spawnRemote', {x: 320, y: 40});
    }
  });

  // paddle only moves at 600px / second, or 0.6px / millisecond
  client.on('clientMove', function(data) {
    // console.log('RECEIVED clientMove: ' + data.dir + " at ts " + data.ts);
    var clientIndex = _.findIndex(playersState, {client: client});
    var playerState = playersState[clientIndex];
    playerState.dirty = true;
    playerState.dir = data.dir;
    playerState.ts = data.ts;
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
  return (filteredPlayers.length === playersState.length);
}

setInterval(function() {
  processMoves();
}, 1000.0 / 60);

function processMoves() {
  var now = Date.now();
  // paddle moves
  _.each(playersState, function(playerState) {
    if (playerState.dirty === true) {
      playerState.dirty = false;
      // console.log(playerState.client.id + ' move at ' + playerState.ts + ' processed at ' + now);
      playerState.posx = playerState.posx + playerState.dir * 0.6 * 1000.0 / 60;
      io.emit('clientadjust', {
        id: playerState.client.id,
        ts: now,
        posx: playerState.posx
      });
    }
  });

  // TODO: ball move
}