// Industry standard project management types following PMI/Agile practices

export type TaskStatus = 'todo' | 'dev-inprogress' | 'review' | 'ready-for-qa' | 'qa-inprogress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskType = 'feature' | 'bug' | 'improvement' | 'technical-debt';

export interface StatusChange {
  id: string;
  fromStatus: TaskStatus;
  toStatus: TaskStatus;
  changedBy: string;
  changedAt: string;
  comment?: string;
}

export interface Comment {
  id: string;
  text: string;
  author: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  addedBy: string;
  addedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  assignee: string;
  createdBy: string;
  storyPoints?: number;
  sprintId: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  tags: string[];
  statusHistory: StatusChange[];
  comments: Comment[];
  attachments: Attachment[];
}

export interface Sprint {
  id: string;
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'active' | 'completed';
  velocity?: number; // Story points completed
  capacity: number; // Planned story points
}

export interface SprintMetrics {
  sprintId: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  velocity: number;
  burndown: Array<{ date: string; remaining: number }>;
  teamVelocity: number;
}

