import { Task, Sprint, StatusChange } from '@/types';
import { supabase } from './supabase';

// Fallback to localStorage if Supabase is not configured
const useSupabase = supabase !== null;

// LocalStorage fallback functions
const SPRINTS_KEY = 'my-progress-sprints';
const TASKS_KEY = 'my-progress-tasks';
const CURRENT_USER_KEY = 'my-progress-current-user';

function getLocalSprints(): Sprint[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(SPRINTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error parsing sprints from localStorage:', error);
    return [];
  }
}

function saveLocalSprints(sprints: Sprint[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SPRINTS_KEY, JSON.stringify(sprints));
}

function getLocalTasks(): Task[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(TASKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error parsing tasks from localStorage:', error);
    return [];
  }
}

function saveLocalTasks(tasks: Task[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

// Supabase functions
export async function getSprints(): Promise<Sprint[]> {
  if (!useSupabase) {
    return getLocalSprints();
  }

  try {
    const { data, error } = await supabase!
      .from('sprints')
      .select('*')
      .order('startDate', { ascending: false });

    if (error) {
      console.error('Error fetching sprints:', error);
      return getLocalSprints(); // Fallback
    }

    return (data || []).map((sprint: any) => ({
      ...sprint,
      startDate: sprint.startDate,
      endDate: sprint.endDate,
    })) as Sprint[];
  } catch (error) {
    console.error('Error in getSprints:', error);
    return getLocalSprints(); // Fallback
  }
}

export async function saveSprints(sprints: Sprint[]): Promise<void> {
  if (!useSupabase) {
    saveLocalSprints(sprints);
    return;
  }

  try {
    if (sprints.length > 0) {
      const { error: insertError } = await supabase!
        .from('sprints')
        .upsert(sprints, { onConflict: 'id' });

      if (insertError) {
        console.error('Error saving sprints:', insertError);
        saveLocalSprints(sprints); // Fallback
      }
    } else {
      // If empty array, clear all sprints
      const { error: deleteError } = await supabase!
        .from('sprints')
        .delete()
        .neq('id', '');

      if (deleteError) {
        console.error('Error deleting sprints:', deleteError);
      }
    }
  } catch (error) {
    console.error('Error in saveSprints:', error);
    saveLocalSprints(sprints); // Fallback
  }
}

export async function getTasks(): Promise<Task[]> {
  if (!useSupabase) {
    return getLocalTasks();
  }

  try {
    const { data, error } = await supabase!
      .from('tasks')
      .select('*')
      .order('updatedAt', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
      return getLocalTasks(); // Fallback
    }

    return (data || []).map((task: any) => ({
      ...task,
      statusHistory: task.statusHistory || [],
      comments: task.comments || [],
      attachments: task.attachments || [],
      tags: task.tags || [],
    })) as Task[];
  } catch (error) {
    console.error('Error in getTasks:', error);
    return getLocalTasks(); // Fallback
  }
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  if (!useSupabase) {
    saveLocalTasks(tasks);
    return;
  }

  try {
    if (tasks.length > 0) {
      const { error: insertError } = await supabase!
        .from('tasks')
        .upsert(tasks, { onConflict: 'id' });

      if (insertError) {
        console.error('Error saving tasks:', insertError);
        saveLocalTasks(tasks); // Fallback
      }
    } else {
      // If empty array, clear all tasks
      const { error: deleteError } = await supabase!
        .from('tasks')
        .delete()
        .neq('id', '');

      if (deleteError) {
        console.error('Error deleting tasks:', deleteError);
      }
    }
  } catch (error) {
    console.error('Error in saveTasks:', error);
    saveLocalTasks(tasks); // Fallback
  }
}

export async function addTask(task: Task): Promise<void> {
  if (!useSupabase) {
    const tasks = getLocalTasks();
    tasks.push(task);
    saveLocalTasks(tasks);
    return;
  }

  try {
    const { error } = await supabase!
      .from('tasks')
      .insert(task);

    if (error) {
      console.error('Error adding task:', error);
      const tasks = getLocalTasks();
      tasks.push(task);
      saveLocalTasks(tasks); // Fallback
    }
  } catch (error) {
    console.error('Error in addTask:', error);
    const tasks = getLocalTasks();
    tasks.push(task);
    saveLocalTasks(tasks); // Fallback
  }
}

export async function updateTask(updatedTask: Task): Promise<void> {
  if (!useSupabase) {
    const tasks = getLocalTasks();
    const index = tasks.findIndex(t => t.id === updatedTask.id);
    if (index !== -1) {
      tasks[index] = updatedTask;
      saveLocalTasks(tasks);
    }
    return;
  }

  try {
    const { error } = await supabase!
      .from('tasks')
      .update(updatedTask)
      .eq('id', updatedTask.id);

    if (error) {
      console.error('Error updating task:', error);
      const tasks = getLocalTasks();
      const index = tasks.findIndex(t => t.id === updatedTask.id);
      if (index !== -1) {
        tasks[index] = updatedTask;
        saveLocalTasks(tasks); // Fallback
      }
    }
  } catch (error) {
    console.error('Error in updateTask:', error);
    const tasks = getLocalTasks();
    const index = tasks.findIndex(t => t.id === updatedTask.id);
    if (index !== -1) {
      tasks[index] = updatedTask;
      saveLocalTasks(tasks); // Fallback
    }
  }
}

export async function deleteTask(taskId: string): Promise<void> {
  if (!useSupabase) {
    const tasks = getLocalTasks();
    const filtered = tasks.filter(t => t.id !== taskId);
    saveLocalTasks(filtered);
    return;
  }

  try {
    const { error } = await supabase!
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Error deleting task:', error);
      const tasks = getLocalTasks();
      const filtered = tasks.filter(t => t.id !== taskId);
      saveLocalTasks(filtered); // Fallback
    }
  } catch (error) {
    console.error('Error in deleteTask:', error);
    const tasks = getLocalTasks();
    const filtered = tasks.filter(t => t.id !== taskId);
    saveLocalTasks(filtered); // Fallback
  }
}

export function getCurrentUser(): string {
  if (typeof window === 'undefined') return 'User';
  const user = localStorage.getItem(CURRENT_USER_KEY);
  return user || 'User';
}

export function setCurrentUser(user: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CURRENT_USER_KEY, user);
}

// Real-time subscriptions
export function subscribeToSprints(callback: (sprints: Sprint[]) => void) {
  if (!useSupabase) {
    return () => {}; // No-op unsubscribe
  }

  const channel = supabase!
    .channel('sprints-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'sprints',
      },
      async () => {
        const sprints = await getSprints();
        callback(sprints);
      }
    )
    .subscribe();

  return () => {
    supabase!.removeChannel(channel);
  };
}

export function subscribeToTasks(callback: (tasks: Task[]) => void) {
  if (!useSupabase) {
    return () => {}; // No-op unsubscribe
  }

  const channel = supabase!
    .channel('tasks-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tasks',
      },
      async () => {
        const tasks = await getTasks();
        callback(tasks);
      }
    )
    .subscribe();

  return () => {
    supabase!.removeChannel(channel);
  };
}

