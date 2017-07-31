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
        this.physics.startSystem(Phaser.Physics.ARCADE)
        this.physics.arcade.checkCollision.down = false
        this.physics.arcade.checkCollision.up = false

        this.cursors = this.input.keyboard.createCursorKeys()

        this.bumpSound = this.add.audio('bump')
        this.bump1Sound = this.add.audio('bump1')

        this.initialSetup = true
        this.playerLoaded = false
        this.remotePlayerLoaded = false
        this.ballReset = false
        this.ended = false
        this.savedMoves = []
        this.clientAdjustment

        this.createBall()
        this.createScoreBoard()

        this.game.socket.on('gameState', message => {
            // Back to the menu if we lose a player
            if (message.status === 0 && this.ended === false) {
                this.ended = true
                this.state.start('Menu')
                return
            }

            if (message.players) {
                for (var clientId in message.players) {
                    var player = message.players[clientId]

                    if (this.game.clientId === clientId) {
                        if (!this.playerLoaded) {
                            this.createPaddle(player.x, player.y)
                            this.playerLoaded = true
                        }
                    } else {
                        if (!this.remotePlayerLoaded) {
                            this.createRemotePaddle(player.x, player.y)
                            this.remotePlayerLoaded = true
                        }
                    }
                }
            }

            if (message.clientAdjust) {
                message.clientAdjust.forEach(data => {
                    if (data.id === this.game.clientId) {
                        console.log("server update: " + data.x + " at " + data.ts)
                        this.clientAdjustPosition(data)
                    } else {
                        this.opponentAdjustPosition(data)
                    }
                })
            }

            if (message.updateScore) {
                this.updateScore(message.updateScore)
            }

            if (message.ball) {
                this.updateBall(message.ball)
            }
        })
    }

    update() {
        if (this.initialSetup) {
            this.game.socket.emit('levelLoaded')
            this.initialSetup = false
        }

        if (this.playerLoaded) {
            // paddle motion
            var move = {
                ts: Date.now()
            };

            // TODO: optimize this so that clientMove messages are only sent when necessary
            // Paddle moves at 600 px/s
            if (this.cursors.left.isDown) {
                move.dir = -1
                this.game.socket.emit('clientMove', move)
                this.player1.body.velocity.x = -600

                console.log("client: " + this.player1.x + " at " + move.ts)

                this.updateMoves(move)
            } else if (this.cursors.right.isDown) {
                move.dir = 1
                this.game.socket.emit('clientMove', move)
                this.player1.body.velocity.x = 600

                console.log("client: " + this.player1.x + " at " + move.ts)

                this.updateMoves(move)
            } else {
                move.dir = 0;
                this.socket.emit('clientMove', move)
                this.player1.body.velocity.x = 0
                this.updateMoves(move)
            }

            // ball paddle collisions
            this.physics.arcade.collide(this.ball, this.player1, this.hitPlayer1, null, this)
            this.physics.arcade.collide(this.ball, this.player2, this.hitPlayer2, null, this)
        }
    }

    createPaddle(x, y) {
        this.player1 = new Paddle(this, x, y)
        this.add.existing(this.player1)
    }

    createRemotePaddle(x, y) {
        this.player2 = new Paddle(this, x, y)
        this.add.existing(this.player2)
    }

    createBall() {
        // Initially, create a 'dead' ball.  We will revive it later.
        this.ball = new Ball(this, 0, 0)
        this.add.existing(this.ball)
        this.ball.kill()
    }

    updateScore(data) {
        if (data.player === 'player2') {
            this.player2ScoreText.text = data.score
        } else {
            this.player1ScoreText.text = data.score
        }
    }

    createScoreBoard() {
        this.player1ScoreText = this.add.text(20, 20, 0, this.textStyle)
        this.player2ScoreText = this.add.text(20, 600, 0, this.textStyle)
    }

    hitPlayer1() {
        this.bumpSound.play()
    }

    hitPlayer2() {
        this.bump1Sound.play()
    }

    // Keep a history of the last 30 moves
    updateMoves(move) {
        this.savedMoves.push(move);
        if (this.savedMoves.length > 30) {
            this.savedMoves.shift()
        }
    }

    clientAdjustPosition(data) {
        if (this.player1) {
            var serverTs = data.ts
            var x = data.x
            console.log("server: " + x + " at " + serverTs)

            this.savedMoves = this.savedMoves.filter(savedMove => {
                savedMove.ts > serverTs
            })


            this.savedMoves.forEach(savedMove => {
                x = x + savedMove.dir * 0.6 * this.physics.physicsElapsed

                // Since we are manually adjusting the paddles xpos, we also need to manually check for boundary collisions
                // The paddles are 100px wide, anchored at 50px, and the game world is 640px wide.
                // This means that a paddle's xpos cannot be < 50 or > 590.
                if (x > 590) {
                    x = 590
                }

                if (x < 50) {
                    x = 50
                }
            })

            this.player1.x = x
            console.log("adjusted client: " + x)
        }
    }

    opponentAdjustPosition(data) {
        if (this.player2) {
            // console.log("Current x: " + this.player2.x)
            // console.log("New x: " + data.x)
            this.player2.x = data.x
        }
    }

    updateBall(data) {
        if (this.ball) {
            // Was the ball dead, but is now active again?
            if (!this.ball.alive && data.active === true) {
                this.ball.reset(data.x, data.y)
            } else {
                this.ball.x = data.x
                this.ball.y = data.y
            }
        }
    }
}
