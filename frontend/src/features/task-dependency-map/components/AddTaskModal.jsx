/**
 * AddTaskModal Component
 * 
 * Modal form for creating new tasks. Displays input fields for all task properties
 * and validates input before saving. This is a presentational component - all state
 * is managed by the parent container.
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is visible
 * @param {Function} props.onClose - Callback to close the modal
 * @param {Function} props.onSave - Callback to save the new task
 * @param {Object} props.draft - Current draft state for the new task
 * @param {Function} props.onDraftChange - Callback when draft values change
 */
import React from 'react';
import Modal from '../../../shared/components/Modal';
import InputRow from '../../../shared/components/InputRow';

const AddTaskModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  draft, 
  onDraftChange 
}) => {

  /**
   * Validates and saves the new task
   * Ensures required fields are filled and converts inputs to proper types
   */
  const handleSave = () => {
    // Validate required fields
    if (!draft?.name) {
      alert('Please fill in the Name field');
      return;
    }

    // Ensure start day and duration are valid
    const startDay = Number(draft.start) || 0;
    const duration = Math.max(1, Number(draft.duration) || 1);

    // Convert draft to task object with proper types and validation
    const newTask = {
      id: draft.id || `task-${Date.now()}`, // Auto-generate ID if not provided
      name: draft.name,
      owner: draft.owner || '',
      status: draft.status || 'todo',
      priority: draft.priority || 'normal',
      start: startDay,
      duration: duration,
      lane: Math.max(0, Number(draft.lane) || 0),   // Ensure non-negative
      parentId: draft.parentId || null,
    };

    // Pass to parent container to handle creation
    onSave(newTask);
  };

  // Ensure we have numeric values with proper defaults
  const startDay = draft?.start !== undefined && draft?.start !== null 
    ? (typeof draft.start === 'number' ? draft.start : Number(draft.start) || 0)
    : 0;
  const duration = draft?.duration !== undefined && draft?.duration !== null
    ? (typeof draft.duration === 'number' ? draft.duration : Number(draft.duration) || 1)
    : 1;

  // Calculate end day from start and duration for display
  // End day = start day + duration - 1 (since both start and end day are inclusive)
  const endDay = startDay + duration - 1;

  // Handle end day change - recalculate duration
  const handleEndDayChange = (endDayValue) => {
    if (endDayValue !== '' && !isNaN(Number(endDayValue))) {
      const endDayNum = Number(endDayValue);
      const currentStart = startDay;
      const newDuration = Math.max(1, endDayNum - currentStart + 1);
      onDraftChange(draft => ({ ...draft, duration: newDuration }));
    }
  };

  if (!isOpen) return null;

  return (
    <Modal onClose={onClose} title={draft?.name || "Add New Task"}>
      <div className="space-y-2">
        <div className="text-xs text-gray-500 mb-2">ID: {draft?.id || 'Auto-generated'}</div>
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
            <label className="text-xs mb-1">Start Day</label>
            <input
              type="number"
              value={startDay}
              onChange={e => {
                const value = e.target.value;
                const numValue = value === '' ? 0 : Number(value);
                const newStart = isNaN(numValue) ? 0 : Math.max(0, numValue);
                // Recalculate duration based on current end day
                const currentEndDay = endDay;
                const newDuration = Math.max(1, currentEndDay - newStart + 1);
                onDraftChange(draft => ({ ...draft, start: newStart, duration: newDuration }));
              }}
              className="border rounded px-2 py-1 text-sm w-full"
              placeholder="0"
            />
            <span className="text-[10px] text-gray-500 mt-0.5">Days from today</span>
          </div>
          <div className="flex flex-col">
            <label className="text-xs mb-1">End Day</label>
            <input
              type="number"
              value={endDay}
              onChange={e => {
                const value = e.target.value;
                handleEndDayChange(value);
              }}
              className="border rounded px-2 py-1 text-sm w-full"
              placeholder="Auto"
            />
            <span className="text-[10px] text-gray-500 mt-0.5">Days from today</span>
          </div>
          <div className="flex flex-col">
            <label className="text-xs mb-1">Duration</label>
            <input
              type="number"
              value={duration}
              onChange={e => {
                const value = e.target.value;
                const numValue = value === '' ? 1 : Number(value);
                const newDuration = isNaN(numValue) ? 1 : Math.max(1, numValue);
                onDraftChange(draft => ({ ...draft, duration: newDuration }));
              }}
              className="border rounded px-2 py-1 text-sm w-full"
              placeholder="1"
            />
            <span className="text-[10px] text-gray-500 mt-0.5">Days</span>
          </div>
        </div>
        
        <div className="text-xs text-gray-500">
          Note: Duration is automatically calculated when End Day is set. Changing Start Day or Duration updates the other fields.
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
