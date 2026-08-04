import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, FileText, Folder, GitBranch, Settings, Terminal, Code2, Save, Undo, Redo } from 'lucide-react';

interface Command {
  id: string;
  label: string;
  shortcut?: string;
  icon: React.ElementType;
  action: () => void;
  category: 'file' | 'edit' | 'view' | 'go' | 'run' | 'help';
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: Command[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  commands,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cmd.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setSearchTerm('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: -20 }}
          className="bg-[#2d2d2d] rounded-lg shadow-2xl w-full max-w-2xl border border-[#3c3c3c] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center px-4 border-b border-[#3c3c3c]">
            <Search size={16} className="text-[#858585]" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Type a command..."
              className="flex-1 px-3 py-3 bg-transparent text-white text-sm focus:outline-none"
            />
            <button onClick={onClose} className="p-1 hover:bg-[#3c3c3c] rounded transition-colors">
              <X size={16} className="text-[#858585]" />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto py-2">
            {filteredCommands.length === 0 ? (
              <div className="px-4 py-8 text-center text-[#858585] text-sm">
                No matching commands found
              </div>
            ) : (
              filteredCommands.map((cmd, index) => {
                const Icon = cmd.icon;
                return (
                  <div
                    key={cmd.id}
                    className={`flex items-center justify-between px-4 py-2 cursor-pointer transition-colors ${
                      index === selectedIndex ? 'bg-[#0e639c] text-white' : 'hover:bg-[#3c3c3c]'
                    }`}
                    onClick={() => {
                      cmd.action();
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={16} />
                      <span className="text-sm">{cmd.label}</span>
                    </div>
                    {cmd.shortcut && (
                      <span className="text-xs text-[#858585]">{cmd.shortcut}</span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};