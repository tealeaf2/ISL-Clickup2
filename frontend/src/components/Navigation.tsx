/**
 * Navigation Component
 * 
 * Top navigation bar that allows users to switch between different views:
 * - Task Table: View for browsing and managing ClickUp tasks
 * - Graph View: Interactive dependency graph visualization
 * 
 * The component highlights the currently active page with a blue underline.
 * Navigation buttons are hidden on small screens and shown on larger screens.
 */

interface NavigationProps {
  /** Callback function called when user clicks a navigation button */
  onNavigate: (page: string) => void
  /** Currently active page identifier ('home' or 'dependency-graph') */
  currentPage: string
}

/**
 * Represents the navigation component for the application.
 * 
 * @param onNavigate - Callback function called when user clicks a navigation button
 * @param currentPage - Currently active page identifier ('home' or 'dependency-graph')
 * @returns The navigation component
 */
export default function Navigation({ onNavigate, currentPage }: NavigationProps) {
  return (
    <nav className="bg-white shadow-sm border-b">
      {/* Container with max width and responsive padding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Application title/logo */}
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">ISL Clickup</h1>
            </div>
            
            {/* Navigation buttons - hidden on mobile, visible on larger screens */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {/* Task Table navigation button */}
              <button
                onClick={() => onNavigate('home')}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  // Active state: blue underline and dark text
                  currentPage === 'home'
                    ? 'border-blue-500 text-gray-900'
                    // Inactive state: transparent border, gray text with hover effects
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Task Table
              </button>
              
              {/* Dependency Graph navigation button */}
              <button
                onClick={() => onNavigate('dependency-graph')}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  // Active state: blue underline and dark text
                  currentPage === 'dependency-graph'
                    ? 'border-blue-500 text-gray-900'
                    // Inactive state: transparent border, gray text with hover effects
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Graph View
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
