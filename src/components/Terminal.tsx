import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronUp, ChevronDown, Terminal as TerminalIcon } from 'lucide-react';

interface TerminalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Terminal: React.FC<TerminalProps> = ({ isOpen, onClose }) => {
  const [history, setHistory] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [height, setHeight] = useState(200);
  const [isResizing, setIsResizing] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleCommand = async (cmd: string) => {
    setHistory(prev => [...prev, `$ ${cmd}`]);
    
    if (cmd === 'clear') {
      setHistory([]);
      return;
    }

    try {
      const result = await window.electronAPI.executeCommand(cmd);
      setHistory(prev => [...prev, `> Command executed`]);
    } catch (error) {
      setHistory(prev => [...prev, `> Error: ${error}`]);
    }
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) {
      handleCommand(input.trim());
    }
  };

  const handleResize = (e: React.MouseEvent) => {
    const startY = e.clientY;
    const startHeight = height;

    const onMouseMove = (e: MouseEvent) => {
      const newHeight = startHeight - (e.clientY - startY);
      setHeight(Math.max(100, Math.min(400, newHeight)));
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      setIsResizing(false);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    setIsResizing(true);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="bg-[#1e1e1e] border-t border-[#3c3c3c] flex flex-col"
      style={{ height: `${height}px` }}
    >
      <div 
        className="h-1 cursor-ns-resize hover:bg-[#0e639c] transition-colors"
        onMouseDown={handleResize}
      />
      
      <div className="flex items-center justify-between px-3 h-8 border-b border-[#3c3c3c]">
        <div className="flex items-center gap-2">
          <TerminalIcon size={14} className="text-[#858585]" />
          <span className="text-xs text-[#cccccc]">Terminal</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-[#3c3c3c] rounded transition-colors">
          <X size={14} className="text-[#858585]" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 font-mono text-sm">
        {history.map((line, index) => (
          <div key={index} className="text-[#cccccc] whitespace-pre-wrap">
            {line}
          </div>
        ))}
        <div className="flex items-center gap-2 text-[#cccccc]">
          <span>$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-[#cccccc] font-mono text-sm"
            placeholder="Type a command..."
          />
        </div>
      </div>
    </div>
  );
};