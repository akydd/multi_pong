import 'pixi'
import 'p2'
import Phaser from 'phaser'

import io from 'socket.io-client'

import BootState from './Boot'
import PreloaderState from './Preloader'
import MenuState from './Menu'
import GameState from './Game'

export default class Game extends Phaser.Game {
    constructor() {
        // Connect to the server
        let socket = io.connect('http://localhost:8000');

        socket.on('connect', () => {
            socket.emit('join', 'Client join')
        })

        //	Create your Phaser game and inject it into the game-div div.
        super(640, 960, Phaser.AUTO, 'game-div')

        //	Add the game States
        this.state.add('Boot', BootState)
        this.state.add('Preloader', PreloaderState)
        this.state.add('Menu', MenuState)
        this.state.add('Game', GameState)

        // Now start the Boot state.
        this.state.start('Boot')
    }
}

window.game = new Game()
