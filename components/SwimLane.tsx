'use client';

import { Task, TaskStatus } from '@/types';
import TaskCard from './TaskCard';

interface SwimLaneProps {
  status: TaskStatus;
  tasks: Task[];
  onCardClick: (task: Task) => void;
}

const statusConfig: Record<TaskStatus, { label: string; color: string; bgColor: string }> = {
  todo: { label: 'To Do', color: 'text-gray-700', bgColor: 'bg-gray-50' },
  'dev-inprogress': { label: 'Dev In Progress', color: 'text-blue-700', bgColor: 'bg-blue-50' },
  review: { label: 'Review', color: 'text-purple-700', bgColor: 'bg-purple-50' },
  'ready-for-qa': { label: 'Ready for QA', color: 'text-yellow-700', bgColor: 'bg-yellow-50' },
  'qa-inprogress': { label: 'QA In Progress', color: 'text-orange-700', bgColor: 'bg-orange-50' },
  done: { label: 'Done', color: 'text-green-700', bgColor: 'bg-green-50' },
};

export default function SwimLane({ status, tasks, onCardClick }: SwimLaneProps) {
  const config = statusConfig[status];

  return (
    <div className="flex-shrink-0 w-80">
      <div className={`${config.bgColor} rounded-t-lg p-3 border-b-2 border-gray-200 sticky top-0 z-10`}>
        <div className="flex items-center justify-between">
          <h3 className={`font-semibold ${config.color} text-sm`}>
            {config.label}
          </h3>
          <span className={`${config.color} text-xs font-medium bg-white px-2 py-0.5 rounded-full`}>
            {tasks.length}
          </span>
        </div>
      </div>
      <div className={`${config.bgColor} rounded-b-lg p-3 min-h-[600px] space-y-3 overflow-y-auto max-h-[calc(100vh-200px)] custom-scrollbar`}>
        {tasks.map(task => (
          <div key={task.id} onClick={() => onCardClick(task)} className="cursor-pointer">
            <TaskCard task={task} />
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
            No tasks
          </div>
        )}
      </div>
    </div>
  );
}

