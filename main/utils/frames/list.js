// Native
const path = require('path')
const { platform } = require('os')

// Packages
const { BrowserWindow } = require('electron')
const isDev = require('electron-is-dev')
const { resolve } = require('app-root-path')
const debug = require('electron-debug')

// Utilities
const attachTrayState = require('../highlight')
const positionWindow = require('./position')

// Ensure that people can open the developer tools
// even in production
debug({
  enabled: true
})

const windowURL = page => {
  if (isDev) {
    return 'http://localhost:8000/' + page
  }

  return path.join('file://', resolve('./renderer'), page, 'index.html')
}

exports.tutorialWindow = tray => {
  const win = new BrowserWindow({
    width: 650,
    height: 430,
    title: 'Welcome to Now',
    resizable: false,
    center: true,
    frame: false,
    show: false,
    fullscreenable: false,
    maximizable: false,
    titleBarStyle: 'hidden-inset',
    backgroundColor: '#000',
    webPreferences: {
      backgroundThrottling: false,
      devTools: true
    }
  })

  win.loadURL(windowURL('tutorial'))
  attachTrayState(win, tray)

  const emitTrayClick = aboutWindow => {
    const emitClick = () => {
      if (aboutWindow && aboutWindow.isVisible()) {
        return
      }

      // Automatically open the context menu
      if (tray) {
        tray.emit('click')
      }

      win.removeListener('hide', emitClick)
    }

    win.on('hide', emitClick)
    win.close()
  }

  win.on('open-tray', emitTrayClick)

  // Just hand it back
  return win
}

exports.aboutWindow = tray => {
  const win = new BrowserWindow({
    width: 360,
    height: 408,
    title: 'About Now',
    resizable: false,
    center: true,
    show: false,
    fullscreenable: false,
    maximizable: false,
    minimizable: false,
    titleBarStyle: 'hidden-inset',
    frame: false,
    backgroundColor: '#ECECEC',
    webPreferences: {
      backgroundThrottling: false,
      devTools: true
    }
  })

  win.loadURL(windowURL('about'))
  attachTrayState(win, tray)

  return win
}

exports.mainWindow = tray => {
  let windowHeight = 380

  if (platform() === 'win32') {
    windowHeight -= 12
  }

  const win = new BrowserWindow({
    width: 330,
    height: windowHeight,
    title: 'Now',
    resizable: false,
    show: false,
    fullscreenable: false,
    maximizable: false,
    minimizable: false,
    transparent: true,
    frame: false,
    movable: false,
    webPreferences: {
      backgroundThrottling: false,
      devTools: true
    }
  })

  positionWindow(tray, win)

  win.loadURL(windowURL('feed'))
  attachTrayState(win, tray)

  // Hide window if it's not focused anymore
  // This can only happen if the dev tools are not open
  // Otherwise, we won't be able to debug the renderer
  win.on('blur', () => {
    if (win.webContents.isDevToolsOpened()) {
      return
    }

    win.hide()
  })

  return win
}
