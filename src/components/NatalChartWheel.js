import React, { useMemo } from 'react';

export const ELEMENT_HEX = { Fire: '#fb923c', Earth: '#34d399', Air: '#38bdf8', Water: '#818cf8' };

const SIZE = 380;
const C = SIZE / 2;
const R_SIGN_OUT = 184;
const R_SIGN_IN = 152;
const R_HOUSE_IN = 122;
const R_TICK = 138;      // where a body's exact-degree tick touches the house ring
const R_GLYPH = 106;     // where the glyph itself sits
const R_ASPECT = 88;     // radius the aspect chords are drawn on

// Several astrological glyphs (the zodiac signs, Venus, Mars, the arrow used
// for the Ascendant) also carry an emoji presentation, which browsers pick by
// default and render as a coloured sticker. U+FE0E is the text variation
// selector: it pins them to the monochrome text form so they inherit `fill`.
// It is inert on code points that have no emoji form, and skipped for
// multi-character labels like "MC".
const TEXT_PRESENTATION = '\uFE0E';
function glyph(symbol) {
  return [...symbol].length === 1 ? symbol + TEXT_PRESENTATION : symbol;
}

function polar(r, deg) {
  const a = (deg * Math.PI) / 180;
  return [C + r * Math.cos(a), C + r * Math.sin(a)];
}

function annulus(rOut, rIn, fromDeg, toDeg) {
  const [x1, y1] = polar(rOut, fromDeg);
  const [x2, y2] = polar(rOut, toDeg);
  const [x3, y3] = polar(rIn, toDeg);
  const [x4, y4] = polar(rIn, fromDeg);
  const large = Math.abs(toDeg - fromDeg) > 180 ? 1 : 0;
  return `M${x1} ${y1} A${rOut} ${rOut} 0 ${large} 1 ${x2} ${y2} `
       + `L${x3} ${y3} A${rIn} ${rIn} 0 ${large} 0 ${x4} ${y4} Z`;
}

// Glyphs are pushed apart just enough not to collide, while a thin tick still
// points back at the true degree — so a stellium stays readable without
// lying about where anything actually is.
function declutter(bodies, minGap) {
  const sorted = [...bodies].sort((a, b) => a.wheelAngle - b.wheelAngle);
  for (let pass = 0; pass < 4; pass++) {
    for (let i = 1; i < sorted.length; i++) {
      const gap = sorted[i].display - sorted[i - 1].display;
      if (gap < minGap) {
        const push = (minGap - gap) / 2;
        sorted[i - 1].display -= push;
        sorted[i].display += push;
      }
    }
    // The ring wraps, so the last and first glyph are neighbours too.
    if (sorted.length > 1) {
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      const wrapGap = first.display + 360 - last.display;
      if (wrapGap < minGap) {
        const push = (minGap - wrapGap) / 2;
        last.display -= push;
        first.display += push;
      }
    }
  }
  return sorted;
}

/**
 * The chart wheel. Longitude runs anticlockwise from the Ascendant at the
 * left — the standard orientation, which puts the Midheaven at the top and
 * the IC at the bottom. Without a birth time there is no Ascendant, so the
 * wheel falls back to 0° Aries on the left and the house ring is omitted
 * rather than faked.
 */
