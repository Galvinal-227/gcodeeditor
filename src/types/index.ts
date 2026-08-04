export interface FileNode {
  id: string;
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileNode[];
  content?: string;
}

export interface Tab {
  id: string;
  filePath: string;
  fileName: string;
  content: string;
  isDirty: boolean;
  language: string;
}

export interface EditorState {
  tabs: Tab[];
  activeTabId: string | null;
  files: FileNode[];
  currentProject: string | null;
}

export interface PreviewState {
  isOpen: boolean;
  html: string;
  css: string;
  javascript: string;
  isFullscreen: boolean;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  error: string | null;
}

export interface FileSystemState {
  rootPath: string | null;
  files: FileNode[];
  selectedFile: string | null;
  expandedFolders: Set<string>;
  recentProjects: string[];
}

export type DeviceType = 'desktop' | 'tablet' | 'mobile';

// Export semua types sebagai default export juga
export default {
  FileNode,
  Tab,
  EditorState,
  PreviewState,
  FileSystemState,
  DeviceType,
};