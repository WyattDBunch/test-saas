import { create } from 'zustand';
import type { Task, TaskStatus, TaskFilters } from '../types';
import { generateId } from '../utils/helpers';
import { saveToStorage, loadFromStorage, STORAGE_KEYS } from '../utils/storage';

interface TaskState {
  tasks: Task[];
  filters: TaskFilters;
  selectedTaskId: string | null;

  // Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
  reorderTasks: (tasks: Task[]) => void;
  setFilters: (filters: Partial<TaskFilters>) => void;
  clearFilters: () => void;
  setSelectedTask: (id: string | null) => void;
  getTaskById: (id: string) => Task | undefined;
  getFilteredTasks: () => Task[];
  getTasks: () => Task[];
  loadTasks: () => void;
  saveTasks: () => void;
}

const DEFAULT_FILTERS: TaskFilters = {};

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: loadFromStorage<Task[]>(STORAGE_KEYS.TASKS, []),
  filters: DEFAULT_FILTERS,
  selectedTaskId: null,

  addTask: (taskData) => {
    const newTask: Task = {
      ...taskData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      order: get().tasks.length,
    };

    set((state) => {
      const newTasks = [...state.tasks, newTask];
      saveToStorage(STORAGE_KEYS.TASKS, newTasks);
      return { tasks: newTasks };
    });
  },

  updateTask: (id, updates) => {
    set((state) => {
      const newTasks = state.tasks.map((task) =>
        task.id === id
          ? { ...task, ...updates, updatedAt: new Date().toISOString() }
          : task
      );
      saveToStorage(STORAGE_KEYS.TASKS, newTasks);
      return { tasks: newTasks };
    });
  },

  deleteTask: (id) => {
    set((state) => {
      const newTasks = state.tasks.filter((task) => task.id !== id);
      saveToStorage(STORAGE_KEYS.TASKS, newTasks);
      return {
        tasks: newTasks,
        selectedTaskId: state.selectedTaskId === id ? null : state.selectedTaskId,
      };
    });
  },

  toggleTaskStatus: (id) => {
    set((state) => {
      const task = state.tasks.find((t) => t.id === id);
      if (!task) return state;

      const newStatus: TaskStatus =
        task.status === 'completed' ? 'todo' : 'completed';
      const completedAt = newStatus === 'completed' ? new Date().toISOString() : undefined;

      const newTasks = state.tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              status: newStatus,
              completedAt,
              updatedAt: new Date().toISOString(),
            }
          : t
      );

      saveToStorage(STORAGE_KEYS.TASKS, newTasks);
      return { tasks: newTasks };
    });
  },

  reorderTasks: (reorderedTasks) => {
    const tasksWithOrder = reorderedTasks.map((task, index) => ({
      ...task,
      order: index,
    }));

    set({ tasks: tasksWithOrder });
    saveToStorage(STORAGE_KEYS.TASKS, tasksWithOrder);
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  clearFilters: () => {
    set({ filters: DEFAULT_FILTERS });
  },

  setSelectedTask: (id) => {
    set({ selectedTaskId: id });
  },

  getTaskById: (id) => {
    return get().tasks.find((task) => task.id === id);
  },

  getFilteredTasks: () => {
    const { tasks, filters } = get();
    let filtered = [...tasks];

    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter((task) => filters.status!.includes(task.status));
    }

    if (filters.priority && filters.priority.length > 0) {
      filtered = filtered.filter((task) => filters.priority!.includes(task.priority));
    }

    if (filters.projectId) {
      filtered = filtered.filter((task) => task.projectId === filters.projectId);
    }

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter((task) =>
        filters.tags!.some((tag) => task.tags.includes(tag))
      );
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchLower) ||
          task.description.toLowerCase().includes(searchLower)
      );
    }

    if (filters.dueDateFrom) {
      filtered = filtered.filter(
        (task) => task.dueDate && task.dueDate >= filters.dueDateFrom!
      );
    }

    if (filters.dueDateTo) {
      filtered = filtered.filter(
        (task) => task.dueDate && task.dueDate <= filters.dueDateTo!
      );
    }

    return filtered.sort((a, b) => a.order - b.order);
  },

  getTasks: () => get().tasks,

  loadTasks: () => {
    const tasks = loadFromStorage<Task[]>(STORAGE_KEYS.TASKS, []);
    set({ tasks });
  },

  saveTasks: () => {
    saveToStorage(STORAGE_KEYS.TASKS, get().tasks);
  },
}));
