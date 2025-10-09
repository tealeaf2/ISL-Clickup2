export interface ClickUpUser {
  id: number;
  username: string;
  email: string;
  color: string;
  profilePicture?: string;
}

export interface ClickUpStatus {
  status: string;
  color: string;
  type: string;
  orderindex: number;
}

export interface ClickUpPriority {
  id: string;
  priority: string;
  color: string;
  orderindex: string;
}

export interface ClickUpTask {
  id: string;
  name: string;
  text_content: string;
  description: string;
  status: ClickUpStatus;
  orderindex: string;
  date_created: string;
  date_updated: string;
  date_closed?: string;
  date_done?: string;
  creator: ClickUpUser;
  assignees: ClickUpUser[];
  watchers: ClickUpUser[];
  checklists: any[];
  tags: any[];
  parent?: string;
  priority?: ClickUpPriority;
  due_date?: string;
  start_date?: string;
  points?: number;
  time_estimate?: number;
  time_spent?: number;
  custom_fields: any[];
  dependencies: string[];
  linked_tasks: string[];
  team_id: string;
  url: string;
  permission_level: string;
  list: any;
  project: any;
  folder: any;
  space: any;
}

export interface Team {
  id: string;
  name: string;
  color?: string;
}
