import React from 'react';
import { motion } from 'framer-motion';
import {
  Files,
  Search,
  GitBranch,
  Settings,
  Code2,
  FolderOpen,
  Sparkles,
} from 'lucide-react';

interface ActivityBarProps {
  activeView: 'explorer' | 'search' | 'git' | 'settings' | 'ai';
  onViewChange: (view: 'explorer' | 'search' | 'git' | 'settings' | 'ai') => void;
  onTogglePreview: () => void;
  isPreviewOpen: boolean;
  onOpenFolder: () => void;
}

export const ActivityBar: React.FC<ActivityBarProps> = ({
  activeView,
  onViewChange,
  onTogglePreview,
  isPreviewOpen,
  onOpenFolder,
}) => {
  const items = [
    { id: 'explorer', icon: Files, label: 'Explorer' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'git', icon: GitBranch, label: 'Source Control' },
    { id: 'ai', icon: Sparkles, label: 'AI Assistant' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="w-12 bg-[var(--bg-secondary)] flex flex-col items-center py-2 border-r border-[var(--border-color)] flex-shrink-0">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeView === item.id;
        return (
          <motion.button
            key={item.id}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onViewChange(item.id as any)}
            className={`relative w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
              isActive
                ? 'text-white bg-[var(--bg-active)]'
                : 'text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-hover)]'
            }`}
            title={item.label}
          >
            <Icon size={20} />
            {isActive && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-[var(--accent-color)] rounded-r"
              />
            )}
          </motion.button>
        );
      })}

      <div className="flex-1" />

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onOpenFolder}
        className="w-10 h-10 flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-hover)] transition-colors"
        title="Open Folder"
      >
        <FolderOpen size={20} />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onTogglePreview}
        className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
          isPreviewOpen
            ? 'text-white bg-[var(--accent-color)]'
            : 'text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-hover)]'
        }`}
        title="Toggle Preview"
      >
        <Code2 size={20} />
      </motion.button>
    </div>
  );
};