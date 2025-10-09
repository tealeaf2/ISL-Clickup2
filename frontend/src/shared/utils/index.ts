/**
 * Utility functions for the task dependency map
 */

/**
 * Clamp a value between min and max
 * @param val - Value to clamp
 * @param lo - Minimum value
 * @param hi - Maximum value
 * @returns Clamped value
 */
export const clamp = (val: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, val));

/**
 * Round value to nearest day if snapping is enabled
 * @param v - Value to round
 * @param snapToDays - Whether to snap to days
 * @returns Rounded value
 */
export const roundDay = (v: number, snapToDays: boolean = true): number => snapToDays ? Math.round(v) : v;

/**
 * Calculate task rectangle position and dimensions
 * @param task - Task object
 * @param layoutConstants - Layout constants
 * @returns Rectangle with x, y, w, h properties
 */
export const computeTaskRect = (task: { start: number; duration: number; lane: number }, layoutConstants: { DAY_WIDTH: number; LANE_HEIGHT: number; BAR_HEIGHT: number; PADDING: number }) => {
  const { DAY_WIDTH, LANE_HEIGHT, BAR_HEIGHT, PADDING } = layoutConstants;
  
  // Ensure all values are valid numbers
  const start = isNaN(task.start) ? 0 : Math.max(0, task.start);
  const duration = isNaN(task.duration) ? 1 : Math.max(1, task.duration);
  const lane = isNaN(task.lane) ? 0 : Math.max(0, task.lane);
  
  const x = PADDING + start * DAY_WIDTH;
  const y = PADDING + lane * LANE_HEIGHT + (LANE_HEIGHT - BAR_HEIGHT) / 2;
  const w = Math.max(30, duration * DAY_WIDTH - 16); // ensure minimally visible
  
  return { x, y, w, h: BAR_HEIGHT };
};

/**
 * Convert x coordinate to day value
 * @param x - X coordinate
 * @param padding - Padding value
 * @param dayWidth - Width per day
 * @returns Day value
 */
export const dayFromX = (x: number, padding: number, dayWidth: number): number => (x - padding) / dayWidth;

/**
 * Generate edge path for task dependencies
 * @param fromId - Source task ID
 * @param toId - Target task ID
 * @param tasksById - Tasks lookup object
 * @param computeTaskRect - Function to compute task rectangles
 * @returns SVG path string
 */
export const edgePath = (fromId: string, toId: string, tasksById: Record<string, any>, computeTaskRect: (task: any, layoutConstants: any) => { x: number; y: number; w: number; h: number }): string => {
  const source = tasksById[fromId];
  const target = tasksById[toId];
  if (!source || !target) return '';
  
  const sourceRect = computeTaskRect(source, { DAY_WIDTH: 140, LANE_HEIGHT: 90, BAR_HEIGHT: 26, PADDING: 110 });
  const targetRect = computeTaskRect(target, { DAY_WIDTH: 140, LANE_HEIGHT: 90, BAR_HEIGHT: 26, PADDING: 110 });
  
  const x1 = sourceRect.x + sourceRect.w + 8;
  const y1 = sourceRect.y + sourceRect.h / 2;
  const x2 = targetRect.x - 8;
  const y2 = targetRect.y + targetRect.h / 2;
  const dx = Math.max(40, (x2 - x1) / 2);
  
  return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
};

/**
 * Calculate days since a given date
 * @param iso - ISO date string
 * @returns Days since the date
 */
export const daysSince = (iso: string): number | null => {
  if (!iso) return null;
  const date = new Date(iso);
  const now = new Date();
  const diffTime = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diffTime);
};
