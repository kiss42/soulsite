import React from 'react';
import DailyForecast from '../../DailyForecast';

export default function HomeScreen({ onNavigate }) {
  return (
    <div className="px-4 pt-6 pb-8 space-y-6">
      <DailyForecast />

      <div className="space-y-3 text-center">
        <div className="eyebrow justify-center">Soul OS · lunar mode</div>
        <h1 className="text-3xl font-semibold leading-tight" style={{ fontFamily: "'Cinzel Decorative', serif" }}>
          Psychic &amp; Tarot Readings
        </h1>
        <p className="text-gray-300 text-sm">
          A quiet altar for numerology, tarot, chakras, shadow work, and dreams.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-1">
          <button onClick={() => onNavigate('numerology')} className="primary-btn px-6 w-auto">Start your reading</button>
          <button onClick={() => onNavigate('tarot')} className="ghost-btn px-6 w-auto">Draw a card</button>
        </div>
      </div>

      <div className="trim-card w-full">
        <div className="ribbon mb-4">Moonlit sequence</div>
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-white/80">
            <span>Ground</span>
            <span className="text-white">2 min</span>
          </div>
          <p className="text-lg font-semibold">Breathe, pull a card, name the tension.</p>
          <div className="flex justify-between text-sm text-white/80">
            <span>Decode</span>
            <span className="text-white">3 min</span>
          </div>
          <p className="text-lg font-semibold">Run the number, trace the pattern.</p>
          <div className="flex justify-between text-sm text-white/80">
            <span>Integrate</span>
            <span className="text-white">5 min</span>
          </div>
          <p className="text-lg font-semibold">Journal the prompt, log the angel sign.</p>
        </div>
      </div>

      <button
        onClick={() => onNavigate('more')}
        className="w-full text-left rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 flex items-center justify-between"
      >
        <span className="text-sm text-white/70">Angel numbers, shadow work &amp; dream journal</span>
        <span className="text-white/30">→</span>
      </button>
    </div>
  );
}
