// Layout constants
export const LAYOUT_CONSTANTS = {
  DAY_WIDTH: 140, // px per time unit ("day")
  LANE_HEIGHT: 90, // px per row/lane
  BAR_HEIGHT: 26, // task bar height
  PADDING: 110, // around content
};

// Task status colors
export const STATUS_COLORS = {
  done: '#10b981', // emerald-500
  'in-progress': '#3b82f6', // blue-500
  blocked: '#ef4444', // red-500
  todo: '#9ca3af', // gray-400
  default: '#6b7280', // gray-500
};

// Status badge classes
export const STATUS_BADGE_CLASSES = {
  done: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'in-progress': 'bg-blue-100 text-blue-800 border-blue-200',
  blocked: 'bg-red-100 text-red-800 border-red-200',
  todo: 'bg-gray-100 text-gray-800 border-gray-200',
};
