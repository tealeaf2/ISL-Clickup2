import React from 'react';

const DependencyGraphPlaceholder: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Dependency Graph
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            This is a placeholder for the dependency graph visualization feature.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              <strong>Note:</strong> The full dependency graph functionality from the Dependency-Graph project 
              can be integrated here by copying the complete feature set.
            </p>
          </div>
          <div className="mt-6 text-sm text-gray-500">
            <p>Features that would be available:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Interactive task dependency visualization</li>
              <li>Drag-and-drop task management</li>
              <li>Task relationship mapping</li>
              <li>Status propagation</li>
              <li>Timeline view with Gantt-style layout</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DependencyGraphPlaceholder;
