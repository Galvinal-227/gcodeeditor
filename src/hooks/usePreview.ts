import { useState, useCallback, useRef, useEffect } from 'react';
import type { PreviewState, DeviceType } from '../types';

export const usePreview = () => {
  const [state, setState] = useState<PreviewState>({
    isOpen: true,
    html: '',
    css: '',
    javascript: '',
    isFullscreen: false,
    deviceType: 'desktop',
    error: null,
  });

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [previewKey, setPreviewKey] = useState(0);

  const updatePreview = useCallback((html: string, css: string, javascript: string) => {
    setState(prev => ({
      ...prev,
      html,
      css,
      javascript,
      error: null,
    }));
    setPreviewKey(prev => prev + 1);
  }, []);

  const generateHTML = useCallback((html: string, css: string, javascript: string) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            /* Reset and base styles */
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
            /* User CSS */
            ${css}
          </style>
        </head>
        <body>
          ${html}
          <script>
            (function() {
              try {
                // User JavaScript
                ${javascript}
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
  }, []);

  const getPreviewHTML = useCallback(() => {
    return generateHTML(state.html, state.css, state.javascript);
  }, [state.html, state.css, state.javascript, generateHTML]);

  const togglePreview = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: !prev.isOpen }));
  }, []);

  const setDeviceType = useCallback((deviceType: DeviceType) => {
    setState(prev => ({ ...prev, deviceType }));
  }, []);

  const toggleFullscreen = useCallback(() => {
    setState(prev => ({ ...prev, isFullscreen: !prev.isFullscreen }));
  }, []);

  const refreshPreview = useCallback(() => {
    setPreviewKey(prev => prev + 1);
  }, []);

  const handleIframeError = useCallback((error: Error) => {
    setState(prev => ({
      ...prev,
      error: error.message || 'Failed to render preview',
    }));
  }, []);

  // Listen for error messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'preview-error') {
        setState(prev => ({
          ...prev,
          error: event.data.error || 'JavaScript error in preview',
        }));
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Update preview when HTML, CSS, or JavaScript changes
  useEffect(() => {
    if (iframeRef.current && (state.html || state.css || state.javascript)) {
      const content = getPreviewHTML();
      const iframe = iframeRef.current;
      if (iframe) {
        try {
          const doc = iframe.contentDocument;
          if (doc) {
            doc.open();
            doc.write(content);
            doc.close();
          }
        } catch (error) {
          console.error('Error updating preview:', error);
        }
      }
    }
  }, [state.html, state.css, state.javascript, getPreviewHTML, previewKey]);

  return {
    state,
    iframeRef,
    updatePreview,
    togglePreview,
    setDeviceType,
    toggleFullscreen,
    refreshPreview,
    handleIframeError,
    getDeviceWidth: (deviceType: DeviceType) => {
      switch (deviceType) {
        case 'desktop':
          return '100%';
        case 'tablet':
          return '768px';
        case 'mobile':
          return '375px';
        default:
          return '100%';
      }
    },
  };
};