import React from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Square,
  Save,
  Undo2,
  Redo2,
  Search,
  RotateCcw,
  Maximize2,
  Minimize2,
  Plus,
  SplitSquareHorizontal,
  GitBranch,
  Settings,
  Copy,
  Scissors,
  Clipboard,
} from 'lucide-react';

interface ToolbarProps {
  onRun: () => void;
  onStop: () => void;
  onSave: () => void;
  onSaveAll: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onSearch: () => void;
  onRefresh: () => void;
  onFullscreen: () => void;
  onSplitEditor: () => void;
  onNewFile: () => void;
  onToggleGit: () => void;
  onToggleSettings: () => void;
  onCopy: () => void;
  onCut: () => void;
  onPaste: () => void;
  isRunning: boolean;
  canUndo: boolean;
  canRedo: boolean;
  isFullscreen: boolean;
  isTerminalOpen: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onRun,
  onStop,
  onSave,
  onSaveAll,
  onUndo,
  onRedo,
  onSearch,
  onRefresh,
  onFullscreen,
  onSplitEditor,
  onNewFile,
  onToggleGit,
  onToggleSettings,
  onCopy,
  onCut,
  onPaste,
  isRunning,
  canUndo,
  canRedo,
  isFullscreen,
  isTerminalOpen,
}) => {
  return (
    <div className="h-10 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] flex items-center px-3 gap-1 flex-shrink-0">
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

      <div className="flex items-center gap-1">
        <ToolbarButton icon={Save} onClick={onSave} label="Save" />
        <ToolbarButton icon={Save} onClick={onSaveAll} label="Save All" />
      </div>

      <div className="flex items-center gap-1">
        <ToolbarButton icon={Search} onClick={onSearch} label="Search" />
        <ToolbarButton 
          icon={isFullscreen ? Minimize2 : Maximize2} 
          onClick={onFullscreen} 
          label="Fullscreen" 
        />
      </div>

      <div className="w-px h-6 bg-[var(--border-color)] mx-2" />

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