import React, { useState, useEffect, useCallback } from 'react';
import { useTaskData } from '../../../shared/hooks/useTaskData';
import { usePanZoom } from '../../../shared/hooks/usePanZoom';
import { useTaskSelection } from '../../../shared/hooks/useTaskSelection';
import { useTaskRelationships } from '../../../shared/hooks/useTaskRelationships';
import TaskDependencyMap from '../TaskDependencyMap';
import { LAYOUT_CONSTANTS } from '../../../shared/constants';
import { 
  clamp, 
  roundDay, 
  computeTaskRect, 
  dayFromX 
} from '../../../shared/utils';

/**
 * Stateful container component that manages all state and passes data down to stateless child components
 * Follows "data down, event up" pattern
 */
const TaskDependencyMapContainer = () => {
  // Initial sample data
  const initialTasks = [
    { id: "P", name: "Project Alpha", owner: "Hernan", start: 0, duration: 15, lane: 0, status: "todo", parentId: null },
  ];

  // Options and state
  const [options, setOptions] = useState({
    parentBlockedIfAnyChildBlocked: true,
    snapToDays: true,
    enableAutoPropagation: true,
    debounceMs: 300,
  });

  // Custom hooks for data management
  const { tasks, setTasks, tasksById, maxDay, maxLane, dependencies } = useTaskData(initialTasks);
  const { 
    selectedId, 
    selectTask, 
    editOpen, 
    setEditOpen, 
    draft, 
    setDraft, 
    updateDraft, 
    closeSelection, 
    openEdit, 
    modalPosition,
    showAddTaskModal,
    openAddTaskModal,
    closeAddTaskModal
  } = useTaskSelection();

  // Task relationships hook for auto-updating parent/dependent tasks
  const { updateRelatedTasks } = useTaskRelationships(tasks, setTasks);

  // Calculate content dimensions
  const { DAY_WIDTH, LANE_HEIGHT, PADDING } = LAYOUT_CONSTANTS;
  const contentWidth = PADDING * 2 + maxDay * DAY_WIDTH;
  const contentHeight = PADDING * 2 + (maxLane + 1) * LANE_HEIGHT;

  // Pan and zoom functionality
  const {
    containerRef,
    scale,
    pan,
    isPanning,
    handleWheel,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    fitToView,
    resetView,
    setScale,
    zoomIn,
    zoomOut
  } = usePanZoom(contentWidth, contentHeight);

  // Task drag state
  const [dragTask, setDragTask] = useState(null);

  // Add task modal draft state
  const [addTaskDraft, setAddTaskDraft] = useState({
    id: '',
    name: '',
    owner: '',
    status: 'todo',
    start: 0,
    duration: 1,
    lane: 0,
    parentId: '',
    dependsText: ''
  });

  // Update draft when selected task changes
  useEffect(() => {
    updateDraft(selectedId ? tasksById[selectedId] : null);
  }, [selectedId, editOpen, tasksById, updateDraft]);

  // Initialize add task draft when modal opens
  useEffect(() => {
    if (showAddTaskModal) {
      // Generate a unique ID
      const existingIds = tasks.map(task => task.id);
      let newId = 'T1';
      let counter = 1;
      while (existingIds.includes(newId)) {
        counter++;
        newId = `T${counter}`;
      }

      setAddTaskDraft({
        id: newId,
        name: '',
        owner: '',
        status: 'todo',
        start: 0,
        duration: 1,
        lane: 0,
        parentId: '',
        dependsText: ''
      });
    }
  }, [showAddTaskModal, tasks]);

  // Initial status update for Project Alpha based on its children
  useEffect(() => {
    // Trigger initial status calculation for Project Alpha
    setTimeout(() => {
      updateRelatedTasks("P");
    }, 100);
  }, [updateRelatedTasks]);

  // Get blockers for a task
  const getBlockers = useCallback((task) => {
    if (!task.depends || task.depends.length === 0) return [];
    
    return task.depends
      .map(depId => tasksById[depId])
      .filter(dep => dep && dep.status !== 'done')
      .map(dep => ({
        by: dep.id,
        owner: dep.owner,
        type: 'dependency',
        since: dep.lastUpdated || new Date().toISOString()
      }));
  }, [tasksById]);

  // Task click handler for selection
  const onTaskClick = useCallback((e, task, clickPosition) => {
    selectTask(task.id, clickPosition);
  }, [selectTask]);

  // Task drag handlers
  const onTaskPointerDown = useCallback((e, task, clickPosition = null) => {
    e.stopPropagation();
    
    // If this is a click (not drag), handle selection
    if (clickPosition) {
      selectTask(task.id, clickPosition);
      return;
    }
    
    // For drag operations, don't select the task immediately
    // Only set up drag state
    const rect = computeTaskRect(task, LAYOUT_CONSTANTS);
    const mouseXWorld = (e.clientX - containerRef.current.getBoundingClientRect().left - pan.x) / scale;
    const grabOffsetX = mouseXWorld - rect.x;
    setDragTask({ id: task.id, start0: task.start, grabOffsetX });
    e.target.setPointerCapture?.(e.pointerId);
  }, [selectTask, containerRef, pan.x, scale]);

  const onTaskPointerMove = useCallback((e) => {
    if (!dragTask) return;
    const task = tasksById[dragTask.id];
    if (!task) return;
    
    const worldX = (e.clientX - containerRef.current.getBoundingClientRect().left - pan.x) / scale;
    const newStartPx = worldX - dragTask.grabOffsetX;
    const newStart = clamp(
      roundDay(dayFromX(newStartPx, PADDING, DAY_WIDTH), options.snapToDays),
      0,
      10000
    );
    
    if (newStart !== task.start) {
      setTasks(prev => prev.map(t => 
        t.id === task.id ? { ...t, start: newStart } : t
      ));
    }
  }, [dragTask, tasksById, containerRef, pan.x, scale, PADDING, DAY_WIDTH, options.snapToDays, setTasks]);

  const onTaskPointerUp = useCallback((e) => {
    if (dragTask) {
      e.target.releasePointerCapture?.(e.pointerId);
      setDragTask(null);
    }
  }, [dragTask]);

  // Edit handlers
  const saveDraft = useCallback(() => {
    console.log('saveDraft called, draft:', draft);
    if (!draft) {
      console.log('No draft to save');
      return;
    }
    const depends = (draft.dependsText || "").split(",")
      .map(s => s.trim())
      .filter(Boolean);
    
    console.log('Saving task with status:', draft.status);
    
    // Update the task and trigger propagation with updated data
    setTasks(prev => {
      const updatedTasks = prev.map(task => 
        task.id === draft.id ? {
          ...task,
          name: draft.name,
          owner: draft.owner,
          status: draft.status,
          start: Number(draft.start) || 0,
          duration: Math.max(1, Number(draft.duration) || 1),
          lane: Math.max(0, Number(draft.lane) || 0),
          parentId: draft.parentId || null,
          depends,
        } : task
      );
      
      // Trigger propagation immediately with the updated tasks
      setTimeout(() => {
        console.log('Triggering related tasks update for:', draft.id);
        updateRelatedTasks(draft.id, updatedTasks);
      }, 50);
      
      return updatedTasks;
    });
    
    closeSelection();
    console.log('Task saved and all modals closed');
  }, [draft, setTasks, updateRelatedTasks, closeSelection]);

  const deleteTask = useCallback(() => {
    if (!selectedId) return;
    const id = selectedId;
    setTasks(prev => prev
      .filter(task => task.id !== id)
      .map(task => ({
        ...task,
        depends: (task.depends || []).filter(d => d !== id),
        parentId: task.parentId === id ? null : task.parentId,
      }))
    );
    closeSelection();
  }, [selectedId, setTasks, closeSelection]);

  // Add new task handler
  const addNewTask = useCallback((newTask) => {
    setTasks(prev => [...prev, newTask]);
    console.log('New task added:', newTask);

    // Auto-update related tasks for the new task
    setTimeout(() => {
      updateRelatedTasks(newTask.id);
      
      // Also update any existing tasks that might be affected by this new task
      // This handles cases where existing tasks depend on this new task
      const allTasks = [...tasks, newTask];
      allTasks.forEach(task => {
        if (task.depends && task.depends.includes(newTask.id)) {
          updateRelatedTasks(task.id);
        }
      });
    }, 100);
    
    // Close all modals after adding the task
    closeSelection();
    console.log('New task added and all modals closed');
  }, [setTasks, updateRelatedTasks, tasks, closeSelection]);

  // Prepare tasks with computed rectangles
  const tasksWithRects = tasks.map(task => ({
    ...task,
    rect: computeTaskRect(task, LAYOUT_CONSTANTS)
  }));

  const selectedTask = selectedId ? tasksById[selectedId] : null;

  // Event handlers for data flow (events up)
  const handleOptionsChange = useCallback((newOptions) => {
    setOptions(newOptions);
  }, []);

  const handleZoomIn = useCallback(() => {
    console.log('Zoom In clicked, current scale:', scale);
    zoomIn();
  }, [zoomIn, scale]);

  const handleZoomOut = useCallback(() => {
    console.log('Zoom Out clicked, current scale:', scale);
    zoomOut();
  }, [zoomOut, scale]);

  const handleReset = useCallback(() => {
    resetView();
  }, [resetView]);

  const handleFitToView = useCallback(() => {
    fitToView();
  }, [fitToView]);

  const handleAddTaskDraftChange = useCallback((newDraft) => {
    setAddTaskDraft(newDraft);
  }, []);

  // Props to pass down to child components (data down)
  const containerProps = {
    // Data
    options,
    tasks: tasksWithRects,
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
    blockers: selectedTask ? getBlockers(selectedTask) : [],
    
    // Event handlers
    onOptionsChange: handleOptionsChange,
    onZoomIn: handleZoomIn,
    onZoomOut: handleZoomOut,
    onReset: handleReset,
    onFitToView: handleFitToView,
    onTaskClick,
    onTaskPointerDown,
    onTaskPointerMove,
    onTaskPointerUp,
    onWheel: handleWheel,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: onPointerUp,
    onEdit: openEdit,
    onClose: closeSelection,
    onSave: saveDraft,
    onDelete: deleteTask,
    onDraftChange: setDraft,
    onAddTaskModalOpen: openAddTaskModal,
    onAddTaskModalClose: closeAddTaskModal,
    onAddTaskSave: addNewTask,
    onAddTaskDraftChange: handleAddTaskDraftChange,
    getBlockers
  };

  return <TaskDependencyMap {...containerProps} />;
};

export default TaskDependencyMapContainer;
