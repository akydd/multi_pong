Game.Game = function(game) {
};

Game.Game.prototype = {
    textStyle: {
        fill: '#ffffff'
    },
    create: function() {
        this.physics.startSystem(Phaser.Physics.ARCADE);
        this.physics.arcade.checkCollision.down = false;
        this.physics.arcade.checkCollision.up = false;

        this.cursors = this.input.keyboard.createCursorKeys();

        this.bumpSound = this.add.audio('bump');
        this.bump1Sound = this.add.audio('bump1');

        this.initialSetup = true;

        this.createPaddles();
        this.createBall();
        this.createScoreBoard();
    },
    update: function() {
        if (this.initialSetup) {
            this.resetBall();
            this.initialSetup = false;
        }

        // paddle motion
        // TODO: add secondary controls for player2
        this.player1.body.velocity.x = 0;
        this.player2.body.velocity.x = 0;
        if (this.cursors.left.isDown) {
            this.player1.body.velocity.x = -600;
            this.player2.body.velocity.x = -600;
        } else if (this.cursors.right.isDown) {
            this.player1.body.velocity.x = 600;
            this.player2.body.velocity.x = 600;
        }

        // ball paddle collisions
        this.physics.arcade.collide(this.ball, this.player1, this.hitPlayer1, null, this);
        this.physics.arcade.collide(this.ball, this.player2, this.hitPlayer2, null, this);
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

        this.ball.events.onOutOfBounds.add(this.scoreAndReset, this);
    },
    scoreAndReset: function() {
        this.updateScore();
        this.resetBall();
    },
    updateScore: function() {
        var ypos = this.ball.y;
        if (ypos <= 0) {
            this.player2Score += 1;
            this.player2ScoreText.text = this.player2Score;
        } else {
            this.player1Score += 1;
            this.player1ScoreText.text = this.player1Score;
        }
    },
    resetBall: function() {
        // The x coordinate, horizontal direction and vertical direction
        // of the ball are picked at random.
        var xpos = this.rnd.integerInRange(0, 640);
        var xdir = this.rnd.pick([-1, 1]);
        var ydir = this.rnd.pick([-1, 1]);

        this.time.events.add(Phaser.Timer.SECOND * 3, function() {
            this.ball.reset(xpos, 480);
            this.ball.body.velocity.x = xdir * 400;
            this.ball.body.velocity.y = ydir * 400;
        }, this);
    },
    createScoreBoard: function() {
        this.player1Score = 0;
        this.player2Score = 0;

        this.player1ScoreText = this.add.text(20, 20, this.player1Score, this.textStyle);
        this.player2ScoreText = this.add.text(20, 920, this.player2Score, this.textStyle);
    },
    hitPlayer1: function() {
        this.bumpSound.play();
    },
    hitPlayer2: function() {
        this.bump1Sound.play();
    }
};