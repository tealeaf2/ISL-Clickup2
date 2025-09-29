# Task Dependency Map

A professional React application for visualizing and managing task dependencies with interactive features.

## Features

- **Interactive Task Visualization**: Drag-and-drop task scheduling with visual dependency mapping
- **Pan & Zoom**: Smooth canvas navigation with mouse wheel zoom and drag panning
- **Task Management**: Create, edit, and delete tasks with full CRUD operations
- **Dependency Tracking**: Visual connections between tasks with automatic status propagation
- **Blocker Detection**: Identify and display task blockers and dependencies
- **Real-time Updates**: Automatic parent task status updates based on children
- **Responsive Design**: Modern UI with Tailwind CSS styling

## Project Structure

```
src/
├── features/
│   └── task-dependency-map/
│       ├── components/
│       │   ├── ControlPanel.jsx
│       │   ├── DependencyCanvas.jsx
│       │   ├── TaskBar.jsx
│       │   ├── TaskDetails.jsx
│       │   └── TaskEditModal.jsx
│       └── TaskDependencyMap.jsx
├── shared/
│   ├── components/
│   │   ├── InputRow.jsx
│   │   ├── LegendItem.jsx
│   │   ├── Modal.jsx
│   │   └── StatusBadge.jsx
│   ├── constants/
│   │   └── index.js
│   ├── hooks/
│   │   ├── usePanZoom.js
│   │   ├── useTaskData.js
│   │   └── useTaskSelection.js
│   └── utils/
│       └── index.js
├── App.jsx
├── main.jsx
└── index.css
```

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## Usage

### Task Management
- Click on any task to select it and view details
- Drag tasks horizontally to reschedule them
- Use the edit button to modify task properties
- Delete tasks using the delete button in the edit modal

### Navigation
- **Zoom**: Use mouse wheel to zoom in/out
- **Pan**: Click and drag on empty canvas areas
- **Reset View**: Click "Reset" to return to default view
- **Fit to View**: Click "Fit to View" to automatically scale to fit all tasks

### Task Dependencies
- Tasks automatically show dependency relationships with arrows
- Parent tasks update their status based on children
- Blockers are highlighted with red badges showing count

## Architecture

### Feature-Oriented Structure
The application uses a feature-oriented directory structure where:
- **Features** contain complete functionality modules
- **Shared** contains reusable components, hooks, and utilities
- Each feature is self-contained with its own components

### Custom Hooks
- `useTaskData`: Manages task state and derived computations
- `usePanZoom`: Handles canvas pan and zoom functionality
- `useTaskSelection`: Manages task selection and editing state

### Component Design
- **Atomic Components**: Small, reusable UI components in shared/components
- **Feature Components**: Larger, feature-specific components in features/
- **Separation of Concerns**: Logic separated into custom hooks and utilities

## Technologies Used

- **React 18**: Modern React with hooks
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **ESLint**: Code linting and formatting

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

The project follows React best practices:
- Functional components with hooks
- Custom hooks for complex state logic
- PropTypes for type checking
- Consistent naming conventions
- Feature-oriented file organization


