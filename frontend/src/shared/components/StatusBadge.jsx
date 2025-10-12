import React from 'react';
import { STATUS_BADGE_CLASSES } from '../constants';

/**
 * Status badge component for displaying task status
 */
const StatusBadge = ({ status }) => {
  const colorClass = STATUS_BADGE_CLASSES[status] || STATUS_BADGE_CLASSES.todo;
  
  return (
    <span className={`text-[11px] border px-2 py-0.5 rounded-sm ${colorClass}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
