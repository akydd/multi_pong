import Phaser from 'phaser'

export default class Ball extends Phaser.Sprite {
    constructor(game, x, y) {
        super(game, x, y, 'ball')

        this.anchor.setTo(0.5)

        game.physics.arcade.enableBody(this)

        // the ball should bounce off the edges of the world
        this.body.collideWorldBounds = true
        this.body.bounce.x = 1
        this.body.bounce.y = 1
        this.checkWorldBounds = true
        this.outOfBoundsKill = true
    }
}
