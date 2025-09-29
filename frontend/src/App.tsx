import { useState } from 'react'
import Navigation from './components/Navigation'
import TaskDependencyMapContainer from './features/task-dependency-map/components/TaskDependencyMapContainer.jsx'

function App() {
  const [currentPage, setCurrentPage] = useState('home')

  const handleNavigate = (page: string) => {
    setCurrentPage(page)
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dependency-graph':
        return <TaskDependencyMapContainer />
      case 'home':
      default:
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Welcome to ISL Clickup
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                A comprehensive project management and task dependency visualization tool
              </p>
              <div className="space-y-4">
                <button
                  onClick={() => handleNavigate('dependency-graph')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Open Dependency Graph
                </button>
                <div className="text-sm text-gray-500">
                  Visualize task dependencies and manage your project workflow
                </div>
              </div>
            </div>
          </div>
        )
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

export default App
