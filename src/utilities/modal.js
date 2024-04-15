import React from 'react';

const Modal = ({ card, onClose }) => {
  const { name, meaning, story } = card;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
      <div className="bg-spiritual-purple p-4 rounded-lg shadow-lg max-w-md w-full text-spiritual font-spiritual">
        <h2 className="text-lg font-bold text-accent-purple">{name}</h2>
        <p><strong>Meaning:</strong> {meaning}</p>
        <p><strong>Story:</strong> {story}</p>
        <button className="mt-4 px-4 py-2 bg-accent-purple text-white rounded hover:bg-purple-800 transition duration-300 ease-in-out" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default Modal;
