import React from 'react';
import Modal from '../../../shared/components/Modal';
import InputRow from '../../../shared/components/InputRow';

/**
 * Add new task modal component - Stateless
 */
const AddTaskModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  draft, 
  onDraftChange 
}) => {

  const handleSave = () => {
    if (!draft?.id || !draft?.name) {
      alert('Please fill in at least ID and Name fields');
      return;
    }

    const newTask = {
      id: draft.id,
      name: draft.name,
      owner: draft.owner,
      status: draft.status,
      start: Number(draft.start) || 0,
      duration: Math.max(1, Number(draft.duration) || 1),
      lane: Math.max(0, Number(draft.lane) || 0),
      parentId: draft.parentId || null,
    };

    onSave(newTask);
  };

  if (!isOpen) return null;

  return (
    <Modal onClose={onClose} title="Add New Task">
      <div className="space-y-2">
        <InputRow
          label="ID"
          value={draft?.id || ''}
          onChange={value => onDraftChange(draft => ({ ...draft, id: value }))}
        />
        <InputRow
          label="Name"
          value={draft?.name || ''}
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
            value={draft?.status || 'todo'}
            onChange={e => onDraftChange(draft => ({ ...draft, status: e.target.value }))}
          >
            <option value="todo">todo</option>
            <option value="in-progress">in-progress</option>
            <option value="blocked">blocked</option>
            <option value="done">done</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-xs w-24">Priority</label>
          <select
            className="border rounded px-2 py-1 text-sm flex-1"
            value={draft?.priority || 'normal'}
            onChange={e => onDraftChange(draft => ({ ...draft, priority: e.target.value }))}
          >
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
            <option value="none">None</option>
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
        
        <InputRow
          label="Parent ID"
          value={draft?.parentId || ''}
          onChange={value => onDraftChange(draft => ({ ...draft, parentId: value }))}
        />

        <div className="flex items-center justify-between pt-2">
          <button 
            className="px-3 py-1 rounded-lg border shadow-sm" 
            onClick={handleSave}
          >
            Apply
          </button>
          <button 
            className="px-3 py-1 rounded-lg border shadow-sm" 
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AddTaskModal;
