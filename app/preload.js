const { contextBridge, ipcRenderer } = require('electron');

// Ponte mínima entre a janela do jogo e o menu nativo do app.
contextBridge.exposeInMainWorld('appBridge', {
  onCommand: cb => ipcRenderer.on('cmd', (_e, c) => cb(c)),
  menu: d => ipcRenderer.send('menu-data', d)
});
