import React, { useState, useEffect } from 'react';

const TarotCard = ({ card, position, onInterpret, forceFlipped, dealIndex = 0 }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { name, imageURL, reversed } = card;

  useEffect(() => {
    if (forceFlipped) setIsFlipped(true);
  }, [forceFlipped]);

  const handleClick = () => {
    if (!isFlipped) {
      setIsFlipped(true);
    } else {
      onInterpret(card);
    }
  };

  return (
    <div
      className="card-deal flex flex-col items-center gap-2"
      style={{ animationDelay: `${dealIndex * 90}ms` }}
    >
      {position && (
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">{position}</p>
      )}

      <div
        className="card-flip-wrapper cursor-pointer"
        style={{ width: '112px', height: '188px' }}
        onClick={handleClick}
        title={isFlipped ? `Interpret ${name}` : 'Click to reveal'}
      >
        <div className={`card-flip-inner w-full h-full${isFlipped ? ' is-flipped' : ''}`}>

          {/* Back face */}
          <div className="card-face card-face--back tarot-card-frame w-full h-full flex items-center justify-center overflow-hidden">
            <div className="card-back-art" />
            <span className="relative z-10 text-2xl select-none" style={{ textShadow: '0 0 12px rgba(233,216,166,0.6)' }}>✦</span>
          </div>

          {/* Front face */}
          <div className="card-face card-face--front tarot-card-frame w-full h-full flex flex-col overflow-hidden">
            <div className="px-2 pt-2 pb-1 text-center">
              <p className="text-[10px] font-semibold text-[var(--accent)] leading-tight">{name}</p>
              {reversed && (
                <p className="text-[8px] uppercase tracking-widest text-red-300/60 mt-0.5">reversed</p>
              )}
            </div>
            <div className="flex-1 px-2 pb-2 overflow-hidden">
              {imgError ? (
                <div className="w-full h-full rounded-xl flex items-center justify-center bg-white/5 border border-white/10">
                  <span className="text-3xl" style={{ textShadow: '0 0 16px rgba(233,216,166,0.5)' }}>✦</span>
                </div>
              ) : (
                <img
                  src={imageURL}
                  alt={name}
                  loading="lazy"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover rounded-xl"
                  style={reversed ? { transform: 'rotate(180deg)' } : undefined}
                />
              )}
            </div>
          </div>

        </div>
      </div>

      {isFlipped && (
        <button
          className="text-[9px] uppercase tracking-widest text-white/40 hover:text-[var(--accent)] transition-colors"
          onClick={(e) => { e.stopPropagation(); onInterpret(card); }}
        >
          Interpret
        </button>
      )}
    </div>
  );
};

export default TarotCard;
