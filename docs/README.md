# ISL-Clickup2 Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Getting Started](#getting-started)
4. [Features](#features)
5. [Component Documentation](#component-documentation)
6. [API Integration](#api-integration)
7. [Development Guide](#development-guide)
8. [Project Structure](#project-structure)

## Project Overview

**ISL-Clickup2** is a web application that provides visualization and management of task dependencies within ClickUp. It offers an intuitive interface for tracking relationships and progress of complex task hierarchies.

### Key Capabilities

- **Task Table View**: Browse and manage ClickUp tasks with filtering and statistics
- **Dependency Graph View**: Interactive Gantt-style visualization of task dependencies
- **Real-time Synchronization**: Connect to ClickUp API to fetch and manage tasks
- **Task Management**: Create, edit, delete, and organize tasks with parent-child relationships
- **Status Propagation**: Automatic parent task status updates based on children

### Built By

- Edward Hawkson (ehawkson@nd.edu)
- Freeman Nkouka (jnkouka@nd.edu)
- Hernan Barajas (hbarajas@nd.edu)
- Ian Setia (isetia@nd.edu)
- Khang Le (kle2@nd.edu)

### Supervised By

- Stefan Oleksiienko
- JP Burford

## Architecture

### Technology Stack

- **Frontend Framework**: React 19.1.1 with TypeScript
- **Build Tool**: Vite 7.1.2
- **Styling**: Tailwind CSS 4.1.13
- **Icons**: Lucide React
- **Containerization**: Docker & Docker Compose
- **Testing**: Vitest 3.2.4

### Design Patterns

The application follows several key design patterns:

1. **Data Down, Events Up**: Parent components manage state and pass data down to child components; child components emit events back up
2. **Container/Presentational**: Separates stateful container components (like `TaskDependencyMapContainer`) from presentational components (like `TaskDependencyMap`)
3. **Custom Hooks**: Business logic is encapsulated in reusable hooks (`useClickUp`, `useTaskRelationships`, `usePanZoom`, etc.)
4. **Component Composition**: Features are organized into feature folders with self-contained components

### Application Flow

```
User interacts with UI
  ↓
Event handlers in presentational components
  ↓
Callbacks passed from container components
  ↓
State updates in container components
  ↓
Custom hooks process business logic
  ↓
State propagates back down to UI
```

## Getting Started

### Prerequisites

- **Docker** & **Docker Compose** installed
- **Node.js** (for local development without Docker)
- **ClickUp API Token** (get from ClickUp settings)

### Installation

1. **Clone the repository**
   ```sh
   git clone https://github.com/tealeaf2/ISL-Clickup2.git
   cd ISL-Clickup2
   ```

2. **Build and start Docker container**
   ```sh
   docker compose up --build
   ```
   
   For subsequent runs:
   ```sh
   docker compose up
   ```

3. **Access the application**
   - Open your browser to `http://localhost:5173`
   - The development server will automatically reload on file changes

4. **Stop the container**
   ```sh
   docker compose down
   ```

### Local Development (without Docker)

1. **Navigate to frontend directory**
   ```sh
   cd frontend
   ```

2. **Install dependencies**
   ```sh
   npm install
   ```

3. **Start development server**
   ```sh
   npm run dev
   ```

4. **Build for production**
   ```sh
   npm run build
   ```

5. **Run tests**
   ```sh
   npm test
   ```

6. **Lint code**
   ```sh
   npm run lint
   ```

## Features

### Task Table View

The Task Table view provides a comprehensive dashboard for managing ClickUp tasks:

- **Team Selection**: Choose which ClickUp team to display tasks from
- **Statistics Dashboard**: View total tasks, your tasks, completed tasks, and overdue tasks
- **Task Filtering**: Automatically categorizes tasks by assignee and status
- **Task Cards**: Displays task details including status, assignees, due dates, and priorities
- **Refresh**: Manually refresh task data from ClickUp

### Dependency Graph View

An interactive visualization of task dependencies:

- **Timeline View**: Tasks are positioned on a calendar timeline based on start dates and durations
- **Hierarchical Organization**: Tasks are organized by owner and parent-child relationships
- **Interactive Pan & Zoom**: Navigate large graphs with pan and zoom controls
- **Task Interaction**: 
  - Click tasks to view/edit details
  - Drag tasks to reschedule them
  - Add new tasks directly from the graph
  - Delete tasks with confirmation
- **Dependency Visualization**: Visual connections show task relationships
- **Status Colors**: Visual indicators for task status (todo, in-progress, done, blocked)
- **Blocking Detection**: Highlights tasks that are blocked by their dependencies

### Task Management

- **Create Tasks**: Add new tasks with full metadata
- **Edit Tasks**: Modify task name, owner, status, priority, dates, and duration
- **Delete Tasks**: Remove tasks (cascades to children)
- **Parent-Child Relationships**: Establish hierarchical task structures
- **Status Propagation**: Parent tasks automatically update based on children's status

### ClickUp Integration

- **API Authentication**: Secure token-based authentication
- **Real-time Data**: Fetch teams, tasks, and metadata
- **Task Synchronization**: Two-way sync with ClickUp (read from ClickUp, write capabilities ready)
- **Error Handling**: Graceful error handling with user-friendly messages

## Component Documentation

### Core Components

#### `App.tsx`
Main application component that manages routing between views and task state.

**State:**
- `currentPage`: Current active view ('home' or 'dependency-graph')
- `clickUpTasks`: Array of tasks fetched from ClickUp

**Props:** None

**Key Features:**
- Navigation between Task Table and Dependency Graph views
- Passes tasks from Task Table to Dependency Graph

#### `TaskTable.tsx`
Displays ClickUp tasks in a card-based dashboard layout.

**Props:**
- `apiToken?: string` - ClickUp API token (default provided for testing)
- `userEmail?: string` - Email to filter "My Tasks"
- `onTasksUpdate?: (tasks: any[]) => void` - Callback when tasks are loaded

**Features:**
- Team selection dropdown
- Statistics cards
- Filtered task views (My Tasks, Overdue, All Tasks)
- Loading and error states

#### `TaskDependencyMapContainer.tsx`
Stateful container that manages all state for the dependency graph.

**Props:**
- `clickUpTasks?: any[]` - Array of ClickUp tasks to visualize

**Key Responsibilities:**
- Converts ClickUp tasks to graph format
- Manages task state and relationships
- Handles pan/zoom state
- Processes task CRUD operations
- Manages modal states

#### `TaskDependencyMap.jsx`
Stateless presentational component that renders the dependency graph UI.

**Props:** (All passed from container)
- Data props: `tasks`, `dependencies`, `selectedId`, `options`, etc.
- Event handlers: `onTaskClick`, `onSave`, `onDelete`, etc.

### Shared Components

#### `Navigation.tsx`
Top navigation bar with view switching.

**Props:**
- `onNavigate: (page: string) => void`
- `currentPage: string`

#### `TaskCard.tsx`
Displays individual task information in card format.

**Props:**
- `task: ClickUpTask`
- `highlight?: boolean`

#### `StatusBadge.tsx`
Visual indicator for task status.

### Feature Components

Located in `features/task-dependency-map/components/`:

- **`DependencyCanvas.tsx`**: Renders the Gantt chart with tasks and dependencies
- **`TaskBar.tsx`**: Individual task bars in the timeline
- **`ControlPanel.tsx`**: Zoom and view controls
- **`TaskDetails.tsx`**: Modal showing task information
- **`TaskEditModal.tsx`**: Form for editing task properties
- **`AddTaskModal.tsx`**: Form for creating new tasks
- **`AddTaskButton.tsx`**: Floating action button to add tasks

### Custom Hooks

#### `useClickUp.ts`
Manages ClickUp API integration.

**Parameters:**
- `apiToken: string` - ClickUp API token

**Returns:**
- `teams: Team[]` - Available teams
- `tasks: ClickUpTask[]` - Fetched tasks
- `loading: boolean` - Loading state
- `error: string` - Error message
- `fetchTeams()` - Fetch all teams
- `fetchTasks(teamId, params?)` - Fetch tasks for a team
- `getMyTasks(email)` - Filter tasks by assignee
- `getTasksByStatus(status)` - Filter tasks by status
- `getOverdueTasks()` - Get overdue tasks

#### `useTaskRelationships.ts`
Manages task parent-child relationships and status propagation.

**Parameters:**
- `tasks: Task[]`
- `setTasks: React.Dispatch<React.SetStateAction<Task[]>>`

**Returns:**
- `getChildren(parentId)` - Get all children of a task
- `getParent(childId)` - Get parent of a task
- `calculateParentStatus(children)` - Determine parent status from children
- `updateRelatedTasks(taskId)` - Update parent based on children (bottom-up)
- `getBlockers(task)` - Get tasks blocking this task

#### `usePanZoom.ts`
Manages pan and zoom state for the dependency graph.

**Parameters:**
- `contentWidth: number`
- `contentHeight: number`

**Returns:**
- `containerRef: RefObject<HTMLElement>`
- `scale: number` - Current zoom level
- `pan: { x: number, y: number }` - Current pan offset
- `isPanning: boolean`
- `onPointerDown/Move/Up` - Pointer event handlers
- `zoomIn()`, `zoomOut()`, `resetView()`, `fitToView()`

#### `useTaskData.ts`
Manages task data structure and dependencies.

**Returns:**
- `tasks: Task[]`
- `setTasks: Function`
- `tasksById: Record<string, Task>`
- `dependencies: Dependency[]`

#### `useTaskSelection.ts`
Manages task selection and editing state.

**Returns:**
- `selectedId: string | null`
- `editOpen: boolean`
- `draft: TaskDraft`
- `modalPosition: ModalPosition`
- Setter functions for all state

## API Integration

### ClickUp API

The application integrates with ClickUp's REST API v2.

**Base URL**: `https://api.clickup.com/api/v2`

**Authentication**: API token passed in `Authorization` header

**Endpoints Used:**

1. **GET /team**
   - Fetches all teams accessible to the API token
   - Response: `{ teams: Team[] }`

2. **GET /team/{teamId}/task**
   - Fetches tasks for a specific team
   - Query parameters:
     - `include_closed`: Include closed tasks (default: false)
     - `subtasks`: Include subtasks (default: true)
   - Response: `{ tasks: ClickUpTask[] }`

### Task Conversion

ClickUp tasks are converted to the internal task format:

```typescript
{
  id: string,
  name: string,
  owner: string,
  start: number,        // Days from today
  duration: number,     // Days
  lane: number,         // Vertical position (assigned by hierarchy)
  status: 'todo' | 'in-progress' | 'done' | 'blocked',
  priority: 'urgent' | 'high' | 'normal' | 'low' | 'none',
  parentId: string | null,
  lastUpdated: string
}
```

**Conversion Logic:**
- Status mapping: ClickUp status → internal status
- Priority mapping: ClickUp priority → internal priority
- Date calculation: Due date → start day relative to today
- Owner extraction: First assignee's username
- Parent relationship: Uses `parent` field from ClickUp

## Development Guide

### Code Style

- **TypeScript**: Use TypeScript for all new components
- **React Hooks**: Prefer functional components with hooks
- **Props Interface**: Define explicit prop interfaces
- **Naming**: Use PascalCase for components, camelCase for functions/variables

### Adding New Features

1. **Create feature folder** in `src/features/` if it's a major feature
2. **Use custom hooks** for business logic
3. **Separate concerns**: Container components for state, presentational for UI
4. **Type everything**: Define interfaces in `shared/types/`

### State Management

- Use React's built-in `useState` and `useEffect`
- Encapsulate complex logic in custom hooks
- Follow "data down, events up" pattern
- Avoid prop drilling with context if needed

### Testing

Tests are located in `frontend/tst/unit/`. Run with:

```sh
npm test
```

### Building for Production

```sh
npm run build
```

Output will be in `frontend/dist/` directory.

## Project Structure

```
ISL-Clickup2/
├── docker-compose.yml          # Docker Compose configuration
├── Dockerfile.dev              # Development Dockerfile
├── README.md                   # Quick start guide
├── docs/                       # Documentation (this folder)
│   └── README.md              # This file
└── frontend/
    ├── package.json           # Dependencies and scripts
    ├── vite.config.ts         # Vite configuration
    ├── tsconfig.json          # TypeScript configuration
    ├── index.html             # HTML entry point
    ├── dist/                  # Production build output
    └── src/
        ├── main.tsx           # Application entry point
        ├── App.tsx            # Root component
        ├── index.css          # Global styles
        ├── components/        # Shared UI components
        │   ├── Navigation.tsx
        │   ├── DependencyGraph.tsx
        │   └── ...
        ├── features/          # Feature modules
        │   └── task-dependency-map/
        │       ├── TaskDependencyMap.jsx
        │       └── components/
        │           ├── TaskDependencyMapContainer.tsx
        │           ├── DependencyCanvas.tsx
        │           └── ...
        └── shared/            # Shared utilities
            ├── components/    # Reusable components
            ├── hooks/         # Custom hooks
            │   ├── useClickUp.ts
            │   ├── useTaskRelationships.ts
            │   ├── usePanZoom.ts
            │   └── ...
            ├── types/         # TypeScript definitions
            │   ├── clickup.ts
            │   ├── task.ts
            │   └── index.ts
            ├── constants/     # Constants
            └── utils/         # Utility functions
        └── tst/              # Tests
            └── unit/
```

### Key Directories

- **`src/components/`**: Top-level shared components
- **`src/features/`**: Feature-specific code organized by feature
- **`src/shared/`**: Reusable code shared across features
- **`src/shared/hooks/`**: Custom React hooks
- **`src/shared/types/`**: TypeScript type definitions
- **`src/shared/components/`**: Reusable UI components
- **`src/shared/utils/`**: Utility functions

## Troubleshooting

### Common Issues

1. **Port already in use**
   - Change port in `docker-compose.yml` or kill process using port 5173

2. **ClickUp API errors**
   - Verify API token is correct
   - Check network connectivity
   - Ensure token has necessary permissions

3. **Tasks not displaying**
   - Check browser console for errors
   - Verify team is selected in Task Table view
   - Ensure tasks exist in selected ClickUp team

4. **Build errors**
   - Run `npm install` to ensure dependencies are installed
   - Check TypeScript errors with `npm run build`
   - Clear `node_modules` and reinstall if needed

## Contributing

When contributing:

1. Follow existing code patterns
2. Add TypeScript types for new code
3. Update documentation for new features
4. Test your changes thoroughly
5. Ensure linting passes: `npm run lint`



