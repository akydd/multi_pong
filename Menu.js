Game.Menu = function(game) {
};

Game.Menu.prototype = {
    create: function() {
        var textStyle = {fill: '#ffffff'};
        var titleText = this.add.text(320, 480 - 40, "Up to start", textStyle);
        titleText.anchor.setTo(0.5, 0.5);

        this.cursor = this.input.keyboard.createCursorKeys();
    },
    update: function() {
        if (this.cursor.up.isDown) {
            this.state.start('Game');
        }
    }
};