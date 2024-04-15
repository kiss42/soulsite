// components/Popup.js
import React from 'react';

const Popup = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-5 rounded-lg relative max-w-lg w-full" style={{ color: 'black' }}>
        {title && <h3 className="text-lg font-bold mb-4">{title}</h3>}
        <button onClick={onClose} className="absolute top-0 right-0 m-2 text-lg font-bold">X</button>
        {children}
      </div>
    </div>
  );
};

export default Popup;
