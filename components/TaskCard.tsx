'use client';

import { Task } from '@/types';

interface TaskCardProps {
  task: Task;
}

const statusColors = {
  todo: 'bg-gray-100 text-gray-800 border-gray-300',
  'dev-inprogress': 'bg-blue-100 text-blue-800 border-blue-300',
  review: 'bg-purple-100 text-purple-800 border-purple-300',
  'ready-for-qa': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'qa-inprogress': 'bg-orange-100 text-orange-800 border-orange-300',
  done: 'bg-green-100 text-green-800 border-green-300',
};

const priorityColors = {
  low: 'text-gray-500',
  medium: 'text-blue-500',
  high: 'text-orange-500',
  critical: 'text-red-500',
};

const typeIcons = {
  feature: '✨',
  bug: '🐛',
  improvement: '⚡',
  'technical-debt': '🔧',
};

export default function TaskCard({ task }: TaskCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{typeIcons[task.type] || '📋'}</span>
          <h3 className="font-semibold text-gray-900 text-sm">{task.title}</h3>
        </div>
        {task.storyPoints && (
          <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded">
            {task.storyPoints} SP
          </span>
        )}
      </div>
      
      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{task.description}</p>
      
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-medium px-2 py-1 rounded border ${statusColors[task.status] || 'bg-gray-100'}`}>
          {task.status.replace(/-/g, ' ').toUpperCase()}
        </span>
        <span className={`text-xs font-medium ${priorityColors[task.priority]}`}>
          {task.priority.toUpperCase()}
        </span>
      </div>
      
      {task.comments.length > 0 && (
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
          <span>💬</span>
          <span>{task.comments.length} comment{task.comments.length !== 1 ? 's' : ''}</span>
        </div>
      )}
      
      {task.attachments.length > 0 && (
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
          <span>📎</span>
          <span>{task.attachments.length} attachment{task.attachments.length !== 1 ? 's' : ''}</span>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">@{task.assignee}</span>
        {task.tags.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {task.tags.slice(0, 2).map(tag => (
              <span key={tag} className="text-xs bg-gray-50 text-gray-600 px-1.5 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

