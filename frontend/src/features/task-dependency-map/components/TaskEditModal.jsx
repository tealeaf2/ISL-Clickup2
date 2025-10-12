import React from 'react';
import Modal from '../../../shared/components/Modal';
import InputRow from '../../../shared/components/InputRow';

/**
 * Task edit modal component
 */
const TaskEditModal = ({ 
  isOpen, 
  task, 
  draft, 
  onClose, 
  onSave, 
  onDelete, 
  onDraftChange 
}) => {
  if (!isOpen || !task) return null;

  return (
    <Modal onClose={onClose} title={`Edit Task ${task.id}`}>
      <div className="space-y-2">
        <InputRow 
          label="ID" 
          value={draft?.id} 
          disabled 
        />
        <InputRow
          label="Name"
          value={draft?.name}
          onChange={value => onDraftChange(draft => ({ ...draft, name: value }))}
        />
        <InputRow
          label="Owner"
          value={draft?.owner || ''}
          onChange={value => onDraftChange(draft => ({ ...draft, owner: value }))}
        />
        
        <div className="flex items-center gap-2">
          <label className="text-xs w-24">Status</label>
          <select
            className="border rounded px-2 py-1 text-sm flex-1"
            value={draft?.status}
            onChange={e => onDraftChange(draft => ({ ...draft, status: e.target.value }))}
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="blocked">Blocked</option>
            <option value="done">Done</option>
          </select>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col">
            <label className="text-xs mb-1">Start (day)</label>
            <input
              type="number"
              value={draft?.start ?? ''}
              onChange={e => onDraftChange(draft => ({ ...draft, start: Number(e.target.value) }))}
              className="border rounded px-2 py-1 text-sm w-full"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs mb-1">Duration</label>
            <input
              type="number"
              value={draft?.duration ?? ''}
              onChange={e => onDraftChange(draft => ({ ...draft, duration: Number(e.target.value) }))}
              className="border rounded px-2 py-1 text-sm w-full"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs mb-1">Lane</label>
            <input
              type="number"
              value={draft?.lane ?? ''}
              onChange={e => onDraftChange(draft => ({ ...draft, lane: Number(e.target.value) }))}
              className="border rounded px-2 py-1 text-sm w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <label className="text-xs mb-1">Est. Hours</label>
            <input
              type="number"
              value={draft?.estimatedHours ?? ''}
              onChange={e => onDraftChange(draft => ({ ...draft, estimatedHours: Number(e.target.value) }))}
              className="border rounded px-2 py-1 text-sm w-full"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs mb-1">Priority</label>
            <select
              value={draft?.priority || 'medium'}
              onChange={e => onDraftChange(draft => ({ ...draft, priority: e.target.value }))}
              className="border rounded px-2 py-1 text-sm w-full"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        
        <InputRow
          label="Parent ID"
          value={draft?.parentId || ''}
          onChange={value => onDraftChange(draft => ({ ...draft, parentId: value }))}
        />
        <InputRow
          label="Depends (comma IDs)"
          value={draft?.dependsText || ''}
          onChange={value => onDraftChange(draft => ({ ...draft, dependsText: value }))}
        />

        <div className="flex items-center justify-between pt-2">
          <button 
            className="px-3 py-1 rounded-lg border shadow-sm" 
            onClick={() => {
              console.log('Apply button clicked, draft:', draft);
              onSave();
            }}
          >
            Apply
          </button>
          <div className="flex items-center gap-2">
            <button 
              className="px-3 py-1 rounded-lg border shadow-sm" 
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              className="px-3 py-1 rounded-lg border shadow-sm text-red-700" 
              onClick={onDelete}
            >
              Delete Task
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default TaskEditModal;
