/**
 * StatusBadge Component
 * 
 * A reusable badge component that displays a task's status with appropriate styling.
 * The badge color and styling are determined by the task status using predefined
 * CSS classes from the constants file.
 * 
 * @fileoverview Component for rendering task status badges with color-coded styling
 */

import React from 'react';
import { STATUS_BADGE_CLASSES } from '../constants';

/**
 * Status badge component for displaying task status with color-coded styling
 * 
 * @param {Object} props - Component props
 * @param {string} props.status - The status of the task (e.g., 'todo', 'in-progress', 'blocked')
 * @returns {JSX.Element} A styled span element displaying the task status
 * 
 * @example
 * <StatusBadge status="in-progress" />
 */
const StatusBadge = ({ status }) => {
  const colorClass = STATUS_BADGE_CLASSES[status] || STATUS_BADGE_CLASSES.todo;
  
  return (
    <span className={`text-[11px] border px-2 py-0.5 rounded-full ${colorClass}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
