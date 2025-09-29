/**
 * Utility functions for the task dependency map
 */

/**
 * Clamp a value between min and max
 * @param {number} val - Value to clamp
 * @param {number} lo - Minimum value
 * @param {number} hi - Maximum value
 * @returns {number} Clamped value
 */
export const clamp = (val, lo, hi) => Math.max(lo, Math.min(hi, val));

/**
 * Round value to nearest day if snapping is enabled
 * @param {number} v - Value to round
 * @param {boolean} snapToDays - Whether to snap to days
 * @returns {number} Rounded value
 */
export const roundDay = (v, snapToDays = true) => snapToDays ? Math.round(v) : v;

/**
 * Calculate task rectangle position and dimensions
 * @param {Object} task - Task object
 * @param {Object} layoutConstants - Layout constants
 * @returns {Object} Rectangle with x, y, w, h properties
 */
export const computeTaskRect = (task, layoutConstants) => {
  const { DAY_WIDTH, LANE_HEIGHT, BAR_HEIGHT, PADDING } = layoutConstants;
  const x = PADDING + task.start * DAY_WIDTH;
  const y = PADDING + task.lane * LANE_HEIGHT + (LANE_HEIGHT - BAR_HEIGHT) / 2;
  const w = Math.max(30, task.duration * DAY_WIDTH - 16); // ensure minimally visible
  return { x, y, w, h: BAR_HEIGHT };
};

/**
 * Convert x coordinate to day value
 * @param {number} x - X coordinate
 * @param {number} padding - Padding value
 * @param {number} dayWidth - Width per day
 * @returns {number} Day value
 */
export const dayFromX = (x, padding, dayWidth) => (x - padding) / dayWidth;

/**
 * Generate edge path for task dependencies
 * @param {string} fromId - Source task ID
 * @param {string} toId - Target task ID
 * @param {Object} tasksById - Tasks lookup object
 * @param {Function} computeTaskRect - Function to compute task rectangles
 * @returns {string} SVG path string
 */
export const edgePath = (fromId, toId, tasksById, computeTaskRect) => {
  const source = tasksById[fromId];
  const target = tasksById[toId];
  if (!source || !target) return '';
  
  const sourceRect = computeTaskRect(source);
  const targetRect = computeTaskRect(target);
  
  const x1 = sourceRect.x + sourceRect.w + 8;
  const y1 = sourceRect.y + sourceRect.h / 2;
  const x2 = targetRect.x - 8;
  const y2 = targetRect.y + targetRect.h / 2;
  const dx = Math.max(40, (x2 - x1) / 2);
  
  return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
};

/**
 * Calculate days since a given date
 * @param {string} iso - ISO date string
 * @returns {number} Days since the date
 */
export const daysSince = (iso) => {
  if (!iso) return null;
  const date = new Date(iso);
  const now = new Date();
  const diffTime = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diffTime);
};

