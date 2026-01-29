'use client';

import { useState, useEffect } from 'react';
import { Task, Sprint, TaskStatus, TaskPriority, TaskType, Comment, Attachment, StatusChange } from '@/types';
import { getCurrentUser } from '@/lib/storage';
import { format, parseISO } from 'date-fns';

interface CardDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  sprints: Sprint[];
  onUpdate: (task: Task) => void;
  onMoveToNextSprint: (task: Task) => void;
}

const teamMembers = [
  'Abhishek (Dev)',
  'Ajay (Dev)',
  'Himanshu (Dev)',
  'Mohana (Dev)',
  'Purushothama (QA)',
  'Ram (Data)',
  'Shiyoni (Dev)',
  'Sri (Dev)',
  'Sugam (HOE)'
];

export default function CardDetailModal({ isOpen, onClose, task, sprints, onUpdate, onMoveToNextSprint }: CardDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachmentName, setAttachmentName] = useState('');

  // Reset form state when modal closes or task changes
  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
      setCommentText('');
      setAttachmentUrl('');
      setAttachmentName('');
    }
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !task) return null;

  const currentUser = getCurrentUser();
  const currentSprint = sprints.find(s => s.id === task.sprintId);
  const nextSprint = currentSprint 
    ? sprints
        .filter(s => s.id !== task.sprintId)
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        .find(s => {
          const currentEnd = parseISO(currentSprint.endDate);
          const sprintStart = parseISO(s.startDate);
          return sprintStart > currentEnd;
        })
    : null;

  const handleStatusChange = (newStatus: TaskStatus) => {
    if (newStatus === task.status) return;

    const statusChange: StatusChange = {
      id: `change-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fromStatus: task.status,
      toStatus: newStatus,
      changedBy: currentUser,
      changedAt: new Date().toISOString(),
    };

    const updatedTask: Task = {
      ...task,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      statusHistory: [...task.statusHistory, statusChange],
      completedAt: newStatus === 'done' ? new Date().toISOString() : task.completedAt,
    };

    onUpdate(updatedTask);
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;

    const comment: Comment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: commentText.trim(),
      author: currentUser,
      createdAt: new Date().toISOString(),
    };

    const updatedTask: Task = {
      ...task,
      comments: [...task.comments, comment],
      updatedAt: new Date().toISOString(),
    };

    onUpdate(updatedTask);
    setCommentText('');
  };

  const handleAddAttachment = () => {
    if (!attachmentUrl.trim() || !attachmentName.trim()) return;

    const attachment: Attachment = {
      id: `attachment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: attachmentName.trim(),
      url: attachmentUrl.trim(),
      addedBy: currentUser,
      addedAt: new Date().toISOString(),
    };

    const updatedTask: Task = {
      ...task,
      attachments: [...task.attachments, attachment],
      updatedAt: new Date().toISOString(),
    };

    onUpdate(updatedTask);
    setAttachmentUrl('');
    setAttachmentName('');
  };

  const handleUpdateField = <K extends keyof Task>(field: K, value: Task[K]) => {
    const updatedTask: Task = {
      ...task,
      [field]: value,
      updatedAt: new Date().toISOString(),
    };
    onUpdate(updatedTask);
  };

  const statusOptions: TaskStatus[] = ['todo', 'dev-inprogress', 'review', 'ready-for-qa', 'qa-inprogress', 'done'];

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Card Details</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              {isEditing ? 'Done' : 'Edit'}
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Title and Basic Info */}
          <div>
            {isEditing ? (
              <input
                type="text"
                value={task.title}
                onChange={(e) => handleUpdateField('title', e.target.value)}
                className="w-full text-xl font-bold px-2 py-1 border border-gray-300 rounded"
              />
            ) : (
              <h3 className="text-xl font-bold text-gray-900">{task.title}</h3>
            )}
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span>Created by {task.createdBy}</span>
              <span>•</span>
              <span>{format(parseISO(task.createdAt), 'MMM d, yyyy')}</span>
            </div>
          </div>

          {/* Status Transition */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <div className="flex gap-2 flex-wrap">
              {statusOptions.map(status => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    task.status === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.replace(/-/g, ' ').toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Editable Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
              {isEditing ? (
                <select
                  value={task.assignee}
                  onChange={(e) => handleUpdateField('assignee', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {teamMembers.map(member => (
                    <option key={member} value={member}>{member}</option>
                  ))}
                </select>
              ) : (
                <p className="text-gray-900">{task.assignee}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sprint</label>
              {isEditing ? (
                <select
                  value={task.sprintId}
                  onChange={(e) => handleUpdateField('sprintId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {sprints.map(sprint => (
                    <option key={sprint.id} value={sprint.id}>{sprint.name}</option>
                  ))}
                </select>
              ) : (
                <p className="text-gray-900">{currentSprint?.name || 'Unknown Sprint'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              {isEditing ? (
                <select
                  value={task.priority}
                  onChange={(e) => handleUpdateField('priority', e.target.value as TaskPriority)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              ) : (
                <p className="text-gray-900 capitalize">{task.priority}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Story Points</label>
              {isEditing ? (
                <input
                  type="number"
                  value={task.storyPoints || ''}
                  onChange={(e) => handleUpdateField('storyPoints', parseInt(e.target.value) || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              ) : (
                <p className="text-gray-900">{task.storyPoints || 'N/A'}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            {isEditing ? (
              <textarea
                value={task.description}
                onChange={(e) => handleUpdateField('description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            ) : (
              <p className="text-gray-700 whitespace-pre-wrap">{task.description || 'No description'}</p>
            )}
          </div>

          {/* Status History */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status History</label>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 max-h-48 overflow-y-auto">
              {task.statusHistory.length === 0 ? (
                <p className="text-sm text-gray-500">No status changes yet</p>
              ) : (
                task.statusHistory.map((change, index) => (
                  <div key={change.id} className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">
                      {format(parseISO(change.changedAt), 'MMM d, HH:mm')}
                    </span>
                    <span className="text-gray-700">
                      {change.changedBy} moved from <strong>{change.fromStatus.replace(/-/g, ' ')}</strong> to <strong>{change.toStatus.replace(/-/g, ' ')}</strong>
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Comments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Comments ({task.comments.length})</label>
            <div className="space-y-3">
              {task.comments.map(comment => (
                <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm text-gray-900">{comment.author}</span>
                    <span className="text-xs text-gray-500">{format(parseISO(comment.createdAt), 'MMM d, HH:mm')}</span>
                  </div>
                  <p className="text-sm text-gray-700">{comment.text}</p>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                  placeholder="Add a comment..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                />
                <button
                  onClick={handleAddComment}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Attachments ({task.attachments.length})</label>
            <div className="space-y-2">
              {task.attachments.map(attachment => (
                <div key={attachment.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <div>
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      📎 {attachment.name}
                    </a>
                    <p className="text-xs text-gray-500">Added by {attachment.addedBy} on {format(parseISO(attachment.addedAt), 'MMM d')}</p>
                  </div>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={attachmentName}
                  onChange={(e) => setAttachmentName(e.target.value)}
                  placeholder="Link name"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="url"
                  value={attachmentUrl}
                  onChange={(e) => setAttachmentUrl(e.target.value)}
                  placeholder="URL"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                />
                <button
                  onClick={handleAddAttachment}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Move to Next Sprint */}
          {nextSprint && task.status !== 'done' && (
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={() => onMoveToNextSprint(task)}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Move to Next Sprint ({nextSprint.name})
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

