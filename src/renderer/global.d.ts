export {};

declare global {
  interface Window {
    electronAPI: {
      openDirectory: () => Promise<string>;
      saveFile: (fileName: string, content: string) => Promise<string | null>;
      openFile: () => Promise<{ path: string; content: string } | null>;
      readDirectory: (path: string) => Promise<any[]>;
      saveFileContent: (filePath: string, content: string) => Promise<boolean>;
      createFile: (dirPath: string, fileName: string) => Promise<string | null>;
      createFolder: (dirPath: string, folderName: string) => Promise<string | null>;
      deleteItem: (itemPath: string) => Promise<boolean>;
      renameItem: (oldPath: string, newName: string) => Promise<string | null>;
      duplicateItem: (itemPath: string) => Promise<string | null>;
      readFile: (filePath: string) => Promise<string | null>;
      getRecentProjects: () => Promise<string[]>;
      saveRecentProject: (projectPath: string) => Promise<void>;
      getAppPath: () => Promise<string>;
      clipboardWrite: (text: string) => Promise<void>;
      clipboardRead: () => Promise<string>;
      showSaveDialog: (options: any) => Promise<any>;
      showOpenDialog: (options: any) => Promise<any>;
      showMessageBox: (options: any) => Promise<any>;
      getTheme: () => Promise<string>;
      setTheme: (theme: string) => Promise<void>;
      getGitStatus: (repoPath: string) => Promise<any>;
      gitCommit: (repoPath: string, message: string) => Promise<any>;
      gitBranch: (repoPath: string, branch: string) => Promise<any>;
      executeCommand: (command: string) => Promise<void>;
      onMenuNewFile: (callback: () => void) => void;
      onMenuNewFolder: (callback: () => void) => void;
      onMenuOpenFolder: (callback: (event: any, path: string) => void) => void;
      onMenuSave: (callback: () => void) => void;
      onMenuSaveAs: (callback: () => void) => void;
      onMenuSaveAll: (callback: () => void) => void;
      onMenuAutoSave: (callback: (event: any, enabled: boolean) => void) => void;
      onMenuCommandPalette: (callback: () => void) => void;
      onMenuToggleExplorer: (callback: () => void) => void;
      onMenuToggleSearch: (callback: () => void) => void;
      onMenuToggleGit: (callback: () => void) => void;
      onMenuToggleExtensions: (callback: () => void) => void;
      onMenuToggleTerminal: (callback: () => void) => void;
      onMenuToggleProblems: (callback: () => void) => void;
      onMenuToggleOutput: (callback: () => void) => void;
      onMenuZoomIn: (callback: () => void) => void;
      onMenuZoomOut: (callback: () => void) => void;
      onMenuZoomReset: (callback: () => void) => void;
      onMenuGoToFile: (callback: () => void) => void;
      onMenuGoToSymbol: (callback: () => void) => void;
      onMenuGoToLine: (callback: () => void) => void;
      onMenuRun: (callback: () => void) => void;
      onMenuStop: (callback: () => void) => void;
      onMenuRestart: (callback: () => void) => void;
    };
  }
}