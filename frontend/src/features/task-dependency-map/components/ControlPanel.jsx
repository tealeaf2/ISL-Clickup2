/**
 * ControlPanel Component
 * * Adds a 'Group By' selector to organize lanes by different variables.
 */
import React from 'react';
import { Activity } from 'lucide-react';

const ControlPanel = ({ 
  onZoomIn, 
  onZoomOut, 
  onFitToView,
  groupBy,        
  setGroupBy,
  showBlastRadius,
  setShowBlastRadius,      
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

      <div>
        <button
          onClick={() => setShowBlastRadius(!showBlastRadius)}
          className={`flex items-center gap-2 px-3 py-1 rounded-md border text-sm transition-colors ${
            showBlastRadius 
              ? 'bg-red-50 border-red-200 text-red-700 font-medium' 
              : 'bg-white hover:bg-gray-50 text-gray-600'
          }`}
        >
          <Activity size={14} className={showBlastRadius ? "text-red-600" : "text-gray-400"} />
          <span>Blast Radius</span>
          <div className={`w-8 h-4 rounded-full relative transition-colors ${showBlastRadius ? 'bg-red-500' : 'bg-gray-300'}`}>
            <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${showBlastRadius ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
        </button>
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