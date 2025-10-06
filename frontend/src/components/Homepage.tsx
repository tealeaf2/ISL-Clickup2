import React, { useMemo, useState, useEffect, useCallback } from 'react';

interface ClickUpUser {
  id: number;
  username: string;
  email: string;
  color: string;
  profilePicture?: string;
}

interface ClickUpStatus {
  status: string;
  color: string;
  type: string;
  orderindex: number;
}

interface ClickUpPriority {
  id: string;
  priority: string;
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

interface Team {
  id: string;
  name: string;
  color?: string;
}

const useClickUp = (apiToken: string) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [tasks, setTasks] = useState<ClickUpTask[]>([]);
  const [taskComments, setTaskComments] = useState<Map<string, string[]>>(new Map());
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
        subtasks: 'true', 
        ...params
      });
     
      const response = await fetch(`${baseUrl}/team/${teamId}/task?${queryParams}`, { headers });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const fetchedTasks = data.tasks || [];
      setTasks(fetchedTasks);
      
      // Fetch comments for each task
      const commentsMap = new Map<string, string[]>();
      await Promise.all(
        fetchedTasks.map(async (task: ClickUpTask) => {
          try {
            const commentResponse = await fetch(`${baseUrl}/task/${task.id}/comment`, { headers });
            if (commentResponse.ok) {
              const commentData = await commentResponse.json();
              const comments = commentData.comments || [];
              if (comments.length > 0) {
                // Get all comments
                const allComments = comments.map((c: any) => c.comment_text || '').filter((text: string) => text.trim());
                commentsMap.set(task.id, allComments);
              }
            }
          } catch (err) {
            // Silently fail for individual comment fetches
            console.error(`Failed to fetch comments for task ${task.id}:`, err);
          }
        })
      );
      
      setTaskComments(commentsMap);
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
    taskComments,
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
  timeRemaining?: string;
  priority?: string;
  status: string;
  comments?: string[];
  subtasks?: Task[];
};

const TASKS: Task[] = [
  {
    id: "1",
    name: "Design homepage",
    assignee: "Edward Hawkson",
    dueDate: "2025-09-25",
    status: "In Progress",
    comments: ["Create responsive component"],
    subtasks: [
      {
        id: "1.1",
        name: "Wireframe header",
        assignee: "Edward",
        dueDate: "2025-09-22",
        status: "Complete",
        comments: ["Logo and nav layout"],
      },
      {
        id: "1.2",
        name: "Responsive grid",
        assignee: "Ian",
        dueDate: "2025-09-24",
        status: "In Progress",
        comments:["Mobile + tablet breakpoints"],
      },
    ],
  },
  {
    id: "2",
    name: "Implement tasks API integration",
    status: "Todo",
    assignee: "Ian",
    dueDate: "2025-10-01",
    comments: ["Wire up ClickUp API to fetch tasks"],
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
    comments: ["Use Figma to improve the look of the task dependency graph"],
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
    const isNumeric = /^\d+$/.test(d);
    const dt = isNumeric ? new Date(parseInt(d)) : new Date(d);
    if (isNaN(dt.getTime())) return d;
    return dt.toLocaleDateString();
  } catch {
    return d;
  }
}

