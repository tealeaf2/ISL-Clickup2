// frontend/src/Homepage.tsx
import React, { useMemo, useState } from "react";

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
    assignee: "Edward",
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
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return d;
    return dt.toLocaleDateString();
  } catch {
    return d;
  }
}

/**
 * Column sizing strategy:
 * - Give fixed pixel widths to the narrower columns so that every group's table
 *   uses the same column sizing and alignment.
 * - Name column uses the remaining width via calc(100% - fixedSum).
 *
 * Fixed widths:
 *   Assignee: 160
 *   Due Date: 140
 *   Priority: 120
 *   Status:   120
 * Fixed sum = 540px
 */
const COL_WIDTHS = {
  assignee: 160,
  dueDate: 140,
  priority: 120,
  status: 120,
  // name will be calc
  nameCalc: `calc(100% - ${160 + 140 + 120 + 120}px)`,
};

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

export default function TaskPage() {
  // expanded state for collapsible subtasks
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => setExpanded((s) => ({ ...s, [id]: !s[id] }));

  // group tasks by status (undefined status -> "Unknown")
  const grouped = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of TASKS) {
      const status = t.status ?? "Unknown";
      if (!map.has(status)) map.set(status, []);
      map.get(status)!.push(t);
    }
    const preferredOrder = ["Todo", "In Progress", "Review", "Complete"];
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

    // sort tasks and subtasks recursively
    const groupedSorted = sortedKeys.map((k) => {
      const arr = map.get(k)!.slice().map((t) => {
        const clone: Task = { ...t };
        if (clone.subtasks) {
          clone.subtasks = sortTasksByDueDateAndName(clone.subtasks).map((st) => {
            const deep = { ...st };
            if (deep.subtasks) deep.subtasks = sortTasksByDueDateAndName(deep.subtasks);
            return deep;
          });
        }
        return clone;
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
  }, []);

  // recursive renderer for a task + its subtasks (collapsible)
  const renderTaskRows = (task: Task, depth = 0): React.ReactNode => {
    const hasSub = !!(task.subtasks && task.subtasks.length);
    const isOpen = !!expanded[task.id];
    const indent = Math.min(depth * 16, 56);

    return (
      <React.Fragment key={task.id}>
        <tr style={{ borderTop: "1px solid #fafafa" }}>
          <td style={{ padding: "12px 16px", width: COL_WIDTHS.nameCalc }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  marginLeft: indent,
                  width: 18,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: hasSub ? "pointer" : undefined,
                }}
                onClick={() => hasSub && toggle(task.id)}
                aria-hidden={!hasSub}
              >
                {hasSub ? <span style={{ userSelect: "none", fontSize: 12 }}>{isOpen ? "▾" : "▸"}</span> : <span style={{ width: 12 }} />}
              </div>

              <div style={{ fontWeight: 600, overflowWrap: "anywhere" }}>{task.name}</div>
            </div>
          </td>

          <td style={{ padding: "12px 16px", width: COL_WIDTHS.assignee }}>{task.assignee ?? "-"}</td>
          <td style={{ padding: "12px 16px", width: COL_WIDTHS.dueDate }}>{formatDate(task.dueDate)}</td>
          <td style={{ padding: "12px 16px", width: COL_WIDTHS.priority }}>{task.priority ?? "-"}</td>
          <td style={{ padding: "12px 16px", width: COL_WIDTHS.status }}>{task.status ?? "-"}</td>
          <td style={{ padding: "12px 16px" }}>{task.comments ?? "-"}</td>
        </tr>

        {hasSub && isOpen
          ? task.subtasks!.map((st) => (
              <React.Fragment key={st.id}>{renderTaskRows(st, depth + 1)}</React.Fragment>
            ))
          : null}
      </React.Fragment>
    );
  };

  return (
    <div style={{ padding: 24, fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>
      <h1 style={{ marginBottom: 12 }}>Tasks</h1>

      <div style={{ display: "flex", gap: 16, flexDirection: "column" }}>
        {/* Each group has its own table + header row, but column widths are fixed so they align */}
        {grouped.map(([status, tasks]) => {
          const total = countWithSubtasks(tasks);
          return (
            <section key={status} style={{ border: "1px solid #e6e6e6", borderRadius: 8, overflow: "hidden" }}>
              <div
                style={{
                  padding: "10px 16px",
                  background: "#f8fafc",
                  borderBottom: "1px solid #eee",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <strong style={{ fontSize: 16 }}>{status}</strong>
                <span style={{ fontSize: 13, color: "#6b7280" }}>
                  {tasks.length} top-level task{tasks.length !== 1 ? "s" : ""} • {total} total
                </span>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                <thead>
                  <tr style={{ textAlign: "left", fontSize: 13, color: "#374151" }}>
                    <th style={{ padding: "10px 16px", borderBottom: "1px solid #f1f5f9", width: COL_WIDTHS.nameCalc }}>Name</th>
                    <th style={{ padding: "10px 16px", borderBottom: "1px solid #f1f5f9", width: COL_WIDTHS.assignee }}>Assignee</th>
                    <th style={{ padding: "10px 16px", borderBottom: "1px solid #f1f5f9", width: COL_WIDTHS.dueDate }}>Due Date</th>
                    <th style={{ padding: "10px 16px", borderBottom: "1px solid #f1f5f9", width: COL_WIDTHS.priority }}>Priority</th>
                    <th style={{ padding: "10px 16px", borderBottom: "1px solid #f1f5f9", width: COL_WIDTHS.status }}>Status</th>
                    <th style={{ padding: "10px 16px", borderBottom: "1px solid #f1f5f9" }}>Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((t) => (
                    <React.Fragment key={t.id}>{renderTaskRows(t, 0)}</React.Fragment>
                  ))}
                </tbody>
              </table>
            </section>
          );
        })}
      </div>
    </div>
  );
}
