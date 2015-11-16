Game.Preloader = function(game) {
};

Game.Preloader.prototype = {
    preload: function() {
        var textStyle = {fill: '#ffffff'};
        var loadingText = this.add.text(320, 480 - 40, "loading...", textStyle);
        var loadingBar = this.add.sprite(320, 480, 'loadingBar');
        var loadingOutline = this.add.sprite(320, 480, 'loadingOutline');

        loadingText.anchor.setTo(0.5, 0.5);
        loadingBar.anchor.setTo(0.5, 0.5);
        loadingOutline.anchor.setTo(0.5, 0.5);

        this.load.setPreloadSprite(loadingBar);

        this.load.image('paddle', 'assets/images/paddle.png');
        this.load.image('ball', 'assets/images/ball.png');
        this.load.audio('bump', 'assets/sounds/bump.ogg', true);
        this.load.audio('bump1', 'assets/sounds/bump1.ogg', true);
    },
    create: function() {
        this.state.start('Menu');
    }
};

