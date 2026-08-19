import React from 'react';
import { useEscapeToClose } from '../hooks/useEscapeToClose';

const Popup = ({ isOpen, onClose, title, children }) => {
  useEscapeToClose(isOpen ? onClose : null);
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-center items-center bg-black/70 p-4"
      onClick={onClose} // Allow clicking the background to close the popup
    >
      <div 
        className="modal-surface max-w-lg w-full max-h-[80vh] overflow-y-auto relative text-white"
        onClick={(e) => e.stopPropagation()} // Prevent click from closing the popup when clicking inside it
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold leading-tight">{title}</h3>
          <button
            onClick={onClose}
            className="text-lg font-bold hover:text-red-300"
          >
            X
          </button>
        </div>
        {/* Popup content */}
        <div className="popup-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Popup;
