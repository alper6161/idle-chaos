const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Platform information
  platform: process.platform,
  
  // Version information
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  },
  
  // Future API methods can be added here
  // For example:
  // openExternal: (url) => ipcRenderer.invoke('open-external', url),
  // showSaveDialog: () => ipcRenderer.invoke('show-save-dialog'),
  // showOpenDialog: () => ipcRenderer.invoke('show-open-dialog')
});

// Optional: Expose a simple API for checking if running in Electron
contextBridge.exposeInMainWorld('isElectron', true); 