export interface Settings {
  theme: 'dark' | 'light';
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  autoSave: boolean;
}

export const defaultSettings: Settings = {
  theme: 'dark',
  fontSize: 14,
  tabSize: 2,
  wordWrap: true,
  autoSave: false,
};

const SETTINGS_KEY = 'code-editor-settings';

export const loadSettings = (): Settings => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...defaultSettings, ...parsed };
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
  return defaultSettings;
};

export const saveSettings = (settings: Settings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    applyTheme(settings.theme);
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};

// Fungsi untuk apply theme ke seluruh aplikasi
export const applyTheme = (theme: 'dark' | 'light'): void => {
  const root = document.documentElement;
  
  if (theme === 'dark') {
    root.setAttribute('data-theme', 'dark');
    root.style.backgroundColor = '#1e1e1e';
    root.style.color = '#cccccc';
    
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', '#1e1e1e');
    }
  } else {
    root.setAttribute('data-theme', 'light');
    root.style.backgroundColor = '#f5f5f5';
    root.style.color = '#333333';
    
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', '#f5f5f5');
    }
  }
  
  // Dispatch event untuk komponen lain
  window.dispatchEvent(new CustomEvent('theme-change', { detail: { theme } }));
};

export const toggleTheme = (): void => {
  const current = loadSettings();
  const newTheme = current.theme === 'dark' ? 'light' : 'dark';
  const newSettings = { ...current, theme: newTheme };
  saveSettings(newSettings);
  applyTheme(newTheme);
};

export const initTheme = (): void => {
  const settings = loadSettings();
  applyTheme(settings.theme);
};