import React from 'react';
import TaskDependencyMapContainer from './features/task-dependency-map/components/TaskDependencyMapContainer';
import ErrorBoundary from './shared/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen">
        <TaskDependencyMapContainer />
      </div>
    </ErrorBoundary>
  );
}

export default App;