/**
 * ControlPanel Component
 * * Adds a 'Group By' selector to organize lanes by different variables.
 */
import React from 'react';

const ControlPanel = ({ 
  onZoomIn, 
  onZoomOut, 
  onFitToView,
  groupBy,        
  setGroupBy      
}) => {
  return (
    <div className="p-3 flex flex-wrap items-center gap-2 border-b sticky top-0 bg-white z-10">
      <div className="flex items-center gap-2 mr-4 border-r pr-4">
        <span className="text-sm text-gray-600 font-medium">Group by:</span>
        <select 
          className="px-2 py-1 rounded-md border text-sm bg-white hover:bg-gray-50 cursor-pointer"
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value)}
        >
          <option value="assignee">Assignee</option>
          <option value="status">Status</option>
          <option value="priority">Priority</option>
        </select>
      </div>

      <div className="ml-auto flex items-center gap-2 flex-wrap">
        <button 
          className="px-3 py-1 rounded-xl border shadow-sm hover:bg-gray-50" 
          onClick={onZoomIn}
        >
          + Zoom In
        </button>
        <button 
          className="px-3 py-1 rounded-xl border shadow-sm hover:bg-gray-50" 
          onClick={onZoomOut}
        >
          − Zoom Out
        </button>
        <button 
          className="px-3 py-1 rounded-xl border shadow-sm hover:bg-gray-50" 
          onClick={onFitToView}
        >
          Fit to View
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;