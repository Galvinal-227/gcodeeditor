import { app, BrowserWindow, ipcMain, dialog, Menu, shell, clipboard, nativeTheme } from 'electron';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';

let mainWindow: BrowserWindow | null = null;
let isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, '../../public/icon.ico'),
    frame: true,
    titleBarStyle: 'default',
    backgroundColor: '#1e1e1e',
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  createMenu();
}

function createMenu() {
  const template: any[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New File',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow?.webContents.send('menu-new-file');
          },
        },
        {
          label: 'New Folder',
          accelerator: 'CmdOrCtrl+Shift+N',
          click: () => {
            mainWindow?.webContents.send('menu-new-folder');
          },
        },
        {
          label: 'Open Folder',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            dialog.showOpenDialog(mainWindow!, {
              properties: ['openDirectory'],
            }).then(result => {
              if (!result.canceled && result.filePaths.length > 0) {
                mainWindow?.webContents.send('menu-open-folder', result.filePaths[0]);
              }
            });
          },
        },
        {
          label: 'Open Recent',
          submenu: [
            {
              label: 'No recent projects',
              enabled: false,
            },
          ],
        },
        { type: 'separator' },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow?.webContents.send('menu-save');
          },
        },
        {
          label: 'Save As',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => {
            mainWindow?.webContents.send('menu-save-as');
          },
        },
        {
          label: 'Save All',
          accelerator: 'CmdOrCtrl+Alt+S',
          click: () => {
            mainWindow?.webContents.send('menu-save-all');
          },
        },
        { type: 'separator' },
        {
          label: 'Auto Save',
          type: 'checkbox',
          checked: false,
          click: (menuItem) => {
            mainWindow?.webContents.send('menu-auto-save', menuItem.checked);
          },
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Redo', accelerator: 'CmdOrCtrl+Shift+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' },
        { type: 'separator' },
        { label: 'Find', accelerator: 'CmdOrCtrl+F', role: 'find' },
        { label: 'Replace', accelerator: 'CmdOrCtrl+H', role: 'replace' },
        { type: 'separator' },
        { label: 'Select All', accelerator: 'CmdOrCtrl+A', role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { label: 'Command Palette', accelerator: 'CmdOrCtrl+Shift+P', click: () => {
          mainWindow?.webContents.send('menu-command-palette');
        }},
        { type: 'separator' },
        { label: 'Explorer', accelerator: 'CmdOrCtrl+Shift+E', click: () => {
          mainWindow?.webContents.send('menu-toggle-explorer');
        }},
        { label: 'Search', accelerator: 'CmdOrCtrl+Shift+F', click: () => {
          mainWindow?.webContents.send('menu-toggle-search');
        }},
        { label: 'Source Control', accelerator: 'CmdOrCtrl+Shift+G', click: () => {
          mainWindow?.webContents.send('menu-toggle-git');
        }},
        { label: 'Extensions', accelerator: 'CmdOrCtrl+Shift+X', click: () => {
          mainWindow?.webContents.send('menu-toggle-extensions');
        }},
        { type: 'separator' },
        { label: 'Terminal', accelerator: 'Ctrl+`', click: () => {
          mainWindow?.webContents.send('menu-toggle-terminal');
        }},
        { label: 'Problems', accelerator: 'CmdOrCtrl+Shift+M', click: () => {
          mainWindow?.webContents.send('menu-toggle-problems');
        }},
        { label: 'Output', accelerator: 'CmdOrCtrl+Shift+U', click: () => {
          mainWindow?.webContents.send('menu-toggle-output');
        }},
        { type: 'separator' },
        { label: 'Toggle Full Screen', accelerator: 'F11', click: () => {
          mainWindow?.setFullScreen(!mainWindow?.isFullScreen());
        }},
        { label: 'Zoom In', accelerator: 'CmdOrCtrl+Plus', click: () => {
          mainWindow?.webContents.send('menu-zoom-in');
        }},
        { label: 'Zoom Out', accelerator: 'CmdOrCtrl+Minus', click: () => {
          mainWindow?.webContents.send('menu-zoom-out');
        }},
        { label: 'Reset Zoom', accelerator: 'CmdOrCtrl+0', click: () => {
          mainWindow?.webContents.send('menu-zoom-reset');
        }},
        { type: 'separator' },
        { label: 'Toggle Developer Tools', accelerator: 'CmdOrCtrl+Shift+I', click: () => {
          mainWindow?.webContents.toggleDevTools();
        }},
        { label: 'Reload', accelerator: 'CmdOrCtrl+R', click: () => {
          mainWindow?.reload();
        }},
      ],
    },
    {
      label: 'Go',
      submenu: [
        { label: 'Go to File', accelerator: 'CmdOrCtrl+P', click: () => {
          mainWindow?.webContents.send('menu-go-to-file');
        }},
        { label: 'Go to Symbol', accelerator: 'CmdOrCtrl+Shift+O', click: () => {
          mainWindow?.webContents.send('menu-go-to-symbol');
        }},
        { label: 'Go to Line', accelerator: 'CmdOrCtrl+G', click: () => {
          mainWindow?.webContents.send('menu-go-to-line');
        }},
      ],
    },
    {
      label: 'Run',
      submenu: [
        { label: 'Run', accelerator: 'F5', click: () => {
          mainWindow?.webContents.send('menu-run');
        }},
        { label: 'Stop', accelerator: 'Shift+F5', click: () => {
          mainWindow?.webContents.send('menu-stop');
        }},
        { label: 'Restart', accelerator: 'CmdOrCtrl+Shift+F5', click: () => {
          mainWindow?.webContents.send('menu-restart');
        }},
      ],
    },
    {
      label: 'Help',
      submenu: [
        { label: 'About', click: () => {
          dialog.showMessageBox(mainWindow!, {
            type: 'info',
            title: 'About Code Editor',
            message: 'Code Editor v1.0.0\n\nA lightweight VS Code inspired code editor built with Electron, React, and Monaco Editor.',
            buttons: ['OK']
          });
        }},
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC Handlers - File System
ipcMain.handle('dialog-open-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openDirectory'],
  });
  return result.filePaths[0];
});

