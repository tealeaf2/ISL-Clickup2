import React, { useRef, useEffect } from 'react';
import { STATUS_COLORS } from '../../../shared/constants';

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
  const dragStartedRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  
  
  const handlePointerDown = (e) => {
    // Only handle right-click for dragging (button 2)
    if (e.button !== 2) return;
    
    // Reset drag tracking
    dragStartedRef.current = false;
    startPosRef.current = { x: e.clientX, y: e.clientY };
    
    onPointerDown(e, task);
  };
  
  const handlePointerMove = (e) => {
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
      className="cursor-pointer"
    >
      {/* Task bar */}
      <rect
        x={rect.x}
        y={rect.y}
        width={rect.w}
        height={rect.h}
        rx={8}
        fill={isSelected ? "#fbbf24" : (STATUS_COLORS[task.status] || STATUS_COLORS.default)}
        opacity={0.92}
      />
      
      {/* Task label */}
      <text
        x={rect.x + 10}
        y={rect.y + rect.h / 2 + 4}
        fontSize={13}
        fill="#ffffff"
        fontWeight={600}
      >
        {task.id}: {task.name}
      </text>
      
      {/* Owner */}
      <text
        x={rect.x + rect.w - 8}
        y={rect.y + rect.h / 2 + 4}
        fontSize={11}
        fill="#ffffff"
        textAnchor="end"
      >
        {task.owner || 'Unassigned'}
      </text>
      
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
