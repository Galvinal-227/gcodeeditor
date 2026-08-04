import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { EditorState, Tab, FileNode } from '../types';

interface EditorStore extends EditorState {
  addTab: (filePath: string, fileName: string, content: string, language: string) => void;
  removeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateTabContent: (tabId: string, content: string) => void;
  setTabDirty: (tabId: string, isDirty: boolean) => void;
  closeAllTabs: () => void;
  getActiveTab: () => Tab | undefined;
  setFiles: (files: FileNode[]) => void;
  setCurrentProject: (projectPath: string) => void;
  addFile: (file: FileNode) => void;
  removeFile: (filePath: string) => void;
  updateFile: (filePath: string, updates: Partial<FileNode>) => void;
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  tabs: [],
  activeTabId: null,
  files: [],
  currentProject: null,

  addTab: (filePath: string, fileName: string, content: string, language: string) => {
    const { tabs } = get();
    const existingTab = tabs.find(tab => tab.filePath === filePath);
    
    if (existingTab) {
      set({ activeTabId: existingTab.id });
      return;
    }

    const newTab: Tab = {
      id: uuidv4(),
      filePath,
      fileName,
      content,
      isDirty: false,
      language,
    };

    set(state => ({
      tabs: [...state.tabs, newTab],
      activeTabId: newTab.id,
    }));
  },

  removeTab: (tabId: string) => {
    const { tabs, activeTabId } = get();
    const tabIndex = tabs.findIndex(tab => tab.id === tabId);
    if (tabIndex === -1) return;

    const newTabs = tabs.filter(tab => tab.id !== tabId);
    let newActiveId = activeTabId;

    if (activeTabId === tabId) {
      if (newTabs.length > 0) {
        newActiveId = newTabs[Math.min(tabIndex, newTabs.length - 1)].id;
      } else {
        newActiveId = null;
      }
    }

    set({
      tabs: newTabs,
      activeTabId: newActiveId,
    });
  },

  setActiveTab: (tabId: string) => {
    set({ activeTabId: tabId });
  },

  updateTabContent: (tabId: string, content: string) => {
    set(state => ({
      tabs: state.tabs.map(tab =>
        tab.id === tabId ? { ...tab, content, isDirty: true } : tab
      ),
    }));
  },

  setTabDirty: (tabId: string, isDirty: boolean) => {
    set(state => ({
      tabs: state.tabs.map(tab =>
        tab.id === tabId ? { ...tab, isDirty } : tab
      ),
    }));
  },

  closeAllTabs: () => {
    set({ tabs: [], activeTabId: null });
  },

  getActiveTab: () => {
    const { tabs, activeTabId } = get();
    return tabs.find(tab => tab.id === activeTabId);
  },

  setFiles: (files: FileNode[]) => {
    set({ files });
  },

  setCurrentProject: (projectPath: string) => {
    set({ currentProject: projectPath });
  },

  addFile: (file: FileNode) => {
    set(state => ({
      files: [...state.files, file],
    }));
  },

  removeFile: (filePath: string) => {
    set(state => ({
      files: state.files.filter(file => file.path !== filePath),
    }));
  },

  updateFile: (filePath: string, updates: Partial<FileNode>) => {
    set(state => ({
      files: state.files.map(file =>
        file.path === filePath ? { ...file, ...updates } : file
      ),
    }));
  },
}));