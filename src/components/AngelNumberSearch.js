import React, { useState } from 'react';
import angelNumbers from '../data/angelNumbers.json';

function AngelNumberSearch() {
  const [number, setNumber] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Handle the search logic for angel numbers
  const handleSearch = () => {
    setLoading(true);
    const result = angelNumbers[number]; // Look up the angel number in the data

    // Simulate a delay for loading effect
    setTimeout(() => {
      if (result) {
        // Construct the message content based on the search result
        const messageContent = (
          <>
            <p className="font-bold">Major Message:</p>
            <p>{result.majorMessage}</p>
            <p className="font-bold">Description:</p>
            <p>{result.description}</p>
            <p className="font-bold">What Your Future Holds:</p>
            <p>{result.future}</p>
            <p className="font-bold">Actions You Can Take:</p>
            <ul className="list-disc list-inside">
              {result.actions
                ? result.actions.split('. ').map((action, index) => (
                    <li key={index}>{action}</li>
                  ))
                : <li>No specific actions provided.</li>}
            </ul>
          </>
        );
        setMessage(messageContent);
      } else {
        setMessage("Adding more angel numbers for the future, please be patient.");
      }

      setShowModal(true); // Show the modal with the result
      setLoading(false);  // Stop loading
    }, 500); // 500ms delay for simulated search effect
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4">
      {/* Toggle between the button and the input field */}
      {!showInput ? (
        <button
          onClick={() => setShowInput(true)}
          className="hover:bg-purple-700 text-white font-spiritual font-bold py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out"
        >
          Find Out Angel Number Meaning
        </button>
      ) : (
        <>
          {/* Input field for the angel number */}
          <input
            type="text"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="Enter an angel number"
            className="border-2 border-purple-500 p-3 rounded-full text-black focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          {/* Search button */}
          <button
            onClick={handleSearch}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out mt-3"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>

          {/* Modal to display the result */}
          {showModal && (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
              <div className="bg-white p-5 rounded-lg shadow-lg max-w-lg w-full text-black">
                <button
                  onClick={handleCloseModal}
                  className="float-right font-bold text-lg text-red-500 hover:text-red-700"
                >
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
