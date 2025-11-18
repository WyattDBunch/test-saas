import React, { useState, useEffect } from 'react';
import { Play, Square, Clock, Trash2, Calendar } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';
import { useTimerStore } from '../store/timerStore';
import { useTaskStore } from '../store/taskStore';
import { useProjectStore } from '../store/projectStore';
import { formatDuration, formatDate } from '../utils/helpers';

export const TimeTracker: React.FC = () => {
  const {
    activeSession,
    sessions,
    currentTime,
    startSession,
    stopSession,
    updateCurrentTime,
    deleteSession,
    getTotalTimeTracked,
  } = useTimerStore();

  const tasks = useTaskStore((state) => state.tasks);
  const allProjects = useProjectStore((state) => state.projects);

  const projects = React.useMemo(() => {
    return allProjects.filter(p => !p.isArchived);
  }, [allProjects]);

  const [description, setDescription] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');

  // Update timer every second when active
  useEffect(() => {
    let interval: number | undefined;

    if (activeSession) {
      interval = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - new Date(activeSession.startTime).getTime()) / 1000);
        updateCurrentTime(elapsed);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeSession, updateCurrentTime]);

  const handleStart = () => {
    if (!description.trim()) return;

    startSession({
      description: description.trim(),
      taskId: selectedTaskId || undefined,
      projectId: selectedProjectId || undefined,
      tags: [],
    });
  };

  const handleStop = () => {
    stopSession();
    setDescription('');
    setSelectedTaskId('');
    setSelectedProjectId('');
  };

  const handleDelete = (sessionId: string) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      deleteSession(sessionId);
    }
  };

  // Sort sessions by date (newest first)
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );

  // Group sessions by date
  const groupedSessions = sortedSessions.reduce((groups, session) => {
    const date = formatDate(session.startTime);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(session);
    return groups;
  }, {} as Record<string, typeof sortedSessions>);

  const getTaskName = (taskId?: string) => {
    if (!taskId) return null;
    return tasks.find(t => t.id === taskId)?.title;
  };

  const getProjectName = (projectId?: string) => {
    if (!projectId) return null;
    return projects.find(p => p.id === projectId)?.name;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Time Tracker</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Track your time across tasks and projects
        </p>
      </div>

      {/* Active Timer Card */}
      <Card>
        <div className="space-y-6">
          {/* Timer Display */}
          <div className="text-center py-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Clock size={40} className="text-blue-500" />
              <div className="text-6xl font-bold text-gray-900 dark:text-white font-mono">
                {formatDuration(currentTime)}
              </div>
            </div>
            {activeSession && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Started {formatDate(activeSession.startTime)} at{' '}
                {new Date(activeSession.startTime).toLocaleTimeString()}
              </div>
            )}
          </div>

          {/* Timer Controls */}
          {!activeSession ? (
            <div className="space-y-4">
              <Input
                placeholder="What are you working on?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleStart()}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  options={[
                    { value: '', label: 'No Task' },
                    ...tasks
                      .filter(t => t.status !== 'completed')
                      .map((t) => ({ value: t.id, label: t.title })),
                  ]}
                />

                <Select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  options={[
                    { value: '', label: 'No Project' },
                    ...projects.map((p) => ({ value: p.id, label: p.name })),
                  ]}
                />
              </div>

              <Button
                onClick={handleStart}
                icon={Play}
                fullWidth
                disabled={!description.trim()}
              >
                Start Timer
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {activeSession.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {activeSession.taskId && (
                    <Badge variant="info" size="sm">
                      Task: {getTaskName(activeSession.taskId)}
                    </Badge>
                  )}
                  {activeSession.projectId && (
                    <Badge variant="default" size="sm">
                      Project: {getProjectName(activeSession.projectId)}
                    </Badge>
                  )}
                </div>
              </div>

              <Button
                onClick={handleStop}
                icon={Square}
                variant="danger"
                fullWidth
              >
                Stop Timer
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Time Tracked</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatDuration(getTotalTimeTracked())}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Sessions</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {sessions.length}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Average Session</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {sessions.length > 0
                ? formatDuration(Math.floor(getTotalTimeTracked() / sessions.length))
                : '0s'}
            </p>
          </div>
        </Card>
      </div>

      {/* Session History */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Calendar size={20} />
          Session History
        </h3>

        {sortedSessions.length === 0 ? (
          <div className="text-center py-8">
            <Clock size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No sessions yet. Start tracking time to see your history!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedSessions).map(([date, dateSessions]) => (
              <div key={date}>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  {date}
                  <Badge size="sm">
                    {formatDuration(dateSessions.reduce((sum, s) => sum + s.duration, 0))}
                  </Badge>
                </h4>
                <div className="space-y-2">
                  {dateSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {session.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(session.startTime).toLocaleTimeString()} -{' '}
                            {session.endTime
                              ? new Date(session.endTime).toLocaleTimeString()
                              : 'In Progress'}
                          </span>
                          {session.taskId && (
                            <Badge variant="info" size="sm">
                              {getTaskName(session.taskId)}
                            </Badge>
                          )}
                          {session.projectId && (
                            <Badge size="sm">
                              {getProjectName(session.projectId)}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white font-mono">
                          {formatDuration(session.duration)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Trash2}
                          onClick={() => handleDelete(session.id)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
