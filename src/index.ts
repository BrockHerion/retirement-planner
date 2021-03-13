import { app } from 'electron';
import path from 'path';

import { createMenu } from './config/menu';
import { createWindow } from './config/window';

import { WIDTH, HEIGHT } from './constants';

const env = process.env.NODE_ENV || 'development';

// Enables hot reload
if (env === 'development') {
  try {
    require('electron-reloader')(module, {
      debug: true,
      watchRenderer: true
    });
  } catch (e) { console.error(`An error occurred ${e}`) }
}

app.on('ready', () => {

  // Create a new window and add properties to it
  const window = createWindow(WIDTH, HEIGHT);
  createMenu();

  // Get the index.html file
  const index = path.join(__dirname, '..', 'index.html');

  // Load the window
  window.loadFile(index)
    .then(() => {
      console.log('Window was loaded successfully!');
    })
    .catch((e) => {
      console.error(`An error occurred: ${e}`);
    });

  if (env === 'development') {
    window.webContents.openDevTools();
  }
});