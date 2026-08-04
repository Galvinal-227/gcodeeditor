import React, { useState, useEffect } from 'react';
import { X, GitBranch, GitCommit, GitPullRequest, Plus, Check, Circle, RefreshCw } from 'lucide-react';
import type { FileNode } from '../types';

interface GitPanelProps {
  onClose: () => void;
  files?: FileNode[];
  rootPath?: string | null;
}

interface GitChange {
  file: string;
  status: 'modified' | 'untracked' | 'deleted' | 'staged';
}

export const GitPanel: React.FC<GitPanelProps> = ({ onClose, files = [], rootPath = null }) => {
  const [changes, setChanges] = useState<GitChange[]>([]);
  const [branchName, setBranchName] = useState('main');
  const [isLoading, setIsLoading] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');
  const [showCommitInput, setShowCommitInput] = useState(false);

  // Simulasi deteksi perubahan file
  useEffect(() => {
    if (files.length > 0) {
      detectChanges();
    }
  }, [files]);

  const detectChanges = () => {
    // Simulasi: anggap semua file di folder adalah tracked
    const mockChanges: GitChange[] = files
      .filter(f => !f.isDirectory)
      .map(f => ({
        file: f.name,
        status: Math.random() > 0.5 ? 'modified' : 'untracked'
      }));
    
    setChanges(mockChanges);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      detectChanges();
      setIsLoading(false);
    }, 500);
  };

  const handleStageAll = () => {
    setChanges(prev => prev.map(c => ({ ...c, status: 'staged' as const })));
  };

  const handleCommit = () => {
    if (!commitMessage.trim()) {
      alert('Please enter a commit message');
      return;
    }
    
    // Simulasi commit
    const stagedChanges = changes.filter(c => c.status === 'staged');
    if (stagedChanges.length === 0) {
      alert('No staged changes to commit');
      return;
    }

    // Hapus perubahan yang sudah di-commit
    const remainingChanges = changes.filter(c => c.status !== 'staged');
    setChanges(remainingChanges);
    setCommitMessage('');
    setShowCommitInput(false);
    
    // Tampilkan notifikasi
    alert(` Committed ${stagedChanges.length} file(s): "${commitMessage}"`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'modified':
        return 'text-yellow-400';
      case 'untracked':
        return 'text-green-400';
      case 'deleted':
        return 'text-red-400';
      case 'staged':
        return 'text-blue-400';
      default:
        return 'text-[#858585]';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'modified':
        return <Circle size={10} className="text-yellow-400 fill-yellow-400" />;
      case 'untracked':
        return <Plus size={10} className="text-green-400" />;
      case 'deleted':
        return <X size={10} className="text-red-400" />;
      case 'staged':
        return <Check size={10} className="text-blue-400" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'modified':
        return 'M';
      case 'untracked':
        return 'U';
      case 'deleted':
        return 'D';
      case 'staged':
        return 'S';
      default:
        return '?';
    }
  };

  const stagedCount = changes.filter(c => c.status === 'staged').length;
  const unstagedCount = changes.filter(c => c.status !== 'staged').length;

  return (
    <div className="h-full bg-[#252526] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 h-9 border-b border-[#3c3c3c] flex-shrink-0">
        <span className="text-sm font-medium text-[#cccccc]">Source Control</span>
        <div className="flex items-center gap-1">
          <button
            onClick={handleRefresh}
            className="p-1 rounded hover:bg-[#3c3c3c] transition-colors"
            title="Refresh"
          >
            <RefreshCw size={14} className={`text-[#858585] ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[#3c3c3c] transition-colors"
          >
            <X size={16} className="text-[#858585]" />
          </button>
        </div>
      </div>

      {/* Branch Info */}
      <div className="p-3 flex-shrink-0">
        <div className="flex items-center gap-2 bg-[#1e1e1e] rounded p-2 border border-[#3c3c3c]">
          <GitBranch size={16} className="text-[#858585]" />
          <span className="text-sm text-[#cccccc]">{branchName}</span>
          <span className="text-xs text-[#858585] ml-auto">
            {changes.length > 0 ? `${unstagedCount} unstaged` : 'clean'}
          </span>
        </div>
      </div>

      {/* Changes List */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#858585]">
              Changes ({changes.length})
              {stagedCount > 0 && ` (${stagedCount} staged)`}
            </span>
            {unstagedCount > 0 && (
              <button 
                onClick={handleStageAll}
                className="text-xs text-[#0e639c] hover:text-[#1177bb] transition-colors"
              >
                Stage All
              </button>
            )}
          </div>

          {changes.length === 0 ? (
            <div className="text-center py-8 text-[#858585] text-sm">
              <Check size={32} className="mx-auto mb-2 opacity-50" />
              <p>No changes</p>
              <p className="text-xs">Working tree clean</p>
            </div>
          ) : (
            changes.map((change, index) => (
              <div
                key={index}
                className="flex items-center gap-2 py-1.5 hover:bg-[#2a2d2e] px-2 rounded cursor-pointer transition-colors group"
              >
                <span className="w-4 text-center text-xs font-bold text-[#858585]">
                  {getStatusLabel(change.status)}
                </span>
                {getStatusIcon(change.status)}
                <span className={`text-sm ${getStatusColor(change.status)}`}>
                  {change.file}
                </span>
                {change.status === 'staged' && (
                  <span className="text-xs text-blue-400 ml-auto">staged</span>
                )}
              </div>
            ))
          )}
        </div>

        {/* Commit Section */}
        {changes.length > 0 && (
          <div className="border-t border-[#3c3c3c] mt-4 pt-3 px-3">
            {showCommitInput ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  placeholder="Commit message..."
                  className="w-full px-3 py-2 bg-[#1e1e1e] border border-[#3c3c3c] rounded text-white text-sm focus:outline-none focus:border-[#0e639c]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCommit();
                    if (e.key === 'Escape') {
                      setShowCommitInput(false);
                      setCommitMessage('');
                    }
                  }}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCommit}
                    className="flex-1 py-1.5 bg-[#0e639c] text-white text-sm rounded hover:bg-[#1177bb] transition-colors"
                    disabled={stagedCount === 0}
                  >
                    Commit
                  </button>
                  <button
                    onClick={() => {
                      setShowCommitInput(false);
                      setCommitMessage('');
                    }}
                    className="px-3 py-1.5 bg-[#3c3c3c] text-[#cccccc] text-sm rounded hover:bg-[#4a4a4a] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
                {stagedCount === 0 && (
                  <p className="text-xs text-[#858585]">Stage files first before committing</p>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 text-xs text-[#858585]">
                <button 
                  onClick={() => setShowCommitInput(true)}
                  className="hover:text-white transition-colors flex items-center gap-1"
                  disabled={unstagedCount === 0 && stagedCount === 0}
                >
                  <GitCommit size={14} />
                  Commit
                </button>
                <button className="hover:text-white transition-colors flex items-center gap-1">
                  <GitPullRequest size={14} />
                  Pull
                </button>
                <button className="hover:text-white transition-colors flex items-center gap-1">
                  <GitBranch size={14} />
                  Branch
                </button>
                <button className="hover:text-white transition-colors flex items-center gap-1 ml-auto text-[#0e639c]">
                  <RefreshCw size={12} />
                  Sync
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {rootPath && (
        <div className="border-t border-[#3c3c3c] px-3 py-1.5 flex-shrink-0">
          <span className="text-xs text-[#858585] truncate">
            📁 {rootPath}
          </span>
        </div>
      )}
    </div>
  );
};