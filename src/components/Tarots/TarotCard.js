import React from 'react';

const TarotCard = ({ card, onClick }) => {
  const { name, imageURL } = card;

  return (
    <div className="tarot-card-frame text-center text-white hover:translate-y-[-2px]" onClick={onClick}>
      <div className="pt-4 px-4">
        <h2 className="text-lg font-semibold text-[var(--accent)] drop-shadow">{name}</h2>
      </div>
      <div className="px-5 pb-5">
        <img
          src={imageURL}
          alt={`${name} tarot card`}
          className="mx-auto w-28 h-44 object-cover rounded-2xl shadow-lg shadow-black/50"
        />
      </div>
    </div>
  );
};

export default TarotCard;