ipcMain.handle('dialog-save-file', async (event, fileName: string, content: string) => {
  const result = await dialog.showSaveDialog(mainWindow!, {
    defaultPath: fileName,
    filters: [
      { name: 'All Files', extensions: ['*'] },
      { name: 'HTML', extensions: ['html'] },
      { name: 'CSS', extensions: ['css'] },
      { name: 'JavaScript', extensions: ['js'] },
    ],
  });
  
  if (!result.canceled && result.filePath) {
    fs.writeFileSync(result.filePath, content, 'utf-8');
    return result.filePath;
  }
  return null;
});

ipcMain.handle('dialog-open-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openFile'],
    filters: [
      { name: 'All Files', extensions: ['*'] },
      { name: 'HTML', extensions: ['html', 'htm'] },
      { name: 'CSS', extensions: ['css'] },
      { name: 'JavaScript', extensions: ['js'] },
    ],
  });
  if (!result.canceled && result.filePaths.length > 0) {
    const content = fs.readFileSync(result.filePaths[0], 'utf-8');
    return { path: result.filePaths[0], content };
  }
  return null;
});

ipcMain.handle('read-directory', async (event, dirPath: string) => {
  try {
    const files = fs.readdirSync(dirPath);
    const result = [];
    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      const stat = fs.statSync(fullPath);
      result.push({
        id: fullPath,
        name: file,
        path: fullPath,
        isDirectory: stat.isDirectory(),
        children: stat.isDirectory() ? await readDirectory(fullPath) : [],
        content: stat.isDirectory() ? undefined : fs.readFileSync(fullPath, 'utf-8'),
      });
    }
    return result;
  } catch (error) {
    console.error('Error reading directory:', error);
    return [];
  }
});

async function readDirectory(dirPath: string): Promise<any[]> {
  try {
    const files = fs.readdirSync(dirPath);
    const result = [];
    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      const stat = fs.statSync(fullPath);
      result.push({
        id: fullPath,
        name: file,
        path: fullPath,
        isDirectory: stat.isDirectory(),
        children: stat.isDirectory() ? await readDirectory(fullPath) : [],
        content: stat.isDirectory() ? undefined : fs.readFileSync(fullPath, 'utf-8'),
      });
    }
    return result;
  } catch {
    return [];
  }
}

ipcMain.handle('save-file', async (event, filePath: string, content: string) => {
  try {
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  } catch (error) {
    console.error('Error saving file:', error);
    return false;
  }
});

