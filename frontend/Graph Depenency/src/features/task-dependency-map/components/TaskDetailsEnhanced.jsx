import React, { useState } from 'react';
import StatusBadge from '../../../shared/components/StatusBadge';
import { daysSince } from '../../../shared/utils';

/**
 * Enhanced task details modal with dependency analysis and time tracking
 */
const TaskDetailsEnhanced = ({ 
  task, 
  blockers, 
  onClose, 
  onEdit,
  position = { x: 0, y: 0 },
  containerRect = null,
  timeEntries = [],
  riskAnalysis = null
}) => {
  const [activeTab, setActiveTab] = useState('details');

  if (!task) return null;

  // Calculate modal position relative to the task
  const modalWidth = 400;
  const modalHeight = 500;
  const padding = 10;

  // Get container dimensions
  const containerWidth = containerRect?.width || window.innerWidth;
  const containerHeight = containerRect?.height || window.innerHeight;

  // Calculate position to show modal next to task
  let modalX = position.x + padding;
  let modalY = position.y - modalHeight / 2;

  // Adjust if modal goes off screen
  if (modalX + modalWidth > containerWidth) {
    modalX = position.x - modalWidth - padding;
  }
  if (modalY < 0) {
    modalY = padding;
  }
  if (modalY + modalHeight > containerHeight) {
    modalY = containerHeight - modalHeight - padding;
  }

  const taskTimeEntries = timeEntries.filter(entry => entry.taskId === task.id);
  const totalLoggedTime = taskTimeEntries.reduce((sum, entry) => sum + entry.hours, 0);

  return (
    <div 
      className="absolute bg-white border-2 border-blue-500 rounded-xl shadow-lg z-50"
      style={{
        width: `${modalWidth}px`,
        height: `${modalHeight}px`,
        left: `${modalX}px`,
        top: `${modalY}px`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="font-semibold">Task {task.id}</div>
        <button className="text-xs underline hover:text-gray-600" onClick={onClose}>
          Close
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b">
        {['details', 'risks', 'time'].map(tab => (
          <button
            key={tab}
            className={`px-3 py-2 text-sm font-medium capitalize ${
              activeTab === tab 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-3 overflow-y-auto" style={{ height: `${modalHeight - 100}px` }}>
        {activeTab === 'details' && (
          <div className="space-y-3">
            <div className="text-sm text-gray-600">{task.name}</div>
            
            <div className="flex items-center gap-2">
              <StatusBadge status={task.status} />
              <div className="text-xs text-gray-500">Owner: {task.owner || 'Unassigned'}</div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>Start: <span className="font-mono">Day {task.start}</span></div>
              <div>Duration: <span className="font-mono">{task.duration}d</span></div>
              <div>Lane: <span className="font-mono">{task.lane}</span></div>
              <div>Parent: <span className="font-mono">{task.parentId || '—'}</span></div>
              <div className="col-span-2">Depends: <span className="font-mono">{(task.depends||[]).join(', ') || '—'}</span></div>
            </div>

            {/* Time Tracking Summary */}
            {task.estimatedHours && (
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-xs font-semibold mb-1">Time Tracking</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>Estimated: <span className="font-mono">{task.estimatedHours}h</span></div>
                  <div>Logged: <span className="font-mono">{totalLoggedTime}h</span></div>
                  <div className="col-span-2">
                    Variance: <span className={`font-mono ${totalLoggedTime > task.estimatedHours ? 'text-red-600' : 'text-green-600'}`}>
                      {((totalLoggedTime - task.estimatedHours) / task.estimatedHours * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Blockers */}
            <div>
              <div className="text-xs font-semibold mb-1">Blockers</div>
              {blockers.length === 0 ? (
                <div className="text-xs text-gray-500">No active blockers</div>
              ) : (
                <ul className="space-y-1 max-h-24 overflow-auto pr-1">
                  {blockers.map((blocker, i) => (
                    <li key={i} className="text-xs bg-red-50 border border-red-100 rounded-md p-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{blocker.by}</span>
                        {blocker.type === "dependency" && <span className="ml-2 text-[10px] text-red-700">(dep)</span>}
                      </div>
                      <div className="text-[11px] text-gray-600">Owner: {blocker.owner || '—'}</div>
                      <div className="text-[11px] text-gray-600">{blocker.since ? `${daysSince(blocker.since)}d blocked` : 'since unknown'}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button 
                className="px-3 py-1 rounded-lg border shadow-sm" 
                onClick={onEdit}
              >
                Edit Task
              </button>
              <button 
                className="px-3 py-1 rounded-lg border shadow-sm" 
                onClick={onClose}
              >
                Done
              </button>
            </div>
          </div>
        )}

        {activeTab === 'risks' && riskAnalysis && (
          <div className="space-y-3">
            <div className="text-sm font-semibold">Risk Analysis</div>
            
            {/* Risk Level */}
            <div className={`p-2 rounded ${
              riskAnalysis.severity === 'high' ? 'bg-red-50 border border-red-200' :
              riskAnalysis.severity === 'medium' ? 'bg-yellow-50 border border-yellow-200' :
              'bg-green-50 border border-green-200'
            }`}>
              <div className="text-xs font-semibold">Risk Level: {riskAnalysis.severity}</div>
              <div className="text-xs text-gray-600">{riskAnalysis.reason}</div>
            </div>

            {/* Recommendations */}
            {riskAnalysis.recommendations && riskAnalysis.recommendations.length > 0 && (
              <div>
                <div className="text-xs font-semibold mb-1">Recommendations</div>
                <ul className="space-y-1">
                  {riskAnalysis.recommendations.map((rec, i) => (
                    <li key={i} className="text-xs bg-blue-50 border border-blue-100 rounded p-1">
                      <div className="font-medium">{rec.action}</div>
                      <div className="text-gray-600">{rec.reason}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === 'time' && (
          <div className="space-y-3">
            <div className="text-sm font-semibold">Time Entries</div>
            
            {taskTimeEntries.length === 0 ? (
              <div className="text-xs text-gray-500">No time entries logged</div>
            ) : (
              <div className="space-y-1 max-h-32 overflow-auto">
                {taskTimeEntries.map(entry => (
                  <div key={entry.id} className="text-xs bg-gray-50 border rounded p-1">
                    <div className="flex justify-between">
                      <span className="font-medium">{entry.hours}h</span>
                      <span className="text-gray-500">{new Date(entry.date).toLocaleDateString()}</span>
                    </div>
                    {entry.description && (
                      <div className="text-gray-600">{entry.description}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetailsEnhanced;


