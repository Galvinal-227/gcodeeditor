import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Panel, Group, Separator } from 'react-resizable-panels';
import {
  Files,
  Search,
  GitBranch,
  Settings,
  Code2,
  Save,
  Maximize2,
  Minimize2,
  RotateCcw,
  Play,
  Square,
  File,
} from 'lucide-react';
import { ActivityBar } from './components/ActivityBar';
import { Explorer } from './components/Explorer';
import { SearchPanel } from './components/SearchPanel';
import { GitPanel } from './components/GitPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { CommandPalette } from './components/CommandPalete';
import { AIAssistant } from './components/AIAssistant';
import { Tabs } from './components/Tabs';
import Editor, { type EditorRef } from './components/Editor';
import { Preview } from './components/Preview';
import { StatusBar } from './components/StatusBar';
import { Toolbar } from './components/Toolbar';
import { useEditor } from './hooks/useEditor';
import { useFileSystem } from './hooks/useFileSystem';
import { usePreview } from './hooks/usePreview';
import type { FileNode } from './types';
import { loadSettings, applyTheme } from './utils/settings';

export const App: React.FC = () => {
  // ===== REFS =====
  const editorRef = useRef<EditorRef | null>(null);

  // ===== HOOKS =====
  const {
    tabs,
    activeTabId,
    files: editorFiles,
    openFile,
    closeFile,
    switchTab,
    updateContent,
    saveContent,
    getActiveTab,
    setFiles: setEditorFiles,
    getFileLanguage,
  } = useEditor();

  const {
    rootPath,
    files: fileSystemFiles,
    selectedFile,
    setSelectedFile,
    expandedFolders,
    recentProjects,
    isLoading,
    openDirectory,
    createFile,
    createFolder,
    deleteItem,
    renameItem,
    duplicateItem,
    readFile,
    saveFileContent,
    toggleFolder,
    exportProject,
    importProject,
    refreshFileTree,
    dirHandle,
  } = useFileSystem();

  const {
    state: previewState,
    updatePreview,
    refreshPreview,
  } = usePreview();

  // ===== STATE =====
  const [activeView, setActiveView] = useState<'explorer' | 'search' | 'git' | 'settings' | 'ai'>('explorer');
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSplitEditor, setIsSplitEditor] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [problems, setProblems] = useState(0);
  const [isGitRepo, setIsGitRepo] = useState(false);
  const [branchName, setBranchName] = useState('main');
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // ===== THEME SYNC =====
  useEffect(() => {
    const settings = loadSettings();
    applyTheme(settings.theme);
  }, []);

  // ===== SYNC FILESYSTEM FILES TO EDITOR FILES =====
  useEffect(() => {
    if (fileSystemFiles.length > 0) {
      setEditorFiles(fileSystemFiles);
    }
  }, [fileSystemFiles, setEditorFiles]);

  // ===== LOAD FILE WHEN SELECTED =====
  useEffect(() => {
    if (selectedFile) {
      const loadFile = async () => {
        console.log('Loading file:', selectedFile);
        
        const findFile = (nodes: FileNode[], path: string): FileNode | null => {
          for (const node of nodes) {
            if (node.path === path) {
              return node;
            }
            if (node.children) {
              const found = findFile(node.children, path);
              if (found) return found;
            }
          }
          return null;
        };
        
        const fileNode = findFile(fileSystemFiles, selectedFile);
        if (fileNode && fileNode.content !== undefined && fileNode.content !== '') {
          const fileName = selectedFile.split('/').pop() || 'untitled';
          const language = getFileLanguage(fileName);
          openFile(selectedFile, fileName, fileNode.content, language);
          console.log('File loaded from cache:', fileName);
        } else {
          const content = await readFile(selectedFile);
          if (content !== null) {
            const fileName = selectedFile.split('/').pop() || 'untitled';
            const language = getFileLanguage(fileName);
            openFile(selectedFile, fileName, content, language);
            console.log('File loaded from filesystem:', fileName);
          }
        }
      };
      loadFile();
    }
  }, [selectedFile, fileSystemFiles, readFile, openFile, getFileLanguage]);

  // ===== KEYBOARD SHORTCUTS =====
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command Palette: Ctrl+Shift+P
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
      // Explorer: Ctrl+Shift+E
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        setActiveView('explorer');
      }
      // Search: Ctrl+Shift+F
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        setActiveView('search');
      }
      // Git: Ctrl+Shift+G
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'G') {
        e.preventDefault();
        setActiveView('git');
      }
      // AI Assistant: Ctrl+Shift+I
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        setActiveView(prev => prev === 'ai' ? 'explorer' : 'ai');
      }
      // Settings: Ctrl+,
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        setActiveView('settings');
      }
      // Fullscreen: F11
      if (e.key === 'F11') {
        e.preventDefault();
        setIsFullscreen(!isFullscreen);
      }
      // Zoom In: Ctrl+=
      if ((e.ctrlKey || e.metaKey) && e.key === '=') {
        e.preventDefault();
        setZoomLevel(Math.min(zoomLevel + 10, 200));
      }
      // Zoom Out: Ctrl+-
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        setZoomLevel(Math.max(zoomLevel - 10, 50));
      }
      // Reset Zoom: Ctrl+0
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        setZoomLevel(100);
      }
      // Save: Ctrl+S
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      // Save All: Ctrl+Shift+S
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        handleSaveAll();
      }
      // New File: Ctrl+N
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleNewFile();
      }
      // Run: F5
      if (e.key === 'F5' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleRun();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomLevel]);

  // ===== FULLSCREEN =====
  useEffect(() => {
    if (isFullscreen) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, [isFullscreen]);

  // ===== HANDLERS =====
  const handleFileSelect = useCallback((filePath: string) => {
    console.log('File selected:', filePath);
    setSelectedFile(filePath);
  }, [setSelectedFile]);

  const handleNewFile = async () => {
    console.log('New file clicked');
    if (!rootPath) {
      await openDirectory();
      return;
    }
    const fileName = prompt('Enter file name:');
    if (fileName) {
      await createFile(rootPath, fileName);
    }
  };

  const handleSave = useCallback(async () => {
    if (!activeTabId) {
      console.warn('No active tab to save');
      return;
    }
    
    if (!rootPath || !dirHandle) {
      alert('Please open a folder first before saving.\nClick the "Open Folder" button in the activity bar.');
      return;
    }
    
    console.log('Saving file...');
    const result = await saveContent(activeTabId, saveFileContent);
    if (result) {
      console.log('File saved successfully');
    } else {
      console.error('Failed to save file');
    }
  }, [activeTabId, rootPath, dirHandle, saveContent, saveFileContent]);

  const handleSaveAll = useCallback(async () => {
    if (!rootPath || !dirHandle) {
      alert('Please open a folder first before saving.\nClick the "Open Folder" button in the activity bar.');
      return;
    }
    
    console.log('Saving all files...');
    let successCount = 0;
    let failCount = 0;
    
    const dirtyTabs = tabs.filter(tab => tab.isDirty);
    if (dirtyTabs.length === 0) {
      console.log('No dirty files to save');
      return;
    }
    
    for (const tab of dirtyTabs) {
      console.log(`Saving: ${tab.fileName}`);
      const result = await saveContent(tab.id, saveFileContent);
      if (result) {
        successCount++;
      } else {
        failCount++;
      }
    }
    
    console.log(`Save all completed: ${successCount} saved, ${failCount} failed`);
  }, [tabs, rootPath, dirHandle, saveContent, saveFileContent]);

  // ===== EDITOR COMMANDS (HANYA UNTUK REF, TIDAK DIPAKAI DI TOOLBAR) =====
  const handleUndo = useCallback(() => {
    console.log('Undo triggered');
    editorRef.current?.undo();
  }, []);

  const handleRedo = useCallback(() => {
    console.log('Redo triggered');
    editorRef.current?.redo();
  }, []);

  const handleCopy = useCallback(() => {
    console.log('Copy triggered');
    editorRef.current?.copy();
  }, []);

  const handleCut = useCallback(() => {
    console.log('Cut triggered');
    editorRef.current?.cut();
  }, []);

  const handlePaste = useCallback(() => {
    console.log('Paste triggered');
    editorRef.current?.paste();
  }, []);

  const handleRefresh = useCallback(() => {
    console.log('Refresh clicked');
    refreshFileTree();
    refreshPreview();
  }, [refreshFileTree, refreshPreview]);

  const handleRun = useCallback(() => {
    console.log('Run clicked');
    setIsRunning(true);
    
    const htmlTab = tabs.find(tab => tab.fileName.endsWith('.html'));
    const cssTab = tabs.find(tab => tab.fileName.endsWith('.css'));
    const jsTab = tabs.find(tab => tab.fileName.endsWith('.js') || tab.fileName.endsWith('.javascript'));
    
    const htmlContent = htmlTab?.content || '';
    const cssContent = cssTab?.content || '';
    const jsContent = jsTab?.content || '';
    
    updatePreview(htmlContent, cssContent, jsContent);
    setIsPreviewOpen(true);
    setIsRunning(false);
  }, [tabs, updatePreview]);

  const handleStop = useCallback(() => {
    console.log('Stop clicked');
    setIsRunning(false);
  }, []);

  const handleCreateFile = useCallback(async (parentPath: string, fileName: string) => {
    await createFile(parentPath, fileName);
  }, [createFile]);

  const handleCreateFolder = useCallback(async (parentPath: string, folderName: string) => {
    await createFolder(parentPath, folderName);
  }, [createFolder]);

  const handleDelete = useCallback(async (filePath: string) => {
    if (confirm(`Are you sure you want to delete this item?`)) {
      await deleteItem(filePath);
    }
  }, [deleteItem]);

  const handleRename = useCallback(async (filePath: string, newName: string) => {
    await renameItem(filePath, newName);
  }, [renameItem]);

  const handleDuplicate = useCallback(async (filePath: string) => {
    await duplicateItem(filePath);
  }, [duplicateItem]);

  const handleImportProject = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.zip';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        await importProject(file);
      }
    };
    input.click();
  }, [importProject]);

  const handleOpenFolder = useCallback(async () => {
    console.log('Open folder clicked');
    await openDirectory();
  }, [openDirectory]);

  const handleInsertCode = useCallback((code: string) => {
    const activeTab = getActiveTab();
    if (activeTab) {
      const newContent = activeTab.content + '\n\n' + code;
      updateContent(activeTab.id, newContent);
    }
  }, [getActiveTab, updateContent]);

  // ===== COMMANDS FOR COMMAND PALETTE =====
  const commands = [
    { id: 'new-file', label: 'New File', shortcut: 'Ctrl+N', icon: Files, action: handleNewFile, category: 'file' as const },
    { id: 'save', label: 'Save', shortcut: 'Ctrl+S', icon: Save, action: handleSave, category: 'file' as const },
    { id: 'save-all', label: 'Save All', shortcut: 'Ctrl+Shift+S', icon: Save, action: handleSaveAll, category: 'file' as const },
    { id: 'undo', label: 'Undo', shortcut: 'Ctrl+Z', icon: RotateCcw, action: handleUndo, category: 'edit' as const },
    { id: 'redo', label: 'Redo', shortcut: 'Ctrl+Shift+Z', icon: RotateCcw, action: handleRedo, category: 'edit' as const },
    { id: 'copy', label: 'Copy', shortcut: 'Ctrl+C', icon: Files, action: handleCopy, category: 'edit' as const },
    { id: 'cut', label: 'Cut', shortcut: 'Ctrl+X', icon: Files, action: handleCut, category: 'edit' as const },
    { id: 'paste', label: 'Paste', shortcut: 'Ctrl+V', icon: Files, action: handlePaste, category: 'edit' as const },
    { id: 'toggle-explorer', label: 'Toggle Explorer', shortcut: 'Ctrl+Shift+E', icon: Files, action: () => setActiveView('explorer'), category: 'view' as const },
    { id: 'toggle-search', label: 'Toggle Search', shortcut: 'Ctrl+Shift+F', icon: Search, action: () => setActiveView('search'), category: 'view' as const },
    { id: 'toggle-git', label: 'Toggle Source Control', shortcut: 'Ctrl+Shift+G', icon: GitBranch, action: () => setActiveView('git'), category: 'view' as const },
    { id: 'toggle-ai', label: 'Toggle AI Assistant', shortcut: 'Ctrl+Shift+I', icon: Code2, action: () => setActiveView(prev => prev === 'ai' ? 'explorer' : 'ai'), category: 'view' as const },
    { id: 'toggle-settings', label: 'Toggle Settings', shortcut: 'Ctrl+,', icon: Settings, action: () => setActiveView('settings'), category: 'view' as const },
    { id: 'run', label: 'Run', shortcut: 'F5', icon: Play, action: handleRun, category: 'run' as const },
    { id: 'stop', label: 'Stop', shortcut: 'Shift+F5', icon: Square, action: handleStop, category: 'run' as const },
    { id: 'zoom-in', label: 'Zoom In', shortcut: 'Ctrl+=', icon: Maximize2, action: () => setZoomLevel(Math.min(zoomLevel + 10, 200)), category: 'view' as const },
    { id: 'zoom-out', label: 'Zoom Out', shortcut: 'Ctrl+-', icon: Minimize2, action: () => setZoomLevel(Math.max(zoomLevel - 10, 50)), category: 'view' as const },
    { id: 'reset-zoom', label: 'Reset Zoom', shortcut: 'Ctrl+0', icon: RotateCcw, action: () => setZoomLevel(100), category: 'view' as const },
    { id: 'fullscreen', label: 'Toggle Fullscreen', shortcut: 'F11', icon: Maximize2, action: () => setIsFullscreen(!isFullscreen), category: 'view' as const },
    { id: 'toggle-preview', label: 'Toggle Preview', shortcut: '', icon: Code2, action: () => setIsPreviewOpen(!isPreviewOpen), category: 'view' as const },
  ];

  // ===== RENDER SIDE PANEL =====
  const renderSidePanel = () => {
    switch (activeView) {
      case 'explorer':
        return (
          <Explorer
            files={fileSystemFiles}
            selectedFile={selectedFile}
            expandedFolders={expandedFolders}
            onFileSelect={handleFileSelect}
            onToggleFolder={toggleFolder}
            onCreateFile={handleCreateFile}
            onCreateFolder={handleCreateFolder}
            onDelete={handleDelete}
            onRename={handleRename}
            onDuplicate={handleDuplicate}
            onExport={exportProject}
            onImport={handleImportProject}
            onRefresh={handleRefresh}
            rootPath={rootPath}
          />
        );
      case 'search':
        return (
          <SearchPanel
            files={fileSystemFiles}
            tabs={tabs}
            onFileSelect={handleFileSelect}
            onClose={() => setActiveView('explorer')}
          />
        );
      case 'git':
        return (
          <GitPanel
            onClose={() => setActiveView('explorer')}
            files={fileSystemFiles}
            rootPath={rootPath}
          />
        );
      case 'ai':
        return (
          <AIAssistant
            isOpen={true}
            onClose={() => setActiveView('explorer')}
            onInsertCode={handleInsertCode}
            onCreateFile={createFile}
            rootPath={rootPath}
          />
        );
      case 'settings':
        return (
          <SettingsPanel
            onClose={() => setActiveView('explorer')}
          />
        );
      default:
        return null;
    }
  };

  // ===== EDITOR CONTENT =====
  const activeTab = getActiveTab();

  const editorContent = (
    <div className="h-full flex flex-col">
      <Toolbar
        onRun={handleRun}
        onStop={handleStop}
        onSave={handleSave}
        onSaveAll={handleSaveAll}
        onSearch={() => setActiveView('search')}
        onRefresh={handleRefresh}
        onFullscreen={() => setIsFullscreen(!isFullscreen)}
        onSplitEditor={() => setIsSplitEditor(!isSplitEditor)}
        onNewFile={handleNewFile}
        onToggleGit={() => setActiveView('git')}
        onToggleSettings={() => setActiveView('settings')}
        isRunning={isRunning}
        isFullscreen={isFullscreen}
      />
      <Tabs
        tabs={tabs}
        activeTabId={activeTabId}
        onTabClick={switchTab}
        onTabClose={closeFile}
        onTabDrag={(fromId, toId) => {}}
      />
      <div className="flex-1 overflow-hidden" style={{ zoom: `${zoomLevel}%` }}>
        {activeTab ? (
          <div className="h-full">
            {isSplitEditor ? (
              <Group direction="horizontal" className="h-full">
                <Panel defaultSize={50} minSize={20}>
                  <Editor
                    ref={editorRef}
                    key={`${activeTab.id}-1`}
                    tabId={activeTab.id}
                    content={activeTab.content}
                    language={activeTab.language}
                    onChange={(content) => updateContent(activeTab.id, content)}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    onCopy={handleCopy}
                    onCut={handleCut}
                    onPaste={handlePaste}
                  />
                </Panel>
                <Separator className="w-1 bg-[var(--border-color)] hover:bg-[var(--accent-color)] transition-colors cursor-col-resize" />
                <Panel defaultSize={50} minSize={20}>
                  <Editor
                    ref={editorRef}
                    key={`${activeTab.id}-2`}
                    tabId={activeTab.id}
                    content={activeTab.content}
                    language={activeTab.language}
                    onChange={(content) => updateContent(activeTab.id, content)}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    onCopy={handleCopy}
                    onCut={handleCut}
                    onPaste={handlePaste}
                  />
                </Panel>
              </Group>
            ) : (
              <Editor
                ref={editorRef}
                key={activeTab.id}
                tabId={activeTab.id}
                content={activeTab.content}
                language={activeTab.language}
                onChange={(content) => updateContent(activeTab.id, content)}
                onUndo={handleUndo}
                onRedo={handleRedo}
                onCopy={handleCopy}
                onCut={handleCut}
                onPaste={handlePaste}
              />
            )}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-[var(--text-secondary)]">
            <div className="text-center">
              <div className="text-4xl mb-4">
                <File size={48} className="mx-auto opacity-30" />
              </div>
              <p className="text-lg">No file open</p>
              <p className="text-sm">Open a file from the explorer to start editing</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ===== MAIN RENDER =====
  return (
    <div className="h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden">
      <div className="flex-1 flex overflow-hidden">
        <ActivityBar
          activeView={activeView}
          onViewChange={setActiveView}
          onTogglePreview={() => setIsPreviewOpen(!isPreviewOpen)}
          isPreviewOpen={isPreviewOpen}
          onOpenFolder={handleOpenFolder}
        />

        <div className="w-64 min-w-[200px] flex-shrink-0 h-full">
          {renderSidePanel()}
        </div>

        <div className="flex-1 h-full">
          <Group direction="horizontal" className="h-full">
            <Panel defaultSize={isPreviewOpen ? 50 : 100} minSize={30}>
              {editorContent}
            </Panel>

            {isPreviewOpen && (
              <>
                <Separator className="w-1 bg-[var(--border-color)] hover:bg-[var(--accent-color)] transition-colors cursor-col-resize" />
                <Panel defaultSize={50} minSize={20}>
                  <Preview
                    isOpen={isPreviewOpen}
                    onClose={() => setIsPreviewOpen(false)}
                    html={previewState.html}
                    css={previewState.css}
                    javascript={previewState.javascript}
                  />
                </Panel>
              </>
            )}
          </Group>
        </div>
      </div>

      <StatusBar
        currentFile={activeTab?.fileName || null}
        language={activeTab?.language || 'plaintext'}
        lineCount={activeTab ? activeTab.content.split('\n').length : 0}
        column={0}
        isDirty={activeTab?.isDirty || false}
        isGitRepo={isGitRepo}
        branchName={branchName}
        problems={problems}
        onToggleProblems={() => setProblems(problems > 0 ? 0 : 1)}
        onToggleSettings={() => setActiveView('settings')}
        isTerminalOpen={false}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        commands={commands}
      />
    </div>
  );
};
