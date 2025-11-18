import React, { useMemo } from 'react';
import { CheckCircle2, Clock, FileText, FolderKanban, TrendingUp, AlertCircle } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { useTaskStore } from '../store/taskStore';
import { useNoteStore } from '../store/noteStore';
import { useProjectStore } from '../store/projectStore';
import { useTimerStore } from '../store/timerStore';
import { isDateToday, isDateThisWeek, isDateThisMonth, formatDuration, isTaskOverdue } from '../utils/helpers';

export const Dashboard: React.FC = () => {
  const tasks = useTaskStore((state) => state.tasks);
  const notes = useNoteStore((state) => state.notes);
  const allProjects = useProjectStore((state) => state.projects);
  const sessions = useTimerStore((state) => state.sessions);

  const projects = useMemo(() => {
    return allProjects.filter(p => !p.isArchived);
  }, [allProjects]);

  const totalTimeTracked = useMemo(() => {
    return sessions.reduce((total, session) => total + session.duration, 0);
  }, [sessions]);

  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
    const overdueTasks = tasks.filter(t => isTaskOverdue(t.dueDate) && t.status !== 'completed').length;

    const tasksCompletedToday = tasks.filter(
      t => t.completedAt && isDateToday(t.completedAt)
    ).length;

    const tasksCompletedThisWeek = tasks.filter(
      t => t.completedAt && isDateThisWeek(t.completedAt)
    ).length;

    const tasksCompletedThisMonth = tasks.filter(
      t => t.completedAt && isDateThisMonth(t.completedAt)
    ).length;

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      totalNotes: notes.length,
      totalProjects: projects.length,
      tasksCompletedToday,
      tasksCompletedThisWeek,
      tasksCompletedThisMonth,
      completionRate,
    };
  }, [tasks, notes, projects]);

  const recentTasks = useMemo(() => {
    return [...tasks]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
  }, [tasks]);

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    subtitle?: string;
  }> = ({ title, value, icon: Icon, color, subtitle }) => (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-4 rounded-full ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here's what's happening with your workspace today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Tasks"
          value={stats.totalTasks}
          icon={CheckCircle2}
          color="bg-blue-500"
          subtitle={`${stats.completedTasks} completed`}
        />
        <StatCard
          title="In Progress"
          value={stats.inProgressTasks}
          icon={Clock}
          color="bg-purple-500"
        />
        <StatCard
          title="Notes"
          value={stats.totalNotes}
          icon={FileText}
          color="bg-green-500"
        />
        <StatCard
          title="Projects"
          value={stats.totalProjects}
          icon={FolderKanban}
          color="bg-orange-500"
        />
      </div>

      {/* Progress and Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Progress */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp size={20} />
            Completion Progress
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Overall</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {stats.completionRate}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${stats.completionRate}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.tasksCompletedToday}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Today</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.tasksCompletedThisWeek}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">This Week</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.tasksCompletedThisMonth}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">This Month</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Time Tracked */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock size={20} />
            Time Tracked
          </h3>
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {formatDuration(totalTimeTracked)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total time tracked</p>
          </div>
          {stats.overdueTasks > 0 && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900 dark:text-red-100">
                  {stats.overdueTasks} overdue {stats.overdueTasks === 1 ? 'task' : 'tasks'}
                </p>
                <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                  You have tasks that are past their due date
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Recent Tasks */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Tasks
        </h3>
        <div className="space-y-3">
          {recentTasks.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
              No tasks yet. Create your first task to get started!
            </p>
          ) : (
            recentTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                      {task.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Badge
                    variant={
                      task.status === 'completed'
                        ? 'success'
                        : task.status === 'in-progress'
                        ? 'info'
                        : 'default'
                    }
                    size="sm"
                  >
                    {task.status}
                  </Badge>
                  <Badge
                    variant={
                      task.priority === 'urgent'
                        ? 'danger'
                        : task.priority === 'high'
                        ? 'warning'
                        : 'default'
                    }
                    size="sm"
                  >
                    {task.priority}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};
