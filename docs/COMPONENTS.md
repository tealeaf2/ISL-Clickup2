# Component Documentation

This document provides detailed information about all components in the application.

## Component Hierarchy

```
App
├── Navigation
└── [Conditional Render]
    ├── TaskTable
    │   └── TaskCard (multiple)
    └── TaskDependencyMapContainer
        └── TaskDependencyMap
            ├── ControlPanel
            ├── DependencyCanvas
            │   └── TaskBar (multiple)
            ├── AddTaskButton
            ├── TaskDetails (conditional)
            ├── TaskEditModal (conditional)
            └── AddTaskModal (conditional)
```

## Core Components

### App

**Location:** `src/App.tsx`

**Type:** Functional Component (TypeScript)

**Purpose:** Root application component that manages global state and routing.

**Props:** None

**State:**
- `currentPage: string` - Current active view ('home' | 'dependency-graph')
- `clickUpTasks: ClickUpTask[]` - Tasks fetched from ClickUp

**Key Methods:**
- `handleNavigate(page: string)` - Switch between views
- `handleTasksUpdate(tasks: ClickUpTask[])` - Callback when tasks are loaded

**Renders:**
- Navigation component
- TaskTable (home view)
- TaskDependencyMapContainer (dependency-graph view)

---

### Navigation

**Location:** `src/components/Navigation.tsx`

**Type:** Functional Component (TypeScript)

**Purpose:** Top navigation bar for switching between views.

**Props:**
```typescript
interface NavigationProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}
```

**Features:**
- Visual indication of active page
- Hover states for better UX
- Responsive design

**Usage:**
```tsx
<Navigation 
  onNavigate={handleNavigate} 
  currentPage={currentPage} 
/>
```

---

### TaskTable

**Location:** `src/shared/components/TaskTable.tsx`

**Type:** Functional Component (TypeScript)

**Purpose:** Dashboard view for browsing and managing ClickUp tasks.

**Props:**
```typescript
interface TaskTableProps {
  apiToken?: string;
  userEmail?: string;
  onTasksUpdate?: (tasks: any[]) => void;
}
```

**State Management:**
- Uses `useClickUp` hook for API integration
- Manages selected team state

**Features:**
- Team selection dropdown
- Statistics cards (Total, My Tasks, Completed, Overdue)
- Filtered task views
- Loading and error states
- Refresh functionality

**Displays:**
1. **Statistics Dashboard**: Overview cards
2. **My Tasks Section**: Tasks assigned to current user
3. **Overdue Tasks Section**: Tasks past due date
4. **All Tasks Section**: Complete task list

**Loading State:**
Shows spinner and loading message while fetching initial data.

**Error State:**
Displays error message with retry button.

**Usage:**
```tsx
<TaskTable 
  apiToken="pk_..."
  userEmail="user@example.com"
  onTasksUpdate={(tasks) => setTasks(tasks)}
/>
```

---

### TaskCard

**Location:** `src/shared/components/TaskCard.tsx`

**Type:** Functional Component (TypeScript)

**Purpose:** Displays individual task information in a card format.

**Props:**
```typescript
interface TaskCardProps {
  task: ClickUpTask;
  highlight?: boolean;
}
```

**Displays:**
- Task name
- Status badge
- Assignees
- Due date
- Priority
- Description preview

**Styling:**
- Card-based layout with shadow
- Highlight option for emphasis (e.g., "My Tasks")
- Color-coded status indicators

---

## Dependency Graph Components

### TaskDependencyMapContainer

**Location:** `src/features/task-dependency-map/components/TaskDependencyMapContainer.tsx`

**Type:** Functional Component (TypeScript) - Container Component

**Purpose:** Stateful container that manages all state and business logic for the dependency graph.

**Props:**
```typescript
interface Props {
  clickUpTasks?: any[];
}
```

**Key Responsibilities:**
1. Converts ClickUp tasks to graph format using actual API dates
2. Manages task state and relationships (read-only)
3. Manages pan/zoom state
4. Handles modal states (TaskDetails for viewing)
5. **Note**: CRUD operations removed - application is read-only
6. **Note**: Status propagation disabled - tasks displayed as-is from API

