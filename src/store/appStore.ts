import { create } from 'zustand';
import type { AppSettings } from '../types';
import { saveToStorage, loadFromStorage, STORAGE_KEYS } from '../utils/storage';

interface AppState {
  settings: AppSettings;
  commandPaletteOpen: boolean;
  sidebarOpen: boolean;
  currentView: 'dashboard' | 'tasks' | 'notes' | 'timer' | 'projects' | 'settings';

  // Actions
  updateSettings: (settings: Partial<AppSettings>) => void;
  toggleTheme: () => void;
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setCurrentView: (view: AppState['currentView']) => void;
  loadSettings: () => void;
  saveSettings: () => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  accentColor: '#3b82f6',
  soundEnabled: true,
  notificationsEnabled: true,
  compactMode: false,
  showCompletedTasks: true,
  defaultTaskView: 'list',
};

export const useAppStore = create<AppState>((set, get) => ({
  settings: loadFromStorage<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS),
  commandPaletteOpen: false,
  sidebarOpen: true,
  currentView: 'dashboard',

  updateSettings: (newSettings) => {
    set((state) => {
      const updatedSettings = { ...state.settings, ...newSettings };
      saveToStorage(STORAGE_KEYS.SETTINGS, updatedSettings);

      // Apply theme to document
      if (newSettings.theme) {
        if (newSettings.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else if (newSettings.theme === 'light') {
          document.documentElement.classList.remove('dark');
        } else {
          // Auto mode
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          if (prefersDark) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      }

      return { settings: updatedSettings };
    });
  },

  toggleTheme: () => {
    const { settings } = get();
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    get().updateSettings({ theme: newTheme });
  },

  toggleCommandPalette: () => {
    set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen }));
  },

  setCommandPaletteOpen: (open) => {
    set({ commandPaletteOpen: open });
  },

  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },

  setCurrentView: (view) => {
    set({ currentView: view });
  },

  loadSettings: () => {
    const settings = loadFromStorage<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    set({ settings });

    // Apply theme on load
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (settings.theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      }
    }
  },

  saveSettings: () => {
    saveToStorage(STORAGE_KEYS.SETTINGS, get().settings);
  },
}));
