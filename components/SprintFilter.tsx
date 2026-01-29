'use client';

import { Sprint } from '@/types';

interface SprintFilterProps {
  sprints: Sprint[];
  selectedSprintId: string | null;
  onSprintChange: (sprintId: string | null) => void;
}

export default function SprintFilter({ sprints, selectedSprintId, onSprintChange }: SprintFilterProps) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Sprint
      </label>
      <select
        value={selectedSprintId || ''}
        onChange={(e) => onSprintChange(e.target.value || null)}
        className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
      >
        <option value="">All Sprints</option>
        {sprints.map(sprint => (
          <option key={sprint.id} value={sprint.id}>
            {sprint.name} ({sprint.status})
          </option>
        ))}
      </select>
    </div>
  );
}

