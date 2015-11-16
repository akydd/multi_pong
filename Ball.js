"use strict";

var Ball = function(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'ball');

    this.anchor.setTo(0.5);

    game.physics.arcade.enableBody(this);

    // the ball should bounce off the edges of the world
    this.body.collideWorldBounds = true;
    this.body.bounce.x = 1;
    this.body.bounce.y = 1;
    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;
};

Ball.prototype = Object.create(Phaser.Sprite.prototype);
Ball.prototype.constructor = Ball;