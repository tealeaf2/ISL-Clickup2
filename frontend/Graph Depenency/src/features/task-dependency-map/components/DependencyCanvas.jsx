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
  getBlockers
}) => {
  const { DAY_WIDTH, LANE_HEIGHT, PADDING } = LAYOUT_CONSTANTS;

  // Generate grid lines
  const gridLines = [];
  for (let d = 0; d <= maxDay; d++) {
    gridLines.push({ x: PADDING + d * DAY_WIDTH, d });
  }

  const laneLines = [];
  for (let l = 0; l <= maxLane + 1; l++) {
    laneLines.push({ y: PADDING + l * LANE_HEIGHT, l });
  }

  // Create tasks lookup for edge path calculation
  const tasksById = Object.fromEntries(tasks.map(task => [task.id, task]));

  return (
    <svg className="absolute inset-0 w-full h-full" role="img" aria-label="Task dependency map">
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
        {gridLines.map(({ x, d }) => (
          <g key={`v-${d}`}>
            <line
              x1={x}
              y1={PADDING - 40}
              x2={x}
              y2={contentHeight - PADDING + 40}
              stroke="#e5e7eb"
            />
            <text x={x + 6} y={PADDING - 50} fontSize={12} fill="#374151">
              Day {d}
            </text>
          </g>
        ))}

        {/* Horizontal lane separators */}
        {laneLines.map(({ y, l }) => (
          <line
            key={`h-${l}`}
            x1={PADDING - 60}
            y1={y}
            x2={contentWidth - PADDING + 60}
            y2={y}
            stroke="#e5e7eb"
          />
        ))}

        {/* Lane labels */}
        {Array.from({ length: maxLane + 1 }).map((_, l) => (
          <text
            key={`lane-${l}`}
            x={PADDING - 90}
            y={PADDING + l * LANE_HEIGHT + LANE_HEIGHT / 2 + 4}
            fontSize={12}
            fill="#6b7280"
          >
            Lane {l + 1}
          </text>
        ))}

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


