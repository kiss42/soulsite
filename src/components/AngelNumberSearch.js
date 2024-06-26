import React, { useState } from 'react';
import angelNumbers from '../data/angelNumbers.json';

function AngelNumberSearch() {
  const [number, setNumber] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleSearch = () => {
    setLoading(true);
    const result = angelNumbers[number];
    setTimeout(() => {
      if (result) {
        const messageContent = (
          <>
            <p className="font-bold">Major Message:</p>
            <p>{result.majorMessage}</p>
            <p className="font-bold">Description:</p>
            <p>{result.description}</p>
            <p className="font-bold">What Your Future Holds:</p>
            <p>{result.future}</p>
            <p className="font-bold">Actions You Can Take:</p>
            <ul>
              {result.actions ? result.actions.split('. ').map((action, index) => (
                <li key={index}>{action}</li>
              )) : <li>No specific actions provided.</li>}
            </ul>
          </>
        );
        setMessage(messageContent);
        setShowModal(true);
      } else {
        setMessage("Adding more angel numbers for the future, please be patient.");
        setShowModal(true);
      }
      setLoading(false);
    }, 500);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4">
      {!showInput ? (
        <button
          onClick={() => setShowInput(true)}
          className="hover:bg-purple-700 text-sparkle-white font-spiritual font-bold py-2 px-4 rounded-full shadow-spiritual transition duration-300 ease-in-out"
        >
          Find Out Angel Number Meaning
        </button>
      ) : (
        <>
          <input
            type="text"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="Enter an angel number"
            className="border-2 border-accent-purple p-3 rounded-full text-black focus:outline-none focus:ring-2 focus:ring-accent-purple"
          />
          <button
            onClick={handleSearch}
            className="bg-accent-purple hover:bg-purple-700 text-sparkle-white font-spiritual font-bold py-2 px-4 rounded-full shadow-spiritual transition duration-300 ease-in-out"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
          {showModal && (
            <div className="absolute top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex justify-center items-center">
              <div className="bg-spiritual-purple p-5 text-spiritual rounded-lg max-w-lg w-full text-black">
                <button onClick={handleCloseModal} className="float-right font-bold">
                  X
                </button>
                <div className="mt-5">{message}</div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AngelNumberSearch;
