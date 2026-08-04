import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, File, Code, Palette, BracesIcon } from 'lucide-react';
import type { Tab } from '../types';

interface TabsProps {
  tabs: Tab[];
  activeTabId: string | null;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onTabDrag?: (fromId: string, toId: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTabId,
  onTabClick,
  onTabClose,
  onTabDrag,
}) => {
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'html':
        return <Code size={14} className="text-[#e34c26]" />;
      case 'css':
        return <Palette size={14} className="text-[#264de4]" />;
      case 'js':
      case 'javascript':
        return <BracesIcon size={14} className="text-[#f7df1e]" />;
      default:
        return <File size={14} className="text-[var(--text-secondary)]" />;
    }
  };

  return (
    <div className="flex items-center h-9 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] overflow-x-auto flex-shrink-0">
      <AnimatePresence>
        {tabs.map((tab) => (
          <motion.div
            key={tab.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.15 }}
            draggable
            onDragStart={(e) => e.dataTransfer.setData('tabId', tab.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const fromId = e.dataTransfer.getData('tabId');
              if (onTabDrag && fromId !== tab.id) {
                onTabDrag(fromId, tab.id);
              }
            }}
            onClick={() => onTabClick(tab.id)}
            className={`flex items-center px-3 h-full min-w-[120px] max-w-[200px] border-r border-[var(--border-color)] cursor-pointer transition-colors ${
              activeTabId === tab.id
                ? 'bg-[var(--bg-primary)] text-[var(--text-primary)]'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-hover)]'
            }`}
          >
            <span className="mr-2">{getFileIcon(tab.fileName)}</span>
            <span className="text-xs truncate flex-1">{tab.fileName}</span>
            {tab.isDirty && (
              <span className="ml-1 w-2 h-2 rounded-full bg-[var(--accent-color)]" />
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.id);
              }}
              className="ml-2 p-0.5 rounded hover:bg-[var(--bg-active)] transition-colors"
            >
              <X size={12} className="text-[var(--text-secondary)] hover:text-white" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};