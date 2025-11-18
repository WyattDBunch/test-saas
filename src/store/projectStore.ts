import { create } from 'zustand';
import type { Project } from '../types';
import { generateId, getRandomColor } from '../utils/helpers';
import { saveToStorage, loadFromStorage, STORAGE_KEYS } from '../utils/storage';

interface ProjectState {
  projects: Project[];
  selectedProjectId: string | null;

  // Actions
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'isArchived'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  archiveProject: (id: string) => void;
  unarchiveProject: (id: string) => void;
  setSelectedProject: (id: string | null) => void;
  getProjectById: (id: string) => Project | undefined;
  getActiveProjects: () => Project[];
  loadProjects: () => void;
  saveProjects: () => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: loadFromStorage<Project[]>(STORAGE_KEYS.PROJECTS, []),
  selectedProjectId: null,

  addProject: (projectData) => {
    const newProject: Project = {
      ...projectData,
      id: generateId(),
      color: projectData.color || getRandomColor(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isArchived: false,
    };

    set((state) => {
      const newProjects = [...state.projects, newProject];
      saveToStorage(STORAGE_KEYS.PROJECTS, newProjects);
      return { projects: newProjects };
    });
  },

  updateProject: (id, updates) => {
    set((state) => {
      const newProjects = state.projects.map((project) =>
        project.id === id
          ? { ...project, ...updates, updatedAt: new Date().toISOString() }
          : project
      );
      saveToStorage(STORAGE_KEYS.PROJECTS, newProjects);
      return { projects: newProjects };
    });
  },

  deleteProject: (id) => {
    set((state) => {
      const newProjects = state.projects.filter((project) => project.id !== id);
      saveToStorage(STORAGE_KEYS.PROJECTS, newProjects);
      return {
        projects: newProjects,
        selectedProjectId: state.selectedProjectId === id ? null : state.selectedProjectId,
      };
    });
  },

  archiveProject: (id) => {
    set((state) => {
      const newProjects = state.projects.map((project) =>
        project.id === id
          ? { ...project, isArchived: true, updatedAt: new Date().toISOString() }
          : project
      );
      saveToStorage(STORAGE_KEYS.PROJECTS, newProjects);
      return { projects: newProjects };
    });
  },

  unarchiveProject: (id) => {
    set((state) => {
      const newProjects = state.projects.map((project) =>
        project.id === id
          ? { ...project, isArchived: false, updatedAt: new Date().toISOString() }
          : project
      );
      saveToStorage(STORAGE_KEYS.PROJECTS, newProjects);
      return { projects: newProjects };
    });
  },

  setSelectedProject: (id) => {
    set({ selectedProjectId: id });
  },

  getProjectById: (id) => {
    return get().projects.find((project) => project.id === id);
  },

  getActiveProjects: () => {
    return get().projects.filter((project) => !project.isArchived);
  },

  loadProjects: () => {
    const projects = loadFromStorage<Project[]>(STORAGE_KEYS.PROJECTS, []);
    set({ projects });
  },

  saveProjects: () => {
    saveToStorage(STORAGE_KEYS.PROJECTS, get().projects);
  },
}));
