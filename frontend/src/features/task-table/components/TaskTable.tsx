/**
 * TaskTable Component
 * 
 * A comprehensive dashboard component that displays ClickUp tasks in a table layout
 * with status grouping and expandable subtasks. Features include:
 * - Team selection dropdown
 * - Status-grouped table sections with expandable subtasks
 * - Comments column with task comments/descriptions
 * - Time remaining calculations
 * - Task refresh functionality
 * - Loading and error states
 * - API token input (if not provided via props)
 * 
 * This component serves as the main task management interface and can notify
 * parent components when tasks are loaded via the onTasksUpdate callback.
 * 
 * @fileoverview Main dashboard component for displaying ClickUp tasks in table format
 */

import React, { useMemo, useState, useEffect } from 'react';
import { useClickUp } from '../../../shared/hooks/useClickUp';
import { User, Target, Calendar, Clapperboard, MessagesSquare, ListFilter, LayoutList } from "lucide-react"


/**
 * Props for TaskTable component
 */
interface TaskTableProps {
  /** ClickUp API token for authentication */
  apiToken?: string;
  /** Callback function called when tasks are loaded/updated */
  onTasksUpdate?: (tasks: any[]) => void;
}

/**
 * Internal task representation for display
 */
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

/**
 * Column width constants for table layout
 */
const COL_WIDTHS = {
  assignee: 160,
  dueDate: 120,
  timeRemaining: 140,
  priority: 100,
  status: 120,
  comments: 200,
  nameCalc: `calc(100% - ${160 + 120 + 140 + 100 + 120 + 200}px)`,
};

/**
 * Status color mapping for badges
 */
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  "To Do": { bg: "#f3f0ff", text: "#6b46ff" },
  "In Progress": { bg: "#fff7ed", text: "#ff7a00" },
  Review: { bg: "#eff6ff", text: "#1e40af" },
  Complete: { bg: "#ecfdf5", text: "#059669" },
  Unknown: { bg: "#f1f5f9", text: "#374151" },
};

/**
 * Formats a date string or timestamp into a localized date string
 */
