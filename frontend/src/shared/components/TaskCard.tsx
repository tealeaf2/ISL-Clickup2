import React from 'react';
import { Calendar, User, CheckCircle } from 'lucide-react';
import type { ClickUpTask, ClickUpPriority } from '../types';

interface TaskCardProps {
  task: ClickUpTask;
  highlight?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, highlight = false }) => {
  const getPriorityColor = (priority?: ClickUpPriority): string => {
    if (!priority) return 'text-gray-600 bg-gray-100';
    
    switch (priority.priority.toLowerCase()) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'normal': return 'text-blue-600 bg-blue-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return 'No due date';
    return new Date(parseInt(dateStr)).toLocaleDateString();
  };

  return (
    <div className={`p-4 rounded-lg border hover:shadow-md transition-shadow ${
      highlight ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white'
    }`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-900 truncate pr-2">{task.name}</h3>
        <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
          {task.priority?.priority || 'No Priority'}
        </span>
      </div>
      
      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
        <div className="flex items-center gap-1">
          <CheckCircle className="w-4 h-4" />
          <span>{task.status.status}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(task.due_date)}</span>
        </div>
      </div>
      
      {task.assignees.length > 0 && (
        <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
          <User className="w-4 h-4" />
          <span>{task.assignees.map(a => a.username).join(', ')}</span>
        </div>
      )}
      
      <a 
        href={task.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
      >
        View in ClickUp →
      </a>
    </div>
  );
};
