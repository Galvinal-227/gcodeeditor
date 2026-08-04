import { contextBridge, ipcRenderer } from 'electron';

const electronAPI = {
  // File operations
  openDirectory: () => ipcRenderer.invoke('dialog-open-directory'),
  saveFile: (fileName: string, content: string) => ipcRenderer.invoke('dialog-save-file', fileName, content),
  openFile: () => ipcRenderer.invoke('dialog-open-file'),
  readDirectory: (path: string) => ipcRenderer.invoke('read-directory', path),
  saveFileContent: (filePath: string, content: string) => ipcRenderer.invoke('save-file', filePath, content),
  createFile: (dirPath: string, fileName: string) => ipcRenderer.invoke('create-file', dirPath, fileName),
  createFolder: (dirPath: string, folderName: string) => ipcRenderer.invoke('create-folder', dirPath, folderName),
  deleteItem: (itemPath: string) => ipcRenderer.invoke('delete-item', itemPath),
  renameItem: (oldPath: string, newName: string) => ipcRenderer.invoke('rename-item', oldPath, newName),
  duplicateItem: (itemPath: string) => ipcRenderer.invoke('duplicate-item', itemPath),
  readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
  
  // Project management
  getRecentProjects: () => ipcRenderer.invoke('get-recent-projects'),
  saveRecentProject: (projectPath: string) => ipcRenderer.invoke('save-recent-project', projectPath),
  getAppPath: () => ipcRenderer.invoke('get-app-path'),
  
  // Clipboard
  clipboardWrite: (text: string) => ipcRenderer.invoke('clipboard-write', text),
  clipboardRead: () => ipcRenderer.invoke('clipboard-read'),
  
  // Dialogs
  showSaveDialog: (options: any) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options: any) => ipcRenderer.invoke('show-open-dialog', options),
  showMessageBox: (options: any) => ipcRenderer.invoke('show-message-box', options),
  
  // Theme
  getTheme: () => ipcRenderer.invoke('get-theme'),
  setTheme: (theme: string) => ipcRenderer.invoke('set-theme', theme),
  
  // Git
  getGitStatus: (repoPath: string) => ipcRenderer.invoke('get-git-status', repoPath),
  gitCommit: (repoPath: string, message: string) => ipcRenderer.invoke('git-commit', repoPath, message),
  gitBranch: (repoPath: string, branch: string) => ipcRenderer.invoke('git-branch', repoPath, branch),
  
  // Commands
  executeCommand: (command: string) => ipcRenderer.invoke('execute-command', command),
  
  // Menu events
  onMenuNewFile: (callback: () => void) => {
    ipcRenderer.on('menu-new-file', callback);
    return () => ipcRenderer.removeListener('menu-new-file', callback);
  },
  onMenuNewFolder: (callback: () => void) => {
    ipcRenderer.on('menu-new-folder', callback);
    return () => ipcRenderer.removeListener('menu-new-folder', callback);
  },
  onMenuOpenFolder: (callback: (event: any, path: string) => void) => {
    ipcRenderer.on('menu-open-folder', callback);
    return () => ipcRenderer.removeListener('menu-open-folder', callback);
  },
  onMenuSave: (callback: () => void) => {
    ipcRenderer.on('menu-save', callback);
    return () => ipcRenderer.removeListener('menu-save', callback);
  },
  onMenuSaveAs: (callback: () => void) => {
    ipcRenderer.on('menu-save-as', callback);
    return () => ipcRenderer.removeListener('menu-save-as', callback);
  },
  onMenuSaveAll: (callback: () => void) => {
    ipcRenderer.on('menu-save-all', callback);
    return () => ipcRenderer.removeListener('menu-save-all', callback);
  },
  onMenuAutoSave: (callback: (event: any, enabled: boolean) => void) => {
    ipcRenderer.on('menu-auto-save', callback);
    return () => ipcRenderer.removeListener('menu-auto-save', callback);
  },
  onMenuCommandPalette: (callback: () => void) => {
    ipcRenderer.on('menu-command-palette', callback);
    return () => ipcRenderer.removeListener('menu-command-palette', callback);
  },
  onMenuToggleExplorer: (callback: () => void) => {
    ipcRenderer.on('menu-toggle-explorer', callback);
    return () => ipcRenderer.removeListener('menu-toggle-explorer', callback);
  },
  onMenuToggleSearch: (callback: () => void) => {
    ipcRenderer.on('menu-toggle-search', callback);
    return () => ipcRenderer.removeListener('menu-toggle-search', callback);
  },
  onMenuToggleGit: (callback: () => void) => {
    ipcRenderer.on('menu-toggle-git', callback);
    return () => ipcRenderer.removeListener('menu-toggle-git', callback);
  },
  onMenuToggleExtensions: (callback: () => void) => {
    ipcRenderer.on('menu-toggle-extensions', callback);
    return () => ipcRenderer.removeListener('menu-toggle-extensions', callback);
  },
  onMenuToggleTerminal: (callback: () => void) => {
    ipcRenderer.on('menu-toggle-terminal', callback);
    return () => ipcRenderer.removeListener('menu-toggle-terminal', callback);
  },
  onMenuToggleProblems: (callback: () => void) => {
    ipcRenderer.on('menu-toggle-problems', callback);
    return () => ipcRenderer.removeListener('menu-toggle-problems', callback);
  },
  onMenuToggleOutput: (callback: () => void) => {
    ipcRenderer.on('menu-toggle-output', callback);
    return () => ipcRenderer.removeListener('menu-toggle-output', callback);
  },
  onMenuZoomIn: (callback: () => void) => {
    ipcRenderer.on('menu-zoom-in', callback);
    return () => ipcRenderer.removeListener('menu-zoom-in', callback);
  },
  onMenuZoomOut: (callback: () => void) => {
    ipcRenderer.on('menu-zoom-out', callback);
    return () => ipcRenderer.removeListener('menu-zoom-out', callback);
  },
  onMenuZoomReset: (callback: () => void) => {
    ipcRenderer.on('menu-zoom-reset', callback);
    return () => ipcRenderer.removeListener('menu-zoom-reset', callback);
  },
  onMenuGoToFile: (callback: () => void) => {
    ipcRenderer.on('menu-go-to-file', callback);
    return () => ipcRenderer.removeListener('menu-go-to-file', callback);
  },
  onMenuGoToSymbol: (callback: () => void) => {
    ipcRenderer.on('menu-go-to-symbol', callback);
    return () => ipcRenderer.removeListener('menu-go-to-symbol', callback);
  },
  onMenuGoToLine: (callback: () => void) => {
    ipcRenderer.on('menu-go-to-line', callback);
    return () => ipcRenderer.removeListener('menu-go-to-line', callback);
  },
  onMenuRun: (callback: () => void) => {
    ipcRenderer.on('menu-run', callback);
    return () => ipcRenderer.removeListener('menu-run', callback);
  },
  onMenuStop: (callback: () => void) => {
    ipcRenderer.on('menu-stop', callback);
    return () => ipcRenderer.removeListener('menu-stop', callback);
  },
  onMenuRestart: (callback: () => void) => {
    ipcRenderer.on('menu-restart', callback);
    return () => ipcRenderer.removeListener('menu-restart', callback);
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);