**State Managed:**
- Task data and relationships
- Selected task and viewing state
- Pan and zoom transforms
- Modal visibility (TaskDetails modal)
- **Note**: Task draft removed - read-only mode

**Custom Hooks Used:**
- `useTaskData` - Task data structure
- `usePanZoom` - Viewport navigation
- `useTaskSelection` - Selection state
- `useTaskRelationships` - Relationship logic

**Key Methods:**
- `convertClickUpTasksToGraphTasks()` - Transforms ClickUp format to graph format using actual API dates
- `handleOptionsChange()` - Updates display options
- **Note**: CRUD methods removed (saveDraft, deleteTask, addNewTask) - read-only mode
- **Placeholder handlers**: `handleTaskUpdate`, `handleTaskStatusUpdate`, `handleTaskDateUpdate` exist but not connected

**Empty State:**
Shows message when no tasks are available.

---

### TaskDependencyMap

**Location:** `src/features/task-dependency-map/TaskDependencyMap.jsx`

**Type:** Functional Component (JavaScript) - Presentational Component

**Purpose:** Stateless component that renders the dependency graph UI.

**Props:** All props are passed from container (see container for full list)

**Key Props:**
- **Data:** `tasks`, `dependencies`, `selectedId`, `options`, etc.
- **Callbacks:** `onTaskClick`, `onSave`, `onDelete`, `onZoomIn`, etc.

**Architecture:**
Follows "data down, events up" pattern - receives all data and handlers as props.

**Renders:**
- ControlPanel (zoom/pan controls)
- DependencyCanvas (main graph visualization)
- TaskDetails (read-only task information modal)
- **Note**: TaskEditModal, AddTaskModal, AddTaskButton removed (read-only mode)

---

### DependencyCanvas

**Location:** `src/features/task-dependency-map/components/DependencyCanvas.tsx`

**Type:** Functional Component

**Purpose:** Renders the Gantt-style timeline visualization.

**Props:**
```typescript
{
  tasks: Task[];
  dependencies: Dependency[];
  selectedId: string | null;
  maxDay: number;
  maxLane: number;
  contentWidth: number;
  contentHeight: number;
  pan: { x: number; y: number };
  scale: number;
  onTaskPointerDown: (e, task, offset) => void;
  onTaskPointerMove: (e) => void;
  onTaskPointerUp: () => void;
  getBlockers: (task: Task) => TaskBlocker[];
  owners: string[];
  startDate: Date;
}
```

**Features:**
- Timeline grid with day markers (highlights "today" line)
- Owner lanes (rows) with large, readable labels (250px left area)
- Task bars positioned by actual API dates (supports overdue tasks)
- Dependency arrows (parent to child connections)
- Selection highlighting
- **Note**: Drag interaction removed (read-only mode)

**Rendering:**
Uses SVG for scalable graphics. Tasks are rendered as `TaskBar` components.

---

### TaskBar

**Location:** `src/features/task-dependency-map/components/TaskBar.tsx`

**Type:** Functional Component

**Purpose:** Individual task bar in the timeline.

**Props:**
```typescript
{
  task: Task;
  isSelected: boolean;
  blockers: TaskBlocker[];
  onClick: (e, task, position) => void;  // Changed from pointer events to click
  // Note: Drag functionality removed (read-only mode)
}
```

**Current Behavior:**
- Click task to open read-only TaskDetails modal
- No drag functionality (removed for read-only mode)

**Visual Features:**
- Width based on duration (matches actual date range from API)
- Position based on start day (from API start_date, can be negative for overdue)
- Color by status:
  - `todo`: Gray
  - `in-progress`: Blue
  - `blocked`: Red
  - **Note**: 'done' status removed - ClickUp removes completed tasks
- Selection border
- Blocker badges for blocked child tasks

---

### ControlPanel

**Location:** `src/features/task-dependency-map/components/ControlPanel.tsx`

**Type:** Functional Component

**Purpose:** Controls for zooming and panning the graph.

**Props:**
```typescript
{
  options: TaskOptions;
  onOptionsChange: (options: TaskOptions) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onFitToView: () => void;
}
```

**Controls:**
- Zoom In button
- Zoom Out button
- Reset View button
- Fit to View button
- Options toggle (future)

---

### TaskDetails

**Location:** `src/features/task-dependency-map/components/TaskDetails.tsx`

