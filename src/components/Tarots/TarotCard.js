import React from 'react';

const TarotCard = ({ card, onClick }) => {
  const { name, imageURL } = card;

  return (
    <div className="p-4 shadow-lg rounded-lg text-center bg-purple-900 hover:bg-purple-800 transition-colors duration-300 cursor-pointer text-black" onClick={onClick}>
      <h2 className="text-lg font-bold">{name}</h2>
      <img src={imageURL} alt={`${name} tarot card`} className="mx-auto w-24 h-36 object-cover rounded-md" />
    </div>
  );
};

export default TarotCard;
