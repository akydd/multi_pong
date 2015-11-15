Game.Preloader = function(game) {
};

Game.Preloader.prototype = {
    preload: function() {
        var loadingBar = this.add.sprite(320, 480, 'loadingBar');
        var loadingOutline = this.add.sprite(320, 480, 'loadingOutline');

        loadingBar.anchor.setTo(0.5, 0.5);
        loadingOutline.anchor.setTo(0.5, 0.5);

        this.load.setPreloadSprite(loadingBar);
    }
};

