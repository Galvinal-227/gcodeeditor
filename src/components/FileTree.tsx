import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  File,
  Trash2,
  Pencil,
  Copy,
  FilePlus,
  FolderPlus,
} from 'lucide-react';
import type { FileNode } from '../types';

interface FileTreeProps {
  files: FileNode[];
  selectedFile: string | null;
  expandedFolders: Set<string>;
  onFileSelect: (filePath: string) => void;
  onToggleFolder: (folderPath: string) => void;
  onContextMenu: (e: React.MouseEvent, file: FileNode) => void;
  onCreateFile: (parentPath: string, fileName: string) => void;
  onCreateFolder: (parentPath: string, folderName: string) => void;
  onDelete: (filePath: string) => void;
  onRename: (filePath: string, newName: string) => void;
  onDuplicate: (filePath: string) => void;
}

const FileTreeItem: React.FC<{
  node: FileNode;
  level: number;
  selectedFile: string | null;
  expandedFolders: Set<string>;
  onFileSelect: (filePath: string) => void;
  onToggleFolder: (folderPath: string) => void;
  onContextMenu: (e: React.MouseEvent, file: FileNode) => void;
}> = ({
  node,
  level,
  selectedFile,
  expandedFolders,
  onFileSelect,
  onToggleFolder,
  onContextMenu,
}) => {
  const isExpanded = expandedFolders.has(node.path);
  const isSelected = selectedFile === node.path;

  const handleClick = () => {
    if (node.isDirectory) {
      onToggleFolder(node.path);
    } else {
      onFileSelect(node.path);
    }
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className={`flex items-center gap-1 px-2 py-1 rounded cursor-pointer transition-colors ${
          isSelected
            ? 'bg-[#0e639c] text-white'
            : 'hover:bg-[#2a2d2e] text-[#cccccc]'
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
        onContextMenu={(e) => onContextMenu(e, node)}
      >
        {node.isDirectory && (
          <span className="w-4 h-4 flex items-center justify-center">
            {isExpanded ? (
              <ChevronDown size={14} className="text-[#858585]" />
            ) : (
              <ChevronRight size={14} className="text-[#858585]" />
            )}
          </span>
        )}
        {node.isDirectory ? (
          isExpanded ? (
            <FolderOpen size={16} className="text-[#e8ab53]" />
          ) : (
            <Folder size={16} className="text-[#e8ab53]" />
          )
        ) : (
          <File size={16} className="text-[#858585]" />
        )}
        <span className="text-sm truncate">{node.name}</span>
      </motion.div>
      {node.isDirectory && isExpanded && node.children && (
        <AnimatePresence>
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {node.children.map((child) => (
              <FileTreeItem
                key={child.path}
                node={child}
                level={level + 1}
                selectedFile={selectedFile}
                expandedFolders={expandedFolders}
                onFileSelect={onFileSelect}
                onToggleFolder={onToggleFolder}
                onContextMenu={onContextMenu}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export const FileTree: React.FC<FileTreeProps> = ({
  files,
  selectedFile,
  expandedFolders,
  onFileSelect,
  onToggleFolder,
  onContextMenu,
  onCreateFile,
  onCreateFolder,
  onDelete,
  onRename,
  onDuplicate,
}) => {
  const [contextMenuFile, setContextMenuFile] = useState<FileNode | null>(null);
  const [contextMenuPosition, setContextMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleContextMenu = (e: React.MouseEvent, file: FileNode) => {
    e.preventDefault();
    setContextMenuFile(file);
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    onContextMenu(e, file);
  };

  const handleCloseContextMenu = () => {
    setContextMenuFile(null);
    setContextMenuPosition(null);
  };

  const handleAction = (action: () => void) => {
    action();
    handleCloseContextMenu();
  };

  return (
    <div className="h-full overflow-y-auto bg-[#252526]">
      <div className="p-2">
        {files.length === 0 ? (
          <div className="text-center py-8 text-[#858585] text-sm">
            <Folder size={32} className="mx-auto mb-2 opacity-50" />
            <p>No files yet</p>
          </div>
        ) : (
          files.map((file) => (
            <FileTreeItem
              key={file.path}
              node={file}
              level={0}
              selectedFile={selectedFile}
              expandedFolders={expandedFolders}
              onFileSelect={onFileSelect}
              onToggleFolder={onToggleFolder}
              onContextMenu={handleContextMenu}
            />
          ))
        )}
      </div>

      {/* Context Menu */}
      {contextMenuFile && contextMenuPosition && (
        <div
          className="fixed bg-[#2d2d2d] rounded-lg shadow-xl border border-[#3c3c3c] py-1 z-50 min-w-[180px]"
          style={{
            left: contextMenuPosition.x,
            top: contextMenuPosition.y,
          }}
          onMouseLeave={handleCloseContextMenu}
        >
          <button
            onClick={() => handleAction(() => {
              const fileName = prompt('Enter file name:');
              if (fileName) onCreateFile(contextMenuFile!.path, fileName);
            })}
            className="w-full px-4 py-2 text-sm text-[#cccccc] hover:bg-[#0e639c] hover:text-white flex items-center gap-2 transition-colors"
          >
            <FilePlus size={14} />
            New File
          </button>
          <button
            onClick={() => handleAction(() => {
              const folderName = prompt('Enter folder name:');
              if (folderName) onCreateFolder(contextMenuFile!.path, folderName);
            })}
            className="w-full px-4 py-2 text-sm text-[#cccccc] hover:bg-[#0e639c] hover:text-white flex items-center gap-2 transition-colors"
          >
            <FolderPlus size={14} />
            New Folder
          </button>
          {!contextMenuFile.isDirectory && (
            <>
              <div className="h-px bg-[#3c3c3c] my-1" />
              <button
                onClick={() => handleAction(() => onDuplicate(contextMenuFile!.path))}
                className="w-full px-4 py-2 text-sm text-[#cccccc] hover:bg-[#0e639c] hover:text-white flex items-center gap-2 transition-colors"
              >
                <Copy size={14} />
                Duplicate
              </button>
              <button
                onClick={() => handleAction(() => {
                  const newName = prompt('Enter new name:', contextMenuFile!.name);
                  if (newName && newName !== contextMenuFile!.name) {
                    onRename(contextMenuFile!.path, newName);
                  }
                })}
                className="w-full px-4 py-2 text-sm text-[#cccccc] hover:bg-[#0e639c] hover:text-white flex items-center gap-2 transition-colors"
                >
                <Pencil size={14} />
                Rename
              </button>
            </>
          )}
          <div className="h-px bg-[#3c3c3c] my-1" />
          <button
            onClick={() => handleAction(() => {
              if (confirm(`Are you sure you want to delete "${contextMenuFile!.name}"?`)) {
                onDelete(contextMenuFile!.path);
              }
            })}
            className="w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300 flex items-center gap-2 transition-colors"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};