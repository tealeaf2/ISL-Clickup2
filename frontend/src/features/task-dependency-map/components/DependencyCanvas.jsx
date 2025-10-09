import React from 'react';
import TaskBar from './TaskBar';
import LegendItem from '../../../shared/components/LegendItem';
import { LAYOUT_CONSTANTS, STATUS_COLORS } from '../../../shared/constants';
import { edgePath } from '../../../shared/utils';

/**
 * Canvas component for rendering the dependency map
 */
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
  onTaskPointerDown,
  onTaskPointerMove,
  onTaskPointerUp,
  getBlockers,
  owners = [],
  startDate = new Date()
}) => {
  const { DAY_WIDTH, LANE_HEIGHT, PADDING } = LAYOUT_CONSTANTS;

  // Generate calendar day grid lines
  const gridLines = [];
  const safeContentWidth = isNaN(contentWidth) ? 800 : contentWidth;
  const safeDayWidth = isNaN(DAY_WIDTH) ? 120 : DAY_WIDTH;
  const totalDays = Math.max(7, Math.ceil((safeContentWidth - PADDING * 2) / safeDayWidth));
  const baseDate = startDate || new Date();
  
  for (let d = 0; d < totalDays; d++) {
    const currentDate = new Date(baseDate);
    currentDate.setDate(baseDate.getDate() + d);
    gridLines.push({ 
      x: PADDING + d * safeDayWidth, 
      day: d,
      date: currentDate
    });
  }

  // Generate lane lines for all lanes from 0 to maxLane
  const laneLines = [];
  const taskLanes = tasks.map(task => isNaN(task.lane) ? 0 : task.lane);
  const actualMaxLane = taskLanes.length > 0 ? Math.max(...taskLanes) : 0;
  
  console.log('Tasks for lane generation:', tasks.map(task => ({ id: task.id, name: task.name, lane: task.lane, owner: task.owner })));
  console.log('Actual max lane:', actualMaxLane);
  
  for (let l = 0; l <= actualMaxLane; l++) {
    // Find a task in this lane to get owner info
    const taskInLane = tasks.find(task => task.lane === l);
    const owner = taskInLane ? taskInLane.owner : '';
    
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
        {/* Background */}
        <rect x={0} y={0} width={contentWidth} height={contentHeight} fill="#f8fafc" />
        

        {/* Vertical day grid + labels */}
        {gridLines.map(({ x, day, date }) => {
          const isToday = date.toDateString() === new Date().toDateString();
          return (
            <g key={`v-${day}-${date.getTime()}`}>
              <line
                x1={x}
                y1={PADDING - 40}
                x2={x}
                y2={contentHeight - PADDING + 40}
                stroke={isToday ? "#3b82f6" : "#e5e7eb"}
                strokeWidth={isToday ? 2 : 1}
              />
              <text 
                x={x + 6} 
                y={PADDING - 50} 
                fontSize={12} 
                fill={isToday ? "#3b82f6" : "#374151"}
                fontWeight={isToday ? "bold" : "normal"}
              >
                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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
              x1={PADDING - 60}
              y1={y}
              x2={contentWidth - PADDING + 60}
              y2={y}
              stroke={isOwnerBoundary ? "#9ca3af" : "#e5e7eb"}
              strokeWidth={isOwnerBoundary ? 2 : 1}
            />
          );
        })}

        {/* Owner section labels */}
        {laneLines.map(({ y, lane, owner }, index) => {
          // Only show owner label for the first lane of each owner section
          const isFirstLaneOfOwner = index === 0 || laneLines[index - 1].owner !== owner;
          
          if (!isFirstLaneOfOwner || !owner) return null;
          
          const taskInLane = tasks.find(task => task.lane === lane);
          const isParent = taskInLane && !taskInLane.parentId;
          const isChild = taskInLane && taskInLane.parentId;
          
          return (
            <text
              key={`lane-${lane}-${owner}`}
              x={PADDING - 90}
              y={y + LANE_HEIGHT / 2 + 4}
              fontSize={12}
              fill={isParent ? "#1f2937" : isChild ? "#6b7280" : "#1f2937"}
              fontWeight={isParent ? "bold" : "normal"}
              textAnchor="end"
            >
              {owner}
            </text>
          );
        })}

        {/* Edges (behind bars) */}
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
            onPointerDown={onTaskPointerDown}
            onPointerMove={onTaskPointerMove}
            onPointerUp={onTaskPointerUp}
          />
        ))}

        {/* Legend */}
        <g transform={`translate(${contentWidth - PADDING - 260}, ${PADDING - 80})`}>
          <rect
            x={0}
            y={0}
            width={260}
            height={60}
            rx={10}
            fill="#ffffff"
            stroke="#e5e7eb"
          />
          <LegendItem x={12} y={14} color={STATUS_COLORS.done} label="Done" />
          <LegendItem x={78} y={14} color={STATUS_COLORS['in-progress']} label="In Progress" />
          <LegendItem x={172} y={14} color={STATUS_COLORS.blocked} label="Blocked" />
          <LegendItem x={12} y={34} color={STATUS_COLORS.todo} label="To Do" />
        </g>
      </g>
    </svg>
  );
};

export default DependencyCanvas;


