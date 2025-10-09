import React, { useRef, useEffect } from 'react';
import { STATUS_COLORS, PRIORITY_COLORS, PRIORITY_BORDERS } from '../../../shared/constants';

/**
 * Helper functions to extract priority border properties
 */
const getPriorityStrokeColor = (priority) => {
  if (!PRIORITY_BORDERS[priority]) return "#374151";
  const parts = PRIORITY_BORDERS[priority].split('; ');
  const strokePart = parts.find(part => part.startsWith('stroke: '));
  return strokePart ? strokePart.split(': ')[1] : "#374151";
};

const getPriorityStrokeWidth = (priority) => {
  if (!PRIORITY_BORDERS[priority]) return 1;
  const parts = PRIORITY_BORDERS[priority].split('; ');
  const widthPart = parts.find(part => part.startsWith('stroke-width: '));
  return widthPart ? parseInt(widthPart.split(': ')[1]) : 1;
};

/**
 * Task bar component representing a single task in the dependency map
 */
const TaskBar = ({
  task,
  isSelected,
  blockers,
  onPointerDown,
  onPointerMove,
  onPointerUp
}) => {
  const rect = task.rect;
  
  // Ensure rect has valid values
  const safeRect = {
    x: isNaN(rect?.x) ? 0 : rect?.x || 0,
    y: isNaN(rect?.y) ? 0 : rect?.y || 0,
    w: isNaN(rect?.w) ? 100 : rect?.w || 100,
    h: isNaN(rect?.h) ? 24 : rect?.h || 24
  };
  
  const dragStartedRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  
  
  const handlePointerDown = (e) => {
    // Only handle right-click for dragging (button 2)
    if (e.button !== 2) return;
    
    // Reset drag tracking
    dragStartedRef.current = false;
    startPosRef.current = { x: e.clientX, y: e.clientY };
    
    // Capture pointer for this element
    e.currentTarget.setPointerCapture(e.pointerId);
    
    onPointerDown(e, task);
  };
  
  const handlePointerMove = (e) => {
    // Only handle move events if we have pointer capture
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    
    // Check if we've moved enough to consider this a drag
    const deltaX = Math.abs(e.clientX - startPosRef.current.x);
    const deltaY = Math.abs(e.clientY - startPosRef.current.y);
    const dragThreshold = 3; // pixels
    
    if (deltaX > dragThreshold || deltaY > dragThreshold) {
      dragStartedRef.current = true;
    }
    
    if (onPointerMove) {
      onPointerMove(e);
    }
  };
  
  const handlePointerUp = (e) => {
    // Release pointer capture
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    
    // Reset drag state
    dragStartedRef.current = false;
    
    if (onPointerUp) {
      onPointerUp(e);
    }
  };

  const handleLeftClick = (e) => {
    e.stopPropagation();
    
    // Calculate click position relative to the container
    const containerRect = e.target.closest('svg').getBoundingClientRect();
    const clickX = e.clientX - containerRect.left;
    const clickY = e.clientY - containerRect.top;
    
    // Call the selection handler directly
    if (onPointerDown) {
      onPointerDown(e, task, { x: clickX, y: clickY });
    }
  };

  
  return (
    <g
      key={task.id}
      data-taskid={task.id}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={handleLeftClick}
      className="cursor-pointer task-bar"
    >
      {/* Task bar */}
      <rect
        x={safeRect.x}
        y={safeRect.y}
        width={safeRect.w}
        height={safeRect.h}
        rx={8}
        fill={isSelected ? "#fbbf24" : (STATUS_COLORS[task.status] || STATUS_COLORS.default)}
        opacity={0.92}
        stroke={getPriorityStrokeColor(task.priority)}
        strokeWidth={getPriorityStrokeWidth(task.priority)}
      />
      
      {/* Task label with text clipping */}
      <g>
        <defs>
          <clipPath id={`clip-${task.id}`}>
            <rect
              x={safeRect.x + 8}
              y={safeRect.y + 2}
              width={Math.max(0, safeRect.w - 16)}
              height={safeRect.h - 4}
            />
          </clipPath>
        </defs>
        <text
          x={safeRect.x + 10}
          y={safeRect.y + safeRect.h / 2 + 4}
          fontSize={12}
          fill="#ffffff"
          fontWeight={!task.parentId ? 700 : 600}
          clipPath={`url(#clip-${task.id})`}
        >
          {!task.parentId ? `📋 ${task.name}` : `  ↳ ${task.name}`}
        </text>
      </g>
      
      
      {/* Blocker badge */}
      {blockers.length > 0 && (
        <g>
          <rect
            x={rect.x - 36}
            y={rect.y - 2}
            width={32}
            height={rect.h + 4}
            rx={6}
            fill="#ef4444"
          />
          <text
            x={rect.x - 20}
            y={rect.y + rect.h / 2 + 4}
            fontSize={12}
            fill="#ffffff"
            textAnchor="middle"
          >
            {blockers.length}
          </text>
        </g>
      )}
      
      {/* Selection ring */}
      {isSelected && (
        <rect
          x={rect.x - 3}
          y={rect.y - 3}
          width={rect.w + 6}
          height={rect.h + 6}
          rx={10}
          fill="none"
          stroke="#111827"
          strokeDasharray="6 4"
        />
      )}
    </g>
  );
};

export default TaskBar;
