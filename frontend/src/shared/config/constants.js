/**
 * Application-wide configuration constants
 */

// Default application options
export const DEFAULT_OPTIONS = {
  parentBlockedIfAnyChildBlocked: true,
  snapToDays: true,
  enableAutoPropagation: true,
  debounceMs: 300,
};

// Default task values
export const DEFAULT_TASK = {
  status: 'todo',
  start: 0,
  duration: 1,
  lane: 0,
  priority: 'medium',
  estimatedHours: 0,
};

// UI constants
export const UI_CONSTANTS = {
  MODAL_Z_INDEX: 50,
  TOOLTIP_Z_INDEX: 60,
  DRAG_THRESHOLD: 3, // pixels
  CLICK_DELAY: 50, // ms
  DOUBLE_CLICK_DELAY: 300, // ms
};

// Animation constants
export const ANIMATION_CONSTANTS = {
  TRANSITION_DURATION: 200, // ms
  DEBOUNCE_DELAY: 300, // ms
  PROPAGATION_DELAY: 50, // ms
};

// Validation constants
export const VALIDATION_CONSTANTS = {
  MIN_TASK_DURATION: 1,
  MAX_TASK_DURATION: 365,
  MIN_TASK_LANE: 0,
  MAX_TASK_LANE: 50,
  MIN_ESTIMATED_HOURS: 0,
  MAX_ESTIMATED_HOURS: 1000,
};

// Error messages
export const ERROR_MESSAGES = {
  TASK_ID_REQUIRED: 'Task ID is required',
  TASK_NAME_REQUIRED: 'Task name is required',
  INVALID_TASK_ID: 'Task ID already exists',
  INVALID_DEPENDENCY: 'Invalid dependency reference',
  SAVE_FAILED: 'Failed to save task',
  DELETE_FAILED: 'Failed to delete task',
};

// Success messages
export const SUCCESS_MESSAGES = {
  TASK_SAVED: 'Task saved successfully',
  TASK_DELETED: 'Task deleted successfully',
  TASK_ADDED: 'Task added successfully',
};
