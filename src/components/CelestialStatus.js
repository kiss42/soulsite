import React, { useState, useMemo } from 'react';
import { getMoonPhaseInfo, getMoonSign, getRetrogradeStatus, getRetrogradeDataCoverageEnd, formatDate } from '../utils/celestialCalc';

const ELEMENT_COLORS = {
  Fire:  'text-orange-300',
  Earth: 'text-emerald-300',
  Air:   'text-sky-300',
  Water: 'text-indigo-300',
};

function PlanetChip({ color, symbol, planet }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium"
      style={{ borderColor: `${color}55`, color, background: `${color}12` }}
    >
      <span>{symbol}</span>
      <span>{planet}</span>
    </span>
  );
}

function RetrogradeCard({ item, expanded, onToggle }) {
  const { planet, symbol, color, rules, meaning, advice, period, daysLeft } = item;

  return (
    <div
      className="rounded-xl border p-4 cursor-pointer transition-colors"
      style={{ borderColor: `${color}40`, background: `${color}0a` }}
      onClick={onToggle}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl" style={{ textShadow: `0 0 14px ${color}` }}>{symbol}</span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-white">{planet} Retrograde</p>
              <span
                className="text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full font-medium"
                style={{ background: `${color}25`, color }}
              >
                Active
              </span>
            </div>
            <p className="text-[10px] text-white/40 mt-0.5">in {period.sign} · {daysLeft}d remaining · ends {formatDate(period.end)}</p>
          </div>
        </div>
        <span className="text-white/30 text-sm shrink-0">{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <div className="mt-4 space-y-3 border-t pt-3" style={{ borderColor: `${color}25` }}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Rules</p>
          <p className="text-xs text-white/55 -mt-2">{rules}</p>
          <p className="text-sm text-white/75 leading-relaxed">{meaning}</p>
          <div className="rounded-lg px-3 py-2.5" style={{ background: `${color}18`, borderLeft: `2px solid ${color}80` }}>
            <p className="text-[10px] uppercase tracking-[0.18em] mb-1" style={{ color }}>What to do</p>
            <p className="text-xs text-white/70 leading-relaxed">{advice}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ShadowCard({ item }) {
  const { planet, symbol, color, period, phase, daysUntil, daysAgo } = item;
  const label = phase === 'pre'
    ? `Enters retrograde in ${daysUntil}d (${formatDate(period.start)})`
    : `Left retrograde ${daysAgo}d ago — shadow still active`;

  return (
    <div
      className="flex items-center gap-3 rounded-xl border px-4 py-3"
      style={{ borderColor: `${color}28`, background: `${color}07` }}
    >
      <span className="text-lg opacity-60" style={{ color }}>{symbol}</span>
      <div>
        <p className="text-xs font-medium text-white/70">{planet}</p>
        <p className="text-[10px] text-white/35">{label}</p>
      </div>
      <span
        className="ml-auto text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full"
        style={{ background: `${color}18`, color: `${color}bb` }}
      >
        Shadow
      </span>
    </div>
  );
}

function UpcomingRow({ item }) {
  const { planet, symbol, color, period, daysUntil } = item;
  return (
    <div className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
      <span className="text-base" style={{ color, opacity: 0.7 }}>{symbol}</span>
      <p className="text-xs text-white/60 flex-1">{planet} in {period.sign}</p>
      <p className="text-[10px] text-white/35">in {daysUntil}d · {formatDate(period.start)}</p>
    </div>
  );
}

export default function CelestialStatus() {
  const [expandedPlanet, setExpandedPlanet] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const now = useMemo(() => new Date(), []);
  const moon = useMemo(() => getMoonPhaseInfo(now), [now]);
  const moonSign = useMemo(() => getMoonSign(now), [now]);
  const { active, shadow, upcoming } = useMemo(() => getRetrogradeStatus(now), [now]);
  const coverageEnd = useMemo(() => getRetrogradeDataCoverageEnd(), []);
  const isDataStale = now > coverageEnd;

  const toggle = (planet) => setExpandedPlanet(p => (p === planet ? null : planet));

  return (
    <div className="space-y-6">

      {/* Moon status */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
        <div className="flex items-center gap-4">
          <span className="text-5xl" style={{ textShadow: '0 0 24px rgba(233,216,166,0.5)' }}>{moon.emoji}</span>
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/35 mb-0.5">Moon tonight</p>
            <p className="text-xl font-semibold text-white">{moon.name}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`text-xs font-medium ${ELEMENT_COLORS[moonSign.element] ?? 'text-white/60'}`}>
                {moonSign.symbol} {moonSign.name}
              </span>
              <span className="text-white/20">·</span>
              <span className="text-xs text-white/45">{moon.illumination}% illuminated</span>
              <span className="text-white/20">·</span>
              <span className="text-xs text-white/40">{moonSign.element} · {moonSign.keywords}</span>
            </div>
          </div>
        </div>
        <div className="sm:ml-auto rounded-xl bg-white/5 border border-white/10 px-4 py-3 max-w-xs">
          <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--accent)]/60 mb-1">Energy</p>
          <p className="text-xs text-white/65 leading-relaxed">{moon.energy}</p>
        </div>
      </div>

      {/* Note about moon retrograde */}
      <div className="flex items-start gap-3 rounded-xl bg-white/[0.03] border border-white/8 px-4 py-3">
        <span className="text-base mt-0.5">🌙</span>
        <p className="text-xs text-white/45 leading-relaxed">
          The Moon does not go retrograde — it always moves direct. What most people feel as "moon retrograde energy" is the moon passing through a sign ruled by a retrograde planet, or the moon entering a <strong className="text-white/60">void of course</strong> period. The active retrogrades below are what shape that feeling.
        </p>
      </div>

      {/* Active retrogrades */}
      {active.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <p className="eyebrow">Active now</p>
            <div className="flex gap-1.5 flex-wrap">
              {active.map(r => (
                <PlanetChip key={r.planet} color={r.color} symbol={r.symbol} planet={r.planet} />
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {active.map(item => (
              <RetrogradeCard
                key={item.planet}
                item={item}
                expanded={expandedPlanet === item.planet}
                onToggle={() => toggle(item.planet)}
              />
            ))}
          </div>
        </div>
      )}

      {active.length === 0 && isDataStale && (
        <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-4 text-center">
          <p className="text-sm text-amber-200/80">Our planetary calendar is due for a refresh.</p>
          <p className="text-xs text-amber-200/50 mt-1">We've mapped transits through {formatDate(coverageEnd.toISOString().slice(0, 10))} — check back soon for the next stretch of sky.</p>
        </div>
      )}

      {active.length === 0 && !isDataStale && (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4 text-center">
          <p className="text-sm text-white/50">No major planets in retrograde right now.</p>
          <p className="text-xs text-white/30 mt-1">A rare window — good time to move forward on important decisions.</p>
        </div>
      )}

      {/* Shadow periods */}
      {shadow.length > 0 && (
        <div className="space-y-2">
          <p className="eyebrow">Shadow periods</p>
          {shadow.map(item => (
            <ShadowCard key={item.planet} item={item} />
          ))}
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="eyebrow">Coming within 60 days</p>
            {upcoming.length > 3 && (
              <button
                className="text-[10px] uppercase tracking-widest text-white/35 hover:text-white/60 transition-colors"
                onClick={() => setShowAll(v => !v)}
              >
                {showAll ? 'Less' : `+${upcoming.length - 3} more`}
              </button>
            )}
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-1">
            {(showAll ? upcoming : upcoming.slice(0, 3)).map(item => (
              <UpcomingRow key={`${item.planet}-${item.period.start}`} item={item} />
            ))}
          </div>
        </div>
      )}

      <p className="text-[9px] text-center text-white/20 tracking-widest uppercase">
        Moon phase and sign calculated in real-time · Retrograde dates are approximate
      </p>
    </div>
  );
}
