import React from 'react';
import ControlPanel from './components/ControlPanel';
import DependencyCanvas from './components/DependencyCanvas';
import TaskDetails from './components/TaskDetails';
import TaskEditModal from './components/TaskEditModal';
import AddTaskButton from './components/AddTaskButton';
import AddTaskModal from './components/AddTaskModal';

/**
 * Stateless Task Dependency Map component - receives all data and handlers as props
 * Follows "data down, event up" pattern
 */
const TaskDependencyMap = ({
  // Data props (data down)
  options,
  tasks,
  dependencies,
  selectedId,
  selectedTask,
  editOpen,
  draft,
  modalPosition,
  showAddTaskModal,
  addTaskDraft,
  contentWidth,
  contentHeight,
  pan,
  scale,
  isPanning,
  containerRef,
  blockers,
  
  // Event handler props (events up)
  onOptionsChange,
  onZoomIn,
  onZoomOut,
  onReset,
  onFitToView,
  onTaskClick,
  onTaskPointerDown,
  onTaskPointerMove,
  onTaskPointerUp,
  onWheel,
  onPointerDown,
  onPointerMove,
  onPointerCancel,
  onEdit,
  onClose,
  onSave,
  onDelete,
  onDraftChange,
  onAddTaskModalOpen,
  onAddTaskModalClose,
  onAddTaskSave,
  onAddTaskDraftChange,
  getBlockers
}) => {
  return (
    <div className="w-full h-[80vh] bg-white text-gray-800 flex flex-col">
      <ControlPanel
        options={options}
        onOptionsChange={onOptionsChange}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onReset={onReset}
        onFitToView={onFitToView}
        isPropagating={false}
        onTriggerPropagation={() => {}}
        autoUpdateEnabled={true}
      />

      {/* Canvas */}
      <div
        ref={containerRef}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerMove}
        onPointerCancel={onPointerCancel}
        className={`relative flex-1 overflow-hidden ${isPanning ? "cursor-grabbing" : "cursor-grab"}`}
        style={{ touchAction: "none" }}
      >
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
          onTaskPointerDown={onTaskPointerDown}
          onTaskPointerMove={onTaskPointerMove}
          onTaskPointerUp={onTaskPointerUp}
          getBlockers={getBlockers}
        />

        {/* HUD readout */}
        <div className="absolute bottom-3 left-3 text-xs bg-white/85 backdrop-blur rounded-md px-2 py-1 border shadow-sm">
          <span className="tabular-nums">
            scale: {scale.toFixed(2)} · pan: ({Math.round(pan.x)}, {Math.round(pan.y)})
          </span>
        </div>

        {/* Add Task Button */}
        <AddTaskButton onClick={onAddTaskModalOpen} />

        {/* Task details modal - only show when edit modal is not open */}
        {selectedTask && !editOpen && (
          <TaskDetails
            task={selectedTask}
            blockers={blockers}
            onClose={onClose}
            onEdit={onEdit}
            position={modalPosition}
            containerRect={containerRef?.current?.getBoundingClientRect?.()}
          />
        )}

        {/* Edit modal */}
        <TaskEditModal
          isOpen={editOpen}
          task={selectedTask}
          draft={draft}
          onClose={onClose}
          onSave={onSave}
          onDelete={onDelete}
          onDraftChange={onDraftChange}
        />

        {/* Add new task modal */}
        <AddTaskModal
          isOpen={showAddTaskModal}
          onClose={onAddTaskModalClose}
          onSave={onAddTaskSave}
          draft={addTaskDraft}
          onDraftChange={onAddTaskDraftChange}
        />
      </div>
    </div>
  );
};

export default TaskDependencyMap;