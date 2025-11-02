/**
 * Modal Component
 * 
 * A reusable modal/dialog component that displays content in an overlay.
 * Provides a centered modal with a title, close button, and customizable content.
 * Uses a semi-transparent backdrop and centers the modal content on the screen.
 * 
 * @fileoverview Reusable modal component for displaying dialog overlays
 */

import React from 'react';

/**
 * Modal component for displaying overlay dialogs
 * 
 * Creates a full-screen overlay with a centered modal dialog containing
 * a title, close button, and custom content.
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - The title to display at the top of the modal
 * @param {Function} props.onClose - Callback function called when the close button is clicked
 * @param {React.ReactNode} props.children - The content to display inside the modal body
 * @returns {JSX.Element} A modal overlay with centered dialog content
 * 
 * @example
 * <Modal title="Edit Task" onClose={handleClose}>
 *   <form>...</form>
 * </Modal>
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
