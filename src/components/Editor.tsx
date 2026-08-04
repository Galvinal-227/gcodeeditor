import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { loadSettings } from '../utils/settings';

interface EditorProps {
  tabId: string;
  content: string;
  language: string;
  onChange: (content: string) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onCopy?: () => void;
  onCut?: () => void;
  onPaste?: () => void;
}

export interface EditorRef {
  undo: () => void;
  redo: () => void;
  copy: () => void;
  cut: () => void;
  paste: () => void;
  focus: () => void;
  getEditor: () => any;
  updateTheme: (theme: 'dark' | 'light') => void;
}

// Emmet shortcuts untuk HTML
const emmetShortcuts: Record<string, string> = {
  '!': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  
</body>
</html>`,
  'html:5': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  
</body>
</html>`,
  'link:css': `<link rel="stylesheet" href="style.css">`,
  'script:src': `<script src="script.js"></script>`,
  'img': `<img src="" alt="">`,
  'input': `<input type="text" name="" id="">`,
  'ul>li*3': `<ul>
  <li></li>
  <li></li>
  <li></li>
</ul>`,
  'div.container': `<div class="container">
  
</div>`,
  'section#main': `<section id="main">
  
</section>`,
};

export const Editor = forwardRef<EditorRef, EditorProps>(({
  tabId,
  content,
  language = 'plaintext', // Default value
  onChange,
  onUndo,
  onRedo,
  onCopy,
  onCut,
  onPaste,
}, ref) => {
  const editorRef = useRef<any>(null);
  const [currentTheme, setCurrentTheme] = useState<'dark' | 'light'>('dark');

  // Load theme dari settings
  useEffect(() => {
    const settings = loadSettings();
    setCurrentTheme(settings.theme);
  }, []);

  // Listen untuk perubahan theme dari luar
  useEffect(() => {
    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      const theme = customEvent.detail?.theme || 'dark';
      setCurrentTheme(theme);
      if (editorRef.current) {
        try {
          const monaco = (window as any).monaco;
          if (monaco) {
            monaco.editor.setTheme(theme === 'dark' ? 'vs-dark' : 'vs-light');
          }
        } catch (error) {
          console.error('Error updating theme:', error);
        }
      }
    };

    window.addEventListener('theme-change' as any, handleThemeChange);
    return () => window.removeEventListener('theme-change' as any, handleThemeChange);
  }, []);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    undo: () => {
      editorRef.current?.trigger('keyboard', 'undo', null);
    },
    redo: () => {
      editorRef.current?.trigger('keyboard', 'redo', null);
    },
    copy: () => {
      editorRef.current?.trigger('keyboard', 'editor.action.clipboardCopyAction', null);
    },
    cut: () => {
      editorRef.current?.trigger('keyboard', 'editor.action.clipboardCutAction', null);
    },
    paste: () => {
      editorRef.current?.trigger('keyboard', 'editor.action.clipboardPasteAction', null);
    },
    focus: () => {
      editorRef.current?.focus();
    },
    getEditor: () => {
      return editorRef.current;
    },
    updateTheme: (theme: 'dark' | 'light') => {
      setCurrentTheme(theme);
      if (editorRef.current) {
        try {
          const monaco = (window as any).monaco;
          if (monaco) {
            monaco.editor.setTheme(theme === 'dark' ? 'vs-dark' : 'vs-light');
          }
        } catch (error) {
          console.error('Error updating theme:', error);
        }
      }
    },
  }));

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    editor.focus();

    // Set theme awal
    try {
      const monaco = (window as any).monaco;
      if (monaco) {
        const settings = loadSettings();
        monaco.editor.setTheme(settings.theme === 'dark' ? 'vs-dark' : 'vs-light');
      }
    } catch (error) {
      console.error('Error setting theme:', error);
    }

    // Register completion provider untuk Emmet-like shortcuts
    if (language === 'html') {
      try {
        const monaco = (window as any).monaco;
        if (monaco) {
          const completionProvider = {
            provideCompletionItems: (model: any, position: any) => {
              const word = model.getWordUntilPosition(position);
              const range = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endColumn: word.endColumn,
              };

              const suggestions: any[] = [];
              
              for (const [shortcut, expansion] of Object.entries(emmetShortcuts)) {
                suggestions.push({
                  label: shortcut,
                  kind: monaco.languages.CompletionItemKind.Snippet,
                  detail: 'Emmet Abbreviation',
                  documentation: `Expand to:\n${expansion}`,
                  insertText: expansion,
                  insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                  range: range,
                });
              }

              const htmlTags = ['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'form', 'input', 'button', 'textarea', 'select', 'option', 'label', 'section', 'article', 'header', 'footer', 'nav', 'main', 'aside'];
              for (const tag of htmlTags) {
                suggestions.push({
                  label: tag,
                  kind: monaco.languages.CompletionItemKind.Snippet,
                  detail: 'HTML Tag',
                  insertText: `<${tag}>$0</${tag}>`,
                  insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                  range: range,
                });
              }

              return { suggestions };
            },
            triggerCharacters: ['<', ' '],
          };

          monaco.languages.registerCompletionItemProvider('html', completionProvider);
        }
      } catch (error) {
        console.error('Error registering completion provider:', error);
      }
    }

    // Handle '!' shortcut
    const disposable = editor.getModel()?.onDidChangeContent(() => {
      const model = editor.getModel();
      if (!model) return;

      const currentContent = model.getValue();
      const lines = currentContent.split('\n');
      const lastLine = lines[lines.length - 1];
      
      if (lastLine && lastLine.trim() === '!') {
        const template = emmetShortcuts['!'];
        lines.pop();
        const newContent = lines.join('\n') + (lines.length > 0 ? '\n' : '') + template;
        model.setValue(newContent);
        const bodyIndex = template.indexOf('<body>');
        if (bodyIndex !== -1) {
          const pos = model.getPositionAt(lines.join('\n').length + bodyIndex + 7);
          editor.setPosition(pos);
        }
      }
    });

    // Keyboard shortcuts for editor
    try {
      const monaco = (window as any).monaco;
      if (monaco) {
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyZ, () => {
          editor.trigger('keyboard', 'undo', null);
          onUndo?.();
        });

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyZ, () => {
          editor.trigger('keyboard', 'redo', null);
          onRedo?.();
        });

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyC, () => {
          editor.trigger('keyboard', 'editor.action.clipboardCopyAction', null);
          onCopy?.();
        });

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyX, () => {
          editor.trigger('keyboard', 'editor.action.clipboardCutAction', null);
          onCut?.();
        });

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV, () => {
          editor.trigger('keyboard', 'editor.action.clipboardPasteAction', null);
          onPaste?.();
        });

        // Alt+Z untuk toggle word wrap
        editor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.KeyZ, () => {
          const current = editor.getOption(monaco.editor.EditorOption.wordWrap);
          const newValue = current === 'on' ? 'off' : 'on';
          editor.updateOptions({ wordWrap: newValue });
        });
      }
    } catch (error) {
      console.error('Error registering shortcuts:', error);
    }

    return () => {
      disposable?.dispose();
    };
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      onChange(value);
    }
  };

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, [tabId]);

  const isDark = currentTheme === 'dark';

  return (
    <div className="h-full w-full" style={{ background: isDark ? '#1e1e1e' : '#f5f5f5' }}>
      <MonacoEditor
        key={tabId}
        height="100%"
        language={language}
        value={content}
        theme={isDark ? 'vs-dark' : 'vs-light'}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: true },
          fontSize: 14,
          fontFamily: 'JetBrains Mono, monospace',
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          wrappingIndent: 'indent',
          autoIndent: 'full',
          formatOnPaste: true,
          formatOnType: true,
          suggestOnTriggerCharacters: true,
          acceptSuggestionOnEnter: 'on',
          autoClosingBrackets: 'always',
          autoClosingQuotes: 'always',
          autoClosingTags: 'always',
          bracketPairColorization: { enabled: true },
          linkedEditing: true,
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          renderWhitespace: 'selection',
          renderControlCharacters: false,
          fontLigatures: true,
          suggestSelection: 'first',
          quickSuggestions: {
            other: true,
            comments: false,
            strings: true,
          },
          parameterHints: { enabled: true },
          lightbulb: { enabled: true },
          codeLens: { enabled: true },
          contextmenu: true,
          mouseWheelZoom: true,
          dragAndDrop: true,
          multiCursorModifier: 'alt',
          occurrencesHighlight: true,
          folding: true,
          foldingStrategy: 'auto',
          showFoldingControls: 'mouseover',
          matchBrackets: 'near',
          highlightActiveIndentGuide: true,
          renderIndentGuides: true,
          detectIndentation: true,
          trimAutoWhitespace: true,
          renderLineHighlight: 'all',
          selectionHighlight: true,
        }}
      />
    </div>
  );
});

Editor.displayName = 'Editor';

export default Editor;