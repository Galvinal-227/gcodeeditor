/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      colors: {
        'vscode-dark': '#1e1e1e',
        'vscode-light': '#2d2d2d',
        'vscode-hover': '#2a2d2e',
        'vscode-border': '#3c3c3c',
        'vscode-active': '#0e639c',
        'vscode-text': '#cccccc',
        'vscode-selection': '#264f78',
      },
    },
  },
  plugins: [],
};