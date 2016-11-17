var path = require('path')
var webpack = require('webpack')

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
            {
                test: /\.js$/,
                loader: 'babel-loader',
                include: path.join(__dirname, 'src'),
                query: {
                    presets: ['es2015']
                }
            }
        ]
    }
}

