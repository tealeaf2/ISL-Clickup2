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
 * @param day0Offset - Offset in days from grid start to day 0 (today). Used to position tasks with negative start values (overdue tasks)
 * @returns Rectangle with x, y, w, h properties
 */
export const computeTaskRect = (task: { start: number; duration: number; lane: number; id?: string }, layoutConstants: { DAY_WIDTH: number; LANE_HEIGHT: number; BAR_HEIGHT: number; PADDING: number }, day0Offset: number = 0) => {
  const { DAY_WIDTH, LANE_HEIGHT, BAR_HEIGHT, PADDING } = layoutConstants;
  
  // Ensure all values are valid numbers
  // Allow negative start values for overdue tasks (don't clamp to 0)
  const start = isNaN(task.start) ? 0 : task.start;
  const duration = isNaN(task.duration) ? 1 : Math.max(1, task.duration);
  const lane = isNaN(task.lane) ? 0 : Math.max(0, task.lane);
  
  // Position task: day0Offset is where day 0 (today) is in the grid
  // Tasks with start=0 are at day0Offset, tasks with start=-5 are 5 days before day0Offset
  // Grid line at grid day d is at: ownerLabelArea + PADDING + d * DAY_WIDTH
  // Task starts at grid day: day0Offset + start
  // Owner label area (250px) is reserved on the left, then PADDING, then the grid starts
  const ownerLabelArea = 250; // Space for owner labels on the left
  const gridStartDay = day0Offset + start;
  const x = ownerLabelArea + PADDING + gridStartDay * DAY_WIDTH;
  const y = PADDING + lane * LANE_HEIGHT + (LANE_HEIGHT - BAR_HEIGHT) / 2;
  
  // Width calculation: Rectangle should span exactly from start grid line to end grid line
  // In a Gantt chart, if a task starts on day 0 and has duration 3:
  //   - It spans days 0, 1, 2 (3 days total)
  //   - Rectangle starts at grid line for day 0
  //   - Rectangle ends at grid line for day 3 (the start of the day after day 2)
  //   - Width = 3 * DAY_WIDTH
  // 
  // The rectangle should extend from:
  //   Start: grid day (day0Offset + start) at x = PADDING + (day0Offset + start) * DAY_WIDTH
  //   End: grid day (day0Offset + start + duration) at x = PADDING + (day0Offset + start + duration) * DAY_WIDTH
  //   Width = duration * DAY_WIDTH
  const w = Math.max(30, duration * DAY_WIDTH);
  
  // Calculate the end position for verification
  const endX = x + w;
  const expectedEndGridDay = gridStartDay + duration;
  const expectedEndX = PADDING + expectedEndGridDay * DAY_WIDTH;
  
  // Debug logging for rectangle calculation
  console.log(`computeTaskRect: task="${task.id || 'unknown'}", start=${start}, duration=${duration}, day0Offset=${day0Offset}, gridStartDay=${gridStartDay}, x=${x}, w=${w}, endX=${endX}, expectedEndGridDay=${expectedEndGridDay}, expectedEndX=${expectedEndX}, DAY_WIDTH=${DAY_WIDTH}`);
  
  return { x, y, w, h: BAR_HEIGHT };
};

/**
 * Convert x coordinate to day value
 * @param x - X coordinate
 * @param padding - Padding value
 * @param dayWidth - Width per day
 * @param day0Offset - Offset in days from grid start to day 0 (today). Defaults to 0.
 * @returns Day value relative to day 0 (today), so negative values mean overdue tasks
 */
export const dayFromX = (x: number, padding: number, dayWidth: number, day0Offset: number = 0): number => {
  // Convert x to day index in the grid
  const gridDay = (x - padding) / dayWidth;
  // Convert to day relative to day 0 (today)
  return gridDay - day0Offset;
};

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
