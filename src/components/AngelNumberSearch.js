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
            <p className="font-bold text-lg sm:text-base">Major Message:</p>
            <p className="text-sm">{result.majorMessage}</p>
            <p className="font-bold text-lg sm:text-base">Description:</p>
            <p className="text-sm">{result.description}</p>
            <p className="font-bold text-lg sm:text-base">What Your Future Holds:</p>
            <p className="text-sm">{result.future}</p>
            <p className="font-bold text-lg sm:text-base">Actions You Can Take:</p>
            <ul className="list-disc list-inside">
              {result.actions
                ? result.actions.split('. ').map((action, index) => (
                    <li key={index} className="text-sm">{action}</li>
                  ))
                : <li>No specific actions provided.</li>}
            </ul>
          </>
        );
        setMessage(messageContent);
      } else {
        setMessage("Adding more angel numbers for the future, please be patient.");
      }

      setShowModal(true);
      setLoading(false);
    }, 500);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="space-y-3">
      {!showInput ? (
        <button
          onClick={() => setShowInput(true)}
          className="primary-btn w-full"
        >
          Find Out Angel Number Meaning
        </button>
      ) : (
        <>
          <div className="stack-card space-y-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/70">
              <span className="text-lg">🪽</span>
              <span>Angel lookup</span>
            </div>
            <input
              type="text"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="Enter an angel number"
              className="pill-input"
            />
            <button
              onClick={handleSearch}
              className="primary-btn w-full"
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {showModal && (
            <div className="fixed inset-0 bg-black/70 flex justify-center items-center p-4 fade-in show z-50">
              <div className="modal-surface max-w-lg w-full text-white max-h-[80vh] overflow-y-auto scroll-smooth">
                <button
                  onClick={handleCloseModal}
                  className="float-right font-bold text-lg text-red-400 hover:text-red-200"
                >
                  X
                </button>
                <div className="mt-5 space-y-2 text-gray-200">{message}</div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AngelNumberSearch;
