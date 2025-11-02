/**
 * DependencyCanvas Component
 * 
 * SVG canvas that renders the Gantt-style dependency graph visualization.
 * Displays:
 * - Calendar timeline grid with day markers
 * - Owner lanes (horizontal rows organized by task owner)
 * - Task bars positioned by date and lane
 * - Dependency arrows connecting parent to child tasks
 * - Status legend
 * - Owner labels on the left side
 * 
 * The canvas supports pan and zoom transformations applied via SVG transform.
 * 
 * @param {Object} props - Component props
 * @param {Array} props.tasks - Array of tasks to render
 * @param {Array} props.dependencies - Array of dependency relationships
 * @param {string|null} props.selectedId - ID of currently selected task
 * @param {number} props.maxDay - Maximum day number to display
 * @param {number} props.maxLane - Maximum lane number to display
 * @param {number} props.contentWidth - Width of the content area
 * @param {number} props.contentHeight - Height of the content area
 * @param {Object} props.pan - Pan offset {x, y} in pixels
 * @param {number} props.scale - Zoom scale factor (1.0 = 100%)
 * @param {Function} props.onTaskClick - Callback when task is clicked
 * @param {Function} props.getBlockers - Function to get blockers for a task
 * @param {Array} props.owners - Array of unique owner names
 * @param {Date} props.startDate - Starting date for the timeline
 */
import React from 'react';
import TaskBar from './TaskBar';
import LegendItem from '../../../shared/components/LegendItem';
import { LAYOUT_CONSTANTS, STATUS_COLORS } from '../../../shared/constants';
import { edgePath } from '../../../shared/utils';

