const { contextBridge, ipcRenderer } = require('electron');

// Expose safe, isolated API bridge to renderer
contextBridge.exposeInMainWorld('jarvisDesktop', {
  platform: process.platform,
  isElectron: true,
  companionLoopbackUrl: 'http://127.0.0.1:8001',
});
