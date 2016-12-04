const path = require('path')
const express = require('express')

module.exports = {
    app: function () {
        const app = express()
        const indexPath = path.join(__dirname, '/../index.html')
        const distPath = express.static(path.join(__dirname, '../dist'))
        const assetsPath = express.static(path.join(__dirname, '../assets'))

        app.use('/dist', distPath)
        app.use('/assets', assetsPath)
        app.get('/', function (_, res) { res.sendFile(indexPath) })

        return app
    }
}
