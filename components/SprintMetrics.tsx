'use client';

import type { SprintMetrics } from '@/types';
import { Sprint } from '@/types';

interface SprintMetricsProps {
  sprint: Sprint;
  metrics: SprintMetrics;
}

export default function SprintMetrics({ sprint, metrics }: SprintMetricsProps) {
  const completionRate = metrics.totalTasks > 0 
    ? Math.round((metrics.completedTasks / metrics.totalTasks) * 100) 
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 lg:p-6 mb-4 lg:mb-6">
      <h2 className="text-base lg:text-xl font-bold text-gray-900 mb-2 lg:mb-4 truncate">{sprint.name}</h2>
      <p className="text-xs lg:text-sm text-gray-600 mb-3 lg:mb-4 truncate">{sprint.goal}</p>
      
      <div className="grid grid-cols-4 gap-2 lg:gap-4">
        <div className="text-center">
          <div className="text-lg lg:text-2xl font-bold text-gray-900">{metrics.totalTasks}</div>
          <div className="text-[10px] lg:text-xs text-gray-500">Total</div>
        </div>
        <div className="text-center">
          <div className="text-lg lg:text-2xl font-bold text-green-600">{metrics.completedTasks}</div>
          <div className="text-[10px] lg:text-xs text-gray-500">Done</div>
        </div>
        <div className="text-center">
          <div className="text-lg lg:text-2xl font-bold text-blue-600">{metrics.inProgressTasks}</div>
          <div className="text-[10px] lg:text-xs text-gray-500">Active</div>
        </div>
        <div className="text-center">
          <div className="text-lg lg:text-2xl font-bold text-orange-600">{metrics.velocity}</div>
          <div className="text-[10px] lg:text-xs text-gray-500">SP</div>
        </div>
      </div>
      
      <div className="mt-3 lg:mt-4">
        <div className="flex justify-between text-[10px] lg:text-xs text-gray-600 mb-1">
          <span>Progress</span>
          <span>{completionRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5 lg:h-2">
          <div
            className="bg-blue-600 h-1.5 lg:h-2 rounded-full transition-all"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>
    </div>
  );
}

