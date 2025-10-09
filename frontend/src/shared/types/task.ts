export interface Task {
  id: string;
  name: string;
  owner: string;
  start: number;
  duration: number;
  lane: number;
  status: TaskStatus;
  priority: TaskPriority;
  parentId: string | null;
  depends: string[];
  lastUpdated?: string;
  rect?: TaskRect;
}

export type TaskStatus = 'todo' | 'in-progress' | 'done' | 'blocked';
export type TaskPriority = 'urgent' | 'high' | 'normal' | 'low' | 'none';

export interface TaskRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface TaskDependency {
  from: string;
  to: string;
}

export interface TaskBlocker {
  by: string;
  owner: string;
  type: string;
  since: string;
}

export interface TaskDraft {
  id: string;
  name: string;
  owner: string;
  status: TaskStatus;
  priority: TaskPriority;
  start: number;
  duration: number;
  lane: number;
  parentId: string | null;
  dependsText: string;
}

export interface TaskOptions {
  parentBlockedIfAnyChildBlocked: boolean;
  snapToDays: boolean;
  enableAutoPropagation: boolean;
  debounceMs: number;
}

export interface PanState {
  x: number;
  y: number;
}

export interface ModalPosition {
  x: number;
  y: number;
}
