import Phaser from 'phaser'

export default class extends Phaser.State {
    preload() {
        var textStyle = {fill: '#ffffff'}
        var loadingText = this.add.text(320, 320 - 40, "loading...", textStyle)
        var loadingBar = this.add.sprite(320, 320, 'loadingBar')
        var loadingOutline = this.add.sprite(320, 320, 'loadingOutline')

        loadingText.anchor.setTo(0.5, 0.5)
        loadingBar.anchor.setTo(0.5, 0.5)
        loadingOutline.anchor.setTo(0.5, 0.5)

        this.load.setPreloadSprite(loadingBar)

        this.load.image('paddle', 'assets/images/paddle.png')
        this.load.image('ball', 'assets/images/ball.png')
        this.load.audio('bump', 'assets/sounds/bump.ogg', true)
        this.load.audio('bump1', 'assets/sounds/bump1.ogg', true)
    }

    create() {
        this.state.start('Menu')
    }
}

