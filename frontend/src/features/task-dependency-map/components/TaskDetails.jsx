/**
 * TaskDetails Component
 * 
 * Modal that displays detailed information about a task when clicked.
 * Shows task properties and blockers in read-only mode.
 * Positioned near the click location for context.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.task - The task to display details for
 * @param {Array} props.blockers - Array of tasks blocking this task
 * @param {Function} props.onClose - Callback to close the modal
 * @param {Object} props.position - Screen position {x, y} for modal placement
 * @param {DOMRect|null} props.containerRect - Bounding rect of the container for positioning
 * @param {Function} [props.onEdit] - TODO: Callback for editing the task (not yet implemented)
 * @param {Function} [props.onStatusUpdate] - TODO: Callback for updating task status (not yet implemented)
 */
import React from 'react';
import StatusBadge from './StatusBadge';
import { daysSince } from '../../../shared/utils';
import {User, Target, Calendar, Clapperboard, ArrowBigUp,ArrowBigDown, Rows4, Construction} from "lucide-react"

/**
 * Calculates time remaining until due date or time overdue
 * Matches the calculation logic used in TaskTable component
 */
function calculateTimeRemaining(dueDate) {
  if (!dueDate) return "-";
  
  try {
    const isNumeric = /^\d+$/.test(String(dueDate));
    const dueDt = isNumeric ? new Date(parseInt(dueDate)) : new Date(dueDate);
    
    if (isNaN(dueDt.getTime())) return "-";
    
    const now = new Date();
    const diffMs = dueDt.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    const remainingHours = diffHours % 24;
    
    if (diffHours < 0) {
      const absDays = Math.abs(diffDays);
      const absHours = Math.abs(remainingHours);
      if (absDays === 0) {
        return `${absHours}h overdue`;
      }
      return absHours > 0 ? `${absDays}d ${absHours}h overdue` : `${absDays}d overdue`;
    } else if (diffHours < 24) {
      return diffHours === 0 ? "Due now" : `${diffHours}h remaining`;
    } else {
      return remainingHours > 0 ? `${diffDays}d ${remainingHours}h remaining` : `${diffDays}d remaining`;
    }
  } catch {
    return "-";
  }
}

const TaskDetails = ({ 
  task, 
  blockers, 
  onClose,
  position = { x: 0, y: 0 },
  containerRect = null,
  // TODO: Add these props when update functionality is implemented
  onEdit = undefined,
  onStatusUpdate = undefined
}) => {
  if (!task) return null;

  // Simple positioning - just use the position directly
  const modalX = position.x + 20;
  const modalY = position.y - 100;

  return (
    <div 
      className="absolute w-[320px] bg-white border-2 border-blue-500 rounded-xl shadow-lg p-3 space-y-2 z-50"
      style={{
        left: `${Math.max(10, modalX)}px`,
        top: `${Math.max(10, modalY)}px`,
      }}
    >
      <div className="flex items-center justify-between">
        <div className="font-semibold text-base">{task.name}</div>
        <button className="text-xs underline hover:text-gray-600" onClick={onClose}>
          Close
        </button>
      </div>
      
      <div className="text-xs text-gray-500">Task ID: {task.id}</div>
      
      <div className="flex items-center gap-2">
        {/* Target(Status) Icon */}
        <Target class="h-5 w-5"/>
        <StatusBadge status={task.status} />
        {/* User Icon */}
         <User className="h-5 w-5"/>
        <div className="text-xs text-gray-500">
          Owner: {task.owner || 'Unassigned'}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-xs">
        {task.dueDate && (
          <div className="col-span-2">
            {/* Calendar (Time Remaining) Icon */}
          <Calendar className="mr-1 inline-block h-5 w-5 align-middle" />
            Time Remaining: <span className={`font-mono ${calculateTimeRemaining(task.dueDate)?.includes('overdue') || calculateTimeRemaining(task.dueDate) === "Due now" ? 'text-red-600 font-semibold' : ''}`}>
              {calculateTimeRemaining(task.dueDate)}
            </span>
          </div>
        )}
        <div>
           {/* Arrow Big Up (Parent) Icon */}
          <ArrowBigUp className="mr-1 inline-block h-5 w-5 align-middle" />
          Parent: <span className="font-mono">{task.parentId || '—'}</span>
        </div>
        <div className="col-span-2">
           {/* Arrow Down Up (Depenency) Icon */}
           <ArrowBigDown className="mr-1 inline-block h-5 w-5 align-middle" />
          Depends:{' '}
          <span className="font-mono">
            {(task.depends || []).join(', ') || '—'}
          </span>
        </div>
      </div>

      {/* Blockers list */}
      <div className="pt-1 flex items-center gap-2">
         {/* Construction(Blocker) Icon */}
        <Construction className='mr-1 inline-block h-5 w-5 align-middle'/>
        <div className="text-xs font-semibold mb-1">Blockers</div>
        {blockers.length === 0 ? (
          <div className="text-xs text-gray-500">No active blockers</div>
        ) : (
          <ul className="space-y-1 max-h-24 overflow-auto pr-1">
            {blockers.map((blocker, i) => (
              <li key={i} className="text-xs bg-red-50 border border-red-100 rounded-md p-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{blocker.by}</span>
                  {blocker.type === 'dependency' && (
                    <span className="ml-2 text-[10px] text-red-700">(dep)</span>
                  )}
                </div>
                <div className="text-[11px] text-gray-600">
                  Owner: {blocker.owner || '—'}
                </div>
                <div className="text-[11px] text-gray-600">
                  {blocker.since ? `${daysSince(blocker.since)}d blocked` : 'since unknown'}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* TODO: Add update functionality UI */}
      {/* 
        These buttons will be enabled once update functionality is implemented.
        They should call update handlers passed as props to update the task in ClickUp.
      */}
      <div className="pt-2 border-t border-gray-200">
        <div className="text-xs text-gray-400 mb-2 italic">
          Update functionality coming soon
        </div>
        <div className="flex items-center justify-end gap-2">
          {/* TODO: Add edit button - opens inline editing or edit modal */}
          <button 
            className="px-3 py-1 rounded-lg border border-gray-300 shadow-sm hover:bg-gray-50 text-xs disabled:opacity-50 disabled:cursor-not-allowed" 
            disabled
            onClick={() => {
              // TODO: Implement edit handler
              // Should open an edit form/modal or enable inline editing
              // onEdit?.(task);
            }}
            title="Edit functionality not yet implemented"
          >
            Edit
          </button>
          
          {/* TODO: Add quick status update dropdown */}
          <select
            className="px-2 py-1 rounded-lg border border-gray-300 shadow-sm text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            disabled
            value={task.status}
            onChange={(e) => {
              // TODO: Implement status update handler
              // onStatusUpdate?.(task.id, e.target.value);
            }}
            title="Status update not yet implemented"
          >
            <option value={task.status}>{task.status}</option>
            {/* TODO: Populate with available statuses from ClickUp workspace */}
          </select>
          
          <button 
            className="px-3 py-1 rounded-lg border shadow-sm hover:bg-gray-50 text-xs" 
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
