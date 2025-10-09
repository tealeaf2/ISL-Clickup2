import { useState, useEffect, useCallback } from 'react';
import { useTaskData } from '../../../shared/hooks/useTaskData';
import { usePanZoom } from '../../../shared/hooks/usePanZoom';
import { useTaskSelection } from '../../../shared/hooks/useTaskSelection';
import { useTaskRelationships } from '../../../shared/hooks/useTaskRelationships';
// @ts-ignore - JavaScript component
import TaskDependencyMap from '../TaskDependencyMap';
import { LAYOUT_CONSTANTS } from '../../../shared/constants';
import { 
  clamp, 
  roundDay, 
  computeTaskRect, 
  dayFromX 
} from '../../../shared/utils';
import type { Task, TaskOptions, TaskBlocker, TaskDraft, ModalPosition, TaskPriority } from '../../../shared/types';

/**
 * Stateful container component that manages all state and passes data down to stateless child components
 * Follows "data down, event up" pattern
 */

const TaskDependencyMapContainer = ({ clickUpTasks = [] }: { clickUpTasks?: any[] }) => {
  // Debug: Log received tasks
  console.log('TaskDependencyMapContainer: Received clickUpTasks:', clickUpTasks?.length || 0);
  
  // Convert ClickUp tasks to dependency graph format
  const convertClickUpTasksToGraphTasks = (clickUpTasks: any[]): Task[] => {
    const today = new Date();
    
    // Safety check: ensure clickUpTasks is an array
    if (!Array.isArray(clickUpTasks)) {
      return [];
    }
    
    return clickUpTasks.map((clickUpTask, index) => {
      // Convert ClickUp status to our status format
      const statusMap: Record<string, any> = {
        'to do': 'todo',
        'in progress': 'in-progress',
        'complete': 'done',
        'blocked': 'blocked'
      };
      
      const status = statusMap[clickUpTask.status?.status?.toLowerCase()] || 'todo';
      
      // Convert ClickUp priority to our priority format
      const priorityMap: Record<string, TaskPriority> = {
        'urgent': 'urgent',
        'high': 'high',
        'normal': 'normal',
        'low': 'low',
        'none': 'none'
      };
      
      const priority = priorityMap[clickUpTask.priority?.priority?.toLowerCase()] || 'normal';
      
      // Calculate task position based on due date
      let dueDate, startDay;
      if (clickUpTask.due_date) {
        // Handle both timestamp and date string formats
        const dueDateValue = clickUpTask.due_date;
        if (typeof dueDateValue === 'number') {
          dueDate = new Date(dueDateValue);
        } else {
          dueDate = new Date(dueDateValue);
        }
        
        // Check if the date is valid
        if (isNaN(dueDate.getTime())) {
          // Invalid date, use fallback
          startDay = index % 7;
          dueDate = new Date(today);
          dueDate.setDate(today.getDate() + startDay);
        } else {
          startDay = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        }
      } else {
        // If no due date, spread tasks across the next few days based on index
        startDay = index % 7; // Spread across 7 days (0-6)
        dueDate = new Date(today);
        dueDate.setDate(today.getDate() + startDay);
      }
      
      // Ensure startDay is never NaN
      if (isNaN(startDay)) {
        startDay = index % 7; // Fallback to index-based spreading
      }
      
      // Calculate duration (default to 1 day if no start date, otherwise use actual duration)
      let duration = 1; // Default duration
      if (clickUpTask.start_date) {
        const startDate = new Date(clickUpTask.start_date);
        duration = Math.max(1, Math.floor((dueDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
      }
      
      // Get owner from assignees only - no creator fallback
      let owner = 'Unassigned'; // Default to Unassigned
      
      // Check if task has assignees
      if (clickUpTask.assignees && clickUpTask.assignees.length > 0) {
        const firstAssignee = clickUpTask.assignees[0];
        if (firstAssignee && firstAssignee.username && firstAssignee.username.trim() !== '') {
          owner = firstAssignee.username;
        }
      } else if (clickUpTask.assignee) {
        // Handle different assignee formats
        if (typeof clickUpTask.assignee === 'string' && clickUpTask.assignee.trim() !== '') {
          owner = clickUpTask.assignee;
        } else if (clickUpTask.assignee.username && clickUpTask.assignee.username.trim() !== '') {
          owner = clickUpTask.assignee.username;
        }
      }
      
      // Final safety check - ensure owner is never empty
      if (!owner || owner.trim() === '') {
        owner = 'Unassigned';
      }
      
      // Debug logging (after owner is assigned)
      console.log(`Task ${clickUpTask.name}: due_date=${clickUpTask.due_date}, calculated startDay=${startDay}, owner="${owner}"`);
      
      return {
        id: clickUpTask.id,
        name: clickUpTask.name,
        owner: owner,
        start: Math.max(0, startDay),
        duration: Math.max(1, duration),
        lane: 0, // Will be assigned by hierarchy logic
        status: status,
        priority: priority,
        parentId: clickUpTask.parent || null,
        depends: clickUpTask.dependencies || [],
        lastUpdated: clickUpTask.date_updated
      };
    });
  };

  // Convert ClickUp tasks to graph format
  const convertedTasks = convertClickUpTasksToGraphTasks(clickUpTasks || []);
  
  // Debug: Check the converted tasks
  

  // Options and state
  const [options, setOptions] = useState<TaskOptions>({
    parentBlockedIfAnyChildBlocked: true,
    snapToDays: true,
    enableAutoPropagation: true,
    debounceMs: 300
  });

  const { tasks, setTasks, tasksById, dependencies } = useTaskData(convertedTasks); // Use convertedTasks

  // Selection and editing state
  const { 
    selectedId, 
    editOpen, 
    draft,
    modalPosition,
    setSelectedId,
    setEditOpen, 
    setDraft, 
    setModalPosition
  } = useTaskSelection();

  // Task relationships and propagation
  const { updateRelatedTasks, getBlockers } = useTaskRelationships(tasks, setTasks);

  // Calculate content dimensions based on owners and calendar days
  const { DAY_WIDTH, LANE_HEIGHT, PADDING } = LAYOUT_CONSTANTS;
  
  // Create hierarchical lane assignment
  const laneAssignment: Record<string, number> = {};
  let currentLane = 0;
  
  // Helper function to count dependencies for a task
  const countDependencies = (task: Task): number => {
    return task.depends ? task.depends.length : 0;
  };
  
  // Helper function to sort children by independence (fewer dependencies first)
  const sortByIndependence = (children: Task[]): Task[] => {
    return children.sort((a, b) => {
      const depsA = countDependencies(a);
      const depsB = countDependencies(b);
      return depsA - depsB; // Fewer dependencies first
    });
  };
  
  // Get unique owners and sort them
  const uniqueOwners = Array.from(new Set((tasks || []).map(task => task.owner))).sort();
  
  // Assign lanes by owner with proper hierarchy
  uniqueOwners.forEach(owner => {
    const ownerTasks = (tasks || []).filter(task => task.owner === owner);
    
    // Separate independent tasks (no parent) from dependent tasks (have parent)
    const independentTasks = ownerTasks.filter(task => !task.parentId);
    const dependentTasks = ownerTasks.filter(task => task.parentId);
    
    // Sort independent tasks by dependencies (most independent first)
    const sortedIndependentTasks = sortByIndependence(independentTasks);
    
    // Assign lanes to independent tasks first
    sortedIndependentTasks.forEach(task => {
      laneAssignment[task.id] = currentLane;
      currentLane++;
    });
    
    // Group dependent tasks by parent
    const dependentByParent = dependentTasks.reduce((acc, child) => {
      if (!acc[child.parentId]) acc[child.parentId] = [];
      acc[child.parentId].push(child);
      return acc;
    }, {} as Record<string, Task[]>);
    
    // Assign lanes to dependent tasks, organized by parent
    Object.entries(dependentByParent).forEach(([parentId, children]) => {
      // Sort children by independence (most independent child first)
      const sortedChildren = sortByIndependence(children);
      
      sortedChildren.forEach(child => {
        laneAssignment[child.id] = currentLane;
        currentLane++;
      });
      
      // Add spacing after each parent's children
      if (children.length > 0) {
        currentLane++;
      }
    });
    
    // Add spacing between different owners
    if (owner !== uniqueOwners[uniqueOwners.length - 1]) {
      currentLane++;
    }
  });
  
  // Debug: Check lane assignments
  

  // Get unique owners for display
  const owners = Array.from(new Set((tasks || []).map(task => task.owner))).sort();
  
  // Calculate calendar days (minimum 7 days, adjust if tasks extend beyond)
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 1); // Start one day before today

  const taskEndDays = (tasks || []).map(task => {
    const start = isNaN(task.start) ? 0 : task.start;
    const duration = isNaN(task.duration) ? 1 : task.duration;
    return start + duration;
  });
  const maxTaskEndDay = taskEndDays.length > 0 ? Math.max(...taskEndDays) : 0;
  const minDays = 7;
  const requiredDays = Math.max(minDays, maxTaskEndDay + 2); // +2 for buffer

  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + requiredDays - 1);

  const totalDays = requiredDays;
  const contentWidth = Math.max(800, LAYOUT_CONSTANTS.PADDING * 2 + totalDays * LAYOUT_CONSTANTS.DAY_WIDTH); // Ensure minimum width
  const contentHeight = Math.max(400, LAYOUT_CONSTANTS.PADDING * 2 + Math.max(1, currentLane) * LAYOUT_CONSTANTS.LANE_HEIGHT); // Ensure minimum height

  // Pan and zoom functionality
  const {
    containerRef,
    scale,
    pan,
    isPanning,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    fitToView,
    resetView,
    zoomIn,
    zoomOut
  } = usePanZoom(contentWidth, contentHeight);

  // Task drag state
  const [dragTask, setDragTask] = useState<{ id: string; start0: number; grabOffsetX: number } | null>(null);

  // Add task modal draft state
  const [addTaskDraft, setAddTaskDraft] = useState<TaskDraft>({
    id: '',
    name: '',
    owner: '',
    status: 'todo',
    priority: 'normal',
    start: 0,
    duration: 1,
    lane: 0,
    parentId: '',
    dependsText: ''
  });
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  // Update draft when selected task changes
  useEffect(() => {
    if (selectedId && tasksById[selectedId]) {
      const task = tasksById[selectedId];
      setDraft({
        id: task.id,
        name: task.name,
        owner: task.owner,
        status: task.status,
        priority: task.priority,
        start: task.start,
        duration: task.duration,
        lane: task.lane,
        parentId: task.parentId || '',
        dependsText: task.depends ? task.depends.join(', ') : ''
      });
    }
  }, [selectedId, tasksById, setDraft]);

  // Auto-generate new task ID when add task modal opens
  useEffect(() => {
    if (showAddTaskModal) {
      const existingIds = (tasks || []).map(task => task.id);
      let counter = (tasks || []).length;
      let newId = `T${counter}`;
      
      while (existingIds.includes(newId)) {
        counter++;
        newId = `T${counter}`;
      }

      setAddTaskDraft({
        id: newId,
        name: '',
        owner: '',
        status: 'todo',
        priority: 'normal',
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
    if (tasks && tasks.length > 0) {
      setTasks(prevTasks => updateRelatedTasks(prevTasks));
    }
  }, []); // Run once on mount

  // Prepare tasks with computed rectangles using hierarchy-based lanes and calendar days
  const tasksWithRects = (tasks || []).map(task => {
    // Ensure task has valid numeric values
    const validStart = isNaN(task.start) ? 0 : Math.max(0, task.start);
    const validDuration = isNaN(task.duration) ? 1 : Math.max(1, task.duration);
    
    // Get hierarchy-based lane
    const hierarchyLane = laneAssignment[task.id] || 0;
    
    // Create modified task for rectangle calculation
    // task.start is already calculated as days from today based on due date
    const taskForRect = {
      ...task,
      start: validStart,
      duration: validDuration,
      lane: hierarchyLane
    };
    
    return {
      ...task,
      lane: hierarchyLane, // Update the lane with the assigned lane
      rect: computeTaskRect(taskForRect, LAYOUT_CONSTANTS)
    };
  });

  const selectedTask = selectedId ? tasksById[selectedId] : null;

  // Event handlers for data flow (events up)
  const handleOptionsChange = useCallback((newOptions: TaskOptions) => {
    setOptions(newOptions);
  }, []);

  const handleZoomIn = useCallback(() => {
    zoomIn();
  }, [zoomIn]);

  const handleZoomOut = useCallback(() => {
    zoomOut();
  }, [zoomOut]);

  const handleReset = useCallback(() => {
    resetView();
  }, [resetView]);

  const handleFitToView = useCallback(() => {
    fitToView(contentWidth, contentHeight);
  }, [fitToView, contentWidth, contentHeight]);

  const onTaskClick = useCallback((taskId: string, clickPos: ModalPosition) => {
    setSelectedId(taskId);
    setModalPosition(clickPos);
    setEditOpen(true);
    const taskToEdit = tasksById[taskId];
    if (taskToEdit) {
      setDraft({ ...taskToEdit });
    }
  }, [tasksById]);

  const onTaskPointerDown = useCallback((e: any, task: Task, clickOffset?: { x: number; y: number }) => {
    e.stopPropagation();
    if (e.button === 0) { // Left click
      const rect = task.rect;
      if (rect && clickOffset) {
        const grabOffsetX = clickOffset.x - rect.x;
    setDragTask({ id: task.id, start0: task.start, grabOffsetX });
      }
      onTaskClick(task.id, { x: e.clientX, y: e.clientY });
    }
  }, [onTaskClick]);

  const onTaskPointerMove = useCallback((e: any) => {
    if (dragTask) {
      e.preventDefault();
      const newX = dayFromX(e.clientX - (containerRef.current?.getBoundingClientRect().left || 0) - pan.x, scale, LAYOUT_CONSTANTS);
      const newStart = roundDay(newX - (dragTask.grabOffsetX / LAYOUT_CONSTANTS.DAY_WIDTH));
      
      setTasks(prevTasks => prevTasks.map(task =>
        task.id === dragTask.id ? { ...task, start: Math.max(0, newStart) } : task
      ));
    }
  }, [dragTask, pan.x, scale, setTasks]);

  const onTaskPointerUp = useCallback(() => {
    if (dragTask) {
      setDragTask(null);
      // After drag, update relationships
      setTasks(prevTasks => updateRelatedTasks(prevTasks));
    }
  }, [dragTask, setTasks, updateRelatedTasks]);

  const openEdit = useCallback(() => setEditOpen(true), []);
  const closeSelection = useCallback(() => {
    setSelectedId(null);
    setEditOpen(false);
    setModalPosition({ x: 0, y: 0 });
  }, []);

  const saveDraft = useCallback(() => {
    if (draft && selectedId) {
    console.log('saveDraft called, draft:', draft);
    if (!draft) {
      console.log('No draft to save');
      return;
    }
    
    console.log('Saving task with status:', draft.status);
      setTasks(prevTasks => {
        const updatedTasks = prevTasks.map(task =>
          task.id === selectedId ? { 
          ...task,
            ...draft,
            depends: draft.dependsText ? draft.dependsText.split(',').map(id => id.trim()).filter(id => id) : []
        } : task
      );
      
        console.log('Triggering related tasks update for:', draft.id);
        return updateRelatedTasks(updatedTasks);
    });
    
    closeSelection();
    console.log('Task saved and all modals closed');
    }
  }, [draft, selectedId, setTasks, updateRelatedTasks, closeSelection]);

  const deleteTask = useCallback(() => {
    if (selectedId) {
      setTasks(prevTasks => {
        const updatedTasks = prevTasks.filter(task => task.id !== selectedId && task.parentId !== selectedId);
        return updateRelatedTasks(updatedTasks);
      });
    closeSelection();
    }
  }, [selectedId, setTasks, updateRelatedTasks, closeSelection]);

  const openAddTaskModal = useCallback(() => {
    setShowAddTaskModal(true);
    setAddTaskDraft({
      id: '',
      name: '',
      owner: '',
      status: 'todo',
      priority: 'normal',
      start: 0,
      duration: 1,
      lane: 0,
      parentId: '',
      dependsText: ''
    });
  }, []);

  const closeAddTaskModal = useCallback(() => {
    setShowAddTaskModal(false);
  }, []);

  const handleAddTaskDraftChange = useCallback((newDraft: TaskDraft) => {
    setAddTaskDraft(newDraft);
  }, []);

  const addNewTask = useCallback(() => {
    const newTask: Task = {
      ...addTaskDraft,
      id: `task-${(tasks || []).length + 1}-${Date.now()}`, // Generate a unique ID
      lane: 0, // Will be assigned by hierarchy logic
      lastUpdated: new Date().toISOString()
    };
    setTasks(prevTasks => updateRelatedTasks([...prevTasks, newTask]));
    // Close all modals after adding the task
    closeSelection();
    console.log('New task added and all modals closed');
  }, [setTasks, updateRelatedTasks, tasks, closeSelection, addTaskDraft]);

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

  // Debug: Log tasks state
  console.log('TaskDependencyMapContainer: tasks state:', tasks?.length || 0, 'convertedTasks:', convertedTasks?.length || 0);
  
  // Show message if no tasks
  if (!tasks || tasks.length === 0) {
    return (
      <div className="w-full h-[80vh] bg-white text-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Tasks Available</h2>
          <p className="text-lg text-gray-600 mb-8">
            Switch to the Task Table tab to load ClickUp tasks, then return here to view the dependency graph.
          </p>
        </div>
      </div>
    );
  }

  return <TaskDependencyMap {...containerProps} />;
};

export default TaskDependencyMapContainer;