ipcMain.handle('create-file', async (event, dirPath: string, fileName: string) => {
  try {
    const fullPath = path.join(dirPath, fileName);
    fs.writeFileSync(fullPath, '', 'utf-8');
    return fullPath;
  } catch (error) {
    console.error('Error creating file:', error);
    return null;
  }
});

ipcMain.handle('create-folder', async (event, dirPath: string, folderName: string) => {
  try {
    const fullPath = path.join(dirPath, folderName);
    fs.mkdirSync(fullPath, { recursive: true });
    return fullPath;
  } catch (error) {
    console.error('Error creating folder:', error);
    return null;
  }
});

ipcMain.handle('delete-item', async (event, itemPath: string) => {
  try {
    const stat = fs.statSync(itemPath);
    if (stat.isDirectory()) {
      fs.rmdirSync(itemPath, { recursive: true });
    } else {
      fs.unlinkSync(itemPath);
    }
    return true;
  } catch (error) {
    console.error('Error deleting item:', error);
    return false;
  }
});

ipcMain.handle('rename-item', async (event, oldPath: string, newName: string) => {
  try {
    const dir = path.dirname(oldPath);
    const newPath = path.join(dir, newName);
    fs.renameSync(oldPath, newPath);
    return newPath;
  } catch (error) {
    console.error('Error renaming item:', error);
    return null;
  }
});

ipcMain.handle('duplicate-item', async (event, itemPath: string) => {
  try {
    const dir = path.dirname(itemPath);
    const name = path.basename(itemPath);
    const ext = path.extname(itemPath);
    const baseName = path.basename(name, ext);
    let newPath = path.join(dir, `${baseName}-copy${ext}`);
    let counter = 1;
    while (fs.existsSync(newPath)) {
      newPath = path.join(dir, `${baseName}-copy${counter}${ext}`);
      counter++;
    }
    fs.copyFileSync(itemPath, newPath);
    return newPath;
  } catch (error) {
    console.error('Error duplicating item:', error);
    return null;
  }
});

ipcMain.handle('read-file', async (event, filePath: string) => {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return content;
  } catch (error) {
    console.error('Error reading file:', error);
    return null;
  }
});

ipcMain.handle('get-recent-projects', () => {
  try {
    const configPath = path.join(app.getPath('userData'), 'recent-projects.json');
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf-8');
      return JSON.parse(data);
    }
    return [];
  } catch {
    return [];
  }
});

ipcMain.handle('save-recent-project', (event, projectPath: string) => {
  try {
    const configPath = path.join(app.getPath('userData'), 'recent-projects.json');
    let projects = [];
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf-8');
      projects = JSON.parse(data);
    }
    projects = projects.filter((p: string) => p !== projectPath);
    projects.unshift(projectPath);
    if (projects.length > 10) {
      projects = projects.slice(0, 10);
    }
    fs.writeFileSync(configPath, JSON.stringify(projects, null, 2));
  } catch (error) {
    console.error('Error saving recent project:', error);
  }
});

ipcMain.handle('get-app-path', () => {
  return app.getPath('userData');
});

ipcMain.handle('clipboard-write', (event, text: string) => {
  clipboard.writeText(text);
});

ipcMain.handle('clipboard-read', () => {
  return clipboard.readText();
});

ipcMain.handle('show-save-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow!, options);
  return result;
});

ipcMain.handle('show-open-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow!, options);
  return result;
});

ipcMain.handle('show-message-box', async (event, options) => {
  const result = await dialog.showMessageBox(mainWindow!, options);
  return result;
});

ipcMain.handle('get-theme', () => {
  return nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
});

ipcMain.handle('set-theme', (event, theme: string) => {
  nativeTheme.themeSource = theme;
});

ipcMain.handle('execute-command', (event, command: string) => {
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing command: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  });
});

ipcMain.handle('get-git-status', async (event, repoPath: string) => {
  return {
    branch: 'main',
    changes: [
      { file: 'index.html', status: 'modified' },
      { file: 'style.css', status: 'modified' },
    ],
  };
});

ipcMain.handle('git-commit', async (event, repoPath: string, message: string) => {
  return { success: true };
});

ipcMain.handle('git-branch', async (event, repoPath: string, branch: string) => {
  return { success: true };
});