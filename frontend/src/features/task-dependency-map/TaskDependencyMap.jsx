/**
 * TaskDependencyMap Component
 * 
 * Presentational component that renders the task dependency graph visualization.
 * This is a stateless component that follows the "data down, events up" pattern:
 * - Receives all data and state as props (data down)
 * - Emits events through callback props (events up)
 * 
 * The component displays:
 * - Control panel with zoom/pan controls and options
 * - Interactive canvas showing tasks in a Gantt-style timeline
 * - Modals for viewing/editing tasks and adding new tasks
 * - Debug HUD showing current pan and zoom values
 */

import React from 'react';
import ControlPanel from './components/ControlPanel';
import DependencyCanvas from './components/DependencyCanvas';
import TaskDetails from './components/TaskDetails';

/**
 * Stateless Task Dependency Map component - receives all data and handlers as props
 * Follows "data down, event up" pattern
 * 
 * @param {Object} props - Component props
 * @param {Array} props.tasks - Array of tasks to display (with computed rectangles)
 * @param {Array} props.dependencies - Array of dependency relationships between tasks
 * @param {string|null} props.selectedId - ID of currently selected task
 * @param {Object|null} props.selectedTask - The selected task object
 * @param {boolean} props.editOpen - Whether the detail modal is open
 * @param {Object} props.modalPosition - Screen position for modal placement
 * @param {number} props.contentWidth - Width of the scrollable content area
 * @param {number} props.contentHeight - Height of the scrollable content area
 * @param {Object} props.pan - Pan offset {x, y} in pixels
 * @param {number} props.scale - Current zoom level (1.0 = 100%)
 * @param {boolean} props.isPanning - Whether user is currently panning
 * @param {Object} props.containerRef - React ref to the container element
 * @param {Array} props.blockers - Array of tasks blocking the selected task
 * @param {Function} props.onZoomIn - Callback to zoom in
 * @param {Function} props.onZoomOut - Callback to zoom out
 * @param {Function} props.onFitToView - Callback to fit content horizontally to viewport
 * @param {Function} props.onTaskClick - Callback when a task is clicked
 * @param {Function} props.onTaskPointerDown - Callback when pointer down on task
 * @param {Function} props.onTaskPointerMove - Callback when pointer moves on task
 * @param {Function} props.onTaskPointerUp - Callback when pointer up on task
 * @param {Function} props.onPointerDown - Callback when pointer down on canvas
 * @param {Function} props.onPointerMove - Callback when pointer moves on canvas
 * @param {Function} props.onPointerUp - Callback when pointer up on canvas
 * @param {Function} props.onPointerCancel - Callback when pointer is cancelled
 * @param {Function} props.onClose - Callback to close modals
 * @param {Function} props.getBlockers - Function to get blockers for a task
 */
const TaskDependencyMap = ({
  // Data props (data down)
  tasks,
  dependencies,
  selectedId,
  selectedTask,
  editOpen,
  modalPosition,
  contentWidth,
  contentHeight,
  pan,
  scale,
  isPanning,
  containerRef,
  blockers,
  gridStartDate,
  day0Offset,
  
  // Event handler props (events up)
  onZoomIn,
  onZoomOut,
  onFitToView,
  onTaskClick,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onClose,
  getBlockers
}) => {
  return (
    <div className="w-full h-[80vh] bg-slate-50 text-gray-800 flex flex-col">
      {/* Top control panel with zoom controls */}
      <ControlPanel
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onFitToView={onFitToView}
      />

      {/* Main canvas container - handles pan/zoom interactions */}
      <div
        ref={containerRef}
        onPointerDown={(e) => {
          // Only handle pan events if not clicking on a task or button
          // This prevents panning when interacting with task elements
          if (!e.target.closest('.dependency-edge, button')) {
            onPointerDown(e);
          }
        }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        className={`relative flex-1 overflow-hidden ${isPanning ? "cursor-grabbing" : "cursor-grab"}`}
        style={{ touchAction: "none" }}
      >
        {/* Dependency canvas - renders the Gantt chart with tasks and dependencies */}
        <DependencyCanvas
          tasks={tasks}
          dependencies={dependencies}
          selectedId={selectedId}
          maxDay={Math.max(...tasks.map(task => task.start + task.duration), 0)}
          maxLane={Math.max(...tasks.map(task => task.lane), 0)}
          contentWidth={contentWidth}
          contentHeight={contentHeight}
          pan={pan}
          scale={scale}
          onTaskClick={onTaskClick}
          getBlockers={getBlockers}
          owners={Array.from(new Set(tasks.map(task => task.owner))).sort()}
          startDate={gridStartDate || new Date()}
          day0Offset={day0Offset || 0}
        />

        {/* Debug HUD - shows current pan and zoom values for development */}
        <div className="absolute bottom-3 left-3 text-xs bg-white/85 backdrop-blur rounded-md px-2 py-1 border shadow-sm">
          <span className="tabular-nums">
            scale: {scale.toFixed(2)} · pan: ({Math.round(pan.x)}, {Math.round(pan.y)})
          </span>
        </div>

        {/* Task details modal - shows task information when clicked */}
        {/* Displays when a task is selected and the detail modal should be open */}
        {selectedTask && editOpen && (
          <TaskDetails
            task={selectedTask}
            blockers={blockers}
            onClose={onClose}
            position={modalPosition}
            containerRect={containerRef?.current?.getBoundingClientRect?.()}
            // TODO: Pass update handlers when implemented
            // onEdit={(task) => {
            //   // Handle edit action
            //   if (onTaskUpdate) {
            //     // Open edit modal or enable inline editing
            //   }
            // }}
            // onStatusUpdate={(taskId, newStatus) => {
            //   // Handle status update
            //   if (onTaskStatusUpdate) {
            //     onTaskStatusUpdate(taskId, newStatus);
            //   }
            // }}
          />
        )}

      </div>
    </div>
  );
};

export default TaskDependencyMap;