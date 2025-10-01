import React, { useMemo, useState, useEffect, useCallback } from 'react';

interface ClickUpUser {
  id: number;
  username: string;
  email: string;
  color: string;
  profilePicture?: string;
}

interface ClickUpStatus {
  status: string; // This is the status name (e.g., 'to do', 'In Progress')
  color: string;
  type: string; // e.g., 'open', 'closed'
  orderindex: number;
}

interface ClickUpPriority {
  id: string;
  priority: string; // e.g., 'High', 'Low'
  color: string;
  orderindex: string;
}

interface ClickUpTask {
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
  parent?: string; // Crucial for identifying subtasks
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

interface Team {
  id: string;
  name: string;
  color?: string;
}

const useClickUp = (apiToken: string) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [tasks, setTasks] = useState<ClickUpTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const baseUrl = 'https://api.clickup.com/api/v2';
  const headers = useMemo(() => ({
    'Authorization': apiToken,
    'Content-Type': 'application/json'
  }), [apiToken]);

  const fetchTeams = useCallback(async () => {
    if (!apiToken) return;
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`${baseUrl}/team`, { headers });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setTeams(data.teams || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch teams');
    } finally {
      setLoading(false);
    }
  }, [apiToken, headers]);

  const fetchTasks = useCallback(async (teamId: string, params: Record<string, string> = {}) => {
    if (!apiToken || !teamId) return;
    try {
      setLoading(true);
      setError('');
      
      const queryParams = new URLSearchParams({
        include_closed: 'false',
        // Setting subtasks to 'true' returns subtasks in the flat list.
        // We will structure them in convertedTasks, but to ensure we get all tasks
        // regardless of their location (Space, Folder, List), we need to query
        // a location (here, team) that includes everything.
        subtasks: 'true', 
        ...params
      });
     
      const response = await fetch(`${baseUrl}/team/${teamId}/task?${queryParams}`, { headers });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [apiToken, headers]);

  const getMyTasks = useCallback((userEmail: string): ClickUpTask[] => {
    return tasks.filter(task => 
      task.assignees.some(assignee => assignee.email === userEmail)
    );
  }, [tasks]);

  const getTasksByStatus = useCallback((status: string): ClickUpTask[] => {
    return tasks.filter(task => task.status.status.toLowerCase() === status.toLowerCase());
  }, [tasks]);

  const getOverdueTasks = useCallback((): ClickUpTask[] => {
    const now = Date.now();
    return tasks.filter(task => 
      task.due_date && 
      parseInt(task.due_date) < now && 
      task.status.type !== 'closed'
    );
  }, [tasks]);

  return {
    teams,
    tasks,
    loading,
    error,
    fetchTeams,
    fetchTasks,
    getMyTasks,
    getTasksByStatus,
    getOverdueTasks
  };
};

type Task = {
  id: string;
  name: string;
  assignee?: string;
  dueDate?: string;
  priority?: string;
  status: string;
  comments?: string;
  subtasks?: Task[];
};

const TASKS: Task[] = [
  {
    id: "1",
    name: "Design homepage",
    assignee: "Edward Hawkson",
    dueDate: "2025-09-25",
    status: "In Progress",
    comments: "Create responsive component",
    subtasks: [
      {
        id: "1.1",
        name: "Wireframe header",
        assignee: "Edward",
        dueDate: "2025-09-22",
        status: "Complete",
        comments: "Logo and nav layout",
      },
      {
        id: "1.2",
        name: "Responsive grid",
        assignee: "Ian",
        dueDate: "2025-09-24",
        status: "In Progress",
        comments: "Mobile + tablet breakpoints",
      },
    ],
  },
  {
    id: "2",
    name: "Implement tasks API integration",
    status: "Todo",
    assignee: "Ian",
    dueDate: "2025-10-01",
    comments: "Wire up ClickUp API to fetch tasks",
    subtasks: [
      {
        id: "2.1",
        name: "Auth & tokens",
        status: "Todo",
        assignee: "Ian",
        dueDate: "2025-09-30",
      },
    ],
  },
  {
    id: "3",
    name: "Create Docker Compose File",
    status: "Complete",
    assignee: "Khang",
    dueDate: "2025-09-28",
  },
  {
    id: "4",
    name: "Refining Graph UI",
    status: "In Progress",
    assignee: "Freeman",
    dueDate: "2025-09-28",
    comments: "Use Figma to improve the look of the task dependency graph",
    subtasks: [
      {
        id: "4.1",
        name: "Add hover states",
        status: "In Progress",
        assignee: "Freeman",
        dueDate: "2025-09-27",
      },
      {
        id: "4.2",
        name: "Accessibility audit",
        status: "Todo",
        assignee: "Khang",
        dueDate: "2025-10-02",
      },
    ],
  },
];

function formatDate(d?: string) {
  if (!d) return "-";
  try {
    // Handles both Unix timestamp string (from ClickUp API) and ISO date string (from mock data)
    const dt = new Date(d.length > 13 ? d : parseInt(d)); 
    if (isNaN(dt.getTime())) return d;
    return dt.toLocaleDateString();
  } catch {
    return d;
  }
}

const COL_WIDTHS = {
  assignee: 160,
  dueDate: 120,
  priority: 100,
  status: 120,
  nameCalc: `calc(100% - ${160 + 120 + 100 + 120}px)`,
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  // Used Title Case for consistent display
  "To Do": { bg: "#f3f0ff", text: "#6b46ff" },
  "In Progress": { bg: "#fff7ed", text: "#ff7a00" },
  Review: { bg: "#eff6ff", text: "#1e40af" },
  Complete: { bg: "#ecfdf5", text: "#059669" },
  Unknown: { bg: "#f1f5f9", text: "#374151" },
};

function Avatar({ name }: { name?: string }) {
  const initials = (name || "—")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: "50%",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
        color: "#fff",
        background:
          "linear-gradient(135deg, rgba(123,97,255,1) 0%, rgba(100,116,255,1) 100%)",
        boxShadow: "0 1px 2px rgba(16,24,40,0.08)",
        flexShrink: 0,
      }}
      title={name}
    >
      {initials === "" ? "?" : initials}
    </div>
  );
}

