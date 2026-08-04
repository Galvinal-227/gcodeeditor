import React, { useState, useEffect } from 'react';
import { X, Sun, Moon } from 'lucide-react';
import { loadSettings, saveSettings, applyTheme, defaultSettings, type Settings } from '../utils/settings';

interface SettingsPanelProps {
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  useEffect(() => {
    const loaded = loadSettings();
    setSettings(loaded);
  }, []);

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveSettings(newSettings);
    
    if (key === 'theme') {
      applyTheme(value as 'dark' | 'light');
    }
  };

  return (
    <div className="h-full bg-[var(--bg-secondary)] flex flex-col">
      <div className="flex items-center justify-between px-3 h-9 border-b border-[var(--border-color)] flex-shrink-0">
        <span className="text-sm font-medium text-[var(--text-primary)]">Settings</span>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-[var(--bg-hover)] transition-colors"
        >
          <X size={16} className="text-[var(--text-secondary)]" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {/* Theme Setting */}
          <div>
            <label className="block text-sm text-[var(--text-primary)] mb-2">Theme</label>
            <div className="flex gap-2">
              <button
                onClick={() => updateSetting('theme', 'dark')}
                className={`flex-1 py-2 px-3 rounded text-sm flex items-center justify-center gap-2 transition-colors ${
                  settings.theme === 'dark'
                    ? 'bg-[var(--accent-color)] text-white'
                    : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                <Moon size={16} />
                Dark
              </button>
              <button
                onClick={() => updateSetting('theme', 'light')}
                className={`flex-1 py-2 px-3 rounded text-sm flex items-center justify-center gap-2 transition-colors ${
                  settings.theme === 'light'
                    ? 'bg-[var(--accent-color)] text-white'
                    : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                <Sun size={16} />
                Light
              </button>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-2">
              Current: {settings.theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
            </p>
          </div>

          {/* Font Size */}
          <div>
            <label className="block text-sm text-[var(--text-primary)] mb-2">
              Font Size: {settings.fontSize}px
            </label>
            <input
              type="range"
              min="10"
              max="24"
              value={settings.fontSize}
              onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
              className="w-full accent-[var(--accent-color)]"
            />
          </div>

          {/* Tab Size */}
          <div>
            <label className="block text-sm text-[var(--text-primary)] mb-2">
              Tab Size: {settings.tabSize}
            </label>
            <div className="flex gap-2">
              {[2, 4, 6, 8].map((size) => (
                <button
                  key={size}
                  onClick={() => updateSetting('tabSize', size)}
                  className={`flex-1 py-2 px-3 rounded text-sm transition-colors ${
                    settings.tabSize === size
                      ? 'bg-[var(--accent-color)] text-white'
                      : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Word Wrap */}
          <div>
            <label className="block text-sm text-[var(--text-primary)] mb-2">Word Wrap</label>
            <button
              onClick={() => updateSetting('wordWrap', !settings.wordWrap)}
              className={`w-full py-2 px-3 rounded text-sm transition-colors ${
                settings.wordWrap
                  ? 'bg-[var(--accent-color)] text-white'
                  : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              {settings.wordWrap ? '✅ Enabled' : '❌ Disabled'}
            </button>
          </div>

          {/* Auto Save */}
          <div>
            <label className="block text-sm text-[var(--text-primary)] mb-2">Auto Save</label>
            <button
              onClick={() => updateSetting('autoSave', !settings.autoSave)}
              className={`w-full py-2 px-3 rounded text-sm transition-colors ${
                settings.autoSave
                  ? 'bg-[var(--accent-color)] text-white'
                  : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              {settings.autoSave ? '✅ Enabled' : '❌ Disabled'}
            </button>
          </div>

          <div className="border-t border-[var(--border-color)] pt-4">
            <p className="text-xs text-[var(--text-secondary)]">
              Settings are saved automatically
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};