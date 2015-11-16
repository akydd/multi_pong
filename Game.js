Game.Game = function(game) {
};

Game.Game.prototype = {
    create: function() {
        this.physics.startSystem(Phaser.Physics.ARCADE);
        this.physics.arcade.checkCollision.down = false;
        this.physics.arcade.checkCollision.up = false;

        this.cursors = this.input.keyboard.createCursorKeys();

        this.createPaddles();
        this.createScoreBoard();
    },
    update: function() {
        // paddle motion
        this.player1.body.velocity.x = 0;
        if (this.cursors.left.isDown) {
            this.player1.body.velocity.x = -600;
        } else if (this.cursors.right.isDown) {
            this.player1.body.velocity.x = 600;
        }
    },
    createPaddles: function() {
        this.player1 = new Paddle(this, 320, 40);
        this.player2 = new Paddle(this, 320, 920);

        this.add.existing(this.player1);
        this.add.existing(this.player2);
    },
    createScoreBoard: function() {
    }
};