# Custom Hooks Documentation

This document describes all custom hooks used in the application. Hooks encapsulate reusable stateful logic and follow React's hook conventions.

## Table of Contents

1. [useClickUp](#useclickup)
2. [useTaskRelationships](#usetaskrelationships)
3. [usePanZoom](#usepanzoom)
4. [useTaskData](#usetaskdata)
5. [useTaskSelection](#usetaskselection)

---

## useClickUp

**Location:** `src/shared/hooks/useClickUp.ts`

**Purpose:** Manages ClickUp API integration and task fetching.

**Signature:**
```typescript
export const useClickUp = (apiToken: string) => {
  // Returns hook interface
}
```

### Parameters

- `apiToken: string` - Your ClickUp API token for authentication

### Returns

```typescript
{
  teams: Team[];
  tasks: ClickUpTask[];
  loading: boolean;
  error: string;
  fetchTeams: () => Promise<void>;
  fetchTasks: (teamId: string, params?: Record<string, string>) => Promise<void>;
  getMyTasks: (userEmail: string) => ClickUpTask[];
  getTasksByStatus: (status: string) => ClickUpTask[];
  getOverdueTasks: () => ClickUpTask[];
}
```

### State

- **teams**: Array of teams accessible to the API token
- **tasks**: Array of tasks fetched from ClickUp
- **loading**: Boolean indicating if an API request is in progress
- **error**: String containing error message (empty if no error)

### Methods

#### fetchTeams()

Fetches all teams from ClickUp API.

**Returns:** `Promise<void>`

**Side Effects:**
- Sets `loading` to `true` during request
- Updates `teams` state on success
- Sets `error` state on failure
- Sets `loading` to `false` when complete

**Example:**
```typescript
const { fetchTeams, teams, loading } = useClickUp(apiToken);

useEffect(() => {
  fetchTeams();
}, []);

if (loading) return <div>Loading teams...</div>;
```

#### fetchTasks(teamId, params?)

Fetches tasks for a specific team.

**Parameters:**
- `teamId: string` - The ID of the team to fetch tasks from
- `params?: Record<string, string>` - Optional query parameters
  - `include_closed`: Include closed tasks (default: 'false')
  - `subtasks`: Include subtasks (default: 'true')

**Returns:** `Promise<void>`

**Side Effects:**
- Sets `loading` to `true` during request
- Updates `tasks` state on success
- Sets `error` state on failure
- Sets `loading` to `false` when complete

**Example:**
```typescript
const { fetchTasks, tasks } = useClickUp(apiToken);

await fetchTasks(teamId, {
  include_closed: 'false',
  subtasks: 'true'
});
```

#### getMyTasks(userEmail)

Filters tasks by assignee email.

**Parameters:**
- `userEmail: string` - Email address of the assignee

**Returns:** `ClickUpTask[]` - Array of tasks assigned to the user

**Example:**
```typescript
const { tasks, getMyTasks } = useClickUp(apiToken);
const myTasks = getMyTasks('user@example.com');
```

#### getTasksByStatus(status)

Filters tasks by status name.

**Parameters:**
- `status: string` - Status name (case-insensitive)

**Returns:** `ClickUpTask[]` - Array of tasks with matching status

**Example:**
```typescript
const { tasks, getTasksByStatus } = useClickUp(apiToken);
const completedTasks = getTasksByStatus('complete');
```

#### getOverdueTasks()

Gets all tasks that are past their due date and not closed.

**Returns:** `ClickUpTask[]` - Array of overdue tasks

**Logic:**
- Filters tasks with `due_date` less than current time
- Excludes tasks with status type 'closed'

**Example:**
```typescript
const { getOverdueTasks } = useClickUp(apiToken);
const overdueTasks = getOverdueTasks();
```

### Complete Example

```typescript
import { useClickUp } from '@/shared/hooks/useClickUp';

function TaskDashboard() {
  const apiToken = 'pk_your_token';
  const { 
    teams, 
    tasks, 
    loading, 
    error, 
    fetchTeams, 
    fetchTasks,
    getMyTasks,
    getOverdueTasks 
  } = useClickUp(apiToken);

  const [selectedTeam, setSelectedTeam] = useState('');

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      fetchTasks(selectedTeam);
    }
  }, [selectedTeam]);

  const myTasks = getMyTasks('user@example.com');
  const overdue = getOverdueTasks();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {/* Render teams and tasks */}
    </div>
  );
}
```

---

## useTaskRelationships

**Location:** `src/shared/hooks/useTaskRelationships.ts`

**Purpose:** Manages task parent-child relationships and status propagation.

**Signature:**
```typescript
export const useTaskRelationships = (
  tasks: Task[], 
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>
) => {
  // Returns hook interface
}
```

### Parameters

- `tasks: Task[]` - Current array of tasks
- `setTasks: React.Dispatch<React.SetStateAction<Task[]>>` - State setter for tasks

### Returns

```typescript
{
  getChildren: (parentId: string, currentTasks?: Task[]) => Task[];
  getParent: (childId: string, currentTasks?: Task[]) => Task | null;
  calculateParentStatus: (children: Task[]) => TaskStatus | null;
  updateRelatedTasks: (taskId: string, currentTasks?: Task[]) => void;
  getBlockers: (task: Task) => TaskBlocker[];
}
```

### Methods

#### getChildren(parentId, currentTasks?)

Gets all children of a parent task.

**Parameters:**
- `parentId: string` - ID of the parent task
- `currentTasks?: Task[]` - Optional task array (defaults to `tasks`)

**Returns:** `Task[]` - Array of child tasks

**Example:**
```typescript
const { getChildren } = useTaskRelationships(tasks, setTasks);
const children = getChildren('parent-task-id');
```

#### getParent(childId, currentTasks?)

Gets the parent of a child task.

**Parameters:**
- `childId: string` - ID of the child task
- `currentTasks?: Task[]` - Optional task array (defaults to `tasks`)

**Returns:** `Task | null` - Parent task or null if no parent

**Example:**
```typescript
const { getParent } = useTaskRelationships(tasks, setTasks);
const parent = getParent('child-task-id');
```

#### calculateParentStatus(children)

Determines what a parent's status should be based on its children's statuses.

**Parameters:**
- `children: Task[]` - Array of child tasks

**Returns:** `TaskStatus | null` - Calculated status or null if no children

**Status Hierarchy (bottom-up):**
1. If any child is `blocked` → parent is `blocked`
2. Else if any child is `in-progress` → parent is `in-progress`
3. Else if any child is `todo` → parent is `todo`
4. Else if all children are `done` → parent is `done`
5. Otherwise → parent is `in-progress`

**Example:**
```typescript
const { getChildren, calculateParentStatus } = useTaskRelationships(tasks, setTasks);
const children = getChildren(parentId);
const newStatus = calculateParentStatus(children);
```

#### updateRelatedTasks(taskId, currentTasks?)

Updates parent task status based on children (bottom-up propagation).

**Parameters:**
- `taskId: string` - ID of the task that changed
- `currentTasks?: Task[]` - Optional task array (defaults to `tasks`)

**Side Effects:**
- Updates parent task status in state
- Recursively updates grandparent if parent status changed
- Uses debounced updates to prevent excessive re-renders

**Example:**
```typescript
const { updateRelatedTasks } = useTaskRelationships(tasks, setTasks);

// After updating a task
setTasks(prev => {
  const updated = prev.map(t => 
    t.id === taskId ? { ...t, status: 'done' } : t
  );
  updateRelatedTasks(taskId, updated);
  return updated;
});
```

#### getBlockers(task)

Gets all tasks that are blocking the given task.

**Parameters:**
- `task: Task` - The task to check blockers for

**Returns:** `TaskBlocker[]` - Array of blocker objects

**Blocker Types:**
- `child`: A child task that is blocked

**Blocker Interface:**
```typescript
interface TaskBlocker {
  by: string;        // ID of blocking task
  owner: string;     // Owner of blocking task
  type: 'child';     // Type of blocker
  since: string;     // ISO timestamp when blocked
}
```

**Example:**
```typescript
const { getBlockers } = useTaskRelationships(tasks, setTasks);
const blockers = getBlockers(task);
if (blockers.length > 0) {
  console.log('Task is blocked by:', blockers);
}
```

### Complete Example

```typescript
import { useTaskRelationships } from '@/shared/hooks/useTaskRelationships';

function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { 
    getChildren,
    getParent,
    updateRelatedTasks,
    getBlockers 
  } = useTaskRelationships(tasks, setTasks);

  const handleTaskStatusChange = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => {
      const updated = prev.map(t =>
        t.id === taskId ? { ...t, status: newStatus } : t
      );
      // Update parent based on children
      updateRelatedTasks(taskId, updated);
      return updated;
    });
  };

  const task = tasks.find(t => t.id === 'some-id');
  const blockers = task ? getBlockers(task) : [];
  const children = task ? getChildren(task.id) : [];
}
```

---

## usePanZoom

**Location:** `src/shared/hooks/usePanZoom.ts`

**Purpose:** Manages pan and zoom state for the dependency graph canvas.

**Signature:**
```typescript
export const usePanZoom = (
  contentWidth: number,
  contentHeight: number
) => {
  // Returns hook interface
}
```

### Parameters

- `contentWidth: number` - Width of the scrollable content
- `contentHeight: number` - Height of the scrollable content

### Returns

```typescript
{
  containerRef: RefObject<HTMLElement>;
  scale: number;
  pan: { x: number; y: number };
  isPanning: boolean;
  onPointerDown: (e: PointerEvent) => void;
  onPointerMove: (e: PointerEvent) => void;
  onPointerUp: (e: PointerEvent) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
  fitToView: () => void;
}
```

### State

- **containerRef**: React ref to attach to the container element
- **scale**: Current zoom level (1.0 = 100%, >1.0 = zoomed in, <1.0 = zoomed out)
- **pan**: Current pan offset `{ x: number, y: number }`
- **isPanning**: Boolean indicating if user is currently panning

### Methods

#### onPointerDown(e)

Handles pointer down event to start panning.

**Parameters:**
- `e: PointerEvent` - Pointer event

**Side Effects:**
- Sets `isPanning` to `true`
- Records initial pan position

#### onPointerMove(e)

Handles pointer move event during panning.

**Parameters:**
- `e: PointerEvent` - Pointer event

**Side Effects:**
- Updates `pan` state if `isPanning` is true

#### onPointerUp(e)

Handles pointer up event to stop panning.

**Parameters:**
- `e: PointerEvent` - Pointer event

**Side Effects:**
- Sets `isPanning` to `false`

#### zoomIn()

Increases zoom level.

**Side Effects:**
- Multiplies `scale` by zoom factor (typically 1.2)

**Constraints:**
- Maximum zoom level enforced

#### zoomOut()

Decreases zoom level.

**Side Effects:**
- Divides `scale` by zoom factor (typically 1.2)

**Constraints:**
- Minimum zoom level enforced

#### resetView()

Resets pan and zoom to initial values.

**Side Effects:**
- Sets `scale` to 1.0
- Sets `pan` to `{ x: 0, y: 0 }`

#### fitToView()

Adjusts pan and zoom to fit all content in viewport.

**Parameters:**
- Uses `contentWidth` and `contentHeight` from hook parameters

**Side Effects:**
- Calculates optimal `scale` and `pan` values
- Updates state to fit content

### Complete Example

```typescript
import { usePanZoom } from '@/shared/hooks/usePanZoom';

function Canvas() {
  const contentWidth = 2000;
  const contentHeight = 1000;
  
  const {
    containerRef,
    scale,
    pan,
    isPanning,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    zoomIn,
    zoomOut,
    resetView,
    fitToView
  } = usePanZoom(contentWidth, contentHeight);

  return (
    <div>
      <div className="controls">
        <button onClick={zoomIn}>Zoom In</button>
        <button onClick={zoomOut}>Zoom Out</button>
        <button onClick={resetView}>Reset</button>
        <button onClick={fitToView}>Fit to View</button>
      </div>
      
      <div
        ref={containerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className={isPanning ? 'cursor-grabbing' : 'cursor-grab'}
      >
        <svg
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: '0 0'
          }}
        >
          {/* Content */}
        </svg>
      </div>
    </div>
  );
}
```

---

## useTaskData

**Location:** `src/shared/hooks/useTaskData.ts`

**Purpose:** Manages task data structure and computes dependencies.

**Signature:**
```typescript
export const useTaskData = (initialTasks: Task[]) => {
  // Returns hook interface
}
```

### Parameters

- `initialTasks: Task[]` - Initial array of tasks

### Returns

```typescript
{
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  tasksById: Record<string, Task>;
  dependencies: Dependency[];
}
```

### State

- **tasks**: Current array of tasks
- **tasksById**: Lookup map of tasks by ID for O(1) access
- **dependencies**: Computed array of dependency relationships

### Computed Values

#### tasksById

A record (object) mapping task IDs to task objects. Automatically computed from `tasks`.

**Example:**
```typescript
const { tasksById } = useTaskData(tasks);
const task = tasksById['task-123']; // O(1) lookup
```

#### dependencies

Array of dependency relationships between tasks. Computed from parent-child relationships.

**Dependency Interface:**
```typescript
interface Dependency {
  from: string;  // Parent task ID
  to: string;    // Child task ID
}
```

### Example

```typescript
import { useTaskData } from '@/shared/hooks/useTaskData';

function TaskGraph() {
  const initialTasks: Task[] = [
    { id: '1', name: 'Parent', parentId: null, ... },
    { id: '2', name: 'Child', parentId: '1', ... }
  ];
  
  const { tasks, setTasks, tasksById, dependencies } = useTaskData(initialTasks);

  // Access task by ID
  const parentTask = tasksById['1'];

  // Add new task
  const addTask = (newTask: Task) => {
    setTasks(prev => [...prev, newTask]);
  };

  // Dependencies will be: [{ from: '1', to: '2' }]
}
```

---

## useTaskSelection

**Location:** `src/shared/hooks/useTaskSelection.ts`

**Purpose:** Manages task selection and editing state.

**Signature:**
```typescript
export const useTaskSelection = () => {
  // Returns hook interface
}
```

### Parameters

None

### Returns

```typescript
{
  selectedId: string | null;
  editOpen: boolean;
  draft: TaskDraft;
  modalPosition: ModalPosition;
  setSelectedId: (id: string | null) => void;
  setEditOpen: (open: boolean) => void;
  setDraft: (draft: TaskDraft) => void;
  setModalPosition: (position: ModalPosition) => void;
}
```

### State

- **selectedId**: ID of currently selected task (null if none)
- **editOpen**: Boolean indicating if edit modal is open
- **draft**: Draft state for editing task
- **modalPosition**: Screen position for modal placement

### Types

**TaskDraft:**
```typescript
interface TaskDraft {
  id: string;
  name: string;
  owner: string;
  status: TaskStatus;
  priority: TaskPriority;
  start: number;
  duration: number;
  lane: number;
  parentId: string;
}
```

**ModalPosition:**
```typescript
interface ModalPosition {
  x: number;  // Screen X coordinate
  y: number;  // Screen Y coordinate
}
```

### Example

```typescript
import { useTaskSelection } from '@/shared/hooks/useTaskSelection';

function TaskEditor() {
  const {
    selectedId,
    editOpen,
    draft,
    modalPosition,
    setSelectedId,
    setEditOpen,
    setDraft,
    setModalPosition
  } = useTaskSelection();

  const handleTaskClick = (taskId: string, clickPos: { x: number, y: number }) => {
    setSelectedId(taskId);
    setModalPosition(clickPos);
    setEditOpen(true);
    // Draft should be set from task data
  };

  const handleSave = () => {
    // Save draft...
    setEditOpen(false);
    setSelectedId(null);
  };

  return (
    <>
      {editOpen && (
        <TaskEditModal
          taskId={selectedId}
          draft={draft}
          onDraftChange={setDraft}
          onSave={handleSave}
          onClose={() => setEditOpen(false)}
        />
      )}
    </>
  );
}
```

---

## Hook Composition

Hooks can be composed together for complex functionality:

```typescript
function ComplexComponent() {
  // API integration
  const { tasks: clickUpTasks, fetchTasks } = useClickUp(apiToken);
  
  // Convert and manage tasks
  const convertedTasks = convertClickUpTasks(clickUpTasks);
  const { tasks, setTasks, tasksById } = useTaskData(convertedTasks);
  
  // Relationships
  const { updateRelatedTasks, getBlockers } = useTaskRelationships(tasks, setTasks);
  
  // Selection
  const { selectedId, editOpen, draft, setDraft } = useTaskSelection();
  
  // Viewport
  const { scale, pan, zoomIn, zoomOut } = usePanZoom(width, height);

  // Combine all functionality...
}
```

