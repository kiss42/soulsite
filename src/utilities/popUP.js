import React from 'react';

const Popup = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50"
      onClick={onClose} // Allow clicking the background to close the popup
    >
      <div 
        className="bg-white p-5 rounded-lg shadow-lg max-w-lg w-full max-h-[80vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()} // Prevent click from closing the popup when clicking inside it
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">{title}</h3>
          <button
            onClick={onClose}
            className="text-lg font-bold hover:text-red-500"
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
