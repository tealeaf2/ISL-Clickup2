/**
 * AddTaskButton Component
 * 
 * Floating action button that opens the add task modal.
 * Positioned at the bottom-left of the dependency graph canvas.
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onClick - Callback function called when button is clicked
 */
import React from 'react';

const AddTaskButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="absolute bottom-4 left-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors duration-200 flex items-center gap-2 z-40"
    >
      {/* Plus icon SVG */}
      <svg 
        className="w-5 h-5" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 4v16m8-8H4" 
        />
      </svg>
      Add New Task
    </button>
  );
};

export default AddTaskButton;


