import React, { useState } from 'react';
import { interpretDreamText, getSymbolByKey, pickRandomSymbol } from '../services/dreamService';
import { generatePDF } from '../services/pdfService';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';
import { saveDream } from '../services/profileService';

const COMMON_SYMBOLS = ['water', 'flying', 'falling', 'snake', 'teeth', 'death', 'chased', 'naked', 'fire', 'spider'];

function DreamInterpreter() {
  const { user } = useAuth();
  const { openLogin } = useUI();

  const [text, setText] = useState('');
  const [matches, setMatches] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [saved, setSaved] = useState(false);

  const interpret = (dreamText) => {
    const value = (dreamText ?? text).trim();
    if (!value) return;
    if (dreamText) setText(dreamText);
    setMatches(interpretDreamText(value));
    setSaved(false);
    setShowModal(true);
  };

  const handleRandom = () => {
    const s = pickRandomSymbol();
    interpret(s.label);
  };

  const handleSaveAsPDF = () => {
    const parts = [text, ''];
    matches.forEach(s => parts.push(`${s.emoji} ${s.label}`, s.meaning, s.reflection, ''));
    generatePDF(parts.join('\n\n'));
  };

  const handleSaveToProfile = async () => {
    if (!user) { openLogin(); return; }
    await saveDream(user.uid, {
      dreamText: text,
      symbols: matches.map(s => s.key),
    });
    setSaved(true);
  };

  return (
    <div className="space-y-4">
      <div className="stack-card space-y-3">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/70">
          <span className="text-lg">💭</span>
          <span>Dream interpreter</span>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Describe your dream, or just type a symbol like 'snake' or 'flying'..."
          className="w-full h-28 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-gray-300 p-4 focus:outline-none focus:ring-2 focus:ring-purple-400"
        />

        <button onClick={() => interpret()} className="primary-btn w-full">
          Interpret My Dream
        </button>

        <button onClick={handleRandom} className="ghost-btn w-full text-sm">
          ✦ Surprise me with a symbol
        </button>

        <div>
          <p className="text-xs text-white/50 uppercase tracking-[0.15em] mb-2">Common symbols</p>
          <div className="flex flex-wrap gap-2">
            {COMMON_SYMBOLS.map((key) => {
              const s = getSymbolByKey(key);
              return (
                <button
                  key={key}
                  onClick={() => interpret(s.label)}
                  className="px-3 py-1 rounded-full border border-white/15 bg-white/5 text-xs text-white/80 hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                >
                  {s.emoji} {s.label}
                </button>
              );
            })}
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
              <div>
                <p className="text-xs text-white/50 uppercase tracking-[0.2em]">Dream reading</p>
                <h3 className="text-lg font-bold text-[var(--accent)]">
                  {matches.length ? `${matches.length} symbol${matches.length > 1 ? 's' : ''} found` : 'No symbols recognized yet'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-xl font-bold text-gray-400 hover:text-red-300 transition shrink-0"
                aria-label="Close"
              >
                ✖
              </button>
            </div>

            {matches.length === 0 ? (
              <p className="text-gray-300 text-sm">
                No symbols from the dictionary were recognized in that description yet. Try mentioning specific images, animals, people, or places from the dream — concrete details work best.
              </p>
            ) : (
              <div className="space-y-3">
                {matches.map((s) => (
                  <div key={s.key} className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 space-y-2">
                    <p className="font-semibold text-white flex items-center gap-2">
                      <span className="text-lg">{s.emoji}</span>{s.label}
                    </p>
                    <p className="text-sm text-gray-200 leading-relaxed">{s.meaning}</p>
                    <p className="text-xs text-white/50 italic leading-relaxed">{s.reflection}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <button onClick={handleSaveAsPDF} className="ghost-btn flex-1 text-sm">
                Save as PDF
              </button>
              <button
                onClick={handleSaveToProfile}
                disabled={saved}
                className={`flex-1 text-sm rounded-xl py-3 px-4 border transition-colors ${
                  saved
                    ? 'border-[var(--accent)]/40 text-[var(--accent)]/60'
                    : 'primary-btn'
                }`}
              >
                {saved ? '✓ Saved' : '⊕ Save to profile'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DreamInterpreter;
