import Phaser from 'phaser'

export default class extends Phaser.State {
    create() {
        var textStyle = {fill: '#ffffff'}
        this.titleText = this.add.text(320, 320 - 40, "Press Up arrow when ready", textStyle)
        this.titleText.anchor.setTo(0.5, 0.5)

        this.cursor = this.input.keyboard.createCursorKeys()

        this.game.socket.on('startgame', () => {
            this.state.start('Game')
        });
    }

    update() {
        if (this.cursor.up.isDown) {
            this.titleText.text = "Waiting for other player"
            this.game.socket.emit('playerReady')
        }
    }
}
