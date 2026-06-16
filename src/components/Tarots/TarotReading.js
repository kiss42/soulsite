import React, { useState } from 'react';
import TarotCard from './TarotCard';
import tarotData from '../../data/tarotDeck';

const SPREADS = {
  single: {
    label: 'Daily Card',
    count: 1,
    positions: ['Your message for today'],
  },
  three: {
    label: 'Past · Present · Future',
    count: 3,
    positions: ['Past', 'Present', 'Future'],
  },
  five: {
    label: 'Five-Card Cross',
    count: 5,
    positions: ['Foundation', 'Challenge', 'Subconscious', 'Advice', 'Outcome'],
  },
};

const POSITION_PROMPTS = {
  'Your message for today': 'What is this card asking you to sit with today?',
  'Past':          'What from your past does this card illuminate?',
  'Present':       'How does this card reflect your current moment?',
  'Future':        'What direction is this card pointing you toward?',
  'Foundation':    'What underlying energy is shaping this situation?',
  'Challenge':     'What obstacle does this card bring to light?',
  'Subconscious':  'What hidden feeling is this card surfacing?',
  'Advice':        'What wisdom is this card extending to you right now?',
  'Outcome':       'What does this card suggest about where you are headed?',
};

function drawCards(count) {
  const deck = [...tarotData.tarotDeck];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck.slice(0, count).map(card => ({
    ...card,
    reversed: Math.random() < 0.3,
  }));
}

const TarotReading = () => {
  const [spreadType, setSpreadType] = useState('three');
  const [intention, setIntention] = useState('');
  const [drawnCards, setDrawnCards] = useState(null);
  const [drawId, setDrawId] = useState(0);
  const [revealAll, setRevealAll] = useState(false);
  const [selected, setSelected] = useState(null);

  const spread = SPREADS[spreadType];

  const handleDraw = () => {
    setDrawnCards(drawCards(spread.count));
    setDrawId(id => id + 1);
    setRevealAll(false);
    setSelected(null);
  };

  const handleSpreadChange = (key) => {
    setSpreadType(key);
    setDrawnCards(null);
    setRevealAll(false);
    setSelected(null);
  };

  return (
    <div className="space-y-5">

      {/* Spread selector */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(SPREADS).map(([key, s]) => (
          <button
            key={key}
            onClick={() => handleSpreadChange(key)}
            className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
              spreadType === key
                ? 'border-[var(--accent)] text-[var(--accent)] bg-white/5'
                : 'border-white/15 text-white/50 hover:border-white/30 hover:text-white/80'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Intention input */}
      <div>
        <input
          type="text"
          value={intention}
          onChange={e => setIntention(e.target.value)}
          placeholder="Set your intention — what do you seek guidance on? (optional)"
          className="pill-input text-sm"
        />
      </div>

      {/* Draw button */}
      <div className="flex gap-3 flex-wrap">
        <button onClick={handleDraw} className="primary-btn w-auto px-6">
          {drawnCards ? 'Reshuffle & draw again' : `Draw ${spread.label}`}
        </button>
        {drawnCards && !revealAll && (
          <button
            onClick={() => setRevealAll(true)}
            className="ghost-btn px-4 w-auto text-sm"
          >
            Reveal all
          </button>
        )}
      </div>

      {!drawnCards && (
        <p className="text-xs text-white/30 text-center">
          Cards are drawn face-down — click each one to reveal it, or use Reveal all.
        </p>
      )}

      {/* Cards */}
      {drawnCards && (
        <div className="flex justify-center flex-wrap gap-5 mt-2">
          {drawnCards.map((card, i) => (
            <TarotCard
              key={`${drawId}-${i}`}
              card={card}
              position={spread.positions[i]}
              dealIndex={i}
              forceFlipped={revealAll}
              onInterpret={(c) => setSelected({ ...c, positionLabel: spread.positions[i] })}
            />
          ))}
        </div>
      )}

      {/* Interpretation modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/75 flex justify-center items-center p-4 z-50"
          onClick={() => setSelected(null)}
        >
          <div
            className="modal-surface max-w-md w-full text-white max-h-[88vh] overflow-y-auto space-y-4"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                {selected.positionLabel && (
                  <p className="text-[10px] uppercase tracking-[0.22em] text-white/35 mb-0.5">{selected.positionLabel}</p>
                )}
                <p className={`text-[10px] uppercase tracking-[0.22em] font-medium ${selected.reversed ? 'text-red-300/70' : 'text-white/40'}`}>
                  {selected.reversed ? '↕ Reversed' : '↑ Upright'}
                </p>
                <h3 className="text-2xl font-bold text-[var(--accent)]">{selected.name}</h3>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-xl font-bold text-gray-400 hover:text-red-300 transition ml-4 shrink-0"
                aria-label="Close"
              >✖</button>
            </div>

            {/* Intention echo */}
            {intention.trim() && (
              <div className="rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/30 mb-0.5">Your intention</p>
                <p className="text-xs text-white/60 italic">"{intention.trim()}"</p>
              </div>
            )}

            {/* Card image + active meaning */}
            <div className="flex gap-4">
              <div className="shrink-0">
                <img
                  src={selected.imageURL}
                  alt={selected.name}
                  className="w-[72px] h-[116px] object-cover rounded-xl shadow-lg"
                  style={selected.reversed ? { transform: 'rotate(180deg)' } : undefined}
                />
              </div>
              <div className="space-y-3 min-w-0">
                <div className="rounded-xl bg-white/5 border border-white/10 px-3 py-2.5">
                  <p className="text-[var(--accent)] font-semibold text-sm leading-snug">
                    {selected.reversed ? selected.reversedMeaning : selected.meaning}
                  </p>
                </div>
                <p className="text-xs text-white/60 leading-relaxed">{selected.story}</p>
              </div>
            </div>

            {/* Reflection prompt */}
            {selected.positionLabel && POSITION_PROMPTS[selected.positionLabel] && (
              <div className="border-t border-white/10 pt-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/35 mb-1">Reflect</p>
                <p className="text-sm text-white/70 italic">{POSITION_PROMPTS[selected.positionLabel]}</p>
              </div>
            )}

            {/* Upright meaning reference when reversed */}
            {selected.reversed && (
              <div className="border-t border-white/10 pt-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/35 mb-1">Upright meaning</p>
                <p className="text-xs text-white/50">{selected.meaning}</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default TarotReading;
