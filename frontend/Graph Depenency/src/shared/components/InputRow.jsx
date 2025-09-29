import React from 'react';

/**
 * Input row component for form fields
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
