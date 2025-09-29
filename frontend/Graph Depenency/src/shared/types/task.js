/**
 * Type definitions for task-related data structures
 */

/**
 * Task status enumeration
 */
export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  BLOCKED: 'blocked',
  DONE: 'done'
};

/**
 * Task priority enumeration
 */
export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

/**
 * Main task object structure
 * @typedef {Object} Task
 * @property {string} id - Unique task identifier
 * @property {string} name - Task name/title
 * @property {string} owner - Task owner/assignee
 * @property {string} status - Task status (todo, in-progress, blocked, done)
 * @property {number} start - Start day (0-based)
 * @property {number} duration - Duration in days
 * @property {number} lane - Lane/row position (0-based)
 * @property {string|null} parentId - Parent task ID (null for root tasks)
 * @property {string[]} depends - Array of task IDs this task depends on
 * @property {number} [estimatedHours] - Estimated hours for the task
 * @property {string} [priority] - Task priority (low, medium, high)
 * @property {number} [loggedTime] - Total logged time in hours
 * @property {string} [lastTimeEntry] - ISO string of last time entry
 * @property {string} [lastUpdated] - ISO string of last update
 */

/**
 * Task with computed rectangle for rendering
 * @typedef {Object} TaskWithRect
 * @property {Task} - All Task properties
 * @property {TaskRect} rect - Computed rectangle for rendering
 */

/**
 * Rectangle structure for task positioning
 * @typedef {Object} TaskRect
 * @property {number} x - X coordinate
 * @property {number} y - Y coordinate
 * @property {number} w - Width
 * @property {number} h - Height
 */

/**
 * Task dependency relationship
 * @typedef {Object} Dependency
 * @property {string} from - Source task ID
 * @property {string} to - Target task ID
 */

/**
 * Task blocker information
 * @typedef {Object} Blocker
 * @property {string} by - What is blocking (task ID or description)
 * @property {string} owner - Owner of the blocking item
 * @property {string} type - Type of blocker (dependency, explicit)
 * @property {string} [since] - ISO string when blocking started
 */

/**
 * Task draft for editing
 * @typedef {Object} TaskDraft
 * @property {string} id - Task ID
 * @property {string} name - Task name
 * @property {string} owner - Task owner
 * @property {string} status - Task status
 * @property {number} start - Start day
 * @property {number} duration - Duration in days
 * @property {number} lane - Lane position
 * @property {string} [parentId] - Parent task ID
 * @property {string} [dependsText] - Comma-separated dependency IDs
 * @property {number} [estimatedHours] - Estimated hours
 * @property {string} [priority] - Task priority
 */

/**
 * Application options/settings
 * @typedef {Object} AppOptions
 * @property {boolean} parentBlockedIfAnyChildBlocked - Auto-block parent if child blocked
 * @property {boolean} snapToDays - Snap task positions to day boundaries
 * @property {boolean} enableAutoPropagation - Enable automatic status propagation
 * @property {number} debounceMs - Debounce time for updates
 */

/**
 * Pan and zoom state
 * @typedef {Object} PanZoomState
 * @property {number} scale - Current zoom scale
 * @property {Object} pan - Pan offset {x, y}
 * @property {boolean} isPanning - Whether currently panning
 */

/**
 * Modal position for task details
 * @typedef {Object} ModalPosition
 * @property {number} x - X coordinate
 * @property {number} y - Y coordinate
 */

/**
 * Layout constants
 * @typedef {Object} LayoutConstants
 * @property {number} DAY_WIDTH - Width per day in pixels
 * @property {number} LANE_HEIGHT - Height per lane in pixels
 * @property {number} BAR_HEIGHT - Task bar height in pixels
 * @property {number} PADDING - Content padding in pixels
 */

/**
 * Status color mapping
 * @typedef {Object} StatusColors
 * @property {string} done - Color for done status
 * @property {string} in-progress - Color for in-progress status
 * @property {string} blocked - Color for blocked status
 * @property {string} todo - Color for todo status
 * @property {string} default - Default color
 */
