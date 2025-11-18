// Local Storage utility functions with type safety

const STORAGE_KEYS = {
  TASKS: 'testsaas_tasks',
  PROJECTS: 'testsaas_projects',
  NOTES: 'testsaas_notes',
  TIME_SESSIONS: 'testsaas_time_sessions',
  SETTINGS: 'testsaas_settings',
  HISTORY: 'testsaas_history',
} as const;

export function saveToStorage<T>(key: string, data: T): void {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(key, serialized);
  } catch (error) {
    console.error(`Error saving to localStorage:`, error);
  }
}

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error loading from localStorage:`, error);
    return defaultValue;
  }
}

export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage:`, error);
  }
}

export function clearAllStorage(): void {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error(`Error clearing localStorage:`, error);
  }
}

export function exportData(): string {
  const data = {
    tasks: localStorage.getItem(STORAGE_KEYS.TASKS),
    projects: localStorage.getItem(STORAGE_KEYS.PROJECTS),
    notes: localStorage.getItem(STORAGE_KEYS.NOTES),
    timeSessions: localStorage.getItem(STORAGE_KEYS.TIME_SESSIONS),
    settings: localStorage.getItem(STORAGE_KEYS.SETTINGS),
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
}

export function importData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);

    if (data.tasks) localStorage.setItem(STORAGE_KEYS.TASKS, data.tasks);
    if (data.projects) localStorage.setItem(STORAGE_KEYS.PROJECTS, data.projects);
    if (data.notes) localStorage.setItem(STORAGE_KEYS.NOTES, data.notes);
    if (data.timeSessions) localStorage.setItem(STORAGE_KEYS.TIME_SESSIONS, data.timeSessions);
    if (data.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, data.settings);

    return true;
  } catch (error) {
    console.error(`Error importing data:`, error);
    return false;
  }
}

export { STORAGE_KEYS };
