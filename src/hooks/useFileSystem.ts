import { useState, useCallback, useEffect } from 'react';
import type { FileNode } from '../types';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export const useFileSystem = () => {
  const [rootPath, setRootPath] = useState<string | null>(null);
  const [files, setFiles] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [recentProjects, setRecentProjects] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dirHandle, setDirHandle] = useState<any>(null);

  useEffect(() => {
    loadRecentProjects();
  }, []);

  const loadRecentProjects = useCallback(async () => {
    try {
      const stored = localStorage.getItem('recent-projects');
      if (stored) {
        setRecentProjects(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading recent projects:', error);
    }
  }, []);

  const saveRecentProject = useCallback((projectPath: string) => {
    try {
      const updated = [projectPath, ...recentProjects.filter(p => p !== projectPath)].slice(0, 10);
      setRecentProjects(updated);
      localStorage.setItem('recent-projects', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving recent project:', error);
    }
  }, [recentProjects]);

  // ===== BACA FILE DENGAN KONTEN =====
  const readFileContent = useCallback(async (fileHandle: any): Promise<string> => {
    try {
      const file = await fileHandle.getFile();
      return await file.text();
    } catch (error) {
      console.error('Error reading file content:', error);
      return '';
    }
  }, []);

  // ===== READ DIRECTORY DENGAN KONTEN FILE =====
  const readDirectoryRecursive = useCallback(async (handle: any, path: string = ''): Promise<FileNode[]> => {
    const entries: FileNode[] = [];
    
    try {
      for await (const entry of handle.values()) {
        const isDirectory = entry.kind === 'directory';
        const entryPath = path ? `${path}/${entry.name}` : entry.name;
        
        let content = undefined;
        if (!isDirectory) {
          try {
            const file = await entry.getFile();
            content = await file.text();
          } catch (error) {
            console.error('Error reading file:', entry.name, error);
            content = '';
          }
        }
        
        const node: FileNode = {
          id: entryPath,
          name: entry.name,
          path: entryPath,
          isDirectory: isDirectory,
          children: isDirectory ? await readDirectoryRecursive(entry, entryPath) : [],
          content: content,
        };
        entries.push(node);
      }
    } catch (error) {
      console.error('Error reading directory:', error);
    }
    
    entries.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });
    
    return entries;
  }, []);

  const getCleanPath = useCallback((filePath: string): string => {
    if (!rootPath) return filePath;
    if (filePath.startsWith(rootPath)) {
      return filePath.substring(rootPath.length + 1);
    }
    return filePath;
  }, [rootPath]);

  // ===== REFRESH FILE TREE DENGAN KONTEN =====
  const refreshFileTree = useCallback(async () => {
    console.log('Refreshing file tree with content...');
    try {
      if (dirHandle) {
        const files = await readDirectoryRecursive(dirHandle);
        console.log('Refreshed files with content:', files.length);
        setFiles([...files]);
      }
    } catch (error) {
      console.error('Error refreshing files:', error);
    }
  }, [dirHandle, readDirectoryRecursive]);

  // ===== SAVE FILE CONTENT =====
  const saveFileContent = useCallback(async (filePath: string, content: string) => {
    console.log('Saving file:', filePath);
    console.log('dirHandle exists?', !!dirHandle);
    
    try {
      if (dirHandle) {
        let currentHandle = dirHandle;
        
        let cleanPath = filePath;
        if (rootPath && filePath.startsWith(rootPath)) {
          cleanPath = filePath.substring(rootPath.length + 1);
        }
        if (cleanPath.startsWith('/')) {
          cleanPath = cleanPath.substring(1);
        }
        
        console.log('Clean path:', cleanPath);
        const parts = cleanPath.split('/').filter(p => p);
        
        if (parts.length === 0) {
          console.error('Invalid file path:', filePath);
          return false;
        }
        
        const fileName = parts.pop()!;
        console.log('File name:', fileName);
        
        for (const part of parts) {
          try {
            currentHandle = await currentHandle.getDirectoryHandle(part);
          } catch (error) {
            try {
              currentHandle = await currentHandle.getDirectoryHandle(part, { create: true });
            } catch (createError) {
              console.error('Cannot create directory:', part, createError);
              return false;
            }
          }
        }
        
        try {
          let fileHandle;
          try {
            fileHandle = await currentHandle.getFileHandle(fileName);
          } catch {
            fileHandle = await currentHandle.getFileHandle(fileName, { create: true });
          }
          
          const writable = await fileHandle.createWritable();
          await writable.write(content);
          await writable.close();
          
          console.log('File saved successfully:', fileName);
          
          await refreshFileTree();
          
          return true;
        } catch (error) {
          console.error('Error saving file:', error);
          alert(`Error saving file: ${error}`);
          return false;
        }
      } else {
        console.warn('No directory handle available.');
        alert('Please open a folder first using "Open Folder" button.');
        return false;
      }
    } catch (error) {
      console.error('Error in saveFileContent:', error);
      alert(`Error saving file: ${error}`);
      return false;
    }
  }, [dirHandle, rootPath, refreshFileTree]);

  // ===== OPEN DIRECTORY =====
  const openDirectory = useCallback(async () => {
    console.log('Opening directory...');
    
    try {
      if ('showDirectoryPicker' in window) {
        try {
          const handle = await (window as any).showDirectoryPicker();
          console.log('Directory handle obtained:', handle.name);
          setDirHandle(handle);
          
          const files = await readDirectoryRecursive(handle);
          console.log('Files loaded with content:', files.length);
          setFiles(files);
          setRootPath(handle.name);
          
          saveRecentProject(handle.name);
          
          return true;
        } catch (error: any) {
          if (error.name === 'AbortError' || error.code === 20) {
            console.log('User cancelled folder selection');
          } else {
            console.error('Error with File System Access API:', error);
            alert(`Error opening folder: ${error.message}`);
          }
          return false;
        }
      } else {
        console.warn('File System Access API not available');
        alert('Please use Chrome browser (version 86+) with File System Access API support');
        return false;
      }
    } catch (error) {
      console.error('Error opening directory:', error);
      alert(`Error opening directory: ${error}`);
      return false;
    }
  }, [readDirectoryRecursive, saveRecentProject]);

  // ===== CREATE FILE =====
  const createFile = useCallback(async (parentPath: string, fileName: string) => {
    console.log('Creating file - parentPath:', parentPath, 'fileName:', fileName);
    
    try {
      if (dirHandle) {
        let currentHandle = dirHandle;
        const cleanParentPath = getCleanPath(parentPath);
        
        if (cleanParentPath && cleanParentPath !== '' && cleanParentPath !== rootPath) {
          const parts = cleanParentPath.split('/').filter(p => p);
          for (const part of parts) {
            try {
              currentHandle = await currentHandle.getDirectoryHandle(part);
            } catch (error) {
              console.error('Parent directory not found:', part, error);
              alert(`Directory not found: ${part}`);
              return null;
            }
          }
        }
        
        try {
          const fileHandle = await currentHandle.getFileHandle(fileName, { create: true });
          const writable = await fileHandle.createWritable();
          await writable.write('');
          await writable.close();
          
          console.log('File created successfully:', fileName);
          await refreshFileTree();
          return fileName;
        } catch (error) {
          console.error('Error creating file:', error);
          alert(`Error creating file: ${error}`);
          return null;
        }
      } else {
        alert('Please open a folder first using "Open Folder" button');
        return null;
      }
    } catch (error) {
      console.error('Error creating file:', error);
      alert(`Error creating file: ${error}`);
    }
    return null;
  }, [dirHandle, refreshFileTree, rootPath, getCleanPath]);

  // ===== CREATE FOLDER =====
  const createFolder = useCallback(async (parentPath: string, folderName: string) => {
    console.log('Creating folder - parentPath:', parentPath, 'folderName:', folderName);
    
    try {
      if (dirHandle) {
        let currentHandle = dirHandle;
        const cleanParentPath = getCleanPath(parentPath);
        
        if (cleanParentPath && cleanParentPath !== '' && cleanParentPath !== rootPath) {
          const parts = cleanParentPath.split('/').filter(p => p);
          for (const part of parts) {
            try {
              currentHandle = await currentHandle.getDirectoryHandle(part);
            } catch (error) {
              console.error('Parent directory not found:', part, error);
              alert(`Directory not found: ${part}`);
              return null;
            }
          }
        }
        
        try {
          await currentHandle.getDirectoryHandle(folderName, { create: true });
          console.log('Folder created successfully:', folderName);
          await refreshFileTree();
          return folderName;
        } catch (error) {
          console.error('Error creating folder:', error);
          alert(`Error creating folder: ${error}`);
          return null;
        }
      } else {
        alert('Please open a folder first using "Open Folder" button');
        return null;
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      alert(`Error creating folder: ${error}`);
    }
    return null;
  }, [dirHandle, refreshFileTree, rootPath, getCleanPath]);

  // ===== DELETE ITEM =====
  const deleteItem = useCallback(async (itemPath: string) => {
    console.log('Deleting item:', itemPath);
    
    try {
      if (dirHandle) {
        const cleanPath = getCleanPath(itemPath);
        const parts = cleanPath.split('/').filter(p => p);
        
        if (parts.length === 0) {
          alert('Cannot delete root folder');
          return false;
        }
        
        let currentHandle = dirHandle;
        const fileName = parts.pop()!;
        
        for (const part of parts) {
          try {
            currentHandle = await currentHandle.getDirectoryHandle(part);
          } catch {
            alert(`Directory not found: ${part}`);
            return false;
          }
        }
        
        try {
          await currentHandle.removeEntry(fileName, { recursive: true });
          console.log('Item deleted:', fileName);
          await refreshFileTree();
          return true;
        } catch (error) {
          console.error('Error deleting item:', error);
          alert(`Error deleting item: ${error}`);
          return false;
        }
      } else {
        alert('Please open a folder first');
        return false;
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert(`Error deleting item: ${error}`);
    }
    return false;
  }, [dirHandle, refreshFileTree, getCleanPath]);

  // ===== READ FILE =====
  const readFile = useCallback(async (filePath: string) => {
    console.log('Reading file:', filePath);
    
    try {
      if (dirHandle) {
        let currentHandle = dirHandle;
        const cleanPath = getCleanPath(filePath);
        const parts = cleanPath.split('/').filter(p => p);
        
        if (parts.length === 0) return null;
        
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          if (i === parts.length - 1) {
            try {
              const fileHandle = await currentHandle.getFileHandle(part);
              const file = await fileHandle.getFile();
              const content = await file.text();
              console.log('File content read, length:', content.length);
              return content;
            } catch (error) {
              console.error('Error getting file:', part, error);
              return null;
            }
          } else {
            try {
              currentHandle = await currentHandle.getDirectoryHandle(part);
            } catch (error) {
              console.error('Error getting directory:', part, error);
              return null;
            }
          }
        }
        return null;
      } else {
        alert('Please open a folder first');
        return null;
      }
    } catch (error) {
      console.error('Error reading file:', error);
    }
    return null;
  }, [dirHandle, getCleanPath]);

  const renameItem = useCallback(async (oldPath: string, newName: string) => {
    console.log('Renaming item:', oldPath, 'to:', newName);
    alert('Rename feature requires file system access. Please use your OS file manager.');
    return null;
  }, []);

  const duplicateItem = useCallback(async (itemPath: string) => {
    console.log('Duplicating item:', itemPath);
    alert('Duplicate feature requires file system access. Please use your OS file manager.');
    return null;
  }, []);

  const toggleFolder = useCallback((folderPath: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderPath)) {
        newSet.delete(folderPath);
      } else {
        newSet.add(folderPath);
      }
      return newSet;
    });
  }, []);

  const exportProject = useCallback(async () => {
    if (!rootPath) {
      alert('No project opened');
      return;
    }

    try {
      const zip = new JSZip();
      const addFilesToZip = async (files: FileNode[], basePath: string = '') => {
        for (const file of files) {
          if (file.isDirectory && file.children) {
            await addFilesToZip(file.children, `${basePath}${file.name}/`);
          } else {
            const content = await readFile(file.path);
            if (content !== null) {
              zip.file(`${basePath}${file.name}`, content);
            }
          }
        }
      };

      await addFilesToZip(files);
      const blob = await zip.generateAsync({ type: 'blob' });
      saveAs(blob, `${rootPath}.zip`);
    } catch (error) {
      console.error('Error exporting project:', error);
      alert(`Error exporting project: ${error}`);
    }
  }, [rootPath, files, readFile]);

  const importProject = useCallback(async (file: File) => {
    alert('Import project feature requires file system access. Please use your OS file manager.');
  }, []);

  return {
    rootPath,
    files,
    selectedFile,
    setSelectedFile,
    expandedFolders,
    recentProjects,
    isLoading,
    openDirectory,
    createFile,
    createFolder,
    deleteItem,
    renameItem,
    duplicateItem,
    readFile,
    saveFileContent,
    toggleFolder,
    exportProject,
    importProject,
    refreshFileTree,
    dirHandle,
  };
};