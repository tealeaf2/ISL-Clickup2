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
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return d;
    return dt.toLocaleDateString();
  } catch {
    return d;
  }
}

/** Visual/spacing constants */
const COL_WIDTHS = {
  assignee: 160,
  dueDate: 120,
  priority: 100,
  status: 120,
  nameCalc: `calc(100% - ${160 + 120 + 100 + 120}px)`,
};

/** status -> colors reminiscent of ClickUp */
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Todo: { bg: "#f3f0ff", text: "#6b46ff" },
  "In Progress": { bg: "#fff7ed", text: "#ff7a00" },
  Review: { bg: "#eff6ff", text: "#1e40af" },
  Complete: { bg: "#ecfdf5", text: "#059669" },
  Unknown: { bg: "#f1f5f9", text: "#374151" },
};

/** small avatar with initials */
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

export default function TaskPage() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setExpanded((s) => ({ ...s, [id]: !s[id] }));

  // group & sort
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
            background: depth % 2 === 1 ? "#ffffff" : "#ffffff",
            transition: "background .12s ease",
          }}
          className="task-row"
        >
          {/* NAME column: collapse icon + task name (avatar removed from here) */}
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
                background: (task.priority === "High" && "#fff1f2") || (task.priority === "Low" && "#f0fdf4") || "#f3f4f6",
                color: task.priority === "High" ? "#b91c1c" : task.priority === "Low" ? "#059669" : "#374151",
                fontWeight: 600,
              }}
            >
              {task.priority ?? "—"}
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
          <button
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              background: "transparent",
              border: "1px solid transparent",
              color: "#6b46ff",
              fontWeight: 700,
            }}
          >
            Filters
          </button>
        </div>
      </div>

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
                    {/* Name header now includes spacer so it lines up with the actual row names */}
                    <th style={{ padding: "10px 12px", width: COL_WIDTHS.nameCalc }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 20 }} /> {/* spacer matching collapse icon */}
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
    </div>
  );
}
