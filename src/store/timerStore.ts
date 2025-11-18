import { create } from 'zustand';
import type { TimeSession } from '../types';
import { generateId } from '../utils/helpers';
import { saveToStorage, loadFromStorage, STORAGE_KEYS } from '../utils/storage';

interface TimerState {
  sessions: TimeSession[];
  activeSession: TimeSession | null;
  currentTime: number; // in seconds

  // Actions
  startSession: (data: { taskId?: string; projectId?: string; description: string; tags?: string[] }) => void;
  stopSession: () => void;
  updateCurrentTime: (seconds: number) => void;
  deleteSession: (id: string) => void;
  getSessionsByTask: (taskId: string) => TimeSession[];
  getSessionsByProject: (projectId: string) => TimeSession[];
  getTotalTimeByTask: (taskId: string) => number;
  getTotalTimeByProject: (projectId: string) => number;
  getTotalTimeTracked: () => number;
  loadSessions: () => void;
  saveSessions: () => void;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  sessions: loadFromStorage<TimeSession[]>(STORAGE_KEYS.TIME_SESSIONS, []),
  activeSession: null,
  currentTime: 0,

  startSession: (data) => {
    // Stop any existing active session first
    if (get().activeSession) {
      get().stopSession();
    }

    const newSession: TimeSession = {
      id: generateId(),
      taskId: data.taskId,
      projectId: data.projectId,
      description: data.description,
      tags: data.tags || [],
      startTime: new Date().toISOString(),
      duration: 0,
      createdAt: new Date().toISOString(),
    };

    set({ activeSession: newSession, currentTime: 0 });
  },

  stopSession: () => {
    const { activeSession, currentTime } = get();
    if (!activeSession) return;

    const completedSession: TimeSession = {
      ...activeSession,
      endTime: new Date().toISOString(),
      duration: currentTime,
    };

    set((state) => {
      const newSessions = [...state.sessions, completedSession];
      saveToStorage(STORAGE_KEYS.TIME_SESSIONS, newSessions);
      return {
        sessions: newSessions,
        activeSession: null,
        currentTime: 0,
      };
    });
  },

  updateCurrentTime: (seconds) => {
    set({ currentTime: seconds });
  },

  deleteSession: (id) => {
    set((state) => {
      const newSessions = state.sessions.filter((session) => session.id !== id);
      saveToStorage(STORAGE_KEYS.TIME_SESSIONS, newSessions);
      return { sessions: newSessions };
    });
  },

  getSessionsByTask: (taskId) => {
    return get().sessions.filter((session) => session.taskId === taskId);
  },

  getSessionsByProject: (projectId) => {
    return get().sessions.filter((session) => session.projectId === projectId);
  },

  getTotalTimeByTask: (taskId) => {
    return get()
      .sessions.filter((session) => session.taskId === taskId)
      .reduce((total, session) => total + session.duration, 0);
  },

  getTotalTimeByProject: (projectId) => {
    return get()
      .sessions.filter((session) => session.projectId === projectId)
      .reduce((total, session) => total + session.duration, 0);
  },

  getTotalTimeTracked: () => {
    return get().sessions.reduce((total, session) => total + session.duration, 0);
  },

  loadSessions: () => {
    const sessions = loadFromStorage<TimeSession[]>(STORAGE_KEYS.TIME_SESSIONS, []);
    set({ sessions });
  },

  saveSessions: () => {
    saveToStorage(STORAGE_KEYS.TIME_SESSIONS, get().sessions);
  },
}));
