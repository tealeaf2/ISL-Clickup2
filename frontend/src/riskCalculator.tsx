/**
 * The Task type definition, extended for risk calculation.
 */
export type RiskCalculableTask = {
  dueDate?: string;
  subtasks?: RiskCalculableTask[];
  // --- Fields required for risk calculation ---
  duration?: number; // Total planned duration in days
  dependencies?: {
    total: number;
    blocked: number;
  };
  last_update_days?: number; // Days since the last update
  priority?: string;
  status?: string;
};

// --- Risk Model Constants ---
const WEIGHTS = {
  overdue: 0.25,
  dependency: 0.25,
  inactivity: 0.2,
  complexity: 0.15,
  priority: 0.15,
};

const PRIORITY_MAP: Record<string, number> = {
  High: 1.0,
  Medium: 0.6,
  Low: 0.3,
};

const INACTIVITY_THRESHOLD_DAYS = 7; // After 7 days, inactivity risk is maxed out
const MAX_SUBTASKS_FOR_LOG = 20;     // A reasonable cap for normalization

/**
 * Computes a risk score for a given task.
 * @param task The task object.
 * @returns A risk score from 0 to 100.
 */
export function computeRisk(task: RiskCalculableTask): number {
  // A completed task has 0 risk.
  if (task.status === "Complete") {
    return 0;
  }
  
  // 1. Overdue Factor
  let overdueFactor = 0;
  if (task.dueDate && task.duration) {
    const daysLate = Math.max(0, (new Date().getTime() - new Date(task.dueDate).getTime()) / (1000 * 3600 * 24));
    overdueFactor = Math.min(1, daysLate / task.duration);
  }

  // 2. Dependency Factor
  const dependencyFactor =
    task.dependencies && task.dependencies.total > 0
      ? task.dependencies.blocked / task.dependencies.total
      : 0;

  // 3. Inactivity Factor
  const inactivityFactor = Math.min(
    1,
    (task.last_update_days ?? 0) / INACTIVITY_THRESHOLD_DAYS
  );

  // 4. Complexity Factor (log-normalized subtask count)
  const subtaskCount = task.subtasks?.length ?? 0;
  const complexityFactor =
    Math.log(subtaskCount + 1) / Math.log(MAX_SUBTASKS_FOR_LOG + 1);

  // 5. Priority Factor
  const priorityFactor = PRIORITY_MAP[task.priority ?? ""] ?? PRIORITY_MAP.Low;

  // Calculate the weighted sum and scale to 100
  const score =
    WEIGHTS.overdue * overdueFactor +
    WEIGHTS.dependency * dependencyFactor +
    WEIGHTS.inactivity * inactivityFactor +
    WEIGHTS.complexity * complexityFactor +
    WEIGHTS.priority * priorityFactor;

  return Math.round(score * 100);
}