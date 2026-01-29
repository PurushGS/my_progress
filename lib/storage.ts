import { Task, Sprint, StatusChange } from '@/types';

const SPRINTS_KEY = 'my-progress-sprints';
const TASKS_KEY = 'my-progress-tasks';
const CURRENT_USER_KEY = 'my-progress-current-user';

export function getCurrentUser(): string {
  if (typeof window === 'undefined') return 'User';
  const user = localStorage.getItem(CURRENT_USER_KEY);
  return user || 'User';
}

export function setCurrentUser(user: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CURRENT_USER_KEY, user);
}

export function getSprints(): Sprint[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(SPRINTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error parsing sprints from localStorage:', error);
    return [];
  }
}

export function saveSprints(sprints: Sprint[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SPRINTS_KEY, JSON.stringify(sprints));
}

export function getTasks(): Task[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(TASKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error parsing tasks from localStorage:', error);
    return [];
  }
}

export function saveTasks(tasks: Task[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export function addTask(task: Task): void {
  const tasks = getTasks();
  tasks.push(task);
  saveTasks(tasks);
}

export function updateTask(updatedTask: Task): void {
  const tasks = getTasks();
  const index = tasks.findIndex(t => t.id === updatedTask.id);
  if (index !== -1) {
    tasks[index] = updatedTask;
    saveTasks(tasks);
  }
}

export function deleteTask(taskId: string): void {
  const tasks = getTasks();
  const filtered = tasks.filter(t => t.id !== taskId);
  saveTasks(filtered);
}

// Clear all data from localStorage
export function clearAllData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SPRINTS_KEY);
  localStorage.removeItem(TASKS_KEY);
  // Keep user preference
}

// Initialize storage - no default data, start fresh
export function initializeStorage(): void {
  if (typeof window === 'undefined') return;
  
  // Check if there's old dummy data and clear it
  const existingSprints = getSprints();
  const existingTasks = getTasks();
  
  // Detect and remove dummy data (sprints with IDs like 'sprint-1', 'sprint-2', etc.)
  const hasDummySprints = existingSprints.length > 0 && existingSprints.some(s => 
    (s.id === 'sprint-1' || s.id === 'sprint-2' || s.id === 'sprint-3') ||
    s.name.includes('Foundation') ||
    s.name.includes('Core Features') ||
    s.name.includes('Enhancements')
  );
  
  // Detect dummy tasks (tasks with IDs like 'task-1', 'task-2', etc. or old assignees)
  const hasDummyTasks = existingTasks.length > 0 && existingTasks.some(t => 
    (t.id === 'task-1' || t.id === 'task-2' || t.id === 'task-3' || 
     t.id === 'task-4' || t.id === 'task-5' || t.id === 'task-6' ||
     t.id === 'task-7' || t.id === 'task-8' || t.id === 'task-9') ||
    t.assignee === 'John Doe' ||
    t.assignee === 'Jane Smith' ||
    t.assignee === 'Mike Johnson' ||
    t.assignee === 'Sarah Williams' ||
    t.assignee === 'Alex Brown'
  );
  
  // If dummy data detected, clear everything
  if (hasDummySprints || hasDummyTasks) {
    console.log('Dummy data detected, clearing all data...');
    clearAllData();
    // Re-initialize with empty arrays
    saveSprints([]);
    saveTasks([]);
    return;
  }
  
  // Just ensure localStorage keys exist (empty arrays)
  // User will create their own sprints and tasks
  if (!existingSprints || existingSprints.length === 0) {
    saveSprints([]);
  }
  
  if (!existingTasks || existingTasks.length === 0) {
    saveTasks([]);
  }
}

