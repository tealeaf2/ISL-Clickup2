/**
 * ControlPanel Component
 * 
 * Top control bar that provides zoom controls:
 * - Zoom in button
 * - Zoom out button
 * - Fit to view button (fits graph horizontally to container)
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onZoomIn - Callback for zoom in button
 * @param {Function} props.onZoomOut - Callback for zoom out button
 * @param {Function} props.onFitToView - Callback for fit to view button
 */
import React from 'react';

const ControlPanel = ({ 
  onZoomIn, 
  onZoomOut, 
  onFitToView
}) => {
  return (
    <div className="p-3 flex flex-wrap items-center gap-2 border-b sticky top-0 bg-white z-10">
      <div className="ml-auto flex items-center gap-2 flex-wrap">
        <button 
          className="px-3 py-1 rounded-xl border shadow-sm" 
          onClick={onZoomIn}
        >
          + Zoom In
        </button>
        <button 
          className="px-3 py-1 rounded-xl border shadow-sm" 
          onClick={onZoomOut}
        >
          − Zoom Out
        </button>
        <button 
          className="px-3 py-1 rounded-xl border shadow-sm" 
          onClick={onFitToView}
        >
          Fit to View
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;
