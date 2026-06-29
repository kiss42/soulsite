import React from 'react';
import TarotReading from '../../Tarots/TarotReading';

export default function TarotScreen() {
  return (
    <div className="px-4 pt-5 pb-8 space-y-4">
      <div>
        <div className="eyebrow">Tarot</div>
        <h3 className="section-title">Pull a spread</h3>
        <p className="section-subtitle">Minimal draw with upright art; tap to reveal the story.</p>
      </div>
      <TarotReading />
    </div>
  );
}
