/**
 * ControlPanel Component
 * 
 * Top control bar that provides:
 * - Display options checkboxes (parent blocking, auto-propagation)
 * - Zoom controls (zoom in, zoom out, reset, fit to view)
 * - Status indicators (propagation status, auto-update status)
 * 
 * @param {Object} props - Component props
 * @param {Object} props.options - Current display/behavior options
 * @param {Function} props.onOptionsChange - Callback when options change
 * @param {Function} props.onZoomIn - Callback for zoom in button
 * @param {Function} props.onZoomOut - Callback for zoom out button
 * @param {Function} props.onReset - Callback for reset view button
 * @param {Function} props.onFitToView - Callback for fit to view button
 * @param {boolean} props.isPropagating - Whether status propagation is in progress
 * @param {Function} props.onTriggerPropagation - Callback to trigger propagation
 * @param {boolean} props.autoUpdateEnabled - Whether auto-update is enabled
 */
import React from 'react';

const ControlPanel = ({ 
  options, 
  onOptionsChange, 
  onZoomIn, 
  onZoomOut, 
  onReset, 
  onFitToView,
  isPropagating = false,
  onTriggerPropagation,
  autoUpdateEnabled = true
}) => {
  return (
    <div className="p-3 flex flex-wrap items-center gap-2 border-b sticky top-0 bg-white z-10">
      <div className="font-semibold">Task Dependency Map (POC)</div>
      <div className="ml-auto flex items-center gap-2 flex-wrap">
        <label className="flex items-center gap-2 text-sm mr-4">
          <input
            type="checkbox"
            className="accent-blue-600"
            checked={options.parentBlockedIfAnyChildBlocked}
            onChange={e => onOptionsChange({
              ...options,
              parentBlockedIfAnyChildBlocked: e.target.checked
            })}
          />
          Parent "Blocked" if any child blocked
        </label>
        
        <label className="flex items-center gap-2 text-sm mr-4">
          <input
            type="checkbox"
            className="accent-blue-600"
            checked={options.enableAutoPropagation}
            onChange={e => onOptionsChange({
              ...options,
              enableAutoPropagation: e.target.checked
            })}
          />
          Auto status propagation
        </label>
        
        {isPropagating && (
          <span className="text-xs text-blue-600 animate-pulse">Propagating...</span>
        )}
        {autoUpdateEnabled && (
          <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
            Auto-Update: ON
          </span>
        )}
        
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
          onClick={onReset}
        >
          Reset
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
