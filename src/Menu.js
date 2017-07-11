import Phaser from 'phaser'

export default class extends Phaser.State {
    create() {
        var textStyle = {fill: '#ffffff'}
        this.titleText = this.add.text(320, 320 - 40, "Press Up arrow when ready", textStyle)
        this.titleText.anchor.setTo(0.5, 0.5)

        // Without this flag, this state manager will try to start the state 'Game' multiple times
        this.started = false

        this.cursor = this.input.keyboard.createCursorKeys()

        this.game.socket.on('gameState', message => {
            if (message.status === 1 && this.started === false) {
                this.started = true
                this.state.start('Game')
            }
        });
    }

    update() {
        if (this.cursor.up.isDown) {
            this.titleText.text = "Waiting for other player"
            this.game.socket.emit('playerReady')
        }
    }
}