function formatDate(d?: string): string {
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

/**
 * Calculates time remaining until due date or time overdue
 */
function calculateTimeRemaining(dueDate?: string): string {
  if (!dueDate) return "-";

  try {
    const isNumeric = /^\d+$/.test(dueDate);
    const dueDt = isNumeric ? new Date(parseInt(dueDate)) : new Date(dueDate);

    if (isNaN(dueDt.getTime())) return "-";

    const now = new Date();
    const diffMs = dueDt.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    const remainingHours = diffHours % 24;

    if (diffHours < 0) {
      const absDays = Math.abs(diffDays);
      const absHours = Math.abs(remainingHours);
      if (absDays === 0) {
        return `${absHours}h overdue`;
      }
      return absHours > 0 ? `${absDays}d ${absHours}h overdue` : `${absDays}d overdue`;
    } else if (diffHours < 24) {
      return diffHours === 0 ? "Due now" : `${diffHours}h remaining`;
    } else {
      return remainingHours > 0 ? `${diffDays}d ${remainingHours}h remaining` : `${diffDays}d remaining`;
    }
  } catch {
    return "-";
  }
}

/**
 * Converts a string to title case
 */
function toTitleCase(str: string): string {
  if (!str) return str;
  return str.toLowerCase().split(' ').map(word => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
}

/**
 * Avatar component for displaying user initials
 */
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

/**
 * Counts tasks including all subtasks recursively
 */
function countWithSubtasks(tasks: Task[]): number {
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

/**
 * Sorts tasks by due date first, then by name
 */
function sortTasksByDueDateAndName(arr: Task[]): Task[] {
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

/**
 * TaskTable component - Main dashboard for ClickUp tasks
 * 
 * Displays a comprehensive table-based dashboard with status grouping,
 * expandable subtasks, and comments.
 * 
 * @param {TaskTableProps} props - Component props
 * @returns {JSX.Element} A table-based dashboard with task management interface
 */
export const TaskTable: React.FC<TaskTableProps> = ({
  apiToken: propApiToken,
  onTasksUpdate
}) => {
  // Local state for API token if not provided via props
  // Gets token from environment variable (VITE_CLICKUP_API_TOKEN)
  const [localApiToken, setLocalApiToken] = useState<string>(
    import.meta.env.VITE_CLICKUP_API_TOKEN ?? ''
  );
  const apiToken = propApiToken || localApiToken;

  const {
    teams,
    tasks: clickUpTasks,
    taskComments,
    loading,
    error,
    fetchTeams,
    fetchTasks
  } = useClickUp(apiToken);

  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Paganation by status.
  const [pageByStatus, setPageByStatus] = useState<Record<string, number>>({});
  const ITEMS_PER_PAGE = 5;

  // Whenever the user selects a different team, 
  // reset the status-level pagination back to page 1 for every status.
  useEffect(() => {
    setPageByStatus({});
  }, [selectedTeam]);


  // Pagination for subtasks by parent task id
  const [subtaskPageByTask, setSubtaskPageByTask] = useState<Record<string, number>>({});
  const SUBTASKS_PER_PAGE = 5;






  // Fetch teams on component mount
  useEffect(() => {
    if (apiToken) {
      fetchTeams();
    }
  }, [apiToken, fetchTeams]);

  // Auto-select first team when teams are loaded
  useEffect(() => {
    if (teams.length > 0 && !selectedTeam) {
      setSelectedTeam(teams[0].id);
    }
  }, [teams, selectedTeam]);

  // Fetch tasks when team is selected
  useEffect(() => {
    if (selectedTeam && apiToken) {
      fetchTasks(selectedTeam);
    }
  }, [selectedTeam, apiToken, fetchTasks]);

  // Update parent component when tasks change
  useEffect(() => {
    if (clickUpTasks.length > 0 && onTasksUpdate) {
      onTasksUpdate(clickUpTasks);
    }
  }, [clickUpTasks, onTasksUpdate]);

  // Convert ClickUp tasks to internal format with parent-child relationships
  const convertedTasks: Task[] = useMemo(() => {
    const taskMap = new Map<string, Task>();
    const topLevelTasks: Task[] = [];

    for (const task of clickUpTasks) {
      const normalizedStatus = toTitleCase(task.status.status);

      // Get comments from the taskComments map if available, otherwise use description
      let comments = taskComments.get(task.id) || [];
      if (comments.length === 0 && task.description && task.description.trim()) {
        comments = [task.description.trim()];
      } else if (comments.length === 0 && task.text_content && task.text_content.trim()) {
        comments = [task.text_content.trim()];
      }

      // Handle due_date as both string and number (matching API format)
      const dueDateStr = task.due_date
        ? (typeof task.due_date === 'number' ? String(task.due_date) : task.due_date)
        : undefined;

      const convertedTask: Task = {
        id: task.id,
        name: task.name,
        assignee: task.assignees[0]?.username,
        dueDate: dueDateStr,
        timeRemaining: calculateTimeRemaining(dueDateStr),
        priority: task.priority?.priority?.toLowerCase(),
        status: normalizedStatus,
        comments: comments.length > 0 ? comments : undefined,
        subtasks: [],
      };
      taskMap.set(task.id, convertedTask);
    }

    // Build parent-child relationships
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

  // Group tasks by status
  const grouped = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of convertedTasks) {
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
  }, [convertedTasks]);

  /**
   * Toggles expansion state for a task
   */
  const toggle = (id: string) => setExpanded((s) => ({ ...s, [id]: !s[id] }));

  /**
   * Renders task rows recursively with expandable subtasks
   */
  const renderTaskRows = (task: Task, depth = 0): React.ReactNode => {
    const hasSub = !!(task.subtasks && task.subtasks.length);
    const isOpen = !!expanded[task.id];
    const indent = Math.min(depth * 14, 56);

    const statusColor = STATUS_COLORS[task.status] ?? STATUS_COLORS.Unknown;

    // --- subtask pagination setup for this parent task ---
    let visibleSubtasks: Task[] = [];
    let subStartIndex = 0;
    let subEndIndex = 0;
    let subTotalPages = 0;
    let subCurrentPage = 1;

    if (hasSub && isOpen) {
      const allSubs = task.subtasks!;
      const totalSubs = allSubs.length;

      subTotalPages = Math.max(1, Math.ceil(totalSubs / SUBTASKS_PER_PAGE));

      const rawPage = subtaskPageByTask[task.id] ?? 1;
      subCurrentPage = Math.min(rawPage, subTotalPages);

      subStartIndex = (subCurrentPage - 1) * SUBTASKS_PER_PAGE;
      subEndIndex = subStartIndex + SUBTASKS_PER_PAGE;

      visibleSubtasks = allSubs.slice(subStartIndex, subEndIndex);
    }

    const handleSubtaskPageChange = (newPage: number) => {
      setSubtaskPageByTask((prev) => ({
        ...prev,
        [task.id]: newPage,
      }));
    };

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
                color: task.timeRemaining?.includes('overdue') ? "#dc2626" : task.timeRemaining === "Due now" ? "#ff7a00" : task.timeRemaining?.includes("h") && !task.timeRemaining.includes("d") ? "#dc2626" : "#6b7280",
                fontWeight: task.timeRemaining?.includes('overdue') || task.timeRemaining === "Due now" ? 600 : 400
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

          <td style={{ padding: "10px 12px", width: COL_WIDTHS.comments, verticalAlign: "middle", paddingRight: "30px", paddingLeft: "0px" }}>
            {task.comments && task.comments.length > 0 ? (
              <ul style={{ margin: 0, paddingLeft: 0, fontSize: 13, color: "#6b7280" }}>
                {task.comments.map((comment, idx) => (
                  <li key={idx} style={{ marginBottom: 4 }}>{comment}</li>
                ))}
              </ul>
            ) : (
              <div style={{ fontSize: 13, color: "#9ca3af" }}>-</div>
            )}
          </td>
        </tr>

        {/* ---  render paginated subtasks + their pager --- */}
        {hasSub && isOpen && (
          <>
            {/* subtask pagination row */}
            {subTotalPages > 1 && (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    padding: "4px 16px 8px 16px",
                    fontSize: 11,
                    color: "#6b7280",
                    background: "#f9fafb",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div style={{marginLeft: indent}}>
                      Subtasks:{" "}
                      <strong>
                        {subStartIndex + 1}–
                        {Math.min(subEndIndex, task.subtasks!.length)}
                      </strong>{" "}
                      of <strong>{task.subtasks!.length}</strong>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() =>
                          handleSubtaskPageChange(subCurrentPage - 1)
                        }
                        disabled={subCurrentPage === 1}
                        style={{
                          padding: "2px 8px",
                          borderRadius: 999,
                          border: "1px solid #e5e7eb",
                          background:
                            subCurrentPage === 1 ? "#f3f4f6" : "#ffffff",
                          color:
                            subCurrentPage === 1 ? "#9ca3af" : "#111827",
                          cursor:
                            subCurrentPage === 1 ? "default" : "pointer",
                        }}
                      >
                        Prev
                      </button>
                      <button
                        onClick={() =>
                          handleSubtaskPageChange(subCurrentPage + 1)
                        }
                        disabled={subCurrentPage === subTotalPages}
                        style={{
                          padding: "2px 8px",
                          borderRadius: 999,
                          border: "1px solid #e5e7eb",
                          background:
                            subCurrentPage === subTotalPages
                              ? "#f3f4f6"
                              : "#ffffff",
                          color:
                            subCurrentPage === subTotalPages
                              ? "#9ca3af"
                              : "#111827",
                          cursor:
                            subCurrentPage === subTotalPages
                              ? "default"
                              : "pointer",
                        }}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            )}
            {visibleSubtasks.map((st) => (
              <React.Fragment key={st.id}>
                {renderTaskRows(st, depth + 1)}
              </React.Fragment>
            ))}
          </>
        )}

      </React.Fragment>
    );
  };


  if (loading && teams.length === 0) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "1.25rem", color: "#6b7280" }}>Loading ClickUp data...</p>
        </div>
      </div>
    );
  }

  if (error && teams.length === 0) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", padding: 20 }}>
        <div style={{ maxWidth: "28rem", width: "100%", padding: "1.5rem", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "0.5rem" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#dc2626", marginBottom: "1rem" }}>Error Loading Data</h2>
          <p style={{ color: "#dc2626", marginBottom: "1rem" }}>{error}</p>
          <button
            onClick={fetchTeams}
            style={{ width: "100%", padding: "0.5rem 1rem", background: "#dc2626", color: "#fff", borderRadius: "0.5rem", border: "none", cursor: "pointer" }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, fontFamily: "Inter, system-ui, -apple-system, sans-serif", background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <h1 style={{ margin: 0, fontSize: 20, color: "#0f172a" }}>Tasks</h1>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {!apiToken && (
            <input
              type="password"
              placeholder="Enter ClickUp API Token"
              value={localApiToken}
              onChange={(e) => setLocalApiToken(e.target.value)}
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
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
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

      {!loading && convertedTasks.length === 0 && apiToken && selectedTeam && (
        <div style={{ textAlign: "center", padding: 40, color: "#6b7280" }}>
          No tasks found for this team.
        </div>
      )}

      {!loading && (
        <div style={{ display: "grid", gap: 12 }}>
          {grouped.map(([status, tasks]) => {
            const total = countWithSubtasks(tasks);

            // compute pages
            const totalPages = Math.max(1, Math.ceil(tasks.length / ITEMS_PER_PAGE));
            const rawPage = pageByStatus[status] ?? 1;
            const currentPage = Math.min(rawPage, totalPages); // clamp

            const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
            const endIndex = startIndex + ITEMS_PER_PAGE;
            const visibleTasks = tasks.slice(startIndex, endIndex);

            const handlePageChange = (newPage: number) => {
              setPageByStatus((prev) => ({
                ...prev,
                [status]: newPage,
              }));
            };

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


                  <div className="flex items-center gap-4">
                    {totalPages > 1 && (
                      <div style={{ fontSize: 12, color: "#6b7280" }}>
                        Page {currentPage} of {totalPages}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        style={{
                          padding: "4px 10px",
                          borderRadius: 999,
                          border: "1px solid #e5e7eb",
                          background: currentPage === 1 ? "#f9fafb" : "#ffffff",
                          color: currentPage === 1 ? "#9ca3af" : "#111827",
                          cursor: currentPage === 1 ? "default" : "pointer",
                          fontSize: 12,
                        }}
                      >
                        Prev
                      </button>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        style={{
                          padding: "4px 10px",
                          borderRadius: 999,
                          border: "1px solid #e5e7eb",
                          background:
                            currentPage === totalPages ? "#f9fafb" : "#ffffff",
                          color:
                            currentPage === totalPages ? "#9ca3af" : "#111827",
                          cursor: currentPage === totalPages ? "default" : "pointer",
                          fontSize: 12,
                        }}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>



                <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                  <thead>
                    <tr style={{ textAlign: "left", fontSize: 13, color: "#6b7280", borderTop: "1px solid #f3f4f6" }}>
                      <th style={{ padding: "10px 12px", width: COL_WIDTHS.nameCalc }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 20 }} />
                          <div>
                            {/* LayoutList (Name) Icon */}
                            <LayoutList className="mr-1 inline-block h-5 w-5 align-middle" />
                            Name
                          </div>
                        </div>
                      </th>
                      <th style={{ padding: "10px 12px", width: COL_WIDTHS.assignee }}>
                        {/* User Icon */}
                        <User className="mr-1 inline-block h-5 w-5 align-middle" />
                        Assignee
                      </th>
                      <th style={{ padding: "10px 12px", width: COL_WIDTHS.dueDate }}>
                        {/* Calendar (Due) Icon */}
                        <Calendar className="mr-1 inline-block h-5 w-5 align-middle" />
                        Due
                      </th>
                      <th style={{ padding: "10px 12px", width: COL_WIDTHS.timeRemaining }}>
                        {/* Clapperboard (Time Remaining) Icon */}
                        <Clapperboard className="mr-1 inline-block h-5 w-5 align-middle" />
                        Time Remaining
                      </th>
                      <th style={{ padding: "10px 12px", width: COL_WIDTHS.priority }}>
                        {/* List Filter (Priority) List Filter Icon */}
                        <ListFilter className="mr-1 inline-block h-5 w-5 align-middle" />
                        Priority
                      </th>
                      <th style={{ padding: "10px 12px", width: COL_WIDTHS.status }}>
                        {/* Target(Status) Icon */}
                        <Target className="mr-1 inline-block h-5 w-5 align-middle" />
                        Status
                      </th>
                      <th style={{ padding: "10px 12px", width: COL_WIDTHS.comments, paddingLeft: "0px" }}>
                        {/* Comments Icon */}
                        <MessagesSquare className="mr-1 inline-block h-5 w-5 align-middle" />
                        Comments
                      </th>
                    </tr>
                  </thead>
                  <tbody>{visibleTasks.map((t) => <React.Fragment key={t.id}>{renderTaskRows(t, 0)}</React.Fragment>)}</tbody>
                </table>

                {/* Pagination controls for this status */}
                {totalPages > 1 && (
                  <div /* pagination bar */
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 16px 12px 16px",
                      borderTop: "1px solid #f3f4f6",
                      fontSize: 12,
                      color: "#6b7280",
                    }}
                  >
                    <div>
                      Showing{" "}
                      <strong>
                        {startIndex + 1}–
                        {Math.min(endIndex, tasks.length)}
                      </strong>{" "}
                      of <strong>{tasks.length}</strong> tasks
                    </div>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};
