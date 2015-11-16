Game.Game = function(game) {
};

Game.Game.prototype = {
    create: function() {
        this.physics.startSystem(Phaser.Physics.ARCADE);
        this.physics.arcade.checkCollision.down = false;
        this.physics.arcade.checkCollision.up = false;

        this.createPaddles();
        this.createScoreBoard();
    },
    update: function() {
    },
    createPaddles: function() {
        var player1 = new Paddle(this, 0, 0);
        var player2 = new Paddle(this, 200, 200);

        this.add.existing(player1);
        this.add.existing(player2);
    },
    createScoreBoard: function() {
    }
};