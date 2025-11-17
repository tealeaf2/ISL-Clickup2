/**
 * App Component
 * 
 * Root application component that manages global state and routing between views.
 * 
 * The app has two main views:
 * - Task Table: Dashboard for browsing and managing ClickUp tasks
 * - Dependency Graph: Interactive visualization of task dependencies * 
 * This component maintains:
 * - Current page state for navigation
 * - Task data fetched from ClickUp API (passed from TaskTable to DependencyGraph)
 */

import { useState, useCallback } from 'react'
import Navigation from './components/Navigation'
import TaskDependencyMapContainer from './features/task-dependency-map/components/TaskDependencyMapContainer'
import { TaskTable } from './features/task-table/components/TaskTable'
import type { ClickUpTask } from './shared/types'

function App() {
  /** Current active page/view: 'home' (Task Table) or 'dependency-graph' */
  const [currentPage, setCurrentPage] = useState('home')
  
  /**
   * Array of tasks fetched from ClickUp API, shared between views
   * 
   * useState<ClickUpTask[]>([]) breaks down as:
   * - useState - React hook for managing state
   * - <ClickUpTask[]> - Generic type parameter (NOT a cast) that tells TypeScript
   *                    the state will be an array of ClickUpTask objects
   * - ([]) - Initial value: an empty array (this is NOT a type cast, just the starting value)
   * 
   * This is type annotation, not type casting. Type casting would look like:
   * `as ClickUpTask[]` or `<ClickUpTask[]>value` (older syntax)
   */
  const [clickUpTasks, setClickUpTasks] = useState<ClickUpTask[]>([])

  /**
   * Handles navigation between views
   * Called when user clicks a navigation button in the Navigation component
   * 
   * @param page - The page identifier to navigate to ('home' or 'dependency-graph')
   */
  const handleNavigate = (page: string) => {
    setCurrentPage(page)
  }

  /**
   * Callback function called when tasks are loaded or updated in the TaskTable
   * 
   * This allows the TaskTable component to share task data with the DependencyGraph.
   * When tasks are fetched in the TaskTable view, they're stored here and can be
   * accessed when navigating to the Dependency Graph view.
   * 
   * @param tasks - Array of tasks fetched from ClickUp API
   *                (ClickUpTask[] means an array/list of ClickUpTask objects)
   */
  const handleTasksUpdate = useCallback((tasks: ClickUpTask[]) => {
    console.log('App: Tasks updated, count:', tasks.length);
    // Update state with the new tasks array
    // setClickUpTasks is typed to accept ClickUpTask[] because useState<ClickUpTask[]>
    // was used on line 26, so TypeScript knows the setter function's type
    setClickUpTasks(tasks);
  }, [])

  /**
   * Renders the appropriate page component based on currentPage state
   * 
   * @returns The component for the current page/view
   */
  const renderPage = () => {
    switch (currentPage) {
      case 'dependency-graph':
        // Dependency Graph view - receives tasks from TaskTable
        return <TaskDependencyMapContainer clickUpTasks={clickUpTasks} />
      case 'home':
      default:
        // Task Table view - loads tasks from ClickUp and updates App state
        return <TaskTable onTasksUpdate={handleTasksUpdate} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top navigation bar for switching between views */}
      <Navigation onNavigate={handleNavigate} currentPage={currentPage} />
      
      {/* Main content area - renders the current view */}
      <main>
        {renderPage()}
      </main>
    </div>
  )
}

export default App;