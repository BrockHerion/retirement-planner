const { app, BrowserWindow } = require('electron')
const path = require('path')
const { createMenu } = require('./src/config/menu')
const { enableHotReload } = require('./src/utils/enableHotReload')
const { loadFile, saveFile } = require('./src/data/dataManager')

require('dotenv').config()

const env = process.env.NODE_ENV || 'development'

if (env === 'development') {
    enableHotReload()
}

app.on('ready', () => {
    const window = new BrowserWindow({
        width: process.env.WIDTH,
        height: process.env.HEIGHT,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })
    createMenu()

    const index = path.join(__dirname, 'src/pages/index.html')

    window.loadFile(index)
        .then(() => {
            console.log('Window was loaded successfully!')
            loadFile()
            saveFile()
        })
        .catch((e) => {
            console.error(`An error occurred: ${e}`)
        })

    if (env === 'development') {
        window.webContents.openDevTools()
    }
})