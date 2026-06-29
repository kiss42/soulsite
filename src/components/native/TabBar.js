import React from 'react';

const TABS = [
  { key: 'home', label: 'Home', icon: '✺' },
  { key: 'tarot', label: 'Tarot', icon: '🔮' },
  { key: 'numerology', label: 'Numbers', icon: '🔢' },
  { key: 'astrology', label: 'Astrology', icon: '♈' },
  { key: 'more', label: 'More', icon: '⋯' },
];

export default function TabBar({ active, onChange }) {
  return (
    <nav
      className="shrink-0 z-20 flex backdrop-blur-xl bg-slate-950/80 border-t border-white/10"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {TABS.map(tab => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${
            active === tab.key ? 'text-[var(--accent)]' : 'text-white/40'
          }`}
        >
          <span className="text-xl leading-none">{tab.icon}</span>
          <span className="text-[10px] uppercase tracking-wide">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