const DependencyCanvas = ({
  tasks,
  dependencies,
  selectedId,
  maxDay,
  maxLane,
  contentWidth,
  contentHeight,
  pan,
  scale,
  onTaskClick,
  getBlockers,
  owners = [],
  startDate = new Date(),
  day0Offset = 0
}) => {
  const { DAY_WIDTH, LANE_HEIGHT, PADDING } = LAYOUT_CONSTANTS;

  /**
   * Generate vertical grid lines for calendar days
   * Creates lines at each day boundary with date labels
   */
  const gridLines = [];
  // Use the exact DAY_WIDTH constant - must match what computeTaskRect uses
  const dayWidth = DAY_WIDTH;  // Use exact constant, no fallback needed
  
  // Normalize startDate to midnight for consistent day calculations
  const normalizeToMidnight = (date) => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  };
  
  const baseDate = startDate ? normalizeToMidnight(startDate) : normalizeToMidnight(new Date());
  
  // Calculate total days from content width to ensure grid matches task positioning
  // This MUST use the same DAY_WIDTH constant that computeTaskRect uses
  // Account for owner label area (250px) on the left
  const ownerLabelArea = 250;
  const safeContentWidth = isNaN(contentWidth) ? 800 : contentWidth;
  const totalDays = Math.ceil((safeContentWidth - ownerLabelArea - PADDING * 2) / dayWidth);
  
  // Generate grid lines for each day
  // Grid day 0 = gridStartDate, Grid day day0Offset = today
  // Grid line at index d is at: ownerLabelArea + PADDING + d * DAY_WIDTH
  for (let d = 0; d < totalDays; d++) {
    const currentDate = new Date(baseDate);
    currentDate.setDate(baseDate.getDate() + d);
    const gridLineX = ownerLabelArea + PADDING + d * dayWidth;  // Must use exact same formula as computeTaskRect
    gridLines.push({ 
      x: gridLineX,
      day: d,                          // Day index in the grid (0 = grid start, not today)
      date: currentDate                // Actual date object for labeling
    });
  }
  
  // Debug: Verify grid alignment and log grid line positions
  console.log(`Grid: baseDate=${baseDate.toISOString().split('T')[0]}, totalDays=${totalDays}, day0Offset=${day0Offset}, DAY_WIDTH=${dayWidth}, PADDING=${PADDING}`);
  if (day0Offset < totalDays && day0Offset >= 0) {
    const todayGridLine = gridLines[day0Offset];
    if (todayGridLine) {
      console.log(`Grid alignment: Today at grid index ${day0Offset}, x=${todayGridLine.x}, date=${todayGridLine.date.toISOString().split('T')[0]}`);
    }
  }

  /**
   * Generate horizontal lane separator lines
   * Creates lines between lanes and identifies owner boundaries
   */
  const laneLines = [];
  const taskLanes = tasks.map(task => isNaN(task.lane) ? 0 : task.lane);
  const actualMaxLane = taskLanes.length > 0 ? Math.max(...taskLanes) : 0;
  
  console.log('Tasks for lane generation:', tasks.map(task => ({ id: task.id, name: task.name, lane: task.lane, owner: task.owner })));
  console.log('Actual max lane:', actualMaxLane);
  
  for (let l = 0; l <= actualMaxLane; l++) {
    // Find a task in this lane to get owner info
    const taskInLane = tasks.find(task => task.lane === l);
    // Inherit previous non-empty owner for spacer lanes to avoid splitting sections
    const previousOwner = laneLines.length > 0 ? laneLines[laneLines.length - 1].owner : '';
    const owner = taskInLane ? taskInLane.owner : previousOwner;
    
    console.log(`Creating lane ${l} with owner: ${owner}`);
    
    laneLines.push({
      y: PADDING + l * LANE_HEIGHT,
      lane: l,
      owner: owner
    });
  }
  
  console.log('Generated lane lines:', laneLines);

  // Create tasks lookup for edge path calculation
  const tasksById = Object.fromEntries(tasks.map(task => [task.id, task]));

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-auto" role="img" aria-label="Task dependency map">
      <defs>
        <marker
          id="arrow"
          viewBox="0 0 10 10"
          refX="10"
          refY="5"
          markerWidth="8"
          markerHeight="8"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#6b7280" />
        </marker>
      </defs>

      {/* Pan & Zoom group */}
      <g transform={`translate(${pan.x}, ${pan.y}) scale(${scale})`}>
        {/* Background - covers entire content area including owner label area */}
        <rect x={0} y={0} width={contentWidth} height={contentHeight} fill="#f8fafc" />
        

        {/* Vertical day grid + labels */}
        {/* Grid starts after the owner label area (150px) */}
        {gridLines.map(({ x, day, date }) => {
          // day 0 (today) is at day0Offset in the grid lines array
          const isDay0 = day === day0Offset;
          const isToday = date.toDateString() === new Date().toDateString();
          // Highlight day 0 line or today line (they should be the same, but check both)
          const isHighlighted = isDay0 || isToday;
          // Grid lines are already calculated with owner label area offset, no need to add it again
          const gridLineX = x;
          return (
            <g key={`v-${day}-${date.getTime()}`}>
              <line
                x1={gridLineX}
                y1={PADDING - 40}
                x2={gridLineX}
                y2={contentHeight - PADDING + 40}
                stroke={isHighlighted ? "#3b82f6" : "#e5e7eb"}
                strokeWidth={isHighlighted ? 2 : 1}
              />
              <text 
                x={gridLineX + 6} 
                y={PADDING - 50} 
                fontSize={12} 
                fill={isHighlighted ? "#3b82f6" : "#374151"}
                fontWeight={isHighlighted ? "bold" : "normal"}
              >
                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                {isDay0 && ' (Today)'}
              </text>
            </g>
          );
        })}

        {/* Horizontal lane separators */}
        {laneLines.map(({ y, lane, owner }, index) => {
          // Check if this is the first lane of a new owner
          const isOwnerBoundary = index === 0 || laneLines[index - 1].owner !== owner;
          
          return (
            <line
              key={`h-${lane}-${owner}`}
              x1={0}
              y1={y}
              x2={contentWidth}
              y2={y}
              stroke={isOwnerBoundary ? "#9ca3af" : "#e5e7eb"}
              strokeWidth={isOwnerBoundary ? 2 : 1}
            />
          );
        })}

        {/* Owner section labels - scale font size with zoom to maintain readability */}
        {laneLines.map(({ y, lane, owner }, index) => {
          // Only show owner label for the first lane of each owner section
          const isFirstLaneOfOwner = index === 0 || laneLines[index - 1].owner !== owner;
          
          if (!isFirstLaneOfOwner || !owner) return null;
          
          const taskInLane = tasks.find(task => task.lane === lane);
          const isParent = taskInLane && !taskInLane.parentId;
          const isChild = taskInLane && taskInLane.parentId;
          
          // Calculate font size that maintains readability
          // Base size is 18px, but scale inversely with zoom to keep it readable
          // Minimum readable size is ~12px, so we ensure it never goes below that
          const baseFontSize = 18;
          const minReadableSize = 12;
          const fontSize = Math.max(minReadableSize, baseFontSize / scale);
          
          // Position labels in the owner label area on the left (250px area)
          const ownerLabelArea = 250;
          
          return (
            <text
              key={`lane-${lane}-${owner}`}
              x={ownerLabelArea - 20}
              y={y + LANE_HEIGHT / 2 + 4}
              fontSize={fontSize}
              fill={isParent ? "#111827" : isChild ? "#374151" : "#111827"}
              fontWeight={isParent ? "700" : "600"}
              textAnchor="end"
            >
              {owner}
            </text>
          );
        })}

        {/* Parent-child edges (arrows from parents to children) */}
        {dependencies.map((dep, i) => (
          <path
            key={`e-${i}`}
            d={edgePath(dep.from, dep.to, tasksById, task => task.rect)}
            fill="none"
            stroke="#6b7280"
            strokeWidth={2}
            markerEnd="url(#arrow)"
          />
        ))}

        {/* Task bars */}
        {tasks.map(task => (
          <TaskBar
            key={task.id}
            task={task}
            isSelected={selectedId === task.id}
            blockers={getBlockers(task)}
            onClick={onTaskClick}
          />
        ))}

        {/* Legend */}
        <g transform={`translate(${contentWidth - PADDING - 320}, ${PADDING - 80})`}>
          <rect
            x={0}
            y={0}
            width={320}
            height={40}
            rx={10}
            fill="#ffffff"
            stroke="#e5e7eb"
          />
          <LegendItem x={12} y={14} color={STATUS_COLORS['in-progress']} label="In Progress" />
          <LegendItem x={132} y={14} color={STATUS_COLORS.blocked} label="Blocked" />
          <LegendItem x={220} y={14} color={STATUS_COLORS.todo} label="To Do" />
        </g>
      </g>
    </svg>
  );
};

export default DependencyCanvas;


