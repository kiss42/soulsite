import React, { useState } from 'react';
import NatalChartWheel, { ELEMENT_HEX } from './NatalChartWheel';
import { getHouseMeanings } from '../services/natalChartService';
import zodiacData from '../data/zodiacData.json';

// Matches the wheel: pin glyphs to their monochrome text form so they take the
// row's colour instead of rendering as emoji stickers.
const TEXT_PRESENTATION = '\uFE0E';
const glyph = symbol => ([...symbol].length === 1 ? symbol + TEXT_PRESENTATION : symbol);

const MODALITY_HEX = { Cardinal: '#f472b6', Fixed: '#facc15', Mutable: '#4ade80' };

function BalanceBar({ title, tally, colors, total }) {
  const entries = Object.entries(tally).sort((a, b) => b[1] - a[1]);
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">{title}</p>
      <div className="flex h-2 rounded-full overflow-hidden bg-white/5">
        {entries.map(([key, count]) => (
          <div key={key} style={{ width: `${(count / total) * 100}%`, background: colors[key] }} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {entries.map(([key, count]) => (
          <span key={key} className="text-[11px] text-white/55">
            <span style={{ color: colors[key] }}>●</span> {key} {count}
          </span>
        ))}
      </div>
    </div>
  );
}

function PlacementRow({ body, expanded, onToggle }) {
  const hex = ELEMENT_HEX[body.sign.element];
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-3 py-2.5 flex items-center gap-2.5 text-left hover:bg-white/[0.04] transition-colors"
      >
        <span className="natal-glyph text-lg w-6 text-center shrink-0" style={{ color: body.color }}>{glyph(body.symbol)}</span>
        <span className="text-xs font-medium text-white/80 shrink-0">{body.name}</span>
        {/* The only element allowed to shrink — everything else is short and
            fixed, so on a narrow phone this is what gives way rather than
            pushing the house label and chevron off the edge. */}
        <span className="natal-glyph text-xs min-w-0 truncate" style={{ color: hex }}>
          {glyph(body.sign.symbol)} {body.label} {body.sign.name}
        </span>
        {body.retrograde && (
          <span className="text-[10px] px-1.5 py-0.5 rounded border border-white/15 text-white/50 shrink-0">℞</span>
        )}
        <span className="flex-1" />
        {body.house && (
          <span className="text-[10px] text-white/35 shrink-0">
            <span className="hidden sm:inline">House </span><span className="sm:hidden">H</span>{body.house}
          </span>
        )}
        <span className={`text-white/25 text-xs transition-transform shrink-0 ${expanded ? 'rotate-90' : ''}`}>›</span>
      </button>
      {expanded && (
        <div className="px-3 pb-3 pt-0.5 space-y-1.5" style={{ borderTop: `1px solid ${hex}20` }}>
          <p className="text-[10px] uppercase tracking-[0.16em] pt-2" style={{ color: `${body.color}aa` }}>
            {body.title} · {body.rules}
          </p>
          <p className="text-xs text-white/65 leading-relaxed">{body.blurb}</p>
          {body.house && (
            <p className="text-[11px] text-white/40 leading-relaxed">
              Falling in your {ordinal(body.house)} house — {getHouseMeanings()[body.house - 1].meaning.toLowerCase()}
            </p>
          )}
          {body.retrograde && (
            <p className="text-[11px] text-white/40 leading-relaxed">
              Retrograde at birth: this energy runs inward first. You tend to work it out privately before it ever shows.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export default function NatalChart({ chart }) {
  const [openBody, setOpenBody] = useState(null);
  const [showAllAspects, setShowAllAspects] = useState(false);
  const [showHouses, setShowHouses] = useState(false);

  if (!chart) return null;

  const personal = chart.placements.filter(p => p.kind === 'luminary' || p.kind === 'personal');
  const social = chart.placements.filter(p => p.kind === 'social');
  const generational = chart.placements.filter(p => p.kind === 'generational');
  const aspects = showAllAspects ? chart.aspects : chart.aspects.slice(0, 8);

  return (
    <div className="space-y-4">
      <div className="stack-card space-y-4">
        <div>
          <p className="eyebrow">The whole chart</p>
          <p className="text-xs text-white/40 mt-1">
            {chart.hasHouses
              ? 'Every placement, its house, and the aspects between them — anchored to your Ascendant.'
              : 'Every planet at the moment you were born. Add a birth time and city to unlock houses and angles.'}
          </p>
        </div>

        <NatalChartWheel chart={chart} signs={zodiacData.signs} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <BalanceBar title="Elements" tally={chart.elements} colors={ELEMENT_HEX} total={chart.countedBodies} />
          <BalanceBar title="Modalities" tally={chart.modalities} colors={MODALITY_HEX} total={chart.countedBodies} />
        </div>
        <p className="text-[10px] text-white/25 leading-relaxed">
          Counted across the ten planets{chart.hasHouses ? ' plus your Ascendant' : ''} — {chart.countedBodies} placements in total.
          A stacked element is a genuine signature; an empty one is usually the thing you go looking for in other people.
        </p>
      </div>

      {/* Angles and calculated points */}
      {chart.points.length > 0 && (
        <div className="space-y-2">
          <p className="eyebrow">Angles &amp; points</p>
          <div className="space-y-1.5">
            {chart.points.map(p => (
              <PlacementRow
                key={p.name}
                body={{ ...p, blurb: p.note, kind: 'point' }}
                expanded={openBody === p.name}
                onToggle={() => setOpenBody(openBody === p.name ? null : p.name)}
              />
            ))}
          </div>
          {chart.isDayBirth != null && (
            <p className="text-[10px] text-white/25 leading-relaxed">
              {chart.isDayBirth
                ? 'The Sun was above the horizon when you were born — a day chart, so the Part of Fortune is measured from Moon to Sun.'
                : 'The Sun was below the horizon when you were born — a night chart, which flips the Part of Fortune formula.'}
            </p>
          )}
        </div>
      )}

      {/* Placements */}
      <div className="space-y-2">
        <p className="eyebrow">Your placements</p>
        <p className="text-xs text-white/40">Tap any placement to open it.</p>
        <div className="space-y-1.5">
          {personal.map(p => (
            <PlacementRow key={p.name} body={p} expanded={openBody === p.name}
                          onToggle={() => setOpenBody(openBody === p.name ? null : p.name)} />
          ))}
        </div>

        <p className="text-[10px] uppercase tracking-[0.18em] text-white/30 pt-2">The social planets</p>
        <div className="space-y-1.5">
          {social.map(p => (
            <PlacementRow key={p.name} body={p} expanded={openBody === p.name}
                          onToggle={() => setOpenBody(openBody === p.name ? null : p.name)} />
          ))}
        </div>

        <p className="text-[10px] uppercase tracking-[0.18em] text-white/30 pt-2">
          The generational planets
        </p>
        <p className="text-[11px] text-white/35 leading-relaxed -mt-1">
          These move so slowly that everyone born within years of you shares the sign — read them by house, and as the
          weather your whole generation grew up in.
        </p>
        <div className="space-y-1.5">
          {generational.map(p => (
            <PlacementRow key={p.name} body={p} expanded={openBody === p.name}
                          onToggle={() => setOpenBody(openBody === p.name ? null : p.name)} />
          ))}
        </div>
      </div>

      {/* Aspects */}
      {chart.aspects.length > 0 && (
        <div className="stack-card space-y-3">
          <div>
            <p className="eyebrow">Aspects</p>
            <p className="text-xs text-white/40 mt-1">
              The angles your planets make to each other — the conversations happening inside the chart. Tightest first.
            </p>
          </div>
          <div className="space-y-1.5">
            {aspects.map((a, i) => (
              <div key={i} className="rounded-lg px-3 py-2"
                   style={{ background: `${a.color}12`, borderLeft: `2px solid ${a.color}90` }}>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium text-white/85">{a.a}</span>
                  <span className="natal-glyph" style={{ color: a.color }}>{glyph(a.symbol)}</span>
                  <span className="text-xs font-medium text-white/85">{a.b}</span>
                  <span className="text-[10px] text-white/35">
                    {a.name} · orb {a.orb.toFixed(1)}° · {a.phase}
                  </span>
                  {a.exact && (
                    <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                          style={{ background: `${a.color}25`, color: a.color }}>exact</span>
                  )}
                </div>
                <p className="text-[11px] text-white/55 leading-relaxed mt-1">{a.meaning}</p>
                {a.pairing && (
                  <p className="text-[11px] text-white/35 leading-relaxed mt-1">{a.pairing}</p>
                )}
              </div>
            ))}
          </div>
          {chart.aspects.length > 8 && (
            <button onClick={() => setShowAllAspects(!showAllAspects)}
                    className="text-xs text-[var(--accent)]/80 hover:text-[var(--accent)] transition-colors">
              {showAllAspects ? 'Show fewer' : `Show all ${chart.aspects.length} aspects`}
            </button>
          )}
        </div>
      )}

      {/* Houses */}
      {chart.hasHouses && (
        <div className="stack-card space-y-3">
          <button onClick={() => setShowHouses(!showHouses)} className="w-full text-left">
            <p className="eyebrow">Your houses</p>
            <p className="text-xs text-white/40 mt-1">
              Whole-sign houses, counted from your {chart.points.find(p => p.name === 'Ascendant').sign.name} Ascendant.
              {showHouses ? '' : ' Tap to open.'}
            </p>
          </button>
          {showHouses && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {chart.houses.map(h => {
                const hex = ELEMENT_HEX[h.sign.element];
                const residents = [...chart.placements, ...chart.points]
                  .filter(p => p.house === h.number && p.name !== 'South Node');
                return (
                  <div key={h.number} className="rounded-lg border border-white/10 px-3 py-2 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-white/35">{ordinal(h.number)}</span>
                      <span className="text-xs font-medium text-white/80">{h.name}</span>
                      <span className="natal-glyph text-xs ml-auto" style={{ color: hex }}>{glyph(h.sign.symbol)} {h.sign.name}</span>
                    </div>
                    <p className="text-[11px] text-white/45 leading-relaxed">{h.meaning}</p>
                    {residents.length > 0 && (
                      <p className="text-[11px]">
                        {residents.map(r => (
                          <span key={r.name} style={{ color: r.color }} className="natal-glyph mr-2">{glyph(r.symbol)} {r.name}</span>
                        ))}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Honest accounting of what this is and isn't */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 space-y-1.5">
        <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">How this is calculated</p>
        <p className="text-[11px] text-white/40 leading-relaxed">
          Planetary positions come from truncated orbital theory computed in your browser — accurate to a few
          arcminutes, and checked against published charts. Houses are whole-sign, counted from the Ascendant.
          {!chart.hasHouses && ' Houses, angles and the Part of Fortune need an exact birth time and city.'}
          {!chart.hasTime && ' Without a birth time the Moon is placed at noon and can be up to 6° out — enough to change its sign.'}
        </p>
        {chart.plutoOutOfRange && (
          <p className="text-[11px] text-amber-300/60 leading-relaxed">
            Pluto's position is unreliable for this date — the series it uses only holds between 1800 and 2100.
          </p>
        )}
      </div>
    </div>
  );
}
