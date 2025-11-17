/**
 * TaskDetails Component
 * * Modal that displays detailed information about a task when clicked.
 * Shows task properties and blockers in read-only mode.
 * Draggable and positioned to stay within viewport bounds.
 * * @param {Object} props - Component props
 * @param {Object} props.task - The task to display details for
 * @param {Array} props.blockers - Array of tasks blocking this task
 * @param {Function} props.onClose - Callback to close the modal
 * @param {Object} props.position - Screen position {x, y} for modal placement
 * @param {DOMRect|null} props.containerRect - Bounding rect of the container for positioning
 * @param {Function} [props.onEdit] - TODO: Callback for editing the task (not yet implemented)
 * @param {Function} [props.onStatusUpdate] - TODO: Callback for updating task status (not yet implemented)
 */
import React, { useState, useRef, useEffect } from 'react';
import StatusBadge from './StatusBadge';
import { daysSince } from '../../../shared/utils';
import {User, Target, Calendar, ArrowBigUp, ArrowBigDown, Construction, GripVertical} from "lucide-react"

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

  const modalRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Calculate initial position ensuring modal stays within viewport
  const [modalPosition, setModalPosition] = useState(() => {
    const modalWidth = 320;
    // We use window.innerHeight for initial positioning to approximate the full-screen boundary
    const viewportHeight = window.innerHeight; 
    const modalHeight = 400; // Approximate height
    const padding = 10;
    const vh80InPixels = viewportHeight * 0.8; // Calculate 80vh in pixels

    let x = position.x + 20;
    let y = position.y - 100;
    
    // Keep within viewport bounds, using the 80vh limit for the bottom
    const maxX = window.innerWidth - modalWidth - padding;
    // New maxY: The bottom of the modal (modalPosition.y + modalHeight) should not exceed 80vh.
    // So, modalPosition.y should not exceed (80vh - modalHeight - padding).
    const maxY = vh80InPixels - modalHeight - padding;
    
    x = Math.max(padding, Math.min(x, maxX));
    y = Math.max(padding, Math.min(y, maxY));
    
    return { x, y };
  });

  // Handle drag start
  const handleMouseDown = (e) => {
    // Always stop propagation to prevent background pan/zoom
    e.preventDefault();
    e.stopPropagation();
    
    // Don't start dragging if clicking on interactive elements
    if (e.target.closest('button') || e.target.closest('select')) return;
    
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - modalPosition.x,
      y: e.clientY - modalPosition.y
    });
  };

  // Handle dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      e.preventDefault(); // Prevent default behavior during drag
      
      const modalWidth = modalRef.current?.offsetWidth || 320;
      const modalHeight = modalRef.current?.offsetHeight || 400;
      const padding = 10;
      
      let newX = e.clientX - dragOffset.x;
      let newY = e.clientY - dragOffset.y;
      
      // Calculate 80vh in pixels dynamically
      const vh80InPixels = window.innerHeight * 0.8; 
      
      // Keep within viewport bounds
      const maxX = window.innerWidth - modalWidth - padding;
      
      // *** MODIFICATION START ***
      // Restrict the bottom edge (newY + modalHeight) to 80vh minus padding.
      // This means the maximum 'top' position (newY) is (80vh - modalHeight - padding).
      const maxY = vh80InPixels*0.92 - modalHeight - padding;
      // *** MODIFICATION END ***
      
      newX = Math.max(padding, Math.min(newX, maxX));
      newY = Math.max(padding, Math.min(newY, maxY)); // Use the new maxY constraint
      
      setModalPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  return (
    <div 
      ref={modalRef}
      className={`absolute w-[320px] bg-white border-2 border-blue-500 rounded-xl shadow-lg p-3 space-y-2 z-50 select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{
        left: `${modalPosition.x}px`,
        top: `${modalPosition.y}px`,
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        pointerEvents: 'auto'
      }}
      onMouseDown={handleMouseDown}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-gray-400" />
          <div className="font-semibold text-base">{task.name}</div>
        </div>
        <button className="text-xs underline hover:text-gray-600 cursor-pointer" onClick={onClose}>
          Close
        </button>
      </div>
      
      <div className="text-xs text-gray-500">Task ID: {task.id}</div>
      
      <div className="flex items-center gap-2">
        {/* Target(Status) Icon */}
        <Target className="h-5 w-5"/>
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
            {/* Arrow Down Up (Dependency) Icon */}
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

      <div className="pt-2 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <a
            href={`https://app.clickup.com/t/${task.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-700 underline"
          >
            Open in ClickUp
          </a>
          <button 
            className="px-3 py-1 rounded-lg border shadow-sm hover:bg-gray-50 text-xs cursor-pointer" 
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