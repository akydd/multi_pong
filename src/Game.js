import Phaser from 'phaser'

import Ball from './Ball'
import Paddle from './Paddle'

export default class extends Phaser.State {
    constructor() {
        super()
        this.textStyle = {
            fill: '#ffffff'
        }
    }

    create() {
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
//        this.opponentAdjustment;
//        this.updatedBallState;
        this.id;


        this.createBall();
        this.createScoreBoard();

        // Make the game aware of its server-assigned id
        this.game.socket.on('setId', data => {
            this.id = data.id;
        });

        this.game.socket.on('spawnPlayers', playersData => {
            playersData.forEach(playerData => {
                if (this.id === playerData.id) {
                    if (!this.playerLoaded) {
                        this.createPaddle(playerData.pos);
                        this.playerLoaded = true;
                    }
                } else {
                    if (!this.remotePlayerLoaded) {
                        this.createRemotePaddle(playerData.pos);
                        this.remotePlayerLoaded = true;
                    }
                }
            });
        });

        this.game.socket.on('clientadjust', data => {
            if (data.id === this.id) {
                console.log("server update: " + data.posx + " at " + data.ts);
                this.clientAdjustPosition(data);
            } else {
                this.opponentAdjustPosition(data);
            }
        });

        this.game.socket.on('resetBall', ballData => {
            this.resetBall(ballData);
        });

        this.game.socket.on('updateBallState', data => {
            this.updateBall(data);
        });

        this.game.socket.on('updateScore', data => {
            this.updateScore(data);
        });
    }

    update() {
        if (this.initialSetup) {
            // this.resetBall();
            this.game.socket.emit('levelLoaded');
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
                this.game.socket.emit('clientMove', move);
                this.player1.body.velocity.x = -600;

                console.log("client: " + this.player1.x + " at " + move.ts);

                this.updateMoves(move);
            } else if (this.cursors.right.isDown) {
                move.dir = 1;
                this.game.socket.emit('clientMove', move);
                this.player1.body.velocity.x = 600;

                console.log("client: " + this.player1.x + " at " + move.ts);

                this.updateMoves(move);
            } else {
                // move.dir = 0;
                // this.socket.emit('clientMove', move);
                this.player1.body.velocity.x = 0;
            }

//            this.playerAdjustments();
//            this.updateBall();

            // ball paddle collisions
            this.physics.arcade.collide(this.ball, this.player1, this.hitPlayer1, null, this);
            this.physics.arcade.collide(this.ball, this.player2, this.hitPlayer2, null, this);
        }
    }

    createPaddle(position) {
        this.player1 = new Paddle(this, position.x, position.y);
        this.add.existing(this.player1);
    }

    createRemotePaddle(position) {
        this.player2 = new Paddle(this, position.x, position.y);
        this.add.existing(this.player2);
    }

    createBall() {
        // Initially, create a 'dead' ball.  We will revive it later.
        this.ball = new Ball(this, 0, 0);
        this.add.existing(this.ball);
        this.ball.kill();
    }

    updateScore(data) {
        if (data.player === 'player2') {
            this.player2ScoreText.text = data.score;
        } else {
            this.player1ScoreText.text = data.score;
        }
    }

    resetBall(ballData) {
        this.ball.reset(ballData.posx, ballData.posy);
    }

    createScoreBoard() {
        this.player1ScoreText = this.add.text(20, 20, 0, this.textStyle);
        this.player2ScoreText = this.add.text(20, 920, 0, this.textStyle);
    }

    hitPlayer1() {
        // this.bumpSound.play();
    }

    hitPlayer2() {
        // this.bump1Sound.play();
    }

    updateMoves(move) {
        this.savedMoves.push(move);
        if (this.savedMoves.length > 30) {
            this.savedMoves.shift();
        }
    }

    clientAdjustPosition(data) {
        if (this.player1) {
            var serverTs = data.ts;
            var posx = data.posx;
            console.log("server: " + posx + " at " + serverTs);

            this.savedMoves = this.savedMoves.filter(savedMove => {
                savedMove.ts > serverTs;
            });


            this.savedMoves.forEach(savedMove => {
                posx = posx + savedMove.dir * 10;

                // Since we are manually adjusting the paddles xpos, we also need to manually check for boundary collisions
                // The paddles are 100px wide, anchored at 50px, and the game world is 640px wide.
                // This means that a paddle's xpos cannot be < 50 or > 590.
                if (posx > 590) {
                    posx = 590;
                }

                if (posx < 50) {
                    posx = 50;
                }
            });

            this.player1.x = posx;
            console.log("adjusted client: " + posx);
        }
    }

    opponentAdjustPosition(data) {
        if (this.player2) {
            // console.log("Current posx: " + this.player2.x);
            // console.log("New posx: " + data.posx);
            this.player2.x = data.posx;
        }
    }

    updateBall(data) {
        if (this.ball) {
            this.ball.x = data.posx;
            this.ball.y = data.posy;
        }
    }
}
