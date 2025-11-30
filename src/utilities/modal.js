import React from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-center items-center bg-black/70 p-4"
      onClick={onClose} // Allow clicking the background to close the modal
    >
      <div 
        className="modal-surface max-w-lg w-full max-h-[80vh] overflow-y-auto relative text-white"
        onClick={(e) => e.stopPropagation()} // Prevent click from closing the modal if clicking inside it
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold leading-tight">{title}</h3>
          <button
            onClick={onClose}
            className="text-2xl font-bold text-gray-300 hover:text-red-300 transition duration-300 ease-in-out"
            aria-label="Close modal"
          >
            ✖️
          </button>
        </div>
        {/* Modal content */}
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
