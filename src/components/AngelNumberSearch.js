import React, { useState } from 'react';
import angelNumbers from '../data/angelNumbers.json';

const POPULAR = ['111', '222', '333', '444', '555', '777', '888', '999', '1111', '1212', '1234', '717', '818', '919'];

function AngelNumberSearch() {
  const [number, setNumber] = useState('');
  const [result, setResult] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const search = (num) => {
    const n = (num ?? number).trim();
    if (!n) return;
    const found = angelNumbers[n];
    if (found) {
      setResult({ ...found, _number: n });
      setNotFound(false);
    } else {
      setResult(null);
      setNotFound(true);
    }
    setShowModal(true);
  };

  const handleRandom = () => {
    const keys = Object.keys(angelNumbers);
    const pick = keys[Math.floor(Math.random() * keys.length)];
    setNumber(pick);
    search(pick);
  };

  return (
    <div className="space-y-3">
      {!showInput ? (
        <button onClick={() => setShowInput(true)} className="primary-btn w-full">
          Find Out Angel Number Meaning
        </button>
      ) : (
        <>
          <div className="stack-card space-y-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/70">
              <span className="text-lg">🪽</span>
              <span>Angel lookup</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && search()}
                placeholder="Enter an angel number"
                className="pill-input"
              />
              <button onClick={() => search()} className="primary-btn px-4 w-auto shrink-0">
                Search
              </button>
            </div>

            <button
              onClick={handleRandom}
              className="ghost-btn w-full text-sm"
            >
              ✦ Surprise me
            </button>

            <div>
              <p className="text-xs text-white/50 uppercase tracking-[0.15em] mb-2">Popular</p>
              <div className="flex flex-wrap gap-2">
                {POPULAR.map((n) => (
                  <button
                    key={n}
                    onClick={() => { setNumber(n); search(n); }}
                    className="px-3 py-1 rounded-full border border-white/15 bg-white/5 text-xs text-white/80 hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {showModal && (
            <div
              className="fixed inset-0 bg-black/70 flex justify-center items-center p-4 fade-in show z-50"
              onClick={() => setShowModal(false)}
            >
              <div
                className="modal-surface max-w-lg w-full text-white max-h-[80vh] overflow-y-auto scroll-smooth"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-start mb-4">
                  {!notFound && result && (
                    <div>
                      <p className="text-xs text-white/50 uppercase tracking-[0.2em]">Angel number</p>
                      <h3 className="text-3xl font-bold text-[var(--accent)]">{result._number}</h3>
                    </div>
                  )}
                  <button
                    onClick={() => setShowModal(false)}
                    className="ml-auto text-xl font-bold text-gray-400 hover:text-red-300 transition"
                    aria-label="Close"
                  >
                    ✖
                  </button>
                </div>

                {notFound ? (
                  <p className="text-gray-300 text-sm">This number isn't in the library yet — more are being added soon.</p>
                ) : (
                  <div className="space-y-4 text-gray-200">
                    <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-3">
                      <p className="text-[var(--accent)] font-semibold text-base leading-snug">{result.majorMessage}</p>
                    </div>

                    {(result.associatedTarot || result.associatedStarSign || result.associatedAstrologicalBody) && (
                      <div className="flex flex-wrap gap-2">
                        {result.associatedTarot && (
                          <span className="stat-chip text-xs">🃏 {result.associatedTarot}</span>
                        )}
                        {result.associatedStarSign && (
                          <span className="stat-chip text-xs">♈ {result.associatedStarSign}</span>
                        )}
                        {result.associatedAstrologicalBody && (
                          <span className="stat-chip text-xs">🪐 {result.associatedAstrologicalBody}</span>
                        )}
                      </div>
                    )}

                    <p className="text-sm leading-relaxed">{result.description}</p>

                    {result.future && (
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-white/60 mb-1">What your future holds</p>
                        <p className="text-sm">{result.future}</p>
                      </div>
                    )}

                    {result.actions && (
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-white/60 mb-2">Actions to take</p>
                        <ul className="space-y-1">
                          {result.actions.split('. ').filter(Boolean).map((action, i) => (
                            <li key={i} className="flex gap-2 text-sm">
                              <span className="text-[var(--accent)] shrink-0">·</span>
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AngelNumberSearch;
