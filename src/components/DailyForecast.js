import React, { useMemo } from 'react';
import { useUser } from '../contexts/UserContext';
import { getDailyForecast } from '../services/dailyForecastService';
import numerologyMeanings from '../data/numerologyMeanings.json';

const TODAY_LABEL = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

export default function DailyForecast() {
  const { userDetails } = useUser();

  const { moon, card, personalDayNumber, angelNumber, convergence } = useMemo(
    () => getDailyForecast(userDetails.birthdate),
    [userDetails.birthdate]
  );

  const dayMeaning = personalDayNumber != null ? numerologyMeanings.personalYear[String(personalDayNumber)] : null;

  return (
    <div className="space-y-4">
      <div className="stack-card space-y-4">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/70">
          <span className="text-lg">☉</span>
          <span>Today — {TODAY_LABEL}</span>
        </div>

        {/* Moon */}
        <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/10 px-4 py-3">
          <span className="text-3xl" style={{ textShadow: '0 0 18px rgba(233,216,166,0.5)' }}>{moon.emoji}</span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">{moon.name}</p>
            <p className="text-xs text-white/45 leading-relaxed">{moon.energy}</p>
          </div>
        </div>

        {/* Card of the day */}
        {card && (
          <div className="flex items-start gap-3 rounded-xl bg-white/[0.03] border border-white/10 px-4 py-3">
            <img
              src={card.imageURL}
              alt={card.name}
              className="w-[56px] h-[90px] object-cover rounded-lg shadow-lg shrink-0"
            />
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/35 mb-0.5">Card of the day</p>
              <p className="text-sm font-semibold text-white">{card.name}</p>
              <p className="text-xs text-white/50 leading-relaxed">{card.meaning}</p>
            </div>
          </div>
        )}

        {/* Personal Day number */}
        {personalDayNumber != null ? (
          <div className="rounded-xl bg-white/[0.03] border border-white/10 px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/35 mb-0.5">Your Personal Day</p>
            <p className="text-sm font-semibold text-white">Day {personalDayNumber}{dayMeaning ? ` — ${dayMeaning}` : ''}</p>
          </div>
        ) : (
          <p className="text-xs text-white/30 text-center">Add your birthdate in your profile to see your Personal Day number here too.</p>
        )}

        {/* Angel number of the day */}
        {angelNumber && (
          <div className="rounded-xl bg-white/[0.03] border border-white/10 px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/35 mb-0.5">Angel number for today — {personalDayNumber}</p>
            <p className="text-sm text-white/75 leading-relaxed">{angelNumber.majorMessage}</p>
          </div>
        )}

        {/* Convergence */}
        {convergence && (
          <div className="rounded-xl px-3 py-2.5 border border-[var(--accent)]/40 bg-[var(--accent)]/10 space-y-1">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--accent)]/70">✦ Today's threads align</p>
            {convergence.map((line, i) => (
              <p key={i} className="text-xs text-white/75 leading-relaxed">{line}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
