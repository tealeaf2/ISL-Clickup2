import React from 'react';
import StatusBadge from '../../../shared/components/StatusBadge';
import { daysSince } from '../../../shared/utils';
import { Toolbar } from './Toolbar';
import {User, Target, Calendar, Clapperboard, ArrowBigUp,ArrowBigDown, Rows4, Construction} from "lucide-react"

/**
 * Task details modal component positioned next to the clicked task
 */
const TaskDetails = ({ 
  task, 
  blockers, 
  onClose, 
  onEdit,
  position = { x: 0, y: 0 },
  containerRect = null
}) => {
  if (!task) return null;

  // Simple positioning - just use the position directly
  const modalX = position.x + 20;
  const modalY = position.y - 100;

  return (
    <div 
      className="absolute w-[320px] bg-white border-2 border-blue-500 rounded-xl shadow-lg p-3 space-y-2 z-50"
      style={{
        left: `${Math.max(10, modalX)}px`,
        top: `${Math.max(10, modalY)}px`,
      }}
    >
      <div className="flex items-center justify-between">
        <div className="font-semibold">Task {task.id}</div>
        <button className="text-xs underline hover:text-gray-600" onClick={onClose}>
          Close
        </button>
      </div>
      
      <div className="text-sm text-gray-600">{task.name}</div>
      
      <div className="flex items-center gap-2">
        <Target class="h-5 w-5"/>
        <StatusBadge status={task.status} />
                <User className="h-5 w-5"/>
        <div className="text-xs text-gray-500">
          Owner: {task.owner || 'Unassigned'}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <Calendar className="mr-1 inline-block h-5 w-5 align-middle" />
          <span className="align-middle">Start: <span className="font-mono">Day {task.start}</span>
         </span>
        </div>
        <div>
          <Clapperboard className="mr-1 inline-block h-5 w-5 align-middle" />
           <span className="align-middle">Duration: <span className="font-mono">{task.duration}</span>
            </span>
        </div>
        <div>
          <Rows4 class="mr-1 inline-block h-5 w-5 align-middle"/>
           <span className="align-middle">Lane: <span className="font-mono">{task.lane}</span>
           </span>
        </div>
        <div>
          <ArrowBigUp className="mr-1 inline-block h-5 w-5 align-middle" />
          <span className="align-middle">Parent: <span className="font-mono">{task.parentId || '—'}</span>
          </span>
        </div>
        <div className="col-span-2">
           <ArrowBigDown className="mr-1 inline-block h-5 w-5 align-middle" />
          <span className="align-middle"> Depends:{' '}
          <span className="font-mono">
            {(task.depends || []).join(', ') || '—'}
          </span>
          </span>
        </div>
      </div>

      {/* Blockers list */}
      <div className="pt-1 flex items-center gap-2">
        <Construction className='mr-1 inline-block h-5 w-5 align-middle'/>
        <div className="text-xs font-semibold mb-1">Blockers:</div>
        {blockers.length === 0 ? (
          <div className="text-xs text-gray-500">No active blockers</div>
        ) : (
          <ul className="space-y-1 max-h-24 overflow-auto pr-1">
            {blockers.map((blocker, i) => (
              <li key={i} className="text-xs bg-red-50 border border-red-100 rounded-md p-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{blocker.by}</span>
                  {blocker.type === 'dependency' && (
                    <span className="ml-2 text-[10px] text-red-700">(dep)</span>
                  )}
                </div>
                <div className="text-[11px] text-gray-600">
                  Owner: {blocker.owner || '—'}
                </div>
                <div className="text-[11px] text-gray-600">
                  {blocker.since ? `${daysSince(blocker.since)}d blocked` : 'since unknown'}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button 
          className="px-3 py-1 rounded-lg border shadow-sm" 
          onClick={() => {
            console.log('Edit Task button clicked');
            onEdit();
          }}
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
  );
};

export default TaskDetails;
