import { create } from 'zustand';
import type { Note, NoteFilters } from '../types';
import { generateId } from '../utils/helpers';
import { saveToStorage, loadFromStorage, STORAGE_KEYS } from '../utils/storage';

interface NoteState {
  notes: Note[];
  filters: NoteFilters;
  selectedNoteId: string | null;

  // Actions
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'isPinned'>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  togglePin: (id: string) => void;
  setFilters: (filters: Partial<NoteFilters>) => void;
  clearFilters: () => void;
  setSelectedNote: (id: string | null) => void;
  getNoteById: (id: string) => Note | undefined;
  getFilteredNotes: () => Note[];
  loadNotes: () => void;
  saveNotes: () => void;
}

const DEFAULT_FILTERS: NoteFilters = {};

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: loadFromStorage<Note[]>(STORAGE_KEYS.NOTES, []),
  filters: DEFAULT_FILTERS,
  selectedNoteId: null,

  addNote: (noteData) => {
    const newNote: Note = {
      ...noteData,
      id: generateId(),
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => {
      const newNotes = [...state.notes, newNote];
      saveToStorage(STORAGE_KEYS.NOTES, newNotes);
      return { notes: newNotes };
    });
  },

  updateNote: (id, updates) => {
    set((state) => {
      const newNotes = state.notes.map((note) =>
        note.id === id
          ? { ...note, ...updates, updatedAt: new Date().toISOString() }
          : note
      );
      saveToStorage(STORAGE_KEYS.NOTES, newNotes);
      return { notes: newNotes };
    });
  },

  deleteNote: (id) => {
    set((state) => {
      const newNotes = state.notes.filter((note) => note.id !== id);
      saveToStorage(STORAGE_KEYS.NOTES, newNotes);
      return {
        notes: newNotes,
        selectedNoteId: state.selectedNoteId === id ? null : state.selectedNoteId,
      };
    });
  },

  togglePin: (id) => {
    set((state) => {
      const newNotes = state.notes.map((note) =>
        note.id === id
          ? { ...note, isPinned: !note.isPinned, updatedAt: new Date().toISOString() }
          : note
      );
      saveToStorage(STORAGE_KEYS.NOTES, newNotes);
      return { notes: newNotes };
    });
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  clearFilters: () => {
    set({ filters: DEFAULT_FILTERS });
  },

  setSelectedNote: (id) => {
    set({ selectedNoteId: id });
  },

  getNoteById: (id) => {
    return get().notes.find((note) => note.id === id);
  },

  getFilteredNotes: () => {
    const { notes, filters } = get();
    let filtered = [...notes];

    if (filters.category && filters.category.length > 0) {
      filtered = filtered.filter((note) => filters.category!.includes(note.category));
    }

    if (filters.projectId) {
      filtered = filtered.filter((note) => note.projectId === filters.projectId);
    }

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter((note) =>
        filters.tags!.some((tag) => note.tags.includes(tag))
      );
    }

    if (filters.isPinned !== undefined) {
      filtered = filtered.filter((note) => note.isPinned === filters.isPinned);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(searchLower) ||
          note.content.toLowerCase().includes(searchLower)
      );
    }

    // Sort: pinned notes first, then by updated date
    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  },

  loadNotes: () => {
    const notes = loadFromStorage<Note[]>(STORAGE_KEYS.NOTES, []);
    set({ notes });
  },

  saveNotes: () => {
    saveToStorage(STORAGE_KEYS.NOTES, get().notes);
  },
}));
