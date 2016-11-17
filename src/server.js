var express = require('express')
  , app = express(app)
  , server = require('http').createServer(app)
  , io = require('socket.io')(server)
  , _ = require('underscore')
  , prevTs = 0;


// serve static files from the current directory
app.use(express.static(__dirname));

server.listen(8000);

var playersState = [];
var ballState = {
  active: false
};

// Handle socket connection
io.on('connection', function(client) {
  // TODO: limit to 2 concurrent connections
  console.log(io.sockets.sockets.length + " connections");

  playersState.push(
    {
      client: client,
      state: 'connected',
      posx: 320,
      moves: []
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

      setTimeout(function() {
        resetBall();
      }, 3000);

    }
  });


  client.on('clientMove', function(data) {
    var clientIndex = _.findIndex(playersState, {client: client});
    var playerState = playersState[clientIndex];

    playerState.moves.push({
      dir: data.dir,
      ts: data.ts
    });
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

function resetBall() {
  ballState.posx = _.random(11, 629);
  ballState.posy = 480;

  var directions = [-1, 1];

  var xdirIndex = _.random(0, 1);
  ballState.xdir = directions[xdirIndex];

  var ydirIndex = _.random(0, 1);
  ballState.ydir = directions[ydirIndex];

  ballState.active = true;

  io.emit('resetBall', ballState);
}

setInterval(function() {
  processMoves();
}, 1000.0 / 60);

function processMoves() {
  // elapsed time
  var now = Date.now();
  var delta = now - prevTs;
  prevTs = now;

  // paddle moves
  _.each(playersState, function(playerState) {
    var oldposx = playerState.posx;

    while(playerState.moves.length > 0) {
      var move = playerState.moves.shift();
      playerState.posx = Math.round(playerState.posx + move.dir * 0.6 * delta);

      // Handle left/right wall collisions:
      // The paddles are 100px wide, anchored at 50px, and the game world is 640px wide.
      // This means that a paddle's xpos cannot be < 50 or > 590.
      if (playerState.posx > 590) {
        playerState.posx = 590;
      }

      if (playerState.posx < 50) {
        playerState.posx = 50;
      }
    }

    // TODO: optimize so that clientadjust messages are only sent when necessary
    if (oldposx !== playerState.posx) {
      io.emit('clientadjust', {
        id: playerState.client.id,
        ts: Date.now(),
        posx: playerState.posx
      });
      // console.log(playerState.posx);
    }
  });

  // ball move
  if (ballState.active === true) {
    // calculate new position of ball, given that x/y speeds are each 400px/s
    ballState.posx = ballState.posx + ballState.xdir
    * 0.4 * delta;
    ballState.posy = ballState.posy + ballState.ydir * 0.4 * delta;

    // Handle ball out of bounds in y direction
    if (ballState.posy <= 0 || ballState.posy >= 960) {
      ballState.active = false;

    }

    // Handle left/right wall collisions.
    // The ball is is a 20x20 square, so it will hit a wall when xpos = 10
    // or when xpos = 630.  In either case, switch x direction.
    if (ballState.posx <= 10) {
      ballState.posx = 10;
      ballState.xdir = ballState.xdir * -1;
    }

    if (ballState.posx >= 630) {
      ballState.posx = 630;
      ballState.xdir = ballState.xdir * -1;
    }



    // Handle ball & paddle collisions.
    // The ball is a 20x20 square, so it will collide with:
    // - player1 when its y coordinate is <= 50
    // - player2 when its y coordinate is >= 910
    // In either case we do a simple


    console.log('ballpos - x: ' + ballState.posx + ', y: ' + ballState.posy);
    io.emit('updateBallState', {
      posx: ballState.posx,
      posy: ballState.posy
    });
  }
}