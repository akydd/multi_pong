"use strict";

var Paddle = function(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'loadingBar');

    this.anchor.setTo(0.5);

    game.physics.arcade.enableBody(this);
    this.checkWorldBounds = true;
    this.body.collideWorldBounds = true;
};

Paddle.prototype = Object.create(Phaser.Sprite.prototype);
Paddle.prototype.constructor = Paddle;