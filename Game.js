Game.Game = function(game) {
};

Game.Game.prototype = {
    textStyle: {
        fill: '#ffffff'
    },
    create: function() {
        this.physics.startSystem(Phaser.Physics.ARCADE);
        this.physics.arcade.checkCollision.down = false;
        this.physics.arcade.checkCollision.up = false;

        this.cursors = this.input.keyboard.createCursorKeys();

        this.bumpSound = this.add.audio('bump');
        this.bump1Sound = this.add.audio('bump1');

        this.initialSetup = true;
        this.playerLoaded = false;
        this.remotePlayerLoaded = false;
        this.savedMoves = [];
        this.clientAdjustment;
        this.opponentAdjustment;
        this.id;


        // this.createPaddles();
        this.createBall();
        this.createScoreBoard();

        this.socket = io();
        var _this = this;

        // Make the game aware of its server-assigned id
        this.socket.on('setId', function(data) {
            _this.id = data.id;
            console.log('id set to ' + _this.id);
        });

        // Handle spawning of the client (this player)
        this.socket.on('spawnClient', function(data) {
            if (!_this.playerLoaded) {
                _this.createPaddle(data);
                _this.playerLoaded = true;
            }
        });

        // Handle spawning of remote player (opponent)
        this.socket.on('spawnRemote', function(data) {
            if (!_this.remotePlayerLoaded) {
                _this.createRemotePaddle(data);
                _this.remotePlayerLoaded = true;
            }
        });

        this.socket.on('clientadjust', function(data) {
            if (data.id === _this.id) {
                _this.clientAdjustment = data;
            } else {
                _this.opponentAdjustment = data;
            }
        });
    },
    update: function() {
        if (this.initialSetup) {
            // this.resetBall();
            this.socket.emit('levelLoaded');
            this.initialSetup = false;
        }

        if (this.playerLoaded) {
            // paddle motion
            var move = {
                ts: Date.now()
            };
            if (this.cursors.left.isDown) {
                move.dir = -1;
                this.socket.emit('clientMove', move);
                this.player1.body.velocity.x = -600;
            } else if (this.cursors.right.isDown) {
                move.dir = 1;
                this.socket.emit('clientMove', move);
                this.player1.body.velocity.x = 600;
            } else {
                move.dir = 0;
                this.socket.emit('clientMove', move);
                this.player1.body.velocity.x = 0;
            }
            this.updateMoves(move);

            this.playerAdjustments();

            // ball paddle collisions
            this.physics.arcade.collide(this.ball, this.player1, this.hitPlayer1, null, this);
            this.physics.arcade.collide(this.ball, this.player2, this.hitPlayer2, null, this);
        }
    },
    createPaddle: function(position) {
        this.player1 = new Paddle(this, position.x, position.y);
        this.add.existing(this.player1);
    },
    createRemotePaddle: function(position) {
        this.player2 = new Paddle(this, position.x, position.y);
        this.add.existing(this.player2);
    },
    createBall: function() {
        // Initially, create a 'dead' ball.  We will revive it later.
        this.ball = new Ball(this, 0, 0);
        this.add.existing(this.ball);
        this.ball.kill();

        this.ball.events.onOutOfBounds.add(this.scoreAndReset, this);
    },
    scoreAndReset: function() {
        this.updateScore();
        this.resetBall();
    },
    updateScore: function() {
        var ypos = this.ball.y;
        if (ypos <= 0) {
            this.player2Score += 1;
            this.player2ScoreText.text = this.player2Score;
        } else {
            this.player1Score += 1;
            this.player1ScoreText.text = this.player1Score;
        }
    },
    resetBall: function() {
        // The x coordinate, horizontal direction and vertical direction
        // of the ball are picked at random.
        var xpos = this.rnd.integerInRange(0, 640);
        var xdir = this.rnd.pick([-1, 1]);
        var ydir = this.rnd.pick([-1, 1]);

        this.time.events.add(Phaser.Timer.SECOND * 3, function() {
            this.ball.reset(xpos, 480);
            this.ball.body.velocity.x = xdir * 400;
            this.ball.body.velocity.y = ydir * 400;
        }, this);
    },
    createScoreBoard: function() {
        this.player1Score = 0;
        this.player2Score = 0;

        this.player1ScoreText = this.add.text(20, 20, this.player1Score, this.textStyle);
        this.player2ScoreText = this.add.text(20, 920, this.player2Score, this.textStyle);
    },
    hitPlayer1: function() {
        // this.bumpSound.play();
    },
    hitPlayer2: function() {
        // this.bump1Sound.play();
    },
    updateMoves: function(move) {
        this.savedMoves.push(move);
        if (this.savedMoves.length > 30) {
            this.savedMoves.shift();
        }
    },
    playerAdjustments: function() {
        if (this.clientAdjustment) {
            this.clientAdjustPosition();
            this.clientAdjustment = null;
        }

        if (this.opponentAdjustment) {
            this.opponentAdjustPosition();
            this.opponentAdjustment = null;
        }
    },
    clientAdjustPosition: function() {
    },
    opponentAdjustPosition: function() {
        if (this.player2) {
            // console.log("Current posx: " + this.player2.x);
            // console.log("New posx: " + this.opponentAdjustment.posx);
            this.player2.x = this.opponentAdjustment.posx;
        }
    }
};