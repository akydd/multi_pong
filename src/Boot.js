import Phaser from 'phaser'

export default class extends Phaser.State {
    preload() {
        this.load.image('loadingBar', 'assets/images/loadingbar.png')
        this.load.image('loadingOutline', 'assets/images/loadingoutline.png')

        this.physics.startSystem(Phaser.Physics.ARCADE)
    }

    create() {
        // Keep the game running if the browser window loses focus.  Switching browser tabs
        // will still pause the game.
        this.game.stage.disableVisibilityChange = true
        this.state.start('Preloader')
    }
}