export default function NatalChartWheel({ chart, signs }) {
  const ascLongitude = chart.hasHouses
    ? chart.points.find(p => p.name === 'Ascendant').longitude
    : 0;

  // Screen angle for an ecliptic longitude. SVG's y-axis points down, so a
  // decreasing angle here reads as anticlockwise on screen.
  const angleOf = lon => 180 - (lon - ascLongitude);

  // Two different sets. Every body needs a position so aspect chords can be
  // drawn to it — including the Ascendant and Midheaven, which carry some of
  // the tightest aspects in a chart. Only some of them get a glyph: the angles
  // are already drawn as labelled spokes and the South Node is implied by the
  // North, so repeating them in the glyph ring would just crowd it.
  const drawnAsSpokes = ['Ascendant', 'Midheaven', 'South Node'];

  const positionOf = useMemo(() => {
    const map = {};
    [...chart.placements, ...chart.points].forEach(b => {
      map[b.name] = { wheelAngle: angleOf(b.longitude) };
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chart]);

  const bodies = useMemo(() => {
    const all = [
      ...chart.placements,
      ...chart.points.filter(p => !drawnAsSpokes.includes(p.name)),
    ].map(b => ({
      name: b.name,
      symbol: b.symbol,
      color: b.color,
      retrograde: b.retrograde,
      longitude: b.longitude,
      wheelAngle: angleOf(b.longitude),
      display: angleOf(b.longitude),
    }));
    return declutter(all, 9);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chart]);

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="natal-wheel w-full max-w-[420px] mx-auto block" role="img"
         aria-label="Natal chart wheel">
      {/* Zodiac band */}
      {signs.map((sign, i) => {
        const from = angleOf((i + 1) * 30);
        const to = angleOf(i * 30);
        const mid = angleOf(i * 30 + 15);
        const [gx, gy] = polar((R_SIGN_OUT + R_SIGN_IN) / 2, mid);
        const hex = ELEMENT_HEX[sign.element];
        return (
          <g key={sign.name}>
            <path d={annulus(R_SIGN_OUT, R_SIGN_IN, from, to)} fill={`${hex}1f`} stroke={`${hex}55`} strokeWidth="0.75" />
            <text x={gx} y={gy} fill={hex} fontSize="17" textAnchor="middle" dominantBaseline="central">{glyph(sign.symbol)}</text>
          </g>
        );
      })}

      {/* House ring — only drawn when a real Ascendant anchors it */}
      {chart.hasHouses && chart.houses.map((house, i) => {
        // Whole-sign houses share the zodiac's boundaries, so only the cusp
        // line and the number are drawn here — the band itself is the sign
        // ring above.
        const to = angleOf(ascLongitude + i * 30);
        const mid = angleOf(ascLongitude + i * 30 + 15);
        const [hx, hy] = polar((R_SIGN_IN + R_HOUSE_IN) / 2, mid);
        const [lx, ly] = polar(R_SIGN_IN, to);
        const [lx2, ly2] = polar(R_HOUSE_IN, to);
        return (
          <g key={house.number}>
            <line x1={lx} y1={ly} x2={lx2} y2={ly2} className="wheel-line" strokeWidth={i % 3 === 0 ? 1.4 : 0.6} />
            <text x={hx} y={hy} className="wheel-muted" fontSize="10" textAnchor="middle" dominantBaseline="central">{house.number}</text>
          </g>
        );
      })}

      <circle cx={C} cy={C} r={R_HOUSE_IN} className="wheel-line" fill="none" strokeWidth="0.8" />
      <circle cx={C} cy={C} r={R_ASPECT} className="wheel-line" fill="none" strokeWidth="0.5" strokeDasharray="2 4" />

      {/* Aspect chords. Tighter orbs draw stronger — the eye should land on
          the aspects that actually dominate the chart. */}
      {chart.aspects.map((asp, i) => {
        const a = positionOf[asp.a];
        const b = positionOf[asp.b];
        if (!a || !b) return null;
        const [x1, y1] = polar(R_ASPECT, a.wheelAngle);
        const [x2, y2] = polar(R_ASPECT, b.wheelAngle);
        const strength = 1 - asp.orb / (asp.orb + 6);
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={asp.color} strokeWidth={0.6 + strength * 1.1}
                opacity={0.22 + strength * 0.5} />
        );
      })}

      {/* Angles, drawn as spokes so the horizon and meridian read at a glance */}
      {chart.hasHouses && ['Ascendant', 'Midheaven'].map(name => {
        const p = chart.points.find(q => q.name === name);
        if (!p) return null;
        const [x1, y1] = polar(R_HOUSE_IN, angleOf(p.longitude));
        const [x2, y2] = polar(R_SIGN_IN, angleOf(p.longitude));
        const [tx, ty] = polar(R_SIGN_IN - 12, angleOf(p.longitude));
        return (
          <g key={name}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={p.color} strokeWidth="1.6" opacity="0.85" />
            <text x={tx} y={ty} fill={p.color} fontSize="8.5" textAnchor="middle" dominantBaseline="central"
                  letterSpacing="0.5">{name === 'Ascendant' ? 'AC' : 'MC'}</text>
          </g>
        );
      })}

      {/* Bodies */}
      {bodies.map(b => {
        const [tx1, ty1] = polar(R_TICK, b.wheelAngle);
        const [tx2, ty2] = polar(R_GLYPH + 11, b.display);
        const [gx, gy] = polar(R_GLYPH, b.display);
        return (
          <g key={b.name}>
            <line x1={tx1} y1={ty1} x2={tx2} y2={ty2} stroke={b.color} strokeWidth="0.7" opacity="0.55" />
            <text x={gx} y={gy} fill={b.color} fontSize="15" textAnchor="middle" dominantBaseline="central">{glyph(b.symbol)}</text>
            {b.retrograde && (
              <text x={gx + 10} y={gy + 6} fill={b.color} fontSize="7.5" textAnchor="middle" opacity="0.8">℞</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
