Game.Game = function(game) {
};

Game.Game.prototype = {
    create: function() {
        this.physics.startSystem(Phaser.Physics.ARCADE);
        this.physics.arcade.checkCollision.down = false;
        this.physics.arcade.checkCollision.up = false;

        this.cursors = this.input.keyboard.createCursorKeys();

        this.player1Score = 0;
        this.player2Score = 0;

        this.createPaddles();
        this.createBall();
        this.createScoreBoard();
    },
    update: function() {
        // If the ball is dead, place it and set it in motion.
        if (!this.ball.alive) {
            this.ball.reset(320, 480);
            this.ball.body.velocity.x = 400;
            this.ball.body.velocity.y = 400;
        }

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
    createBall: function() {
        // Initially, create a 'dead' ball.  We will revive it later.
        this.ball = new Ball(this, 0, 0);
        this.add.existing(this.ball);
        this.ball.kill();

        this.ball.events.onOutOfBounds.add(this.ballLost, this);
    },
    createScoreBoard: function() {
    },
    ballLost: function() {
    }
};