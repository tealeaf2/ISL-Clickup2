/**
 * ClickUp API Type Definitions
 * 
 * These interfaces represent the data structures returned by the ClickUp API v2.
 * They match the API response format and are used when fetching data from ClickUp.
 */

/**
 * Represents a user in ClickUp
 */
export interface ClickUpUser {
  /** Unique identifier for the user */
  id: number;
  /** Username displayed in ClickUp */
  username: string;
  /** User's email address */
  email: string;
  /** Color associated with the user (hex code) */
  color: string;
  /** Optional URL to user's profile picture */
  profilePicture?: string;
}

/**
 * Represents a task status in ClickUp
 * Statuses are custom-defined per workspace (e.g., "To Do", "In Progress", "Complete")
 */
export interface ClickUpStatus {
  /** Name of the status (e.g., "In Progress", "Complete") */
  status: string;
  /** Color associated with this status (hex code) */
  color: string;
  /** Type of status: "open", "closed", or custom */
  type: string;
  /** Order index for sorting statuses */
  orderindex: number;
}

/**
 * Represents a priority level in ClickUp
 */
export interface ClickUpPriority {
  /** Unique identifier for the priority */
  id: string;
  /** Priority name (e.g., "urgent", "high", "normal", "low") */
  priority: string;
  /** Color associated with this priority (hex code) */
  color: string;
  /** Order index for sorting priorities */
  orderindex: string;
}

/**
 * Represents a task from ClickUp API
 * 
 * This is the main task object returned by ClickUp's API. It contains
 * all task properties including metadata, relationships, and custom fields.
 * 
 * Note: Some fields use `any[]` because ClickUp's API structure can vary
 * by workspace configuration (custom fields, list structures, etc.)
 */
export interface ClickUpTask {
  /** Unique task identifier */
  id: string;
  /** Task name/title */
  name: string;
  /** Plain text content of the task description */
  text_content: string;
  /** Formatted description (may include markdown/HTML) */
  description: string;
  /** Current status of the task */
  status: ClickUpStatus;
  /** Order index for sorting tasks */
  orderindex: string;
  /** ISO 8601 timestamp when task was created */
  date_created: string;
  /** ISO 8601 timestamp when task was last updated */
  date_updated: string;
  /** ISO 8601 timestamp when task was closed (if applicable) */
  date_closed?: string;
  /** ISO 8601 timestamp when task was marked as done (if applicable) */
  date_done?: string;
  /** User who created the task */
  creator: ClickUpUser;
  /** Array of users assigned to the task */
  assignees: ClickUpUser[];
  /** Array of users watching the task */
  watchers: ClickUpUser[];
  /** Array of checklist items (structure varies by ClickUp version) */
  checklists: any[];
  /** Array of tags associated with the task */
  tags: any[];
  /** ID of the parent task (if this is a subtask) */
  parent?: string;
  /** Priority level of the task (optional) */
  priority?: ClickUpPriority;
  /** ISO 8601 timestamp or timestamp in milliseconds for due date (can be string or number) */
  due_date?: string | number;
  /** ISO 8601 timestamp or timestamp in milliseconds for start date (can be string or number) */
  start_date?: string | number;
  /** Story points assigned to the task (if using points) */
  points?: number;
  /** Estimated time in milliseconds */
  time_estimate?: number;
  /** Time spent on task in milliseconds */
  time_spent?: number;
  /** Array of custom fields (structure varies by workspace) */
  custom_fields: any[];
  /** Array of task IDs that this task depends on */
  dependencies: string[];
  /** Array of task IDs that are linked to this task */
  linked_tasks: string[];
  /** ID of the team this task belongs to */
  team_id: string;
  /** URL to view this task in ClickUp */
  url: string;
  /** Permission level: "read", "write", "admin", etc. */
  permission_level: string;
  /** List object containing list information (structure varies) */
  list: any;
  /** Project object containing project information (structure varies) */
  project: any;
  /** Folder object containing folder information (structure varies) */
  folder: any;
  /** Space object containing space information (structure varies) */
  space: any;
}

/**
 * Represents a team in ClickUp
 * Teams are the top-level organizational unit in ClickUp
 */
export interface Team {
  /** Unique identifier for the team */
  id: string;
  /** Name of the team */
  name: string;
  /** Optional color associated with the team */
  color?: string;
}
