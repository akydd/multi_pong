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


  client.on('playerReady', function() {
    setPlayerState(client, 'ready');

    if (allPlayersHaveState('ready')) {
      io.emit('startgame');
    }
  });


  client.on('levelLoaded', function() {
    setPlayerState(client, 'levelLoaded');
    client.emit('setId', {id: client.id});

    if (allPlayersHaveState('levelLoaded')) {
      io.emit('spawnPlayers', [
        {
          id: playersState[0].client.id,
          pos: {
            x: 320,
            y: 40
          }
        },
        {
          id: playersState[1].client.id,
          pos: {
            x: 320,
            y: 920
          }
        }
      ]);
    }
  });

  // paddle only moves at 600px / second, or 0.6px / millisecond
  client.on('clientMove', function(data) {
    var clientIndex = _.findIndex(playersState, {client: client});
    var playerState = playersState[clientIndex];
    playerState.dirty = true;
    playerState.dir = data.dir;
    playerState.ts = data.ts;
  });

  client.on('disconnect', function() {
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
      // calculate the new x position of the paddle
      playerState.posx = playerState.posx + playerState.dir * 0.6 * 1000.0 / 60;

      // Handle left/right wall collisions:
      // The paddles are 100px wide, anchored at 50px, and the game world is 640px wide.
      // This means that a paddle's xpos cannot be < 50 or > 590.
      if (playerState.posx > 590) {
        playerState.posx = 590;
      }

      if (playerState.posx < 50) {
        playerState.posx = 50;
      }

      // TODO: optimize so that clientadjust messages are only sent when necessary
      io.emit('clientadjust', {
        id: playerState.client.id,
        ts: now,
        posx: playerState.posx,
        dir: playerState.dir
      });

      playerState.dirty = false;
    }
  });

  // TODO: ball move
}