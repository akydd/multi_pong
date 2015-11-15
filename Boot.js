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
        this.state.start('Preloader');
    }
};
