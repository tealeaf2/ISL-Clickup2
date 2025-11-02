/**
 * TaskCard Component
 * 
 * A card component that displays information about a ClickUp task in a visually
 * appealing format. Shows task name, status, priority, due date, assignees, and
 * a link to view the task in ClickUp.
 * 
 * Features:
 * - Priority-based color coding
 * - Status and assignee display
 * - Due date formatting
 * - Optional highlighting for emphasis
 * - Direct link to task in ClickUp
 * 
 * @fileoverview Component for displaying ClickUp task information in card format
 */

import React from 'react';
import { Calendar, User, CheckCircle } from 'lucide-react';
import type { ClickUpTask, ClickUpPriority } from '../types';

/**
 * Props for TaskCard component
 */
interface TaskCardProps {
  /** The ClickUp task object to display */
  task: ClickUpTask;
  /** Whether to highlight this card (e.g., for user's tasks) */
  highlight?: boolean;
}

/**
 * TaskCard component for displaying ClickUp task information
 * 
 * Renders a card with task details including name, status, priority, dates,
 * assignees, and a link to view in ClickUp.
 * 
 * @param {TaskCardProps} props - Component props
 * @returns {JSX.Element} A styled card displaying task information
 * 
 * @example
 * <TaskCard task={clickUpTask} highlight={true} />
 */
export const TaskCard: React.FC<TaskCardProps> = ({ task, highlight = false }) => {
  /**
   * Gets the CSS color classes for a priority level
   * 
   * @param {ClickUpPriority|undefined} priority - The priority object or undefined
   * @returns {string} Tailwind CSS classes for the priority color
   */
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

  /**
   * Formats a date string or timestamp into a localized date string
   * 
   * @param {string|undefined} dateStr - Date string or timestamp, or undefined
   * @returns {string} Formatted date string or 'No due date' if undefined
   */
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
