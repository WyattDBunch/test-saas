import React, { useState, useMemo } from 'react';
import { Plus, Search, Trash2, Edit2, Pin, PinOff, FileText } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Textarea } from '../components/common/Textarea';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';
import { useNoteStore } from '../store/noteStore';
import type { Note, NoteCategory } from '../types';
import { formatRelativeTime } from '../utils/helpers';

export const Notes: React.FC = () => {
  const { notes, addNote, updateNote, deleteNote, togglePin } = useNoteStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<NoteCategory | 'all'>('all');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general' as NoteCategory,
    tags: [] as string[],
  });

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesSearch =
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = categoryFilter === 'all' || note.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [notes, searchQuery, categoryFilter]);

  // Sort by pinned first, then by updated date
  const sortedNotes = useMemo(() => {
    return [...filteredNotes].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [filteredNotes]);

  const handleOpenModal = (note?: Note) => {
    if (note) {
      setEditingNote(note);
      setFormData({
        title: note.title,
        content: note.content,
        category: note.category,
        tags: note.tags,
      });
    } else {
      setEditingNote(null);
      setFormData({
        title: '',
        content: '',
        category: 'general',
        tags: [],
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingNote(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) return;

    if (editingNote) {
      updateNote(editingNote.id, formData);
    } else {
      addNote(formData);
    }

    handleCloseModal();
  };

  const handleDelete = (noteId: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      deleteNote(noteId);
    }
  };

  const getCategoryColor = (category: NoteCategory) => {
    switch (category) {
      case 'idea':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200';
      case 'meeting':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200';
      case 'documentation':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
      case 'reference':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notes</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {sortedNotes.length} {sortedNotes.length === 1 ? 'note' : 'notes'}
          </p>
        </div>
        <Button onClick={() => handleOpenModal()} icon={Plus}>
          New Note
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={Search}
          />
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as NoteCategory | 'all')}
            options={[
              { value: 'all', label: 'All Categories' },
              { value: 'general', label: 'General' },
              { value: 'idea', label: 'Idea' },
              { value: 'meeting', label: 'Meeting' },
              { value: 'documentation', label: 'Documentation' },
              { value: 'reference', label: 'Reference' },
            ]}
          />
        </div>
      </Card>

      {/* Notes Grid */}
      {sortedNotes.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery || categoryFilter !== 'all'
                ? 'No notes found matching your filters.'
                : 'No notes yet. Create your first note to get started!'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedNotes.map((note) => (
            <Card key={note.id} hover>
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {note.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatRelativeTime(note.updatedAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => togglePin(note.id)}
                    className="flex-shrink-0 text-gray-400 hover:text-yellow-500 transition-colors"
                  >
                    {note.isPinned ? (
                      <Pin size={18} className="fill-yellow-500 text-yellow-500" />
                    ) : (
                      <PinOff size={18} />
                    )}
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-4">
                    {note.content || 'No content'}
                  </p>
                </div>

                {/* Metadata */}
                <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-wrap gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(note.category)}`}>
                      {note.category}
                    </span>
                    {note.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} size="sm" variant="info">
                        {tag}
                      </Badge>
                    ))}
                    {note.tags.length > 2 && (
                      <Badge size="sm">+{note.tags.length - 2}</Badge>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Edit2}
                      onClick={() => handleOpenModal(note)}
                      fullWidth
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      onClick={() => handleDelete(note.id)}
                    />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingNote ? 'Edit Note' : 'New Note'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter note title..."
            required
          />

          <Textarea
            label="Content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Write your note here..."
            rows={8}
          />

          <Select
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as NoteCategory })}
            options={[
              { value: 'general', label: 'General' },
              { value: 'idea', label: 'Idea' },
              { value: 'meeting', label: 'Meeting' },
              { value: 'documentation', label: 'Documentation' },
              { value: 'reference', label: 'Reference' },
            ]}
          />

          <Input
            label="Tags (comma separated)"
            value={formData.tags.join(', ')}
            onChange={(e) => setFormData({
              ...formData,
              tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
            })}
            placeholder="tag1, tag2, tag3"
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit">
              {editingNote ? 'Update Note' : 'Create Note'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
