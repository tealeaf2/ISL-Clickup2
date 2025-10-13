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
            <option value="todo">todo</option>
            <option value="in-progress">in-progress</option>
            <option value="blocked">blocked</option>
            <option value="done">done</option>
          </select>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col">
            <label className="text-xs mb-1">Start (day)</label>
            <input
              type="number"
              value={isNaN(draft?.start) ? '' : draft?.start ?? ''}
              onChange={e => {
                const value = e.target.value;
                const numValue = value === '' ? 0 : Number(value);
                onDraftChange(draft => ({ ...draft, start: isNaN(numValue) ? 0 : Math.max(0, numValue) }));
              }}
              className="border rounded px-2 py-1 text-sm w-full"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs mb-1">Duration</label>
            <input
              type="number"
              value={isNaN(draft?.duration) ? '' : draft?.duration ?? ''}
              onChange={e => {
                const value = e.target.value;
                const numValue = value === '' ? 1 : Number(value);
                onDraftChange(draft => ({ ...draft, duration: isNaN(numValue) ? 1 : Math.max(1, numValue) }));
              }}
              className="border rounded px-2 py-1 text-sm w-full"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs mb-1">Lane</label>
            <input
              type="number"
              value={isNaN(draft?.lane) ? '' : draft?.lane ?? ''}
              onChange={e => {
                const value = e.target.value;
                const numValue = value === '' ? 0 : Number(value);
                onDraftChange(draft => ({ ...draft, lane: isNaN(numValue) ? 0 : Math.max(0, numValue) }));
              }}
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
              value={draft?.priority || 'normal'}
              onChange={e => onDraftChange(draft => ({ ...draft, priority: e.target.value }))}
              className="border rounded px-2 py-1 text-sm w-full"
            >
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
              <option value="none">None</option>
            </select>
          </div>
        </div>
        
        <InputRow
          label="Parent ID"
          value={draft?.parentId || ''}
          onChange={value => onDraftChange(draft => ({ ...draft, parentId: value }))}
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
