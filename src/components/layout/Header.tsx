import React from 'react';
import { Menu, Search, Moon, Sun, Command } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { Button } from '../common/Button';

export const Header: React.FC = () => {
  const { toggleSidebar, toggleTheme, settings, setCommandPaletteOpen } = useAppStore();

  const viewTitles = {
    dashboard: 'Dashboard',
    tasks: 'Tasks',
    notes: 'Notes',
    timer: 'Time Tracker',
    projects: 'Projects',
    settings: 'Settings',
  };

  const { currentView } = useAppStore();

  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
          >
            <Menu size={24} />
          </button>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {viewTitles[currentView]}
          </h2>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* Command Palette Trigger */}
          <Button
            variant="ghost"
            size="sm"
            icon={Command}
            onClick={() => setCommandPaletteOpen(true)}
            className="hidden md:flex"
          >
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Ctrl+K
            </span>
          </Button>

          {/* Search - Mobile */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
            onClick={() => setCommandPaletteOpen(true)}
          >
            <Search size={20} />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
            aria-label="Toggle theme"
          >
            {settings.theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
};
