import 'pixi'
import 'p2'
import Phaser from 'phaser'

import BootState from './Boot'
import PreloaderState from './Preloader'
import MenuState from './Menu'
import GameState from './Game'
import FullState from './Full'

export default class Game extends Phaser.Game {
    constructor() {
        //	Create your Phaser game and inject it into the game-div div.
        super(640, 640, Phaser.AUTO, 'game-div')
 
        //	Add the game States
        this.state.add('Boot', BootState)
        this.state.add('Preloader', PreloaderState)
        this.state.add('Menu', MenuState)
        this.state.add('Game', GameState)
        this.state.add('Full', FullState)

        // Now start the Boot state.
        this.state.start('Boot')
    }
}

window.game = new Game()
