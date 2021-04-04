const { app, Menu } = require('electron');

const isMac = process.platform === 'darwin';

const createMenu = () => {
  const template = [
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
    {
      label: 'File',
      submenu: [
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },
    {
      label: 'People',
      submenu: [
        { label: 'Create Person' },
        { label: 'Edit Person' }
      ]
    },
    {
      label: 'Accounts',
      submenu: [
        { label: 'Create Account' },
        { label: 'Edit Account' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

module.exports = { createMenu };
