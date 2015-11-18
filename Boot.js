var Game = {};

Game.Boot = function(game) {
};

Game.Boot.prototype = {
    preload: function() {
        this.load.image('loadingBar', 'assets/images/loadingbar.png');
        this.load.image('loadingOutline', 'assets/images/loadingoutline.png');

        this.physics.startSystem(Phaser.Physics.ARCADE);
    },
    create: function() {
        // Keep the game running if the browser window loses focus.  Switching browser tabs
        // will still pause the game.
        this.game.stage.disableVisibilityChange = true;
        this.state.start('Preloader');
    }
};
