'use client';

import { useState, useEffect, useMemo } from 'react';
import { Task, Sprint, TaskStatus } from '@/types';
import Sidebar from '@/components/Sidebar';
import SwimLane from '@/components/SwimLane';
import CreateCardModal from '@/components/CreateCardModal';
import CardDetailModal from '@/components/CardDetailModal';
import SprintMetrics from '@/components/SprintMetrics';
import { 
  getSprints, 
  saveSprints, 
  getTasks, 
  saveTasks, 
  addTask, 
  updateTask,
  getCurrentUser,
  setCurrentUser,
  subscribeToSprints,
  subscribeToTasks
} from '@/lib/supabase-storage';
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
    // Load initial data
    const loadData = async () => {
      const refreshedSprints = await getSprints();
      const refreshedTasks = await getTasks();
      setSprints(refreshedSprints);
      setTasks(refreshedTasks);
      setCurrentUserState(getCurrentUser());
    };

    loadData();

    // Subscribe to real-time updates
    const unsubscribeSprints = subscribeToSprints((updatedSprints) => {
      setSprints(updatedSprints);
    });

    const unsubscribeTasks = subscribeToTasks((updatedTasks) => {
      setTasks(updatedTasks);
    });

    return () => {
      unsubscribeSprints();
      unsubscribeTasks();
    };
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

  // Calculate sprint metrics
  const sprintMetrics = useMemo(() => {
    if (!currentSprint) return null;
    
    const sprintTasks = tasks.filter(t => t.sprintId === currentSprint.id);
    const completedTasks = sprintTasks.filter(t => t.status === 'done').length;
    const inProgressTasks = sprintTasks.filter(t => t.status !== 'done' && t.status !== 'todo').length;
    const velocity = sprintTasks
      .filter(t => t.status === 'done')
      .reduce((sum, t) => sum + (t.storyPoints || 0), 0);

    return {
      sprintId: currentSprint.id,
      totalTasks: sprintTasks.length,
      completedTasks,
      inProgressTasks,
      blockedTasks: 0,
      velocity,
      burndown: [],
      teamVelocity: velocity,
    };
  }, [currentSprint, tasks]);

  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'statusHistory' | 'comments' | 'attachments'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statusHistory: [],
      comments: [],
      attachments: [],
    };

    await addTask(newTask);
    // Real-time subscription will update the UI automatically
    const updatedTasks = await getTasks();
    setTasks(updatedTasks);
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    await updateTask(updatedTask);
    // Real-time subscription will update the UI automatically
    const updatedTasks = await getTasks();
    setTasks(updatedTasks);
  };

  const handleMoveToNextSprint = async (task: Task) => {
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
    await handleUpdateTask(updatedTask);
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

  const handleCreateSprint = async () => {
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
    await saveSprints(updatedSprints);
    // Real-time subscription will update the UI automatically
    const refreshedSprints = await getSprints();
    setSprints(refreshedSprints);
    setSelectedSprintId(newSprint.id);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        sprints={sprints}
        selectedSprintId={selectedSprintId}
        onSprintSelect={setSelectedSprintId}
        onCreateSprint={handleCreateSprint}
      />

      <div className="flex-1 ml-0 lg:ml-56 xl:ml-64 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
          <div className="px-4 lg:px-6 py-3 lg:py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="pl-12 lg:pl-0">
                <h1 className="text-lg lg:text-2xl font-bold text-gray-900 truncate">
                  {currentSprint ? currentSprint.name : 'All Sprints'}
                </h1>
                {currentSprint && (
                  <p className="text-xs lg:text-sm text-gray-600 mt-1 truncate">{currentSprint.goal}</p>
                )}
              </div>
              <div className="flex items-center gap-2 lg:gap-4 flex-wrap">
                <div className="flex items-center gap-1 lg:gap-2">
                  <label className="text-xs lg:text-sm text-gray-700 hidden sm:inline">User:</label>
                  <input
                    type="text"
                    value={currentUser}
                    onChange={(e) => {
                      const newUser = e.target.value;
                      setCurrentUser(newUser);
                      setCurrentUserState(newUser);
                    }}
                    className="px-2 lg:px-3 py-1 border border-gray-300 rounded-lg text-xs lg:text-sm w-24 lg:w-auto"
                    placeholder="Your name"
                  />
                </div>
                {currentSprint && (
                  <button
                    onClick={handleGeneratePresentation}
                    className="px-2 lg:px-4 py-1 lg:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-xs lg:text-sm whitespace-nowrap"
                  >
                    <span className="hidden sm:inline">📊 Generate Presentation</span>
                    <span className="sm:hidden">📊</span>
                  </button>
                )}
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-2 lg:px-4 py-1 lg:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-xs lg:text-sm whitespace-nowrap"
                >
                  <span className="hidden sm:inline">+ Create Card</span>
                  <span className="sm:hidden">+ Card</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Board */}
        <main className="flex-1 overflow-auto p-3 lg:p-6">
          {selectedSprintId ? (
            <>
              {/* Sprint Metrics */}
              {currentSprint && sprintMetrics && (
                <SprintMetrics sprint={currentSprint} metrics={sprintMetrics} />
              )}

              {/* Swim Lanes Board */}
              <div className="overflow-x-auto pb-4">
                <div className="flex gap-2 lg:gap-4 min-w-max">
                  {statusOrder.map(status => (
                    <SwimLane
                      key={status}
                      status={status}
                      tasks={tasksByStatus[status]}
                      onCardClick={handleCardClick}
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center px-4">
                <p className="text-base lg:text-lg font-medium mb-2">Select a sprint to view the board</p>
                <p className="text-xs lg:text-sm">Choose a sprint from the sidebar to see tasks organized by status</p>
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
