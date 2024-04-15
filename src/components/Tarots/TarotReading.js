// TarotReading.js
import React, { useState } from 'react';
import TarotCard from './TarotCard';
import Modal from '../../utilities/modal'; // Make sure this is the updated Modal
import tarotData from '../../data/tarotDeck';

const TarotReading = () => {
  const [drawnCards, setDrawnCards] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);

  const shuffleCards = () => {
    const shuffledDeck = [...tarotData.tarotDeck].sort(() => Math.random() - 0.5);
    const selectedCards = shuffledDeck.slice(0, 5);
    setDrawnCards(selectedCards);
  };

  const handleCardClick = (card) => {
    setSelectedCard(card);
  };

  const handleCloseModal = () => {
    setSelectedCard(null);
  };

  return (
    <div className="text-center">
      <button onClick={shuffleCards} className="hover:bg-purple-700 text-sparkle-white font-spiritual font-bold py-2 px-4 rounded-full shadow-spiritual transition duration-300 ease-in-out">
        Draw Card
      </button>
      {drawnCards && (
        <div className="flex justify-center flex-wrap gap-4 mt-4 mx-auto" style={{ maxWidth: '1200px' }}>
          {drawnCards.map((card) => (
            <TarotCard key={card.name} card={card} onClick={() => handleCardClick(card)} />
          ))}
          {selectedCard && <Modal card={selectedCard} onClose={handleCloseModal} />}
        </div>
      )}
    </div>
  );
};

export default TarotReading;