function calculateTimeRemaining(dueDate?: string): string {
  if (!dueDate) return "-";
  
  try {
    const isNumeric = /^\d+$/.test(dueDate);
    const dueDt = isNumeric ? new Date(parseInt(dueDate)) : new Date(dueDate);
    
    if (isNaN(dueDt.getTime())) return "-";
    
    const now = new Date();
    const diffMs = dueDt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)}d overdue`;
    } else if (diffDays === 0) {
      return "Due today";
    } else if (diffDays === 1) {
      return "1d remaining";
    } else {
      return `${diffDays}d remaining`;
    }
  } catch {
    return "-";
  }
}

const COL_WIDTHS = {
  assignee: 160,
  dueDate: 120,
  timeRemaining: 140,
  priority: 100,
  status: 120,
  comments: 200,
  nameCalc: `calc(100% - ${160 + 120 + 140 + 100 + 120 + 200}px)`,
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
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
  const { teams, tasks: clickUpTasks, taskComments, loading, error, fetchTeams, fetchTasks } = useClickUp(apiToken);

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
    const taskMap = new Map<string, Task>();
    const topLevelTasks: Task[] = [];
    
    for (const task of clickUpTasks) {
      const normalizedStatus = toTitleCase(task.status.status);
      
      // Get comment from the taskComments map if available, otherwise use description
      let comments = taskComments.get(task.id) || [];
      if (comments.length === 0 && task.description && task.description.trim()) {
        comments = [task.description.trim()];
      } else if (comments.length === 0 && task.text_content && task.text_content.trim()) {
        comments = [task.text_content.trim()];
      }

      const convertedTask: Task = {
        id: task.id,
        name: task.name,
        assignee: task.assignees[0]?.username,
        dueDate: task.due_date,
        timeRemaining: calculateTimeRemaining(task.due_date),
        priority: task.priority?.priority?.toLowerCase(),
        status: normalizedStatus,
        comments: comments.length > 0 ? comments : undefined,
        subtasks: [],
      };
      taskMap.set(task.id, convertedTask);
    }

    for (const task of clickUpTasks) {
      const convertedTask = taskMap.get(task.id)!;
      
      if (task.parent) {
        const parentTask = taskMap.get(task.parent);
        if (parentTask) {
          parentTask.subtasks!.push(convertedTask);
        } else {
          topLevelTasks.push(convertedTask);
        }
      } else {
        topLevelTasks.push(convertedTask);
      }
    }

    return topLevelTasks.filter(task => !task.id.includes('.'));
    
  }, [clickUpTasks, taskComments]);

  const tasksToDisplay = convertedTasks.length > 0 ? convertedTasks : TASKS;

  const grouped = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of tasksToDisplay) {
      const status = t.status ?? "Unknown";
      if (!map.has(status)) map.set(status, []);
      map.get(status)!.push(t);
    }
    
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

    const groupedSorted = sortedKeys.map((k) => {
      const arr = map.get(k)!.slice().map((t) => {
        const clone: Task = { ...t };
        const sortNested = (task: Task): Task => {
          const deep = { ...task };
          if (deep.subtasks && deep.subtasks.length) {
            deep.subtasks = sortTasksByDueDateAndName(deep.subtasks).map(sortNested);
          }
          return deep;
        };
        return sortNested(clone);
      });
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
    const hasSub = !!(task.subtasks && task.subtasks.length);
    const isOpen = !!expanded[task.id];
    const indent = Math.min(depth * 14, 56);

    const statusColor = STATUS_COLORS[task.status] ?? STATUS_COLORS.Unknown;

    return (
      <React.Fragment key={task.id}>
        <tr
          style={{
            borderTop: "1px solid #f3f4f6",
            background: depth % 2 === 1 ? "#fafafb" : "#ffffff",
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
                  {task.comments && task.comments.length > 0 && (
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>{task.comments[0]}</div>
                  )}
                </div>
              </div>
            </div>
          </td>

          <td style={{ padding: "10px 12px", width: COL_WIDTHS.assignee, verticalAlign: "middle" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <Avatar name={task.assignee} />
              <div style={{ fontSize: 13, color: "#374151" }}>{task.assignee}</div>
            </div>
          </td>

          <td style={{ padding: "10px 12px", width: COL_WIDTHS.dueDate, verticalAlign: "middle" }}>
            <div style={{ fontSize: 13, color: task.dueDate ? "#111827" : "#9ca3af" }}>{formatDate(task.dueDate)}</div>
          </td>

          <td style={{ padding: "10px 12px", width: COL_WIDTHS.timeRemaining, verticalAlign: "middle" }}>
            <div 
              style={{ 
                fontSize: 12, 
                color: task.timeRemaining?.includes('overdue') ? "#dc2626" : task.timeRemaining === "Due today" ? "#ff7a00" : "#6b7280",
                fontWeight: task.timeRemaining?.includes('overdue') || task.timeRemaining === "Due today" ? 600 : 400
              }}
            >
              {task.timeRemaining || "-"}
            </div>
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
                background: (task.priority === "urgent" && "#f1f1f1ff") || (task.priority === "high" && "#fff1f2") || (task.priority === "low" && "#f0fdf4") || "#f3f4f6",
                color: task.priority === "urgent" ? "#d96500ff" : task.priority === "high" ? "#b91c1c" : task.priority === "low" ? "#059669" : "#374151",
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

          <td style={{ padding: "10px 12px", width: COL_WIDTHS.comments, verticalAlign: "middle", paddingRight: "30px", paddingLeft: "0px"}}>
            {task.comments && task.comments.length > 0 ? (
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: "#6b7280" }}>
                {task.comments.map((comment, idx) => (
                  <li key={idx} style={{ marginBottom: 4 }}>{comment}</li>
                ))}
              </ul>
            ) : (
              <div style={{ fontSize: 13, color: "#9ca3af" }}>-</div>
            )}
          </td>
        </tr>

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
                      <th style={{ padding: "10px 12px", width: COL_WIDTHS.timeRemaining }}>Time Remaining</th>
                      <th style={{ padding: "10px 12px", width: COL_WIDTHS.priority }}>Priority</th>
                      <th style={{ padding: "10px 12px", width: COL_WIDTHS.status }}>Status</th>
                      <th style={{ padding: "10px 12px", width: COL_WIDTHS.comments }}>Comments</th>
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