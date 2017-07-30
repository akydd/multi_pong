import Phaser from 'phaser'

import io from 'socket.io-client'

export default class extends Phaser.State {
    preload() {
        this.load.image('loadingBar', 'assets/images/loadingbar.png')
        this.load.image('loadingOutline', 'assets/images/loadingoutline.png')

        this.physics.startSystem(Phaser.Physics.ARCADE)
    }

    create() {
        // Connect to the server
        this.game.socket = io.connect(GAME_SERVER);
        console.log("Attempting to connect to " + GAME_SERVER)

        this.game.socket.on('connect', () => {
            this.game.clientId = this.game.socket.io.engine.id
            console.log("Connected as client " + this.game.socket.io.engine.id)
        })

        this.game.socket.on('disconnect', (data) => {
            console.log("Disconnecting, reason: " + data.message)
            this.game.socket.disconnect()
            this.state.start('Full')
        })

        // Keep the game running if the browser window loses focus.  Switching browser tabs
        // will still pause the game.
        this.game.stage.disableVisibilityChange = true
        this.state.start('Preloader')
    }
}
