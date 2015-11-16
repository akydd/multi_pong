"use strict";

var Paddle = function(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'paddle');

    this.anchor.setTo(0.5);

    game.physics.arcade.enableBody(this);
    this.body.collideWorldBounds = true;
    this.body.immovable = true;
};

Paddle.prototype = Object.create(Phaser.Sprite.prototype);
Paddle.prototype.constructor = Paddle;