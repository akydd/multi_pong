import Phaser from 'phaser'

export default class Paddle extends Phaser.Sprite {
    constructor(game, x, y) {
        super(game, x, y, 'paddle')

        this.anchor.setTo(0.5)

        game.physics.arcade.enableBody(this)
        this.body.collideWorldBounds = true
        this.body.immovable = true
    }
}
