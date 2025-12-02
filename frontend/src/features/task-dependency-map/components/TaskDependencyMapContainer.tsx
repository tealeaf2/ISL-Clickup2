import { useState, useCallback, useMemo } from 'react';
import { useTaskData } from '../../../shared/hooks/useTaskData';
import { usePanZoom } from '../../../shared/hooks/usePanZoom';
import { useTaskSelection } from '../../../shared/hooks/useTaskSelection';
import { useTaskRelationships } from '../../../shared/hooks/useTaskRelationships';
// @ts-ignore - JavaScript component
import TaskDependencyMap from '../TaskDependencyMap';
import { LAYOUT_CONSTANTS } from '../../../shared/constants';
import {
  computeTaskRect
} from '../../../shared/utils';
import type { Task, TaskOptions, TaskPriority } from '../../../shared/types';

/**
 * TaskDependencyMapContainer Component
 * * Stateful container component that manages all state and business logic for the dependency graph.
 * This component follows the "data down, events up" pattern:
 * - Manages all state (tasks, selection, pan/zoom, modals, etc.)
 * - Processes business logic (conversion, relationships, lane assignment)
 * - Passes data down to the presentational TaskDependencyMap component
 * - Receives events up from child components and updates state accordingly
 * * Key Responsibilities:
 * - Converts ClickUp API tasks to internal graph format
 * - Manages task state and parent-child relationships
 * - Handles CRUD operations (Create, Read, Update, Delete)
 * - Manages pan/zoom state for navigation
 * - Processes status propagation from children to parents
 * - Handles modal states and task selection
 * - Assigns lanes to tasks based on hierarchy and owner
 */

