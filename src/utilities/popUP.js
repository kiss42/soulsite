import React from 'react';

const Popup = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null; // Ensure the popup doesn't render if not open

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-spiritual-purple p-5 rounded-lg relative max-w-lg w-full text-sparkle-white font-spiritual shadow-spiritual">
        
        {/* Optional title */}
        {title && <h3 className="text-lg font-bold mb-4">{title}</h3>}
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-0 right-0 m-2 text-lg font-bold hover:bg-purple-700 rounded-full py-1 px-3 transition duration-300 ease-in-out"
        >
          X
        </button>
        
        {/* Popup content */}
        <div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Popup;
