/**
 * TaskBar Component
 * 
 * Renders a single task as a bar in the dependency graph timeline.
 * Each task bar displays:
 * - Task name with visual hierarchy indicators (parent vs child)
 * - Color coding by status (todo, in-progress, blocked)
 * - Priority border styling
 * - Blocker badge (if task has blockers)
 * - Selection ring (when task is selected)
 * 
 * Handles pointer events for:
 * - Left click: Select task and open detail modal
 * 
 * TODO: Future drag functionality will trigger date updates
 * When drag-to-update is implemented, this component will need:
 * - onDragStart, onDrag, onDragEnd handlers
 * - Visual feedback during dragging
 * - Call handleTaskDateUpdate when drag completes
 * 
 * @param {Object} props - Component props
 * @param {Object} props.task - Task object to render
 * @param {boolean} props.isSelected - Whether this task is currently selected
 * @param {Array} props.blockers - Array of tasks blocking this task
 * @param {Function} props.onClick - Callback when task is clicked
 */
import React from 'react';
import { STATUS_COLORS, PRIORITY_COLORS, PRIORITY_BORDERS } from '../../../shared/constants';

/**
 * Extracts stroke color from priority border CSS string
 * 
 * @param {string} priority - Priority level
 * @returns {string} Hex color code for the stroke
 */
const getPriorityStrokeColor = (priority) => {
  if (!PRIORITY_BORDERS[priority]) return "#374151";
  const parts = PRIORITY_BORDERS[priority].split('; ');
  const strokePart = parts.find(part => part.startsWith('stroke: '));
  return strokePart ? strokePart.split(': ')[1] : "#374151";
};

/**
 * Extracts stroke width from priority border CSS string
 * 
 * @param {string} priority - Priority level
 * @returns {number} Stroke width in pixels
 */
const getPriorityStrokeWidth = (priority) => {
  if (!PRIORITY_BORDERS[priority]) return 1;
  const parts = PRIORITY_BORDERS[priority].split('; ');
  const widthPart = parts.find(part => part.startsWith('stroke-width: '));
  return widthPart ? parseInt(widthPart.split(': ')[1]) : 1;
};

const TaskBar = ({
  task,
  isSelected,
  blockers,
  onClick,
  isDimmed,
  isInBlastRadius,
}) => {
  const { rect, priority } = task;

  // Ensure rect has valid values - prevents rendering errors with invalid data
  const safeRect = {
    x: isNaN(rect?.x) ? 0 : rect?.x || 0,
    y: isNaN(rect?.y) ? 0 : rect?.y || 0,
    w: isNaN(rect?.w) ? 100 : rect?.w || 100,
    h: isNaN(rect?.h) ? 24 : rect?.h || 24
  };
  const priorityColor = getPriorityStrokeColor(priority?.priority);
  const priorityWidth = getPriorityStrokeWidth(priority?.priority);

  const finalStroke = isSelected ? "#2563eb" : priorityColor;
  const finalStrokeWidth = isSelected ? 2 : priorityWidth;

  const opacity = isDimmed ? 0.15 : 1;
  const filter = isDimmed ? 'grayscale(100%)' : 'none';

  /**
   * Handles click - selects task and opens edit modal
   * Calculates click position for proper modal positioning
   */
  const handleClick = (e) => {
    e.stopPropagation();

    // Calculate click position in screen coordinates (for modal positioning)
    // Modal positioning uses screen coordinates, not SVG-relative coordinates
    const clickX = e.clientX;
    const clickY = e.clientY;

    // Pass task and click position to parent handler
    if (onClick) {
      onClick(e, task, { x: clickX, y: clickY });
    }
  };


  return (
    <g
      key={task.id}
      data-taskid={task.id}
      onClick={handleClick}
      className="cursor-pointer task-bar"
      style={{ opacity, filter }}
    >
      {/* BLAST RADIUS HALO */}
      {isInBlastRadius && (
        <rect
          x={safeRect.x - 6}
          y={safeRect.y - 6}
          width={safeRect.w + 12}
          height={safeRect.h + 12}
          rx={8}
          fill="none"
          stroke="#ef4444"
          strokeWidth={2}
          opacity={0.6}
          className="animate-pulse"
        />
      )}

      {/* SELECTION HALO */}
      {isSelected && (
        <rect
          x={safeRect.x - 3}
          y={safeRect.y - 3}
          width={safeRect.w + 6}
          height={safeRect.h + 6}
          rx={6}
          fill="none"
          stroke="#93c5fd"
          strokeWidth={2}
        />
      )}

      {/* Task bar */}
      <rect
        x={safeRect.x}
        y={safeRect.y}
        width={safeRect.w}
        height={safeRect.h}
        rx={8}
        fill={isSelected ? "#fbbf24" : (STATUS_COLORS[task.status] || STATUS_COLORS.default)}
        opacity={0.92}
        stroke={finalStroke}
        strokeWidth={finalStrokeWidth}
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
            x={safeRect.x - 36}
            y={safeRect.y - 2}
            width={32}
            height={safeRect.h + 4}
            rx={6}
            fill="#ef4444"
          />
          <text
            x={safeRect.x - 20}
            y={safeRect.y + safeRect.h / 2 + 4}
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
          x={safeRect.x - 3}
          y={safeRect.y - 3}
          width={safeRect.w + 6}
          height={safeRect.h + 6}
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
