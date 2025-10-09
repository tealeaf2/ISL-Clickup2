import { useState } from 'react'
import Navigation from './components/Navigation'
import TaskDependencyMapContainer from './features/task-dependency-map/components/TaskDependencyMapContainer'
import { TaskTable } from './shared/components/TaskTable'
import type { ClickUpTask } from './shared/types'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [clickUpTasks, setClickUpTasks] = useState<ClickUpTask[]>([])

  const handleNavigate = (page: string) => {
    setCurrentPage(page)
  }

  // Debug: Log when tasks are updated
  const handleTasksUpdate = (tasks: ClickUpTask[]) => {
    console.log('App: Tasks updated, count:', tasks.length);
    setClickUpTasks(tasks);
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dependency-graph':
        return <TaskDependencyMapContainer clickUpTasks={clickUpTasks} />
      case 'home':
      default:
        return <TaskTable onTasksUpdate={handleTasksUpdate} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation onNavigate={handleNavigate} currentPage={currentPage} />
      <main>
        {renderPage()}
      </main>
            </div>
  )
}

export default App;