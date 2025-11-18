// ==================== TASK TYPES ====================
export type TaskStatus = 'todo' | 'in-progress' | 'completed' | 'archived';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  tags: string[];
  projectId?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  estimatedTime?: number; // in minutes
  timeSpent?: number; // in minutes
  order: number;
}

// ==================== PROJECT TYPES ====================
export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
}

// ==================== NOTE TYPES ====================
export type NoteCategory = 'general' | 'idea' | 'meeting' | 'documentation' | 'reference';

export interface Note {
  id: string;
  title: string;
  content: string;
  category: NoteCategory;
  tags: string[];
  projectId?: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== TIME TRACKER TYPES ====================
export interface TimeSession {
  id: string;
  taskId?: string;
  projectId?: string;
  description: string;
  startTime: string;
  endTime?: string;
  duration: number; // in seconds
  tags: string[];
  createdAt: string;
}

// ==================== APP STATE TYPES ====================
export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  accentColor: string;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  compactMode: boolean;
  showCompletedTasks: boolean;
  defaultTaskView: 'list' | 'board' | 'calendar';
}

// ==================== FILTER & SEARCH TYPES ====================
export interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  projectId?: string;
  tags?: string[];
  search?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
}

export interface NoteFilters {
  category?: NoteCategory[];
  projectId?: string;
  tags?: string[];
  search?: string;
  isPinned?: boolean;
}

// ==================== STATISTICS TYPES ====================
export interface Statistics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  totalProjects: number;
  totalNotes: number;
  totalTimeTracked: number; // in seconds
  tasksCompletedToday: number;
  tasksCompletedThisWeek: number;
  tasksCompletedThisMonth: number;
  productivityScore: number; // 0-100
  averageTaskCompletionTime: number; // in hours
}

// ==================== COMMAND PALETTE TYPES ====================
export interface Command {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  shortcut?: string;
  category: 'navigation' | 'task' | 'note' | 'project' | 'settings' | 'other';
  action: () => void;
}

// ==================== HISTORY TYPES (for undo/redo) ====================
export interface HistoryState {
  tasks: Task[];
  notes: Note[];
  projects: Project[];
  timestamp: number;
}
