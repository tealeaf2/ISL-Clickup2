// Layout constants
export const LAYOUT_CONSTANTS = {
  DAY_WIDTH: 140, // px per time unit ("day")
  LANE_HEIGHT: 90, // px per row/lane
  BAR_HEIGHT: 26, // task bar height
  PADDING: 110, // around content
} as const;

// Task status colors
export const STATUS_COLORS = {
  done: '#10b981', // emerald-500
  'in-progress': '#3b82f6', // blue-500
  blocked: '#ef4444', // red-500
  todo: '#9ca3af', // gray-400
  default: '#6b7280', // gray-500
} as const;

// Status badge classes
export const STATUS_BADGE_CLASSES = {
  done: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'in-progress': 'bg-blue-100 text-blue-800 border-blue-200',
  blocked: 'bg-red-100 text-red-800 border-red-200',
  todo: 'bg-gray-100 text-gray-800 border-gray-200',
} as const;

// Priority colors for task bars
export const PRIORITY_COLORS = {
  urgent: '#dc2626', // red-600 - more intense than blocked
  high: '#ea580c', // orange-600
  normal: '#6b7280', // gray-500 - default
  low: '#10b981', // emerald-500 - subtle green
  none: '#9ca3af', // gray-400 - very subtle
} as const;

// Priority border styles for visual distinction
export const PRIORITY_BORDERS = {
  urgent: 'stroke-width: 3px; stroke: #991b1b;', // red-800
  high: 'stroke-width: 2px; stroke: #c2410c;', // orange-700
  normal: 'stroke-width: 1px; stroke: #374151;', // gray-700
  low: 'stroke-width: 1px; stroke: #047857;', // emerald-700
  none: 'stroke-width: 1px; stroke: #6b7280;', // gray-500
} as const;
