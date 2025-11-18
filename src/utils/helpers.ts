import { format, formatDistanceToNow, isToday, isThisWeek, isThisMonth } from 'date-fns';

// Generate unique IDs
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Date formatting utilities
export function formatDate(date: string | Date, formatStr: string = 'MMM dd, yyyy'): string {
  try {
    return format(new Date(date), formatStr);
  } catch {
    return 'Invalid date';
  }
}

export function formatRelativeTime(date: string | Date): string {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return 'Unknown';
  }
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

// Task utilities
export function isTaskOverdue(dueDate?: string): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
}

export function isTaskDueToday(dueDate?: string): boolean {
  if (!dueDate) return false;
  return isToday(new Date(dueDate));
}

export function isTaskDueThisWeek(dueDate?: string): boolean {
  if (!dueDate) return false;
  return isThisWeek(new Date(dueDate));
}

// Date checking utilities
export function isDateToday(date: string | Date): boolean {
  return isToday(new Date(date));
}

export function isDateThisWeek(date: string | Date): boolean {
  return isThisWeek(new Date(date));
}

export function isDateThisMonth(date: string | Date): boolean {
  return isThisMonth(new Date(date));
}

// Color utilities
export function getRandomColor(): string {
  const colors = [
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#f59e0b', // amber
    '#10b981', // green
    '#06b6d4', // cyan
    '#f43f5e', // rose
    '#6366f1', // indigo
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Array utilities
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const group = String(item[key]);
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

// String utilities
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Download utility
export function downloadFile(content: string, filename: string, mimeType: string = 'application/json'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Keyboard shortcut checker
export function matchesShortcut(event: KeyboardEvent, shortcut: string): boolean {
  const parts = shortcut.toLowerCase().split('+');
  const key = parts[parts.length - 1];
  const modifiers = parts.slice(0, -1);

  const keyMatches = event.key.toLowerCase() === key || event.code.toLowerCase() === key;
  const ctrlMatches = modifiers.includes('ctrl') ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
  const shiftMatches = modifiers.includes('shift') ? event.shiftKey : !event.shiftKey;
  const altMatches = modifiers.includes('alt') ? event.altKey : !event.altKey;

  return keyMatches && ctrlMatches && shiftMatches && altMatches;
}
