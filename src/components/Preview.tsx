import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Maximize2,
  Minimize2,
  RefreshCw,
  Monitor,
  Tablet,
  Smartphone,
  XCircle,
  X
} from 'lucide-react';
import type { DeviceType } from '../types';

interface PreviewProps {
  isOpen: boolean;
  onClose: () => void;
  html: string;
  css: string;
  javascript: string;
}

export const Preview: React.FC<PreviewProps> = ({
  isOpen,
  onClose,
  html,
  css,
  javascript,
}) => {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [previewKey, setPreviewKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const getDeviceWidth = (type: DeviceType): string => {
    switch (type) {
      case 'desktop':
        return '100%';
      case 'tablet':
        return '768px';
      case 'mobile':
        return '375px';
      default:
        return '100%';
    }
  };

  const generateHTML = (htmlContent: string, cssContent: string, jsContent: string) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
              background: white;
              color: #333;
              min-height: 100vh;
            }
            ${cssContent}
          </style>
        </head>
        <body>
          ${htmlContent}
          <script>
            (function() {
              try {
                ${jsContent}
              } catch (error) {
                window.parent.postMessage({
                  type: 'preview-error',
                  error: error.message || 'Error in JavaScript code'
                }, '*');
              }
            })();
          </script>
        </body>
      </html>
    `;
  };

  const refreshPreview = () => {
    setPreviewKey(prev => prev + 1);
    setError(null);
  };

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Handle fullscreen change event
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreenNow = !!document.fullscreenElement;
      if (!isFullscreenNow && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isFullscreen]);

  // Toggle fullscreen
  const toggleFullscreen = async () => {
    try {
      if (!isFullscreen) {
        const container = containerRef.current;
        if (container) {
          if (container.requestFullscreen) {
            await container.requestFullscreen();
          }
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
      setIsFullscreen(!isFullscreen);
    }
  };

  useEffect(() => {
    if (iframeRef.current && (html || css || javascript)) {
      const content = generateHTML(html, css, javascript);
      const iframe = iframeRef.current;
      try {
        const doc = iframe.contentDocument;
        if (doc) {
          doc.open();
          doc.write(content);
          doc.close();
        }
      } catch (err) {
        console.error('Error updating preview:', err);
      }
    }
  }, [html, css, javascript, previewKey]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'preview-error') {
        setError(event.data.error || 'JavaScript error in preview');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (!isOpen) return null;

  const deviceWidth = getDeviceWidth(deviceType);
  const isDesktop = deviceType === 'desktop';

  return (
    <div className="h-full bg-[var(--bg-primary)] flex flex-col relative">
      {/* Preview Toolbar */}
      <div className="flex items-center justify-between px-3 h-9 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-primary)] font-medium">Preview</span>
          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={() => setDeviceType('desktop')}
              className={`p-1 rounded transition-colors ${
                deviceType === 'desktop'
                  ? 'bg-[var(--accent-color)] text-white'
                  : 'text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-hover)]'
              }`}
              title="Desktop"
            >
              <Monitor size={14} />
            </button>
            <button
              onClick={() => setDeviceType('tablet')}
              className={`p-1 rounded transition-colors ${
                deviceType === 'tablet'
                  ? 'bg-[var(--accent-color)] text-white'
                  : 'text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-hover)]'
              }`}
              title="Tablet"
            >
              <Tablet size={14} />
            </button>
            <button
              onClick={() => setDeviceType('mobile')}
              className={`p-1 rounded transition-colors ${
                deviceType === 'mobile'
                  ? 'bg-[var(--accent-color)] text-white'
                  : 'text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-hover)]'
              }`}
              title="Mobile"
            >
              <Smartphone size={14} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={refreshPreview}
            className="p-1 rounded text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-hover)] transition-colors"
            title="Refresh"
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={toggleFullscreen}
            className={`p-1 rounded transition-colors ${
              isFullscreen
                ? 'bg-[var(--accent-color)] text-white'
                : 'text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-hover)]'
            }`}
            title={isFullscreen ? 'Exit Fullscreen (ESC)' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div 
        ref={containerRef}
        className={`flex-1 overflow-hidden bg-[var(--bg-primary)] relative ${
          isFullscreen ? 'fixed inset-0 z-50 bg-[var(--bg-primary)]' : ''
        }`}
      >
        {isFullscreen && (
          <button
            onClick={() => {
              setIsFullscreen(false);
              if (document.exitFullscreen) {
                document.exitFullscreen().catch(() => {});
              }
            }}
            className="absolute top-4 right-4 z-50 p-2 bg-[var(--bg-tertiary)] rounded-lg hover:bg-[var(--bg-hover)] transition-colors text-white border border-[var(--border-color)]"
            title="Exit Fullscreen (ESC)"
          >
            <X size={20} />
          </button>
        )}

        <div className="h-full flex items-center justify-center p-4">
          <div
            className="bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300"
            style={{
              width: deviceWidth,
              height: isDesktop ? '100%' : '90%',
              maxWidth: isDesktop ? '100%' : '100%',
              margin: 'auto',
            }}
          >
            <iframe
              ref={iframeRef}
              className="w-full h-full border-0"
              title="Preview"
              sandbox="allow-scripts allow-modals allow-same-origin"
            />
          </div>
        </div>

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-[var(--bg-tertiary)] rounded-lg p-6 max-w-md w-full mx-4 border border-red-500/30">
              <div className="flex items-center gap-2 text-red-500 mb-3">
                <XCircle size={20} />
                <span className="font-medium">Preview Error</span>
              </div>
              <div className="bg-[var(--bg-primary)] rounded p-3 font-mono text-sm text-red-400 break-words">
                {error}
              </div>
              <button
                onClick={refreshPreview}
                className="mt-4 w-full py-2 bg-[var(--accent-color)] text-white rounded hover:bg-[var(--accent-hover)] transition-colors"
              >
                Refresh Preview
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};