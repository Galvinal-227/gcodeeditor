import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FolderOpen,
  Plus,
  RefreshCw,
  Download,
  Upload,
  Folder,
} from 'lucide-react';
import { FileTree } from './FileTree';
import type { FileNode } from '../types';

interface ExplorerProps {
  files: FileNode[];
  selectedFile: string | null;
  expandedFolders: Set<string>;
  onFileSelect: (filePath: string) => void;
  onToggleFolder: (folderPath: string) => void;
  onCreateFile: (parentPath: string, fileName: string) => Promise<void>;
  onCreateFolder: (parentPath: string, folderName: string) => Promise<void>;
  onDelete: (filePath: string) => Promise<void>;
  onRename: (filePath: string, newName: string) => Promise<void>;
  onDuplicate: (filePath: string) => Promise<void>;
  onExport: () => void;
  onImport: () => void;
  onRefresh: () => void;
  rootPath: string | null;
}

export const Explorer: React.FC<ExplorerProps> = ({
  files,
  selectedFile,
  expandedFolders,
  onFileSelect,
  onToggleFolder,
  onCreateFile,
  onCreateFolder,
  onDelete,
  onRename,
  onDuplicate,
  onExport,
  onImport,
  onRefresh,
  rootPath,
}) => {
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [createType, setCreateType] = useState<'file' | 'folder'>('file');

  const handleCreate = async () => {
    if (!newItemName.trim()) {
      alert('Please enter a name for the file or folder');
      return;
    }
    
    if (!rootPath) {
      alert('Please open a folder first before creating files.\nClick the "Open Folder" button in the activity bar or explorer.');
      setShowCreateMenu(false);
      return;
    }
    
    try {
      const parentPath = rootPath;
      console.log('Creating in parentPath:', parentPath);
      
      if (createType === 'file') {
        await onCreateFile(parentPath, newItemName);
      } else {
        await onCreateFolder(parentPath, newItemName);
      }
      
      setNewItemName('');
      setShowCreateMenu(false);
    } catch (error) {
      console.error('Error creating:', error);
      alert(`Error creating ${createType}: ${error}`);
    }
  };

  return (
    <div className="h-full bg-[var(--bg-secondary)] flex flex-col border-r border-[var(--border-color)] relative">
      {/* Explorer Header */}
      <div className="flex items-center justify-between px-3 h-9 border-b border-[var(--border-color)] flex-shrink-0">
        <div className="flex items-center gap-2">
          <FolderOpen size={16} className="text-[var(--gold)]" />
          <span className="text-sm font-medium text-[var(--text-primary)]">Explorer</span>
          {rootPath && (
            <span className="text-xs text-[var(--text-secondary)] truncate max-w-[100px]">
              {rootPath.split('/').pop()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onRefresh}
            className="p-1 rounded hover:bg-[var(--bg-hover)] transition-colors"
            title="Refresh"
          >
            <RefreshCw size={14} className="text-[var(--text-secondary)]" />
          </button>
          <button
            onClick={() => setShowCreateMenu(true)}
            className="p-1 rounded hover:bg-[var(--bg-hover)] transition-colors"
            title="New File/Folder"
          >
            <Plus size={14} className="text-[var(--text-secondary)]" />
          </button>
          <button
            onClick={onExport}
            className="p-1 rounded hover:bg-[var(--bg-hover)] transition-colors"
            title="Export Project"
          >
            <Download size={14} className="text-[var(--text-secondary)]" />
          </button>
          <button
            onClick={onImport}
            className="p-1 rounded hover:bg-[var(--bg-hover)] transition-colors"
            title="Import Project"
          >
            <Upload size={14} className="text-[var(--text-secondary)]" />
          </button>
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-hidden">
        {rootPath ? (
          <FileTree
            files={files}
            selectedFile={selectedFile}
            expandedFolders={expandedFolders}
            onFileSelect={onFileSelect}
            onToggleFolder={onToggleFolder}
            onContextMenu={(e, file) => {}}
            onCreateFile={onCreateFile}
            onCreateFolder={onCreateFolder}
            onDelete={onDelete}
            onRename={onRename}
            onDuplicate={onDuplicate}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <Folder size={48} className="text-[var(--text-secondary)] mb-4 opacity-50" />
            <p className="text-[var(--text-secondary)] text-sm mb-2">No folder opened</p>
          </div>
        )}
      </div>

      {/* Create File/Folder Modal */}
      {showCreateMenu && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[var(--bg-tertiary)] rounded-lg p-6 w-96 border border-[var(--border-color)]"
          >
            <h3 className="text-white font-medium mb-4">Create New</h3>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setCreateType('file')}
                className={`flex-1 py-2 rounded text-sm transition-colors ${
                  createType === 'file'
                    ? 'bg-[var(--accent-color)] text-white'
                    : 'bg-[var(--bg-active)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                File
              </button>
              <button
                onClick={() => setCreateType('folder')}
                className={`flex-1 py-2 rounded text-sm transition-colors ${
                  createType === 'folder'
                    ? 'bg-[var(--accent-color)] text-white'
                    : 'bg-[var(--bg-active)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                Folder
              </button>
            </div>
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder={`Enter ${createType} name...`}
              className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded text-white text-sm focus:outline-none focus:border-[var(--accent-color)]"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate();
                if (e.key === 'Escape') {
                  setShowCreateMenu(false);
                  setNewItemName('');
                }
              }}
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleCreate}
                className="flex-1 py-2 bg-[var(--accent-color)] text-white rounded text-sm hover:bg-[var(--accent-hover)] transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowCreateMenu(false);
                  setNewItemName('');
                }}
                className="flex-1 py-2 bg-[var(--bg-active)] text-[var(--text-primary)] rounded text-sm hover:bg-[var(--bg-hover)] transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};