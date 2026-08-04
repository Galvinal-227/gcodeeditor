import { create } from 'zustand';
import type { FileNode, FileSystemState } from '../types';

interface FileStore extends FileSystemState {
  setRootPath: (path: string | null) => void;
  setFiles: (files: FileNode[]) => void;
  setSelectedFile: (filePath: string | null) => void;
  toggleExpandedFolder: (folderPath: string) => void;
  setExpandedFolders: (folders: Set<string>) => void;
  setRecentProjects: (projects: string[]) => void;
  addRecentProject: (project: string) => void;
}

export const useFileStore = create<FileStore>((set, get) => ({
  rootPath: null,
  files: [],
  selectedFile: null,
  expandedFolders: new Set<string>(),
  recentProjects: [],

  setRootPath: (path: string | null) => {
    set({ rootPath: path });
  },

  setFiles: (files: FileNode[]) => {
    set({ files });
  },

  setSelectedFile: (filePath: string | null) => {
    set({ selectedFile: filePath });
  },

  toggleExpandedFolder: (folderPath: string) => {
    const { expandedFolders } = get();
    const newSet = new Set(expandedFolders);
    if (newSet.has(folderPath)) {
      newSet.delete(folderPath);
    } else {
      newSet.add(folderPath);
    }
    set({ expandedFolders: newSet });
  },

  setExpandedFolders: (folders: Set<string>) => {
    set({ expandedFolders: folders });
  },

  setRecentProjects: (projects: string[]) => {
    set({ recentProjects: projects });
  },

  addRecentProject: (project: string) => {
    const { recentProjects } = get();
    const filtered = recentProjects.filter(p => p !== project);
    const updated = [project, ...filtered].slice(0, 10);
    set({ recentProjects: updated });
  },
}));