'use client';

import { Sprint } from '@/types';
import { format, parseISO } from 'date-fns';

interface SidebarProps {
  sprints: Sprint[];
  selectedSprintId: string | null;
  onSprintSelect: (sprintId: string | null) => void;
  onCreateSprint: () => void;
}

export default function Sidebar({ sprints, selectedSprintId, onSprintSelect, onCreateSprint }: SidebarProps) {
  const activeSprints = sprints.filter(s => s.status === 'active');
  const completedSprints = sprints.filter(s => s.status === 'completed');
  const planningSprints = sprints.filter(s => s.status === 'planning');

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">My Progress</h1>
        <p className="text-xs text-gray-500 mt-1">Sprint Dashboard</p>
      </div>

      <div className="p-4">
        <button
          onClick={onCreateSprint}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium text-sm mb-6 shadow-sm hover:shadow-md"
        >
          + Create Sprint
        </button>

        <div className="space-y-6">
          {/* Active Sprints */}
          {activeSprints.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Active Sprints
              </h2>
              <div className="space-y-1">
                {activeSprints.map(sprint => (
                  <button
                    key={sprint.id}
                    onClick={() => onSprintSelect(sprint.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedSprintId === sprint.id
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">{sprint.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {format(parseISO(sprint.startDate), 'MMM d')} - {format(parseISO(sprint.endDate), 'MMM d')}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Planning Sprints */}
          {planningSprints.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Planning
              </h2>
              <div className="space-y-1">
                {planningSprints.map(sprint => (
                  <button
                    key={sprint.id}
                    onClick={() => onSprintSelect(sprint.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedSprintId === sprint.id
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">{sprint.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {format(parseISO(sprint.startDate), 'MMM d')} - {format(parseISO(sprint.endDate), 'MMM d')}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Completed Sprints */}
          {completedSprints.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Completed
              </h2>
              <div className="space-y-1">
                {completedSprints.map(sprint => (
                  <button
                    key={sprint.id}
                    onClick={() => onSprintSelect(sprint.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedSprintId === sprint.id
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">{sprint.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {format(parseISO(sprint.startDate), 'MMM d')} - {format(parseISO(sprint.endDate), 'MMM d')}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* All Sprints Option */}
          <div>
            <button
              onClick={() => onSprintSelect(null)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedSprintId === null
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="font-medium">All Sprints</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

