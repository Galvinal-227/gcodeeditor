import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Send, 
  Sparkles, 
  Loader2, 
  Copy, 
  Check, 
  Code2,
  Bot,
  User,
  RefreshCw,
  Terminal,
  FilePlus,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import puterService from '../service/puter.service';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isCode?: boolean;
  codeBlocks?: { language: string; code: string }[];
}

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertCode?: (code: string) => void;
  onCreateFile?: (fileName: string, content: string) => Promise<void>;
  rootPath?: string | null;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ 
  isOpen, 
  onClose,
  onInsertCode,
  onCreateFile,
  rootPath
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isPuterEnvironment, setIsPuterEnvironment] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkEnvironment();
  }, []);

  const checkEnvironment = () => {
    // Cek apakah di environment Puter
    const isPuter = typeof window !== 'undefined' && !!(window as any).puter;
    setIsPuterEnvironment(isPuter);
    
    if (!isPuter) {
      setIsAvailable(false);
      setMessages([
        {
          id: 'not-puter',
          role: 'assistant',
          content: 'AI Assistant hanya tersedia di lingkungan Puter.\n\nUntuk menggunakan AI Assistant, silakan:\n1. Buka aplikasi di https://puter.com\n2. Login ke akun Puter Anda\n3. Buka aplikasi ini dari Puter Drive\n\nAI Assistant tidak tersedia di deployment Vercel/Netlify karena membutuhkan akses ke Puter SDK.',
          timestamp: new Date()
        }
      ]);
      return;
    }

    // Di Puter environment, cek login status
    try {
      const puter = (window as any).puter;
      if (puter && puter.auth) {
        // Coba cek user secara async
        puter.auth.getUser()
          .then((user: any) => {
            if (user) {
              setIsAvailable(true);
              setMessages([
                {
                  id: 'welcome',
                  role: 'assistant',
                  content: 'Hello! I am AetherCode, your AI coding assistant.\n\nI can help you with HTML, CSS, and JavaScript code.\n\nWhat can I help you with today?',
                  timestamp: new Date()
                }
              ]);
            } else {
              setIsAvailable(false);
              setMessages([
                {
                  id: 'login-required',
                  role: 'assistant',
                  content: 'Login Required\n\nTo use AI Assistant, you need to login to Puter first.\n\nClick the Login button below to continue.',
                  timestamp: new Date()
                }
              ]);
            }
          })
          .catch(() => {
            setIsAvailable(false);
            setMessages([
              {
                id: 'login-required',
                role: 'assistant',
                content: 'Login Required\n\nTo use AI Assistant, you need to login to Puter first.\n\nClick the Login button below to continue.',
                timestamp: new Date()
              }
            ]);
          });
      } else {
        setIsAvailable(false);
        setMessages([
          {
            id: 'login-required',
            role: 'assistant',
            content: 'Login Required\n\nTo use AI Assistant, you need to login to Puter first.\n\nClick the Login button below to continue.',
            timestamp: new Date()
          }
        ]);
      }
    } catch (error) {
      console.error('Error checking login status:', error);
      setIsAvailable(false);
    }
  };

  const handleLogin = async () => {
    try {
      const puter = (window as any).puter;
      if (puter && puter.auth) {
        await puter.auth.login();
        // Setelah login, reload status
        setTimeout(() => checkEnvironment(), 1500);
      } else {
        alert('Puter SDK not available. Please make sure you are running in Puter environment.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed or cancelled. Please try again.');
    }
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  };

  const extractCodeBlocks = (text: string): { language: string; code: string }[] => {
    const blocks: { language: string; code: string }[] = [];
    const regex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      blocks.push({
        language: match[1] || 'text',
        code: match[2].trim()
      });
    }
    return blocks;
  };

  const containsCode = (text: string): boolean => {
    return /```(\w+)?\n[\s\S]*?```/.test(text) || 
           /<[a-z][\s\S]*>/i.test(text) ||
           /{[\s\S]*}/.test(text);
  };

  const detectFileType = (code: string, language: string): string => {
    if (language === 'html' || code.includes('<!DOCTYPE html>') || code.includes('<html')) {
      return 'html';
    }
    if (language === 'css' || (code.includes('{') && code.includes('}') && code.includes('.'))) {
      return 'css';
    }
    if (language === 'javascript' || language === 'js' || code.includes('function') || code.includes('const') || code.includes('let')) {
      return 'js';
    }
    return 'txt';
  };

  const getDefaultFileName = (code: string, language: string): string => {
    const type = detectFileType(code, language);
    switch (type) {
      case 'html': return 'index.html';
      case 'css': return 'style.css';
      case 'js': return 'script.js';
      default: return 'code.txt';
    }
  };

  const handleCreateFileFromCode = async (code: string, language: string) => {
    if (!rootPath) {
      alert('Please open a folder first before creating files.\nClick the "Open Folder" button in the activity bar.');
      return;
    }

    if (!onCreateFile) {
      alert('Create file function not available');
      return;
    }

    const defaultName = getDefaultFileName(code, language);
    const name = prompt(`Enter file name:`, defaultName);
    if (!name) return;

    try {
      await onCreateFile(rootPath, name);
      alert(`File "${name}" created successfully! Open it from the explorer and paste the code.`);
    } catch (error) {
      console.error('Error creating file:', error);
      alert(`Error creating file: ${error}`);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || !isAvailable) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const assistantMessageId = generateId();
      let fullResponse = '';

      setMessages(prev => [
        ...prev,
        {
          id: assistantMessageId,
          role: 'assistant',
          content: '',
          timestamp: new Date()
        }
      ]);

      await puterService.sendMessageStream(
        userMessage.content,
        (chunk) => {
          fullResponse += chunk;
          setMessages(prev => 
            prev.map(msg => 
              msg.id === assistantMessageId 
                ? { ...msg, content: fullResponse }
                : msg
            )
          );
        },
        (result) => {
          setIsLoading(false);
          const codeBlocks = extractCodeBlocks(fullResponse);
          const hasCode = codeBlocks.length > 0 || containsCode(fullResponse);
          
          setMessages(prev => 
            prev.map(msg => 
              msg.id === assistantMessageId 
                ? { 
                    ...msg, 
                    content: fullResponse,
                    isCode: hasCode,
                    codeBlocks: codeBlocks
                  }
                : msg
            )
          );
        }
      );
    } catch (error: any) {
      console.error('Error sending message:', error);
      setMessages(prev => [
        ...prev,
        {
          id: generateId(),
          role: 'assistant',
          content: `Error: ${error.message || 'Failed to get response from AI'}`,
          timestamp: new Date()
        }
      ]);
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleInsertCode = (code: string) => {
    if (onInsertCode) {
      onInsertCode(code);
    }
  };

  const formatMessage = (content: string) => {
    let formatted = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-[var(--bg-primary)] px-1 py-0.5 rounded text-[var(--gold)] text-sm">$1</code>')
      .replace(/\n/g, '<br/>');

    return formatted;
  };

  const renderCodeBlock = (block: { language: string; code: string }, index: number) => {
    const codeId = `code-${index}-${Date.now()}`;
    const fileType = detectFileType(block.code, block.language);
    const fileExtension = fileType === 'html' ? 'html' : fileType === 'css' ? 'css' : 'js';
    
    return (
      <div key={index} className="relative bg-[var(--bg-primary)] rounded-lg my-2 overflow-hidden border border-[var(--border-color)]">
        <div className="flex items-center justify-between px-3 py-1.5 bg-[var(--bg-tertiary)] border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2">
            <Terminal size={12} className="text-[var(--text-secondary)]" />
            <span className="text-xs text-[var(--text-secondary)]">{block.language || 'code'}</span>
            <span className="text-xs text-[var(--text-secondary)]">|</span>
            <span className="text-xs text-[var(--accent-color)]">.{fileExtension}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(block.code, codeId)}
              className="text-xs text-[var(--text-secondary)] hover:text-white transition-colors flex items-center gap-1"
            >
              {copiedId === codeId ? (
                <Check size={12} className="text-green-400" />
              ) : (
                <Copy size={12} />
              )}
              {copiedId === codeId ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={() => handleInsertCode(block.code)}
              className="text-xs text-[var(--accent-color)] hover:text-[var(--accent-hover)] transition-colors flex items-center gap-1"
            >
              <Code2 size={12} />
              Insert
            </button>
            <button
              onClick={() => handleCreateFileFromCode(block.code, block.language)}
              className="text-xs text-[var(--gold)] hover:text-[#f0c060] transition-colors flex items-center gap-1"
            >
              <FilePlus size={12} />
              Create File
            </button>
          </div>
        </div>
        <pre className="p-3 text-sm font-mono text-[var(--text-primary)] overflow-x-auto whitespace-pre-wrap max-h-60 overflow-y-auto">
          {block.code}
        </pre>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: '400px', opacity: 1 }}
        exit={{ width: 0, opacity: 0 }}
        className="h-full bg-[var(--bg-secondary)] border-l border-[var(--border-color)] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 h-9 border-b border-[var(--border-color)] flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[var(--gold)]" />
            <span className="text-sm font-medium text-[var(--text-primary)]">AI Assistant</span>
            {!isPuterEnvironment && (
              <span className="text-xs text-red-400">(not available)</span>
            )}
            {isPuterEnvironment && !isAvailable && (
              <span className="text-xs text-yellow-400">(login required)</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {isPuterEnvironment && isAvailable && (
              <button
                onClick={() => puterService.reset()}
                className="p-1 rounded hover:bg-[var(--bg-hover)] transition-colors"
                title="Reset Conversation"
              >
                <RefreshCw size={14} className="text-[var(--text-secondary)]" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-[var(--bg-hover)] transition-colors"
            >
              <X size={16} className="text-[var(--text-secondary)]" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 ${
                  msg.role === 'user'
                    ? 'bg-[var(--accent-color)] text-white'
                    : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {msg.role === 'assistant' ? (
                    <Bot size={14} className="text-[var(--gold)]" />
                  ) : (
                    <User size={14} className="text-white/70" />
                  )}
                  <span className="text-xs font-medium opacity-70">
                    {msg.role === 'assistant' ? 'AetherCode' : 'You'}
                  </span>
                  <span className="text-xs opacity-50 ml-auto">
                    {msg.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                
                {msg.codeBlocks && msg.codeBlocks.length > 0 ? (
                  <div>
                    {msg.content.split(/```(\w+)?\n[\s\S]*?```/).map((part, idx) => {
                      if (part.trim()) {
                        return (
                          <div 
                            key={`text-${idx}`}
                            className="text-sm whitespace-pre-wrap break-words mb-2"
                            dangerouslySetInnerHTML={{ 
                              __html: formatMessage(part) 
                            }}
                          />
                        );
                      }
                      return null;
                    })}
                    {msg.codeBlocks.map((block, idx) => renderCodeBlock(block, idx))}
                  </div>
                ) : (
                  <div 
                    className="text-sm whitespace-pre-wrap break-words"
                    dangerouslySetInnerHTML={{ 
                      __html: formatMessage(msg.content) 
                    }}
                  />
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[var(--bg-tertiary)] rounded-lg px-4 py-3">
                <Loader2 size={20} className="text-[var(--gold)] animate-spin" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-[var(--border-color)] flex-shrink-0">
          {!isPuterEnvironment ? (
            <div className="text-center py-4">
              <AlertCircle size={32} className="mx-auto text-yellow-400 mb-2" />
              <p className="text-sm text-[var(--text-secondary)] mb-2">
                AI Assistant hanya tersedia di lingkungan Puter
              </p>
              <a
                href="https://puter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent-color)] text-white rounded hover:bg-[var(--accent-hover)] transition-colors text-sm"
              >
                <ExternalLink size={14} />
                Buka Puter.com
              </a>
            </div>
          ) : !isAvailable ? (
            <div className="text-center py-4">
              <button
                onClick={handleLogin}
                className="px-6 py-2 bg-[var(--accent-color)] text-white rounded hover:bg-[var(--accent-hover)] transition-colors text-sm"
              >
                Login ke Puter
              </button>
              <p className="text-xs text-[var(--text-secondary)] mt-2">
                Login required to use AI Assistant
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask AI for help..."
                disabled={isLoading}
                className="flex-1 px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-color)] disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="p-2 bg-[var(--accent-color)] text-white rounded hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={16} />
              </button>
            </div>
          )}
          {isPuterEnvironment && isAvailable && (
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-xs text-[var(--text-secondary)]">
                {puterService.getRemainingTokens()} tokens remaining
              </span>
              <span className="text-xs text-[var(--text-secondary)]">
                Enter to send
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
