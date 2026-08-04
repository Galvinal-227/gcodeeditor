import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

// Debug
console.log('Main.tsx loaded');
console.log('electronAPI available?', !!window.electronAPI);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);