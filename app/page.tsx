'use client';

import { useState, useEffect, useMemo } from 'react';
import { Task, Sprint, TaskStatus } from '@/types';
import Sidebar from '@/components/Sidebar';
import SwimLane from '@/components/SwimLane';
import CreateCardModal from '@/components/CreateCardModal';
import CardDetailModal from '@/components/CardDetailModal';
import { 
  getSprints, 
  saveSprints, 
  getTasks, 
  saveTasks, 
  addTask, 
  updateTask,
  initializeStorage,
  getCurrentUser,
  setCurrentUser
} from '@/lib/storage';
import { generateSprintPresentation } from '@/lib/presentation';
import { format } from 'date-fns';

const statusOrder: TaskStatus[] = ['todo', 'dev-inprogress', 'review', 'ready-for-qa', 'qa-inprogress', 'done'];

export default function Home() {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [currentUser, setCurrentUserState] = useState('User');

  useEffect(() => {
    initializeStorage();
    // Refresh data after initialization (in case dummy data was cleared)
    const refreshedSprints = getSprints();
    const refreshedTasks = getTasks();
    setSprints(refreshedSprints);
    setTasks(refreshedTasks);
    setCurrentUserState(getCurrentUser());
  }, []);

  // Clear selected sprint if it no longer exists
  useEffect(() => {
    if (selectedSprintId && !sprints.find(s => s.id === selectedSprintId)) {
      setSelectedSprintId(null);
    }
  }, [sprints, selectedSprintId]);

  const filteredTasks = useMemo(() => {
    if (!selectedSprintId) return tasks;
    return tasks.filter(task => task.sprintId === selectedSprintId);
  }, [tasks, selectedSprintId]);

  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      todo: [],
      'dev-inprogress': [],
      review: [],
      'ready-for-qa': [],
      'qa-inprogress': [],
      done: [],
    };

    filteredTasks.forEach(task => {
      grouped[task.status].push(task);
    });

    // Sort tasks within each status by updated date (most recent first)
    Object.keys(grouped).forEach(status => {
      grouped[status as TaskStatus].sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    });

    return grouped;
  }, [filteredTasks]);

  const currentSprint = selectedSprintId 
    ? sprints.find(s => s.id === selectedSprintId)
    : null;

  const handleCreateTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'statusHistory' | 'comments' | 'attachments'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statusHistory: [],
      comments: [],
      attachments: [],
    };

    addTask(newTask);
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    updateTask(updatedTask);
    setTasks(prevTasks => prevTasks.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const handleMoveToNextSprint = (task: Task) => {
    const currentSprint = sprints.find(s => s.id === task.sprintId);
    if (!currentSprint) {
      alert('Current sprint not found');
      return;
    }

    // Find next sprint by date (sprint that starts after current sprint ends)
    const currentEndDate = new Date(currentSprint.endDate);
    const nextSprint = sprints
      .filter(s => s.id !== task.sprintId)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .find(s => new Date(s.startDate) > currentEndDate);

    if (!nextSprint) {
      alert('No next sprint found. Please create a new sprint first.');
      return;
    }

    const updatedTask: Task = {
      ...task,
      sprintId: nextSprint.id,
      updatedAt: new Date().toISOString(),
      statusHistory: [
        ...task.statusHistory,
        {
          id: `change-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          fromStatus: task.status,
          toStatus: task.status,
          changedBy: currentUser,
          changedAt: new Date().toISOString(),
          comment: `Moved to ${nextSprint.name}`,
        },
      ],
    };
    handleUpdateTask(updatedTask);
    alert(`Card moved to ${nextSprint.name}`);
  };

  const handleCardClick = (task: Task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  };

  const handleGeneratePresentation = () => {
    if (!currentSprint) {
      alert('Please select a sprint first');
      return;
    }

    const sprintTasks = tasks.filter(t => t.sprintId === currentSprint.id);
    const completedTasks = sprintTasks.filter(t => t.status === 'done').length;
    const velocity = sprintTasks
      .filter(t => t.status === 'done')
      .reduce((sum, t) => sum + (t.storyPoints || 0), 0);

    const metrics = {
      sprintId: currentSprint.id,
      totalTasks: sprintTasks.length,
      completedTasks,
      inProgressTasks: sprintTasks.filter(t => t.status !== 'done' && t.status !== 'todo').length,
      blockedTasks: 0,
      velocity,
      burndown: [],
      teamVelocity: velocity,
    };

    generateSprintPresentation(currentSprint, sprintTasks, metrics);
  };

  const handleCreateSprint = () => {
    // Calculate sprint number based on existing sprints
    const existingSprintNumbers = sprints
      .map(s => {
        const match = s.name.match(/Sprint (\d+)/);
        return match ? parseInt(match[1]) : 0;
      })
      .filter(n => n > 0);
    const sprintNumber = existingSprintNumbers.length > 0 
      ? Math.max(...existingSprintNumbers) + 1 
      : sprints.length + 1;

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 13); // 2-week sprint

    const newSprint: Sprint = {
      id: `sprint-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `Sprint ${sprintNumber}`,
      goal: 'New sprint goal',
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      status: 'planning',
      capacity: 25,
    };

    const updatedSprints = [...sprints, newSprint];
    saveSprints(updatedSprints);
    setSprints(updatedSprints);
    setSelectedSprintId(newSprint.id);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        sprints={sprints}
        selectedSprintId={selectedSprintId}
        onSprintSelect={setSelectedSprintId}
        onCreateSprint={handleCreateSprint}
      />

      <div className="flex-1 ml-64 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {currentSprint ? currentSprint.name : 'All Sprints'}
              </h1>
              {currentSprint && (
                <p className="text-sm text-gray-600 mt-1">{currentSprint.goal}</p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">User:</label>
                <input
                  type="text"
                  value={currentUser}
                  onChange={(e) => {
                    const newUser = e.target.value;
                    setCurrentUser(newUser);
                    setCurrentUserState(newUser);
                  }}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                  placeholder="Your name"
                />
              </div>
              {currentSprint && (
                <button
                  onClick={handleGeneratePresentation}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                >
                  📊 Generate Presentation
                </button>
              )}
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
              >
                + Create Card
              </button>
            </div>
          </div>
        </header>

        {/* Board */}
        <main className="flex-1 overflow-x-auto p-6">
          {selectedSprintId ? (
            <div className="flex gap-4 min-w-max">
              {statusOrder.map(status => (
                <SwimLane
                  key={status}
                  status={status}
                  tasks={tasksByStatus[status]}
                  onCardClick={handleCardClick}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <p className="text-lg font-medium mb-2">Select a sprint to view the board</p>
                <p className="text-sm">Choose a sprint from the sidebar to see tasks organized by status</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <CreateCardModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateTask}
        sprints={sprints}
        defaultSprintId={selectedSprintId || undefined}
      />

      <CardDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        sprints={sprints}
        onUpdate={handleUpdateTask}
        onMoveToNextSprint={handleMoveToNextSprint}
      />
    </div>
  );
}
