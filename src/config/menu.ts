import { app, Menu } from 'electron';
import { MenuItemConstructorOptions } from 'electron/main';

const isMac = process.platform === 'darwin';

export const createMenu = () => {
  const template: MenuItemConstructorOptions[] = [];

  if (isMac) {
    // role menu, MacOS only
    template.push(
      {
        label: "Retirement Planner",
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          { role: 'quit' }
        ]
      }
    );
  }

  // role file
  template.push(
    {
      label: 'File',
      submenu: [
        isMac ? { role: 'close' } : { role: 'quit' },
      ]
    }
  );

  // role people
  template.push(
    {
      label: 'People',
      submenu: [
        { label: 'Create Person' },
      ]
    }
  );

  // role accounts
  template.push(
    {
      label: 'Accounts',
      submenu: [
        { label: 'Create Account' },
      ]
    }
  );

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}