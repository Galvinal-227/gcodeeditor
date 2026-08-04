import React, { useState, useEffect } from 'react';
import { Search, X, FileText, ChevronRight, Replace, ChevronDown, ChevronUp } from 'lucide-react';
import type { FileNode, Tab } from '../types';

interface SearchPanelProps {
  files: FileNode[];
  tabs: Tab[];
  onFileSelect: (filePath: string) => void;
  onClose: () => void;
  onReplace?: (filePath: string, search: string, replace: string) => void;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({
  files,
  tabs,
  onFileSelect,
  onClose,
  onReplace,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [showReplace, setShowReplace] = useState(false);
  const [searchResults, setSearchResults] = useState<{ file: FileNode; matches: string[]; lineNumbers: number[] }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());

  const getAllFiles = (nodes: FileNode[]): FileNode[] => {
    let result: FileNode[] = [];
    for (const node of nodes) {
      if (!node.isDirectory) {
        result.push(node);
      } else if (node.children) {
        result = result.concat(getAllFiles(node.children));
      }
    }
    return result;
  };

  const searchFiles = async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const results: { file: FileNode; matches: string[]; lineNumbers: number[] }[] = [];
    const allFiles = getAllFiles(files);

    for (const file of allFiles) {
      try {
        // Try to get content from tabs first
        let content = '';
        const tab = tabs.find(t => t.filePath === file.path);
        if (tab) {
          content = tab.content;
        } else if (file.content) {
          content = file.content;
        }

        if (content) {
          const lines = content.split('\n');
          const matches: string[] = [];
          const lineNumbers: number[] = [];
          lines.forEach((line, index) => {
            if (line.toLowerCase().includes(term.toLowerCase())) {
              matches.push(line.trim());
              lineNumbers.push(index + 1);
            }
          });
          if (matches.length > 0) {
            results.push({ file, matches, lineNumbers });
          }
        }
      } catch (error) {
        console.error('Error searching file:', file.path, error);
      }
    }

    setSearchResults(results);
    setIsSearching(false);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.length >= 2) {
      searchFiles(term);
    } else {
      setSearchResults([]);
    }
  };

  const handleReplaceAll = () => {
    if (!searchTerm || !replaceTerm) return;
    searchResults.forEach(({ file }) => {
      const tab = tabs.find(t => t.filePath === file.path);
      if (tab && onReplace) {
        onReplace(file.path, searchTerm, replaceTerm);
      }
    });
  };

  const toggleExpand = (filePath: string) => {
    setExpandedResults(prev => {
      const newSet = new Set(prev);
      if (newSet.has(filePath)) {
        newSet.delete(filePath);
      } else {
        newSet.add(filePath);
      }
      return newSet;
    });
  };

  return (
    <div className="h-full bg-[#252526] flex flex-col">
      <div className="flex items-center justify-between px-3 h-9 border-b border-[#3c3c3c]">
        <span className="text-sm font-medium text-[#cccccc]">Search</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowReplace(!showReplace)}
            className={`p-1 rounded transition-colors ${showReplace ? 'bg-[#0e639c] text-white' : 'text-[#858585] hover:text-white hover:bg-[#3c3c3c]'}`}
            title="Toggle Replace"
          >
            <Replace size={14} />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[#3c3c3c] transition-colors"
          >
            <X size={16} className="text-[#858585]" />
          </button>
        </div>
      </div>

      <div className="p-3 space-y-2">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#858585]" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search files..."
            className="w-full pl-9 pr-3 py-2 bg-[#1e1e1e] border border-[#3c3c3c] rounded text-white text-sm focus:outline-none focus:border-[#0e639c]"
            autoFocus
          />
          {searchTerm && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#858585]">
              {searchResults.length} results
            </span>
          )}
        </div>

        {showReplace && (
          <div className="relative">
            <Replace size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#858585]" />
            <input
              type="text"
              value={replaceTerm}
              onChange={e => setReplaceTerm(e.target.value)}
              placeholder="Replace with..."
              className="w-full pl-9 pr-3 py-2 bg-[#1e1e1e] border border-[#3c3c3c] rounded text-white text-sm focus:outline-none focus:border-[#0e639c]"
            />
            <button
              onClick={handleReplaceAll}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-[#0e639c] text-white text-xs rounded hover:bg-[#1177bb] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!searchTerm || !replaceTerm || searchResults.length === 0}
            >
              Replace All
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {isSearching && (
          <div className="flex items-center justify-center py-8">
            <div className="spinner"></div>
          </div>
        )}

        {!isSearching && searchTerm && searchResults.length === 0 && (
          <div className="text-center py-8 text-[#858585] text-sm">
            <FileText size={32} className="mx-auto mb-2 opacity-50" />
            <p>No results found</p>
          </div>
        )}

        {searchResults.map(({ file, matches, lineNumbers }) => {
          const isExpanded = expandedResults.has(file.path);
          return (
            <div key={file.path} className="border-b border-[#3c3c3c]">
              <div
                className="flex items-center gap-2 px-3 py-2 hover:bg-[#2a2d2e] cursor-pointer transition-colors"
                onClick={() => toggleExpand(file.path)}
              >
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <FileText size={14} className="text-[#858585]" />
                <span className="text-sm text-[#cccccc] flex-1 truncate">{file.name}</span>
                <span className="text-xs text-[#858585]">{matches.length} matches</span>
              </div>
              {isExpanded && matches.map((match, idx) => (
                <div
                  key={idx}
                  className="pl-8 pr-3 py-1 hover:bg-[#2a2d2e] cursor-pointer transition-colors"
                  onClick={() => onFileSelect(file.path)}
                >
                  <div className="text-xs text-[#858585]">Line {lineNumbers[idx]}</div>
                  <div className="text-sm text-[#cccccc] font-mono truncate">
                    {match}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};