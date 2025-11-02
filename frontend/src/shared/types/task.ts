/**
 * Internal Task Type Definitions
 * 
 * These types represent tasks in the dependency graph visualization.
 * They are the internal representation used throughout the application,
 * distinct from ClickUp's API format (see clickup.ts).
 */

/**
 * Represents a task in the dependency graph
 * 
 * Tasks are displayed on a timeline (Gantt-style) chart where:
 * - `start` determines horizontal position (days from today)
 * - `lane` determines vertical position (row in the chart)
 * - `duration` determines the width of the task bar
 */
export interface Task {
  /** Unique task identifier */
  id: string;
  /** Task name/title */
  name: string;
  /** Username of the task owner/assignee */
  owner: string;
  /** Start day relative to today (0 = today, 1 = tomorrow, etc.) */
  start: number;
  /** Duration of the task in days */
  duration: number;
  /** Vertical lane/row position in the dependency graph */
  lane: number;
  /** Current status of the task */
  status: TaskStatus;
  /** Priority level of the task */
  priority: TaskPriority;
  /** ID of the parent task, or null if this is a top-level task */
  parentId: string | null;
  /** ISO 8601 timestamp when task was last updated (optional) Used for memoization*/
  lastUpdated?: string;
  /** Computed rectangle position and dimensions for rendering (optional) Used for memoization*/
  rect?: TaskRect;
}

/**
 * Valid task status values
 * 
 * Tasks progress through these states:
 * - `todo`: Task not yet started
 * - `in-progress`: Task actively being worked on
 * - `blocked`: Task cannot proceed due to dependencies
 * 
 * Note: Completed tasks are removed by ClickUp, so 'done' status is not used
 */
export type TaskStatus = 'todo' | 'in-progress' | 'blocked';

/**
 * Valid task priority values
 * 
 * Priority levels from highest to lowest:
 * - `urgent`: Highest priority, needs immediate attention
 * - `high`: High priority
 * - `normal`: Standard priority (default)
 * - `low`: Low priority
 * - `none`: No priority set
 */
export type TaskPriority = 'urgent' | 'high' | 'normal' | 'low' | 'none';

/**
 * Rectangle representing a task's position and size in the dependency graph
 * 
 * Used for rendering task bars and collision detection.
 * Coordinates are in pixels relative to the canvas.
 */
export interface TaskRect {
  /** X coordinate of the top-left corner */
  x: number;
  /** Y coordinate of the top-left corner */
  y: number;
  /** Width of the rectangle */
  w: number;
  /** Height of the rectangle */
  h: number;
}

/**
 * Represents a dependency relationship between two tasks
 * 
 * A dependency means the `to` task depends on (requires completion of) the `from` task.
 * In parent-child relationships, the parent is `from` and child is `to`.
 */
export interface TaskDependency {
  /** ID of the task that must be completed first (parent/dependency) */
  from: string;
  /** ID of the task that depends on the first task (child/dependent) */
  to: string;
}

/**
 * Represents a task that is blocking another task
 * 
 * Blockers prevent a task from progressing. This information is used
 * to highlight why tasks might be stuck or unable to proceed.
 */
export interface TaskBlocker {
  /** ID of the task that is causing the block */
  by: string;
  /** Username of the owner of the blocking task */
  owner: string;
  /** Type of blocker (e.g., "child", "dependency") */
  type: string;
  /** ISO 8601 timestamp when the block was detected */
  since: string;
}

/**
 * Draft state for editing a task
 * 
 * Used in edit modals to hold temporary changes before saving.
 * Contains all editable fields from the Task interface.
 */
export interface TaskDraft {
  /** Task identifier */
  id: string;
  /** Task name/title */
  name: string;
  /** Username of the task owner */
  owner: string;
  /** Current status */
  status: TaskStatus;
  /** Priority level */
  priority: TaskPriority;
  /** Start day relative to today */
  start: number;
  /** Duration in days */
  duration: number;
  /** Vertical lane position */
  lane: number;
  /** Parent task ID, or null if top-level */
  parentId: string | null;
}

/**
 * Configuration options for task behavior and display
 * 
 * These options control how tasks interact with each other
 * and how the dependency graph behaves.
 */
export interface TaskOptions {
  /** If true, parent tasks automatically become blocked if any child is blocked */
  parentBlockedIfAnyChildBlocked: boolean;
  /** If true, task positions snap to day boundaries */
  snapToDays: boolean;
  /** If true, status changes propagate from children to parents automatically */
  enableAutoPropagation: boolean;
  /** Debounce delay in milliseconds for status propagation updates */
  debounceMs: number;
}

/**
 * Pan state for the dependency graph viewport
 * 
 * Represents the current pan/scroll offset of the canvas.
 * Used for implementing drag-to-pan functionality.
 */
export interface PanState {
  /** Horizontal pan offset in pixels */
  x: number;
  /** Vertical pan offset in pixels */
  y: number;
}

/**
 * Screen position coordinates
 * 
 * Used for positioning modals and popups relative to click/touch events.
 * Coordinates are in screen pixels.
 */
export interface ModalPosition {
  /** X coordinate in screen pixels */
  x: number;
  /** Y coordinate in screen pixels */
  y: number;
}