const TaskDependencyMapContainer = ({ clickUpTasks = [] }: { clickUpTasks?: any[] }) => {
  // Debug: Log received tasks
  // console.log('TaskDependencyMapContainer: Received clickUpTasks:', clickUpTasks?.length || 0);

  /**
   * Converts ClickUp API task format to internal graph task format
   * * This function transforms tasks from ClickUp's API structure to the format
   * used by the dependency graph visualization, including:
   * - Status mapping (ClickUp status -> internal status)
   * - Priority mapping (ClickUp priority -> internal priority)
   * - Date calculations (due_date -> start day relative to today)
   * - Owner extraction (from assignees array)
   * - Parent relationship mapping
   * * @param clickUpTasks - Array of tasks from ClickUp API
   * @returns Array of tasks in internal graph format
   */
  // Get a consistent "today" reference for all date calculations
  // This must be the same reference used for both task conversion and grid calculation
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const convertClickUpTasksToGraphTasks = (clickUpTasks: any[], todayRef: Date): Task[] => {

    // Safety check: ensure clickUpTasks is an array
    if (!Array.isArray(clickUpTasks)) {
      return [];
    }

    return clickUpTasks.map((clickUpTask, index) => {
      // Convert ClickUp status to our status format
      // Note: 'complete' tasks are removed by ClickUp, so we don't map them
      const statusMap: Record<string, any> = {
        'to do': 'todo',
        'in progress': 'in-progress',
        'blocked': 'blocked'
      };

      const status = statusMap[clickUpTask.status?.status?.toLowerCase()] || 'todo';

      // Convert ClickUp priority to our priority format
      // Since ClickUp priority values match our internal format, we just validate and default
      const clickUpPriority = clickUpTask.priority?.priority?.toLowerCase();
      const validPriorities: readonly TaskPriority[] = ['urgent', 'high', 'normal', 'low', 'none'] as const;
      const priority: TaskPriority = (validPriorities.includes(clickUpPriority as TaskPriority)
        ? clickUpPriority
        : 'normal') as TaskPriority;

      // Helper function to normalize a date to midnight for accurate day calculations
      const normalizeToMidnight = (date: Date): Date => {
        const normalized = new Date(date);
        normalized.setHours(0, 0, 0, 0);
        return normalized;
      };

      // Use the consistent today reference passed in
      const todayMidnight = normalizeToMidnight(todayRef);

      // Use API-provided start_date and due_date directly
      let startDate: Date | null = null;
      let dueDate: Date | null = null;

      // Parse start_date from API - this is the actual task start date
      // ClickUp API may return dates as numbers (timestamps) or strings (ISO or timestamp strings)
      if (clickUpTask.start_date !== null && clickUpTask.start_date !== undefined) {
        const startDateValue = clickUpTask.start_date;
        try {
          let parsed: Date;

          // Handle number (timestamp in milliseconds)
          if (typeof startDateValue === 'number') {
            parsed = new Date(startDateValue);
          }
          // Handle string that looks like a timestamp
          else if (typeof startDateValue === 'string' && /^\d+$/.test(startDateValue)) {
            parsed = new Date(parseInt(startDateValue, 10));
          }
          // Handle ISO string format
          else {
            parsed = new Date(startDateValue);
          }

          // Check if date is valid
          if (!isNaN(parsed.getTime())) {
            startDate = normalizeToMidnight(parsed);
          } else {
            console.warn(`Invalid start_date for task ${clickUpTask.id}:`, startDateValue, 'type:', typeof startDateValue);
          }
        } catch (e) {
          console.warn(`Failed to parse start_date for task ${clickUpTask.id}:`, startDateValue, e);
        }
      }

      // Parse due_date from API - this is the actual task end date
      // ClickUp API may return dates as numbers (timestamps) or strings (ISO or timestamp strings)
      if (clickUpTask.due_date !== null && clickUpTask.due_date !== undefined) {
        const dueDateValue = clickUpTask.due_date;
        try {
          let parsed: Date;

          // Handle number (timestamp in milliseconds)
          if (typeof dueDateValue === 'number') {
            parsed = new Date(dueDateValue);
          }
          // Handle string that looks like a timestamp
          else if (typeof dueDateValue === 'string' && /^\d+$/.test(dueDateValue)) {
            parsed = new Date(parseInt(dueDateValue, 10));
          }
          // Handle ISO string format
          else {
            parsed = new Date(dueDateValue);
          }

          // Check if date is valid
          if (!isNaN(parsed.getTime())) {
            dueDate = normalizeToMidnight(parsed);
          } else {
            console.warn(`Invalid due_date for task ${clickUpTask.id}:`, dueDateValue, 'type:', typeof dueDateValue);
          }
        } catch (e) {
          console.warn(`Failed to parse due_date for task ${clickUpTask.id}:`, dueDateValue, e);
        }
      }

      // Debug: Log parsed dates for verification
      // if (clickUpTask.start_date || clickUpTask.due_date) {
      //   console.log(`Date parsing for "${clickUpTask.name}": start_date raw=${clickUpTask.start_date} -> parsed=${startDate?.toISOString().split('T')[0] || 'null'}, due_date raw=${clickUpTask.due_date} -> parsed=${dueDate?.toISOString().split('T')[0] || 'null'}`);
      // }

      // Calculate start day relative to today using the actual start_date from API
      // If no start_date, use due_date as fallback. If neither exists, spread tasks.
      let startDay: number;
      let duration = 1; // Default duration

      if (startDate) {
        // Use actual start_date from API to position the task
        startDay = Math.floor((startDate.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24));

        // Calculate duration from start_date to due_date (inclusive)
        if (dueDate && dueDate >= startDate) {
          // Duration is the number of days from start to end (inclusive)
          // e.g., start on day 1, end on day 3 = 3 days duration
          duration = Math.max(1, Math.floor((dueDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
        } else if (dueDate && dueDate < startDate) {
          // Invalid: due date before start date, use 1 day duration
          console.warn(`Task ${clickUpTask.id}: due_date (${dueDate.toISOString()}) is before start_date (${startDate.toISOString()}), using 1 day duration`);
          duration = 1;
        } else {
          // No due_date, default to 1 day duration
          duration = 1;
        }
      } else if (dueDate) {
        // No start_date, but we have due_date - use due_date as start position
        startDay = Math.floor((dueDate.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24));
        duration = 1; // Default to 1 day if no start date
      } else {
        // No dates from API, spread tasks across the next few days based on index
        startDay = index % 7; // Spread across 7 days (0-6)
        duration = 1;
      }

      // Ensure startDay is never NaN
      if (isNaN(startDay)) {
        console.warn(`Invalid startDay calculation for task ${clickUpTask.id}, using fallback`);
        startDay = index % 7; // Fallback to index-based spreading
      }

      // Allow negative startDay to represent overdue tasks (don't clamp to 0)
      // Negative values mean the task started before today

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
      // const daysDiff = startDate && dueDate ? Math.floor((dueDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) : 'N/A';
      // console.log(`Task "${clickUpTask.name}": start_date=${clickUpTask.start_date} (parsed: ${startDate?.toISOString().split('T')[0] || 'null'}), due_date=${clickUpTask.due_date} (parsed: ${dueDate?.toISOString().split('T')[0] || 'null'}), daysDiff=${daysDiff}, duration=${duration}, startDay=${startDay}, today=${todayRef.toISOString().split('T')[0]}`);

      return {
        id: clickUpTask.id,
        name: clickUpTask.name,
        owner: owner,
        start: startDay, // Allow negative values for overdue tasks
        duration: Math.max(1, duration),
        lane: 0, // Will be assigned by hierarchy logic
        status: status,
        priority: priority,
        parentId: clickUpTask.parent || null,
        dueDate: clickUpTask.due_date, // Store original due_date for time remaining calculation
        lastUpdated: clickUpTask.date_updated
      };
    });
  };

  // Convert ClickUp tasks to graph format using the consistent today reference
  const convertedTasks = useMemo(() => {
    return convertClickUpTasksToGraphTasks(clickUpTasks || [], today);
  }, [clickUpTasks, today]);

  /** Display and behavior options for the dependency graph */
  const [options] = useState<TaskOptions>({
    parentBlockedIfAnyChildBlocked: true,  // Auto-block parent if any child is blocked
    snapToDays: true,                       // Snap task positions to day boundaries
    enableAutoPropagation: true,            // Auto-update parent status based on children
    debounceMs: 300                         // Debounce delay for status propagation
  });

  /** Grouping state - determines how lanes are organized */
  const [groupBy, setGroupBy] = useState<'assignee' | 'status' | 'priority'>('assignee');
  const [showBlastRadius, setShowBlastRadius] = useState<boolean>(false);

  /** Task data management hook - provides tasks, setter, lookup map, and dependencies */
  const { tasks, setTasks, tasksById, dependencies } = useTaskData(convertedTasks);

  /** Task selection state - manages which task is selected and modal states */
  const {
    selectedId,           // ID of currently selected task
    editOpen,            // Whether detail modal is open
    modalPosition,       // Screen position for modal placement
    setSelectedId,
    setEditOpen,
    selectTask            // Function to select task with position
  } = useTaskSelection();

  /** Task relationships hook - only used for read-only blocker information */
  const { getBlockers } = useTaskRelationships(tasks, setTasks);
  const blastRadiusIds = useMemo(() => {
    const radius = new Set<string>();

    if (!selectedId || !showBlastRadius) return radius;

    // Recursive function to traverse children
    const traverseDownstream = (currentId: string) => {
      radius.add(currentId);

      const children = dependencies.filter(dep => dep.from === currentId);

      children.forEach(childDep => {
        if (!radius.has(childDep.to)) {
          traverseDownstream(childDep.to);
        }
      });
    };

    // Recursive function to traverse parents
    const traverseUpstream = (currentId: string) => {
      radius.add(currentId);

      const parents = dependencies.filter(dep => dep.to === currentId);

      parents.forEach(parentDep => {
        if (!radius.has(parentDep.from)) {
          traverseUpstream(parentDep.from);
        }
      });
    };

    traverseDownstream(selectedId);
    traverseUpstream(selectedId);
    return radius;
  }, [selectedId, showBlastRadius, dependencies]);

  /**
   * Assigns lanes (vertical rows) to tasks based on owner and hierarchy
   * * Lane assignment strategy (now dynamic based on groupBy state):
   * 1. Determine the grouping key (assignee, status, or priority)
   * 2. Group tasks by that key
   * 3. Within each group, separate parent tasks from child tasks
   * 4. Assign parent tasks first, then their children
   * 5. Add spacing between parent-child groups and between different groups
   */
  const laneAssignment: Record<string, number> = {};
  let currentLane = 0;

  // Helper to get the correct grouping value from a task based on state
  const getGroupValue = (task: Task): string => {
    switch (groupBy) {
      case 'status':
        return task.status || 'unknown';
      case 'priority':
        // Capitalize first letter for better label display
        const priority = task.priority || 'none';
        return priority.charAt(0).toUpperCase() + priority.slice(1);
      case 'assignee':
      default:
        return task.owner || 'Unassigned';
    }
  };

  // Get unique group values and sort them alphabetically for consistent ordering
  const uniqueGroupValues = Array.from(new Set((tasks || []).map(getGroupValue))).sort();

  // Assign lanes by group with proper hierarchy (parents before children)
  uniqueGroupValues.forEach(groupValue => {
    // Get all tasks matching the current group value
    const groupTasks = (tasks || []).filter(task => getGroupValue(task) === groupValue);

    // --- The rest of the logic is the same, just uses `groupTasks` ---

    // Separate parent tasks (no parent) from child tasks (have parent)
    const parentTasks = groupTasks.filter(task => !task.parentId);
    const childTasks = groupTasks.filter(task => task.parentId);

    // Assign lanes to parent tasks first
    parentTasks.forEach(task => {
      laneAssignment[task.id] = currentLane;
      currentLane++;
    });

    // Group child tasks by parent
    const childrenByParent = childTasks.reduce((acc, child) => {
      if (!acc[child.parentId!]) acc[child.parentId!] = [];
      acc[child.parentId!].push(child);
      return acc;
    }, {} as Record<string, Task[]>);

    // Assign lanes to child tasks, organized by parent
    Object.entries(childrenByParent).forEach(([_parentId, children]) => {
      children.forEach(child => {
        laneAssignment[child.id] = currentLane;
        currentLane++;
      });

      // Add spacing after each parent's children
      if (children.length > 0) {
        currentLane++;
      }
    });

    // Add spacing between different owners
    if (groupValue !== uniqueGroupValues[uniqueGroupValues.length - 1]) {
      currentLane++;
    }
  });

  // Debug: Check lane assignments

  // Calculate calendar days - need to show past dates for overdue tasks
  // Day 0 = today, negative values = past dates (overdue tasks)
  // Use the same 'today' reference defined above for consistency

  // Find the earliest task start day (may be negative for overdue tasks)
  const taskStartDays = (tasks || []).map(task => isNaN(task.start) ? 0 : task.start);
  const minTaskStartDay = taskStartDays.length > 0 ? Math.min(...taskStartDays) : 0;

  // Find the latest task end day
  const taskEndDays = (tasks || []).map(task => {
    const start = isNaN(task.start) ? 0 : task.start;
    const duration = isNaN(task.duration) ? 1 : task.duration;
    return start + duration;
  });
  const maxTaskEndDay = taskEndDays.length > 0 ? Math.max(...taskEndDays) : 0;

  // Calculate grid limits: exactly 2 days before earliest task start and 2 days after latest task end
  // If no tasks, default to showing a week around today
  const earliestStart = tasks && tasks.length > 0 ? minTaskStartDay - 2 : -7;
  const latestEnd = tasks && tasks.length > 0 ? maxTaskEndDay + 2 : 7;

  // Calculate how many days before/after today to show
  // earliestStart is relative to today (negative = past), so daysBeforeToday should be earliestStart
  const daysBeforeToday = earliestStart; // Negative value (e.g., -14 means start 14 days before today)
  const daysAfterToday = latestEnd; // Positive value (e.g., 14 means end 14 days after today)

  // Calculate the actual start date for the grid (before today)
  const gridStartDate = new Date(today);
  gridStartDate.setDate(today.getDate() + daysBeforeToday); // daysBeforeToday is negative or 0

  // Total days to display: from daysBeforeToday to daysAfterToday
  const totalDays = daysAfterToday - daysBeforeToday;

  // The offset for day 0 (today) - how many days from the grid start
  const day0Offset = -daysBeforeToday; // This is always positive since daysBeforeToday <= 0

  // Extend content width to include space for owner labels on the left (250px for labels + some margin)
  const ownerLabelArea = 250; // Space reserved for owner labels on the left side
  const contentWidth = Math.max(800, ownerLabelArea + LAYOUT_CONSTANTS.PADDING * 2 + totalDays * LAYOUT_CONSTANTS.DAY_WIDTH);
  const contentHeight = Math.max(400, LAYOUT_CONSTANTS.PADDING * 2 + Math.max(1, currentLane) * LAYOUT_CONSTANTS.LANE_HEIGHT);

  /** Pan and zoom functionality - manages viewport navigation for the canvas */
  const {
    containerRef,     // Ref to attach to the container element
    scale,            // Current zoom level (1.0 = 100%)
    pan,              // Current pan offset {x, y} in pixels
    isPanning,        // Whether user is currently panning
    onPointerDown,    // Pointer down event handler
    onPointerMove,    // Pointer move event handler
    onPointerUp,      // Pointer up event handler
    fitToView,        // Function to fit content to viewport
    zoomIn,           // Function to zoom in
    zoomOut           // Function to zoom out
  } = usePanZoom(contentWidth);



  // Note: Draft state removed - we're read-only, only displaying task details


  // Note: Status propagation removed - read-only mode, display tasks as they come from API

  // Prepare tasks with computed rectangles using hierarchy-based lanes and calendar days
  const tasksWithRects = (tasks || []).map(task => {
    // Ensure task has valid numeric values (allow negative start for overdue tasks)
    const validStart = isNaN(task.start) ? 0 : task.start; // Don't clamp - allow negative for overdue tasks
    const validDuration = isNaN(task.duration) ? 1 : Math.max(1, task.duration);

    // Get hierarchy-based lane
    const hierarchyLane = laneAssignment[task.id] || 0;

    // Create modified task for rectangle calculation
    // task.start is already calculated as days from today based on start_date from API
    const taskForRect = {
      ...task,
      start: validStart,
      duration: validDuration,
      lane: hierarchyLane
    };

    return {
      ...task,
      lane: hierarchyLane, // Update the lane with the assigned lane
      rect: computeTaskRect(taskForRect, LAYOUT_CONSTANTS, day0Offset)
    };
  });

  const selectedTask = selectedId ? tasksById[selectedId] : null;

  /**
   * Event handlers - all follow "events up" pattern, receiving callbacks from child components
   * These handlers update state in the container, which then flows back down as props
   */

  /** Handles zoom in button click */
  const handleZoomIn = useCallback(() => {
    zoomIn();
  }, [zoomIn]);

  /** Handles zoom out button click */
  const handleZoomOut = useCallback(() => {
    zoomOut();
  }, [zoomOut]);

  /** Handles fit to view button click - adjusts pan/zoom to fit content horizontally */
  const handleFitToView = useCallback(() => {
    fitToView();
  }, [fitToView]);

  /**
   * Handles task click - selects task, positions modal, and opens edit mode
   * * @param e - Click event
   * @param task - The task being clicked
   * @param clickOffset - Optional offset from click position to task rectangle (for modal positioning)
   */
  const onTaskClick = useCallback((e: any, task: Task, position?: { x: number; y: number }) => {
    e.stopPropagation();
    // Select and open detail modal for the task (read-only)
    // Use provided position or fall back to event coordinates
    const modalPos = position ? position : { x: e.clientX, y: e.clientY };
    selectTask(task.id, modalPos);
    setEditOpen(true);
  }, [selectTask, setEditOpen]);

  const closeSelection = useCallback(() => {
    setSelectedId(null);
    setEditOpen(false);
    selectTask('', { x: 0, y: 0 });
  }, [setSelectedId, setEditOpen, selectTask]);

  // /**
  //  * TODO: Handle task update from graph interactions
  //  * //  * This function will be called when a task is updated on the graph (e.g., moved,
  //  * resized, status changed). It should:
  //  * 1. Convert the graph task changes to ClickUp API format
  //  * 2. Call the ClickUp API to update the task
  //  * 3. Update local state with the response
  //  * 4. Handle errors and show user feedback
  //  * //  * @param {string} taskId - The ID of the task being updated
  //  * @param {Object} changes - Object containing the changes made
  //  * @param {number} [changes.startDay] - New start day (relative to today)
  //  * @param {number} [changes.duration] - New duration in days
  //  * @param {string} [changes.status] - New status
  //  * @param {string} [changes.name] - New task name
  //  * @returns {Promise<void>} Promise that resolves when update is complete
  //  */
  // // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const handleTaskUpdate = useCallback(async (
  //   taskId: string, 
  //   changes: {
  //     startDay?: number;
  //     duration?: number;
  //     status?: string;
  //     name?: string;
  //   }
  // ): Promise<void> => {
  //   // TODO: Implement task update handler
  //   // 1. Get the current task from tasksById
  //   // 2. Calculate new start_date and due_date from startDay and duration
  //   // 3. Convert to ClickUp API format (timestamps or ISO strings)
  //   // 4. Call useClickUp's updateTask or updateTaskDates function
  //   // 5. Update local tasks state with the response
  //   // 6. Handle loading states and errors
  //   // 7. Show user feedback (success/error message)

  //   console.log('TODO: handleTaskUpdate called with:', { taskId, changes });
  //   // throw new Error('handleTaskUpdate not yet implemented');
  // }, []);

  // /**
  //  * TODO: Handle task status update
  //  * //  * Convenience handler specifically for status updates from the UI.
  //  * //  * @param {string} taskId - The ID of the task to update
  //  * @param {string} newStatus - The new status value
  //  * @returns {Promise<void>} Promise that resolves when update is complete
  //  */
  // // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const handleTaskStatusUpdate = useCallback(async (
  //   taskId: string, 
  //   newStatus: string
  // ): Promise<void> => {
  //   // TODO: Implement status update handler
  //   // 1. Call useClickUp's updateTaskStatus function
  //   // 2. Update local tasks state
  //   // 3. Handle errors and show feedback

  //   console.log('TODO: handleTaskStatusUpdate called with:', { taskId, newStatus });
  //   // throw new Error('handleTaskStatusUpdate not yet implemented');
  // }, []);

  // /**
  //  * TODO: Handle task date update (when task is moved or resized on graph)
  //  * //  * This will be called when tasks are repositioned or resized on the graph.
  //  * Converts graph coordinates/days to ClickUp date format and updates via API.
  //  * //  * @param {string} taskId - The ID of the task to update
  //  * @param {number} newStartDay - New start day (relative to today, can be negative)
  //  * @param {number} newDuration - New duration in days
  //  * @returns {Promise<void>} Promise that resolves when update is complete
  //  */
  // // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const handleTaskDateUpdate = useCallback(async (
  //   taskId: string, 
  //   newStartDay: number, 
  //   newDuration: number
  // ): Promise<void> => {
  //   // TODO: Implement date update handler
  //   // 1. Calculate actual dates from newStartDay and newDuration
  //   //    - newStartDay is relative to today (0 = today, negative = past, positive = future)
  //   //    - Calculate start_date: today + newStartDay days
  //   //    - Calculate due_date: start_date + (newDuration - 1) days (duration is inclusive)
  //   // 2. Normalize dates to midnight
  //   // 3. Convert to ClickUp format (timestamp or ISO string)
  //   // 4. Call useClickUp's updateTaskDates function
  //   // 5. Update local tasks state
  //   // 6. Handle errors and show feedback

  //   console.log('TODO: handleTaskDateUpdate called with:', { taskId, newStartDay, newDuration });
  //   // throw new Error('handleTaskDateUpdate not yet implemented');
  // }, []);

  // /**
  //  * TODO: Handle batch task updates
  //  * //  * Updates multiple tasks at once (e.g., when multiple tasks are moved/resized).
  //  * More efficient than individual updates.
  //  * //  * @param {Array<{taskId: string, changes: Object}>} updates - Array of task updates
  //  * @returns {Promise<void>} Promise that resolves when all updates are complete
  //  */
  // // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const handleBatchTaskUpdate = useCallback(async (
  //   updates: Array<{ 
  //     taskId: string; 
  //     changes: { startDay?: number; duration?: number; status?: string } 
  //   }>
  // ): Promise<void> => {
  //   // TODO: Implement batch update handler
  //   // 1. Convert all updates to ClickUp API format
  //   // 2. Call useClickUp's batchUpdateTasks function
  //   // 3. Update local tasks state
  //   // 4. Handle partial failures appropriately
  //   // 5. Show user feedback

  //   console.log('TODO: handleBatchTaskUpdate called with:', updates);
  //   // throw new Error('handleBatchTaskUpdate not yet implemented');
  // }, []);

  // Note: All write operations removed (save, delete, add) - read-only mode

  // Props to pass down to child components (data down)
  const containerProps = {
    // Data
    options,
    tasks: tasksWithRects,
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
    groupBy,
    setGroupBy,
    groupLabels: uniqueGroupValues, // Pass the calculated labels
    containerRef,
    blockers: selectedTask ? getBlockers(selectedTask) : [],
    gridStartDate,  // The date when the grid starts (may be before today for overdue tasks)
    day0Offset,     // The offset in days from grid start to day 0 (today)

    // Event handlers
    onZoomIn: handleZoomIn,
    onZoomOut: handleZoomOut,
    onFitToView: handleFitToView,
    onTaskClick,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: onPointerUp,
    onClose: closeSelection,
    getBlockers,
    showBlastRadius,
    setShowBlastRadius,
    blastRadiusIds,
    // TODO: Pass update handlers to TaskDependencyMap when implemented
    // onTaskUpdate: handleTaskUpdate,
    // onTaskStatusUpdate: handleTaskStatusUpdate,
    // onTaskDateUpdate: handleTaskDateUpdate,
    // onBatchTaskUpdate: handleBatchTaskUpdate
  };

  // Debug: Log tasks state
  console.log('TaskDependencyMapContainer: tasks state:', tasks?.length || 0, 'convertedTasks:', convertedTasks?.length || 0);

  // Show message if no tasks
  if (!tasks || tasks.length === 0) {
    return (
      <div className="w-full h-[80vh] bg-slate-50 text-gray-800 flex items-center justify-center">
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