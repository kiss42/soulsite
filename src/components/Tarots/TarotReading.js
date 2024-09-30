import React, { useState } from 'react';
import TarotCard from './TarotCard';
import Modal from '../../utilities/modal'; // Import Modal
import tarotData from '../../data/tarotDeck'; // Import tarot deck data

const TarotReading = () => {
  const [drawnCards, setDrawnCards] = useState(null);  // State for drawn cards
  const [selectedCard, setSelectedCard] = useState(null); // State for selected card

  // Shuffle tarot deck and draw 5 random cards
  const shuffleCards = () => {
    const shuffledDeck = [...tarotData.tarotDeck].sort(() => Math.random() - 0.5);
    setDrawnCards(shuffledDeck.slice(0, 5));
  };

  // Handle card selection for modal display
  const handleCardClick = (card) => setSelectedCard(card);

  // Close the modal
  const handleCloseModal = () => setSelectedCard(null);

  return (
    <div className="text-center">
      <button 
        onClick={shuffleCards} 
        className="hover:bg-purple-700 text-sparkle-white font-spiritual font-bold py-2 px-4 rounded-full shadow-spiritual transition duration-300 ease-in-out"
      >
        Draw Card
      </button>

      {/* Display drawn cards */}
      {drawnCards && (
        <div className="flex justify-center flex-wrap gap-4 mt-4 mx-auto" style={{ maxWidth: '1200px' }}>
          {drawnCards.map((card) => (
            <TarotCard key={card.name} card={card} onClick={() => handleCardClick(card)} />
          ))}
        </div>
      )}

      {/* Modal for displaying selected card */}
      {selectedCard && (
        <Modal isOpen={!!selectedCard} onClose={handleCloseModal} title={selectedCard.name}>
          <div className="bg-black text-white p-4 rounded-lg">
            <p><strong>Meaning:</strong> {selectedCard.meaning}</p>
            <p><strong>Story:</strong> {selectedCard.story}</p>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default TarotReading;
