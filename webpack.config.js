var path = require('path')
var webpack = require('webpack')

// Phaser webpack config
var phaserModule = path.join(__dirname, '/node_modules/phaser/')
var phaser = path.join(phaserModule, 'build/custom/phaser-split.js')
var pixi = path.join(phaserModule, 'build/custom/pixi.js')
var p2 = path.join(phaserModule, 'build/custom/p2.js')

module.exports = {
    resolve: {
        extensions: ['', '.js']
    },
    entry: {
        app: [
            path.resolve(__dirname, 'src/main.js')
        ]
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            {test: /\.js$/, loader: 'babel-loader', include: path.join(__dirname, 'src'), query: {presets: ['es2015']}},
            {test: /pixi\.js/, loader: 'expose?PIXI'},
            {test: /phaser-split\.js$/, loader: 'expose?Phaser'},
            {test: /p2\.js/, loader: 'expose?p2'}
        ]
    },
    resolve: {
        alias: {
            'phaser': phaser,
            'pixi': pixi,
            'p2': p2
        }
    }
}

