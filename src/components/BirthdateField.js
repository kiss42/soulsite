import React, { useState, useEffect } from 'react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 110 }, (_, i) => CURRENT_YEAR - i);

function parseValue(value) {
  const [y, m, d] = (value || '').split('-').map(Number);
  return { year: y || '', month: m || '', day: d || '' };
}

function daysInMonth(month, year) {
  if (!month) return 31;
  return new Date(year || 2000, month, 0).getDate();
}

export default function BirthdateField({ value, onChange, className = '' }) {
  const [parts, setParts] = useState(() => parseValue(value));

  // Re-sync if the value changes from outside (e.g. profile loads, or a reset)
  useEffect(() => {
    setParts(parseValue(value));
  }, [value]);

  const update = (patch) => {
    const merged = { ...parts, ...patch };
    setParts(merged);
    const { year, month, day } = merged;
    if (year && month && day) {
      const clampedDay = Math.min(day, daysInMonth(month, year));
      onChange(`${year}-${String(month).padStart(2, '0')}-${String(clampedDay).padStart(2, '0')}`);
    } else {
      onChange('');
    }
  };

  const dayOptions = Array.from({ length: daysInMonth(parts.month, parts.year) }, (_, i) => i + 1);

  return (
    <div className={`grid grid-cols-[2fr_1fr_1.3fr] gap-2 ${className}`}>
      <select
        value={parts.month}
        onChange={e => update({ month: Number(e.target.value) })}
        className="pill-input"
        aria-label="Month"
      >
        <option value="">Month</option>
        {MONTHS.map((label, i) => (
          <option key={label} value={i + 1}>{label}</option>
        ))}
      </select>
      <select
        value={parts.day}
        onChange={e => update({ day: Number(e.target.value) })}
        className="pill-input"
        aria-label="Day"
      >
        <option value="">Day</option>
        {dayOptions.map(d => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>
      <select
        value={parts.year}
        onChange={e => update({ year: Number(e.target.value) })}
        className="pill-input"
        aria-label="Year"
      >
        <option value="">Year</option>
        {YEARS.map(y => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </div>
  );
}
