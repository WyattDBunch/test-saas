import React, { useState, useMemo } from 'react';
import { Plus, FolderKanban, Archive, ArchiveRestore, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Textarea } from '../components/common/Textarea';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';
import { useProjectStore } from '../store/projectStore';
import { useTaskStore } from '../store/taskStore';
import type { Project } from '../types';
import { formatRelativeTime } from '../utils/helpers';

const ICON_OPTIONS = ['📁', '🚀', '💼', '🎯', '⚡', '🔥', '💡', '🌟', '🎨', '🔧'];

export const Projects: React.FC = () => {
  const { projects, addProject, updateProject, deleteProject, archiveProject, unarchiveProject } = useProjectStore();
  const tasks = useTaskStore((state) => state.tasks);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '📁',
    color: '#3B82F6',
  });

  const displayedProjects = useMemo(() => {
    return projects.filter(p => p.isArchived === showArchived);
  }, [projects, showArchived]);

  const getProjectTaskStats = (projectId: string) => {
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    const completed = projectTasks.filter(t => t.status === 'completed').length;
    return {
      total: projectTasks.length,
      completed,
      inProgress: projectTasks.filter(t => t.status === 'in-progress').length,
      percentage: projectTasks.length > 0 ? Math.round((completed / projectTasks.length) * 100) : 0,
    };
  };

  const handleOpenModal = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        name: project.name,
        description: project.description,
        icon: project.icon,
        color: project.color,
      });
    } else {
      setEditingProject(null);
      setFormData({
        name: '',
        description: '',
        icon: '📁',
        color: '#3B82F6',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) return;

    if (editingProject) {
      updateProject(editingProject.id, formData);
    } else {
      addProject(formData);
    }

    handleCloseModal();
  };

  const handleDelete = (projectId: string) => {
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    const message = projectTasks.length > 0
      ? `This project has ${projectTasks.length} task(s). Are you sure you want to delete it?`
      : 'Are you sure you want to delete this project?';

    if (window.confirm(message)) {
      deleteProject(projectId);
    }
  };

  const handleArchiveToggle = (project: Project) => {
    if (project.isArchived) {
      unarchiveProject(project.id);
    } else {
      archiveProject(project.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Projects</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {displayedProjects.length} {showArchived ? 'archived' : 'active'} {displayedProjects.length === 1 ? 'project' : 'projects'}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => setShowArchived(!showArchived)}
            icon={showArchived ? Archive : ArchiveRestore}
          >
            {showArchived ? 'Show Active' : 'Show Archived'}
          </Button>
          <Button onClick={() => handleOpenModal()} icon={Plus}>
            New Project
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      {displayedProjects.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <FolderKanban size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {showArchived
                ? 'No archived projects.'
                : 'No projects yet. Create your first project to get started!'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedProjects.map((project) => {
            const stats = getProjectTaskStats(project.id);
            return (
              <Card key={project.id} hover>
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ backgroundColor: project.color + '20' }}
                    >
                      {project.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {project.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatRelativeTime(project.updatedAt)}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="flex-1 mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {project.description || 'No description'}
                    </p>
                  </div>

                  {/* Task Stats */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {stats.completed}/{stats.total} tasks
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${stats.percentage}%`,
                          backgroundColor: project.color,
                        }}
                      />
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {stats.inProgress > 0 && (
                      <Badge variant="info" size="sm">
                        {stats.inProgress} in progress
                      </Badge>
                    )}
                    {project.isArchived && (
                      <Badge variant="default" size="sm">
                        Archived
                      </Badge>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Edit2}
                      onClick={() => handleOpenModal(project)}
                      fullWidth
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={project.isArchived ? ArchiveRestore : Archive}
                      onClick={() => handleArchiveToggle(project)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      onClick={() => handleDelete(project.id)}
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingProject ? 'Edit Project' : 'New Project'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Project Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter project name..."
            required
          />

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter project description..."
            rows={4}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon })}
                  className={`w-12 h-12 text-2xl rounded-lg border-2 transition-all ${
                    formData.icon === icon
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#06B6D4', '#EF4444', '#6366F1'].map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-10 h-10 rounded-lg border-2 transition-all ${
                    formData.color === color
                      ? 'border-gray-900 dark:border-white scale-110'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit">
              {editingProject ? 'Update Project' : 'Create Project'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