**Type:** Functional Component

**Purpose:** Modal displaying task information.

**Props:**
```typescript
{
  task: Task;
  blockers: TaskBlocker[];
  onClose: () => void;
  onEdit: () => void;
  position: { x: number; y: number };
  containerRect?: DOMRect;
}
```

**Displays:**
- Task name
- Status
- Owner
- Priority
- Start date
- Duration
- Blockers (if any)
- Edit button
- Close button

**Positioning:**
Modal appears near click position, adjusted to stay within viewport.

---

### TaskEditModal

**Location:** `src/features/task-dependency-map/components/TaskEditModal.tsx`

**Type:** Functional Component

**Purpose:** Form for editing task properties.

**Props:**
```typescript
{
  isOpen: boolean;
  task: Task | null;
  draft: TaskDraft;
  onClose: () => void;
  onSave: () => void;
  onDelete: () => void;
  onDraftChange: (draft: TaskDraft) => void;
}
```

**Editable Fields:**
- Name (text input)
- Owner (dropdown)
- Status (dropdown: todo, in-progress, done, blocked)
- Priority (dropdown: urgent, high, normal, low, none)
- Start Day (number input)
- Duration (number input)
- Parent Task (dropdown)

**Actions:**
- Save changes
- Delete task (with confirmation)
- Cancel/Close

**Validation:**
- Name required
- Duration must be > 0
- Start day must be >= 0

---

### AddTaskModal

**Location:** `src/features/task-dependency-map/components/AddTaskModal.tsx`

**Type:** Functional Component

**Purpose:** Form for creating new tasks.

**Props:**
```typescript
{
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  draft: TaskDraft;
  onDraftChange: (draft: TaskDraft) => void;
}
```

**Fields:**
Same as TaskEditModal, but for new tasks.

**Auto-generated:**
- Task ID (auto-generated unique ID)

---

### AddTaskButton

**Location:** `src/features/task-dependency-map/components/AddTaskButton.tsx`

**Type:** Functional Component

**Purpose:** Floating action button to open add task modal.

**Props:**
```typescript
{
  onClick: () => void;
}
```

**Styling:**
- Fixed position (bottom-right)
- Circular button with plus icon
- Shadow for depth

---

## Shared Components

### StatusBadge

**Location:** `src/shared/components/StatusBadge.tsx`

**Purpose:** Visual indicator for task status.

**Props:**
```typescript
{
  status: 'todo' | 'in-progress' | 'done' | 'blocked';
}
```

**Visual:**
- Color-coded badge
- Text label
- Optional icon

---

### Modal

**Location:** `src/shared/components/Modal.jsx`

**Purpose:** Reusable modal wrapper.

**Props:**
```typescript
{
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}
```

**Features:**
- Overlay backdrop
- Centered content
- Close on backdrop click
- Close on Escape key
- Animation transitions

---

### InputRow

**Location:** `src/shared/components/InputRow.jsx`

**Purpose:** Standardized form input row.

**Props:**
```typescript
{
  label: string;
  children: ReactNode;
  error?: string;
}
```

**Layout:**
- Label on left
- Input on right
- Error message below (if provided)

---

### ErrorBoundary

**Location:** `src/shared/components/ErrorBoundary.jsx`

**Purpose:** Catches React errors and displays fallback UI.

**Usage:**
Wrap components that might throw errors:

```tsx
<ErrorBoundary>
  <TaskDependencyMapContainer />
</ErrorBoundary>
```

---

## Component Patterns

### Container/Presentational Pattern

The application uses the Container/Presentational pattern:

- **Container Components** (e.g., `TaskDependencyMapContainer`):
  - Manage state
  - Handle business logic
  - Pass data and callbacks to presentational components

- **Presentational Components** (e.g., `TaskDependencyMap`):
  - Receive props
  - Render UI
  - Emit events via callbacks
  - No internal state (or minimal UI state)

### Data Flow

```
User Interaction
  ↓
Presentational Component (event handler)
  ↓
Callback to Container Component
  ↓
State Update in Container
  ↓
Custom Hook Processing
  ↓
State Propagates Down
  ↓
UI Re-renders
```

### Composition

Components are composed rather than nested deeply:
- Small, focused components
- Composed into larger features
- Reusable shared components

