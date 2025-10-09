import React from 'react';

/**
 * Modal component for displaying overlay dialogs
 */
const Modal = ({ title, onClose, children }) => {
  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl border w-[520px] max-w-[95vw] p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold">{title}</div>
          <button className="text-sm underline" onClick={onClose}>
            Close
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
