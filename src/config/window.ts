import { BrowserWindow } from 'electron';

export const createWindow = (width: number, height: number) => new BrowserWindow({
  width: width,
  height: height
})