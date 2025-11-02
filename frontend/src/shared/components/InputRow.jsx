/**
 * InputRow Component
 * 
 * A reusable form input component that provides a consistent layout for
 * labeled input fields. Automatically handles number type conversion and
 * disabled state styling.
 * 
 * @fileoverview Reusable labeled input field component for forms
 */

import React from 'react';

/**
 * Input row component for form fields
 * 
 * Renders a label and input field in a consistent row layout.
 * Automatically converts input values to numbers when type is 'number'.
 * 
 * @param {Object} props - Component props
 * @param {string} props.label - The label text to display next to the input
 * @param {string|number} props.value - The current value of the input field
 * @param {Function} props.onChange - Callback function called when input value changes.
 *   Receives the new value (converted to number if type is 'number', otherwise string)
 * @param {boolean} [props.disabled=false] - Whether the input is disabled
 * @param {string} [props.type='text'] - The HTML input type (text, number, etc.)
 * @returns {JSX.Element} A labeled input field in a row layout
 * 
 * @example
 * <InputRow 
 *   label="Task Name" 
 *   value={taskName} 
 *   onChange={setTaskName} 
 * />
 */
const InputRow = ({ 
  label, 
  value, 
  onChange, 
  disabled = false, 
  type = 'text' 
}) => {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs w-24">{label}</label>
      <input
        type={type}
        disabled={disabled}
        value={value ?? ''}
        onChange={e => onChange && onChange(
          type === 'number' ? Number(e.target.value) : e.target.value
        )}
        className={`border rounded px-2 py-1 text-sm flex-1 ${
          disabled ? 'bg-gray-100' : ''
        }`}
      />
    </div>
  );
};

export default InputRow;