function countWithSubtasks(tasks: Task[]) {
  let total = 0;
  function walk(ts: Task[]) {
    for (const t of ts) {
      total += 1;
      if (t.subtasks && t.subtasks.length) walk(t.subtasks);
    }
  }
  walk(tasks);
  return total;
}

function sortTasksByDueDateAndName(arr: Task[]) {
  const copy = arr.slice();
  copy.sort((x, y) => {
    if (x.dueDate && y.dueDate) {
      return new Date(x.dueDate).getTime() - new Date(y.dueDate).getTime();
    }
    if (x.dueDate) return -1;
    if (y.dueDate) return 1;
    return x.name.localeCompare(y.name);
  });
  return copy;
}

// Helper to convert a string to Title Case (e.g., 'to do' -> 'To Do')
function toTitleCase(str: string): string {
  if (!str) return str;
  return str.toLowerCase().split(' ').map(word => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
}

const DEFAULT_API_TOKEN = 'pk_162298770_TTFOD6EK7IPQ39DI7OGZTT78PQTCBGC4';
export default function TaskPage() {
  const [apiToken, setApiToken] = useState<string>(DEFAULT_API_TOKEN);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setExpanded((s) => ({ ...s, [id]: !s[id] }));
  const { teams, tasks: clickUpTasks, loading, error, fetchTeams, fetchTasks } = useClickUp(apiToken);

  useEffect(() => {
    if (apiToken) {
      fetchTeams();
    }
  }, [apiToken, fetchTeams]);

  useEffect(() => {
    if (selectedTeamId && apiToken) {
      fetchTasks(selectedTeamId);
    }
  }, [selectedTeamId, apiToken, fetchTasks]);

  const convertedTasks: Task[] = useMemo(() => {
    // 1. Convert ClickUpTasks to Task format and create a map for easy lookup
    const taskMap = new Map<string, Task>();
    const topLevelTasks: Task[] = [];
    
    for (const task of clickUpTasks) {
      // Normalize status name to Title Case for consistent grouping/display
      const normalizedStatus = toTitleCase(task.status.status); 

      const convertedTask: Task = {
        id: task.id,
        name: task.name,
        assignee: task.assignees[0]?.username,
        // ClickUp due_date is a Unix timestamp string in milliseconds
        dueDate: task.due_date ? new Date(parseInt(task.due_date)).toISOString().split('T')[0] : undefined,
        priority: task.priority?.priority?.toLowerCase(), // Normalize priority for rendering logic
        status: normalizedStatus,
        comments: task.text_content || task.description,
        subtasks: [], // Initialize subtasks array
      };
      taskMap.set(task.id, convertedTask);
    }

    // Build the task hierarchy (nest subtasks under their parents)
    for (const task of clickUpTasks) {
      const convertedTask = taskMap.get(task.id)!;
      
      if (task.parent) {
        const parentTask = taskMap.get(task.parent);
        if (parentTask) {
          // If parent exists and we have it in our map, add the current task as a subtask
          parentTask.subtasks!.push(convertedTask);
        } else {
          // If parent is missing (e.g., deleted), treat it as a top-level task
          topLevelTasks.push(convertedTask);
        }
      } else {
        // Task has no parent, so it's a top-level task
        topLevelTasks.push(convertedTask);
      }
    }

    // Remove any duplicates that might have been added if a subtask was processed before its parent.
    // Since we iterate over all tasks and assign to map/subtasks, the final list should only
    // contain top-level tasks.
    return topLevelTasks.filter(task => !task.id.includes('.')); // Simple filter to ensure no mock subtasks accidentally end up here if mock data is used alongside API data
    
  }, [clickUpTasks]);

  const tasksToDisplay = convertedTasks.length > 0 ? convertedTasks : TASKS;

  const grouped = useMemo(() => {
    const map = new Map<string, Task[]>();
    // Iterate over the now-hierarchical tasksToDisplay (which only contains top-level tasks)
    for (const t of tasksToDisplay) {
      const status = t.status ?? "Unknown";
      if (!map.has(status)) map.set(status, []);
      map.get(status)!.push(t);
    }
    
    // Ensure that the preferredOrder uses the same status casing as the converted tasks
    const preferredOrder = ["To Do", "In Progress", "Review", "Complete"]; 

    const sortedKeys = Array.from(map.keys()).sort((a, b) => {
      const ia = preferredOrder.indexOf(a);
      const ib = preferredOrder.indexOf(b);
      if (ia !== -1 || ib !== -1) {
        if (ia === -1) return 1;
        if (ib === -1) return -1;
        return ia - ib;
      }
      return a.localeCompare(b);
    });

    // Keep the sorting logic, which now correctly sorts the subtasks as well, since they
    // are nested in the data structure.
    const groupedSorted = sortedKeys.map((k) => {
      const arr = map.get(k)!.slice().map((t) => {
        const clone: Task = { ...t };
        // Recursive sort for subtasks (and nested subtasks if any)
        const sortNested = (task: Task): Task => {
          const deep = { ...task };
          if (deep.subtasks && deep.subtasks.length) {
            deep.subtasks = sortTasksByDueDateAndName(deep.subtasks).map(sortNested);
          }
          return deep;
        };
        return sortNested(clone);
      });
      // Sort top-level tasks
      arr.sort((x, y) => {
        if (x.dueDate && y.dueDate) {
          return new Date(x.dueDate).getTime() - new Date(y.dueDate).getTime();
        }
        if (x.dueDate) return -1;
        if (y.dueDate) return 1;
        return x.name.localeCompare(y.name);
      });
      return [k, arr] as [string, Task[]];
    });
    return groupedSorted;
  }, [tasksToDisplay]);

  const renderTaskRows = (task: Task, depth = 0): React.ReactNode => {
    // The original render logic for subtasks and dropdowns is correct
    // as long as the data (tasks) is structured hierarchically.
    const hasSub = !!(task.subtasks && task.subtasks.length);
    const isOpen = !!expanded[task.id];
    const indent = Math.min(depth * 14, 56);

    const statusColor = STATUS_COLORS[task.status] ?? STATUS_COLORS.Unknown;

    return (
      <React.Fragment key={task.id}>
        <tr
          style={{
            borderTop: "1px solid #f3f4f6",
            background: depth % 2 === 1 ? "#fafafb" : "#ffffff", // Slight change to distinguish subtask depth
            transition: "background .12s ease",
          }}
          className="task-row"
        >
          <td
            style={{
              padding: "10px 12px",
              width: COL_WIDTHS.nameCalc,
              verticalAlign: "middle",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  marginLeft: indent,
                  width: 20,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: hasSub ? "pointer" : undefined,
                  color: "#6b7280",
                  userSelect: "none",
                }}
                onClick={() => hasSub && toggle(task.id)}
                aria-hidden={!hasSub}
              >
                {hasSub ? <span style={{ fontSize: 12 }}>{isOpen ? "▾" : "▸"}</span> : <span style={{ width: 12 }} />}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>{task.name}</div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>{task.comments ?? ""}</div>
                </div>
              </div>
            </div>
          </td>

          <td style={{ padding: "10px 12px", width: COL_WIDTHS.assignee, verticalAlign: "middle" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6 }}>                
                <Avatar name={task.assignee} />
              </div>
              <div style={{ fontSize: 13, color: "#374151" }}>{task.assignee}</div>
            </div>
          </td>

          <td style={{ padding: "10px 12px", width: COL_WIDTHS.dueDate, verticalAlign: "middle" }}>
            <div style={{ fontSize: 13, color: task.dueDate ? "#111827" : "#9ca3af" }}>{formatDate(task.dueDate)}</div>
          </td>

          <td style={{ padding: "10px 12px", width: COL_WIDTHS.priority, verticalAlign: "middle" }}>
            <div
              style={{
                fontSize: 12,
                padding: "6px 8px",
                borderRadius: 999,
                display: "inline-block",
                minWidth: 48,
                textAlign: "center",
                // Priority is normalized to lowercase in convertedTasks
                background: (task.priority === "high" && "#fff1f2") || (task.priority === "low" && "#f0fdf4") || "#f3f4f6",
                color: task.priority === "high" ? "#b91c1c" : task.priority === "low" ? "#059669" : "#374151",
                fontWeight: 600,
              }}
            >
              {task.priority ? toTitleCase(task.priority) : "—"}
            </div>
          </td>

          <td style={{ padding: "10px 12px", width: COL_WIDTHS.status, verticalAlign: "middle" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12,
                padding: "6px 10px",
                borderRadius: 999,
                background: statusColor.bg,
                color: statusColor.text,
                fontWeight: 700,
                textTransform: "none",
              }}
            >
              {task.status}
            </div>
          </td>

          <td style={{ padding: "10px 12px", verticalAlign: "middle" }}>
            <div style={{ fontSize: 13, color: "#6b7280" }}>{task.comments ?? "-"}</div>
          </td>
        </tr>

        {/* This correctly renders nested subtasks if they exist and the parent is expanded */}
        {hasSub && isOpen ? (
          task.subtasks!.map((st) => <React.Fragment key={st.id}>{renderTaskRows(st, depth + 1)}</React.Fragment>)
        ) : null}
      </React.Fragment>
    );
  };

  return (
    <div style={{ padding: 20, fontFamily: "Inter, system-ui, -apple-system, sans-serif", background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <h1 style={{ margin: 0, fontSize: 20, color: "#0f172a" }}>Tasks</h1>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {!apiToken && (
            <input
              type="password"
              placeholder="Enter ClickUp API Token"
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #d1d5db",
                fontSize: 14,
                minWidth: 250
              }}
            />
          )}
          {teams.length > 0 && (
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #d1d5db",
                fontSize: 14,
              }}
            >
              <option value="">Select Team</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          )}
          <button
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              background: "transparent",
              border: "1px solid transparent",
              color: "#6b46ff",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            Filters
          </button>
        </div>
      </div>

      {error && (
        <div style={{ 
          padding: 12, 
          background: "#fef2f2", 
          border: "1px solid #fecaca", 
          borderRadius: 8, 
          color: "#dc2626",
          marginBottom: 18 
        }}>
          {error}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: "center", padding: 40, color: "#6b7280" }}>
          Loading tasks...
        </div>
      )}

      {!loading && tasksToDisplay.length === 0 && apiToken && selectedTeamId && (
        <div style={{ textAlign: "center", padding: 40, color: "#6b7280" }}>
          No tasks found for this team.
        </div>
      )}

      {!loading && (
        <div style={{ display: "grid", gap: 12 }}>
          {grouped.map(([status, tasks]) => {
            const total = countWithSubtasks(tasks);
            return (
              <section
                key={status}
                style={{
                  background: "white",
                  borderRadius: 10,
                  padding: 0,
                  boxShadow: "0 6px 18px rgba(15, 23, 42, 0.06)",
                  overflow: "hidden",
                  border: "1px solid rgba(15,23,42,0.04)",
                }}
              >
                <div style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{status}</div>
                    <div style={{ fontSize: 13, color: "#6b7280" }}>
                      {tasks.length} top-level • {total} total
                    </div>
                  </div>
                </div>

                <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                  <thead>
                    <tr style={{ textAlign: "left", fontSize: 13, color: "#6b7280", borderTop: "1px solid #f3f4f6" }}>
                      <th style={{ padding: "10px 12px", width: COL_WIDTHS.nameCalc }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 20 }} />
                          <div>Name</div>
                        </div>
                      </th>

                      <th style={{ padding: "10px 12px", width: COL_WIDTHS.assignee }}>Assignee</th>
                      <th style={{ padding: "10px 12px", width: COL_WIDTHS.dueDate }}>Due</th>
                      <th style={{ padding: "10px 12px", width: COL_WIDTHS.priority }}>Priority</th>
                      <th style={{ padding: "10px 12px", width: COL_WIDTHS.status }}>Status</th>
                      <th style={{ padding: "10px 12px" }}>Comments</th>
                    </tr>
                  </thead>
                  <tbody>{tasks.map((t) => <React.Fragment key={t.id}>{renderTaskRows(t, 0)}</React.Fragment>)}</tbody>
                </table>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}