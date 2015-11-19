Game.Menu = function(game) {
};

Game.Menu.prototype = {
    create: function() {
        var textStyle = {fill: '#ffffff'};
        this.titleText = this.add.text(320, 480 - 40, "Press Up arrow when ready", textStyle);
        this.titleText.anchor.setTo(0.5, 0.5);

        this.cursor = this.input.keyboard.createCursorKeys();
    },
    update: function() {
        var socket = io();

        var _this = this;
        socket.on('startgame', function() {
            _this.state.start('Game');
        });

        if (this.cursor.up.isDown) {
            this.titleText.text = "Waiting for other player";
            socket.emit('playerReady');
        }
    }
};