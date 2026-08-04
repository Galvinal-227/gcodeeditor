import React from 'react';
import { GitBranch, Circle, CheckCircle, Settings } from 'lucide-react';

interface StatusBarProps {
  currentFile: string | null;
  language: string;
  lineCount: number;
  column: number;
  isDirty: boolean;
  isGitRepo: boolean;
  branchName?: string;
  problems?: number;
  onToggleProblems: () => void;
  onToggleSettings: () => void;
  isTerminalOpen: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  currentFile,
  language,
  lineCount,
  column,
  isDirty,
  isGitRepo,
  branchName = 'main',
  problems = 0,
  onToggleProblems,
  onToggleSettings,
  isTerminalOpen,
}) => {
  return (
    <div className="h-6 bg-[var(--status-bar)] flex items-center justify-between px-4 text-xs text-white flex-shrink-0">
      <div className="flex items-center gap-4">
        {isGitRepo && (
          <div className="flex items-center gap-2">
            <GitBranch size={12} />
            <span>{branchName}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          {isDirty ? (
            <Circle size={10} className="text-yellow-400 fill-yellow-400" />
          ) : (
            <CheckCircle size={10} className="text-green-400" />
          )}
          <span>{isDirty ? 'Unsaved' : 'Saved'}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onToggleProblems}
          className="flex items-center gap-1 hover:bg-[#1a6daa] px-2 py-0.5 rounded transition-colors"
        >
          {problems > 0 ? (
            <span className="text-red-400">●</span>
          ) : (
            <CheckCircle size={10} className="text-green-400" />
          )}
          <span>{problems > 0 ? `${problems} problems` : 'No problems'}</span>
        </button>

        {currentFile && (
          <>
            <span className="text-white/50">|</span>
            <span>{currentFile}</span>
          </>
        )}
        <span className="text-white/50">|</span>
        <span>{language || 'Plain Text'}</span>
        <span className="text-white/50">|</span>
        <span>Ln {lineCount}</span>
        <span>Col {column}</span>

        <button
          onClick={onToggleSettings}
          className="hover:bg-[#1a6daa] p-0.5 rounded transition-colors"
        >
          <Settings size={10} />
        </button>
      </div>
    </div>
  );
};