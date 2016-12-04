import Phaser from 'phaser'

export default class extends Phaser.State {
    create() {
        var textStyle = {fill: '#ffffff'}
        this.titleText = this.add.text(320, 480 - 40, "Server is full.  Try again later.", textStyle)
        this.titleText.anchor.setTo(0.5, 0.5)
    }
}
