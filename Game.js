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
        this.ballReset = false;
        this.savedMoves = [];
        this.clientAdjustment;
        this.opponentAdjustment;
        this.updatedBallState;
        this.id;


        this.createBall();
        this.createScoreBoard();

        this.socket = io();
        var _this = this;

        // Make the game aware of its server-assigned id
        this.socket.on('setId', function(data) {
            _this.id = data.id;
        });

        this.socket.on('spawnPlayers', function(playersData) {
            _.each(playersData, function(playerData) {
                if (_this.id === playerData.id) {
                    if (!_this.playerLoaded) {
                        _this.createPaddle(playerData.pos);
                        _this.playerLoaded = true;
                    }
                } else {
                    if (!_this.remotePlayerLoaded) {
                        _this.createRemotePaddle(playerData.pos);
                        _this.remotePlayerLoaded = true;
                    }
                }
            });
        });

        this.socket.on('clientadjust', function(data) {
            if (data.id === _this.id) {
                _this.clientAdjustment = data;
            } else {
                _this.opponentAdjustment = data;
            }
        });

        this.socket.on('resetBall', function(ballData) {
            _this.resetBall(ballData);
        });

        this.socket.on('updateBallState', function(data) {
            _this.updatedBallState = data;
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

            // TODO: optimize this so that clientMove messages are only sent when necessary
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
            this.updateBall();

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

        // this.ball.events.onOutOfBounds.add(this.scoreAndReset, this);
    },
    scoreAndReset: function() {
        this.updateScore();
        // this.resetBall();
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
    resetBall: function(ballData) {
        this.ball.reset(ballData.posx, ballData.posy);
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
        if (this.player1 && this.savedMoves.length > 0) {
            var serverTs = this.clientAdjustment.ts;
            var posx = this.clientAdjustment.posx;
            var savedTs = this.savedMoves[0].ts;

            while (savedTs < serverTs) {
                this.savedMoves.shift();
                var savedTs = this.savedMoves[0].ts;
            }

            _.each(this.savedMoves, function(savedMove) {
                posx = posx + savedMove.dir * 0.6 * 1000.0 / 60;
            });

            // Since we are manually adjusting the paddles xpos, we also need to manually check for boundary collisions
            // The paddles are 100px wide, anchored at 50px, and the game world is 640px wide.
            // This means that a paddle's xpos cannot be < 50 or > 590.
            if (posx > 590) {
                posx = 590;
            }

            if (posx < 50) {
                posx = 50;
            }

            this.player1.x = posx;
        }
    },
    opponentAdjustPosition: function() {
        if (this.player2) {
            // console.log("Current posx: " + this.player2.x);
            // console.log("New posx: " + this.opponentAdjustment.posx);
            this.player2.x = this.opponentAdjustment.posx;
        }
    },
    updateBall: function() {
        if (this.ball && this.updatedBallState) {
            this.ball.x = this.updatedBallState.posx;
            this.ball.y = this.updatedBallState.posy;
            this.updatedBallState = null;
        }
    }
};