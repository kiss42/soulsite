import React, { useEffect, useRef, useState } from 'react';
import cities from '../data/cities.json';

// Fully offline — matches against the bundled cities.json list, no geocoding API calls.
export default function CityPicker({ value, onSelect, placeholder }) {
  const [query, setQuery] = useState(value || '');
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => { setQuery(value || ''); }, [value]);

  useEffect(() => {
    function onClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const trimmed = query.trim().toLowerCase();
  const matches = trimmed.length > 0
    ? cities.filter(c => c.name.toLowerCase().includes(trimmed)).slice(0, 8)
    : [];

  return (
    <div className="relative" ref={wrapRef}>
      <input
        type="text"
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder || 'Search your birth city…'}
        className="pill-input"
      />
      {open && matches.length > 0 && (
        <div className="absolute z-20 left-0 right-0 mt-1 rounded-xl border border-white/10 bg-slate-950/95 shadow-2xl backdrop-blur-xl max-h-56 overflow-y-auto">
          {matches.map(c => (
            <button
              key={c.name}
              type="button"
              onClick={() => { onSelect(c); setQuery(c.name); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 transition-colors"
            >
              {c.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
