import {
  app,
  dialog,
  BrowserWindow,
  Menu
} from 'electron'

import { autoUpdater } from 'electron-updater'
import Store from '../store'

const store = new Store({
  configName: 'user-preferences',
  defaults: {
    windowBounds: {
      x: 0,
      y: 0,
      width: 800,
      height: 800
    }
  }
})

Menu.setApplicationMenu(
  Menu.buildFromTemplate([
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forcereload' },
        { role: 'toggledevtools' },
        { type: 'separator' },
        { role: 'resetzoom' },
        { role: 'zoomin' },
        { role: 'zoomout' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      role: 'window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    }
  ])
)

let mainWindow

/**
 * Set `__statics` path to static files in production;
 * The reason we are setting it here is that the path needs to be evaluated at runtime
 */
if (process.env.PROD) {
  global.__statics = require('path').join(__dirname, 'statics').replace(/\\/g, '\\\\')
}

function createWindow () {
  let { width, height } = store.get('windowBounds')
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    width,
    height,
    useContentSize: true
    // --- TODO: do it in future !
    // --- TODO: app without frame with custom window
    // frame: false,
    // transparent: true
  })

  mainWindow.loadURL(process.env.APP_URL)

  mainWindow.on('moved', handleMovedOrResize)
  mainWindow.on('resize', handleMovedOrResize)

  mainWindow.on('closed', handleClosed)
}

function handleMovedOrResize () {
  let { x, y, width, height } = mainWindow.getBounds()
  store.set('windowBounds', { x, y, width, height })
}

function handleClosed () {
  mainWindow = null
}

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */
autoUpdater.logger = require('electron-log')
autoUpdater.logger.transports.file.level = 'info'

autoUpdater.on('update-downloaded', () => {
  console.log('update-downloaded lats quitAndInstall')

  if (process.env.NODE_ENV === 'production') {
    dialog.showMessageBox({
      type: 'info',
      title: 'Found Updates',
      message: 'Found updates, do you want update now?',
      buttons: ['Sure', 'No']
    }, buttonIndex => {
      if (buttonIndex === 0) {
        let isSilent = true
        let isForceRunAfter = true
        autoUpdater.quitAndInstall(isSilent, isForceRunAfter)
      }
    })
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') {
    autoUpdater.checkForUpdates()
  }
  createWindow()
})
