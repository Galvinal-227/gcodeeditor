import { useState, useCallback } from 'react';
import { useEditorStore } from '../renderer/store/editorStore';

export const useEditor = () => {
  const {
    tabs,
    activeTabId,
    files,
    currentProject,
    addTab,
    removeTab,
    setActiveTab,
    updateTabContent,
    setTabDirty,
    closeAllTabs,
    getActiveTab,
    setFiles,
    setCurrentProject,
  } = useEditorStore();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [isReplaceOpen, setIsReplaceOpen] = useState(false);

  const openFile = useCallback((filePath: string, fileName: string, content: string, language: string) => {
    addTab(filePath, fileName, content, language);
  }, [addTab]);

  const closeFile = useCallback((tabId: string) => {
    removeTab(tabId);
  }, [removeTab]);

  const switchTab = useCallback((tabId: string) => {
    setActiveTab(tabId);
  }, [setActiveTab]);

  const updateContent = useCallback((tabId: string, content: string) => {
    updateTabContent(tabId, content);
  }, [updateTabContent]);

  // PERBAIKI FUNGSI SAVE - menerima parameter saveFileContent dari luar
  const saveContent = useCallback(async (tabId: string, saveFileFn?: (filePath: string, content: string) => Promise<boolean>) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return false;

    console.log('Saving tab:', tab.fileName, 'content length:', tab.content.length);

    try {
      // Jika ada fungsi saveFile, gunakan untuk menyimpan ke filesystem
      if (saveFileFn) {
        const result = await saveFileFn(tab.filePath, tab.content);
        if (result) {
          setTabDirty(tabId, false);
          console.log('File saved successfully to filesystem');
          return true;
        } else {
          console.error('Failed to save to filesystem');
          return false;
        }
      } else {
        // Fallback: download file
        console.warn('No save function provided, downloading file');
        const blob = new Blob([tab.content], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = tab.fileName;
        link.click();
        URL.revokeObjectURL(link.href);
        setTabDirty(tabId, false);
        return true;
      }
    } catch (error) {
      console.error('Error saving file:', error);
      alert(`Error saving file: ${error}`);
      return false;
    }
  }, [tabs, setTabDirty]);

  const getFileLanguage = useCallback((fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'js':
      case 'javascript':
        return 'javascript';
      default:
        return 'plaintext';
    }
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setIsSearchOpen(true);
  }, []);

  const handleReplace = useCallback((query: string, replace: string) => {
    setSearchQuery(query);
    setReplaceQuery(replace);
    setIsReplaceOpen(true);
    setIsSearchOpen(true);
  }, []);

  return {
    tabs,
    activeTabId,
    files,
    currentProject,
    openFile,
    closeFile,
    switchTab,
    updateContent,
    saveContent,
    closeAllTabs,
    getActiveTab,
    setFiles,
    setCurrentProject,
    getFileLanguage,
    isSearchOpen,
    setIsSearchOpen,
    searchQuery,
    setSearchQuery,
    replaceQuery,
    setReplaceQuery,
    isReplaceOpen,
    setIsReplaceOpen,
    handleSearch,
    handleReplace,
  };
};