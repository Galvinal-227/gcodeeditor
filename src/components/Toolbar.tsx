import React from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Square,
  Save,
  Search,
  RotateCcw,
  Maximize2,
  Minimize2,
  Plus,
  SplitSquareHorizontal,
  GitBranch,
  Settings,
} from 'lucide-react';

interface ToolbarProps {
  onRun: () => void;
  onStop: () => void;
  onSave: () => void;
  onSaveAll: () => void;
  onSearch: () => void;
  onRefresh: () => void;
  onFullscreen: () => void;
  onSplitEditor: () => void;
  onNewFile: () => void;
  onToggleGit: () => void;
  onToggleSettings: () => void;
  isRunning: boolean;
  isFullscreen: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onRun,
  onStop,
  onSave,
  onSaveAll,
  onSearch,
  onRefresh,
  onFullscreen,
  onSplitEditor,
  onNewFile,
  onToggleGit,
  onToggleSettings,
  isRunning,
  isFullscreen,
}) => {
  return (
    <div className="h-10 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] flex items-center px-3 gap-1 flex-shrink-0">
      {/* Run Button */}
      <div className="flex items-center gap-1">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRun}
          className={`px-3 py-1 rounded flex items-center gap-2 text-sm font-medium transition-colors ${
            isRunning
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
              : 'bg-[var(--accent-color)] text-white hover:bg-[var(--accent-hover)]'
          }`}
        >
          {isRunning ? (
            <>
              <Square size={14} />
              Stop
            </>
          ) : (
            <>
              <Play size={14} />
              Run
            </>
          )}
        </motion.button>
      </div>

      <div className="w-px h-6 bg-[var(--border-color)] mx-2" />

      {/* File Operations */}
      <div className="flex items-center gap-1">
        <ToolbarButton icon={Plus} onClick={onNewFile} label="New File" />
        <ToolbarButton icon={Save} onClick={onSave} label="Save" />
        <ToolbarButton icon={Save} onClick={onSaveAll} label="Save All" />
      </div>

      <div className="w-px h-6 bg-[var(--border-color)] mx-2" />

      {/* View Operations */}
      <div className="flex items-center gap-1">
        <ToolbarButton icon={Search} onClick={onSearch} label="Search" />
        <ToolbarButton icon={RotateCcw} onClick={onRefresh} label="Refresh" />
        <ToolbarButton 
          icon={isFullscreen ? Minimize2 : Maximize2} 
          onClick={onFullscreen} 
          label="Fullscreen" 
        />
        <ToolbarButton icon={SplitSquareHorizontal} onClick={onSplitEditor} label="Split Editor" />
      </div>

      <div className="w-px h-6 bg-[var(--border-color)] mx-2" />

      {/* Git & Settings */}
      <div className="flex items-center gap-1">
        <ToolbarButton icon={GitBranch} onClick={onToggleGit} label="Source Control" />
        <ToolbarButton icon={Settings} onClick={onToggleSettings} label="Settings" />
      </div>

      <div className="flex-1" />

      <div className="text-xs text-[var(--text-secondary)]">
        Ready
      </div>
    </div>
  );
};

interface ToolbarButtonProps {
  icon: React.ElementType;
  onClick: () => void;
  disabled?: boolean;
  label: string;
  active?: boolean;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  icon: Icon,
  onClick,
  disabled = false,
  label,
  active = false,
}) => {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`p-1.5 rounded transition-colors ${
        disabled
          ? 'text-[var(--text-secondary)] cursor-not-allowed opacity-50'
          : active
          ? 'text-white bg-[var(--accent-color)]'
          : 'text-[var(--text-primary)] hover:text-white hover:bg-[var(--bg-hover)]'
      }`}
      title={label}
    >
      <Icon size={16} />
    </motion.button>
  );
};
