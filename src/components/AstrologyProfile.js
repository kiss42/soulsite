import React, { useMemo, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import {
  getZodiacSign, getNatalMoonSign, getApproxRisingSign, getTrueRisingSign, getElementCompatibility,
  getZodiacTarotCard, getAllSigns,
} from '../services/astrologyService';
import { getMoonSign, getRetrogradeStatus } from '../utils/celestialCalc';
import { getChakraByElement } from '../services/chakraService';
import { calculateLifePathNumber } from '../services/numerologyService';
import { isValidLat, isValidLon } from '../utils/birthTime';
import { buildNatalChart } from '../services/natalChartService';
import NatalChart from './NatalChart';
import numerologyMeanings from '../data/numerologyMeanings.json';
import BirthdateField from './BirthdateField';
import CityPicker from './CityPicker';

const ELEMENT_HEX = { Fire: '#fb923c', Earth: '#34d399', Air: '#38bdf8', Water: '#818cf8' };

function Chip({ color, children }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium"
      style={{ borderColor: `${color}55`, color, background: `${color}12` }}
    >
      {children}
    </span>
  );
}

function TraitTags({ items, tone }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map(item => (
        <span
          key={item}
          className="tag"
          style={tone ? { borderColor: `${tone}30`, background: `${tone}10`, color: tone } : undefined}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export default function AstrologyProfile() {
  const { userDetails, setUserDetails } = useUser();
  const [compareSign, setCompareSign] = useState(null);

  const hasCoords = isValidLat(userDetails.birthLat) && isValidLon(userDetails.birthLon);

  const sign = useMemo(() => getZodiacSign(userDetails.birthdate), [userDetails.birthdate]);
  const moonSign = useMemo(
    () => getNatalMoonSign(userDetails.birthdate, userDetails.birthtime, userDetails.birthLat, userDetails.birthLon),
    [userDetails.birthdate, userDetails.birthtime, userDetails.birthLat, userDetails.birthLon]
  );
  const trueRising = useMemo(
    () => hasCoords && getTrueRisingSign(userDetails.birthdate, userDetails.birthtime, userDetails.birthLat, userDetails.birthLon),
    [hasCoords, userDetails.birthdate, userDetails.birthtime, userDetails.birthLat, userDetails.birthLon]
  );
  const approxRising = useMemo(
    () => sign && getApproxRisingSign(userDetails.birthtime, sign.name),
    [sign, userDetails.birthtime]
  );
  const risingSign = trueRising || approxRising;
  // The full chart — every planet, the angles, houses and aspects. Degrades
  // on its own as birth data gets thinner, so it can be built unconditionally.
  const { birthdate, birthtime, birthLat, birthLon } = userDetails;
  const natalChart = useMemo(
    () => buildNatalChart({ birthdate, birthtime, birthLat, birthLon }),
    [birthdate, birthtime, birthLat, birthLon]
  );

  const tarotCard = useMemo(() => sign && getZodiacTarotCard(sign.name), [sign]);
  const chakra = useMemo(() => sign && getChakraByElement(sign.element), [sign]);

  const lifePath = useMemo(() => {
    if (!sign || !userDetails.birthdate) return null;
    const number = calculateLifePathNumber(userDetails.birthdate);
    if (number == null) return null;
    return { number, keyword: numerologyMeanings.lifePath[number.toString()] };
  }, [sign, userDetails.birthdate]);

  const compatibility = useMemo(
    () => sign && compareSign ? getElementCompatibility(sign.name, compareSign) : null,
    [sign, compareSign]
  );

  // Short-term forecast: no new astronomical work needed — reuses the same
  // transiting-Moon calculation already shown in CelestialStatus, and the
  // same element-compatibility blurbs already written for comparing two
  // people's signs, just pointed at "today's sky" instead of a second person.
  const todayMoonSign = useMemo(() => getMoonSign(new Date()), []);
  const todayCompat = useMemo(
    () => sign && getElementCompatibility(sign.name, todayMoonSign.name),
    [sign, todayMoonSign]
  );
  const activeRetrogrades = useMemo(() => getRetrogradeStatus(new Date()).active, []);
  const rulingRetro = useMemo(
    () => sign && activeRetrogrades.find(r => r.planet === sign.rulingPlanet || r.planet === sign.traditionalRuler),
    [sign, activeRetrogrades]
  );

  const elementColor = sign ? ELEMENT_HEX[sign.element] : null;

  return (
    <div className="space-y-4">
      <div className="stack-card space-y-3">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/70">
          <span className="text-lg">♈</span>
          <span>Birth chart, simplified</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-xs text-white/45 pl-4 uppercase tracking-[0.18em]">Date of birth</label>
            <BirthdateField
              value={userDetails.birthdate}
              onChange={birthdate => setUserDetails({ ...userDetails, birthdate })}
            />
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-xs text-white/45 pl-4 uppercase tracking-[0.18em]">Time of birth <span className="text-white/25 normal-case">(unlocks Rising)</span></label>
            <input
              type="time"
              value={userDetails.birthtime}
              onChange={e => setUserDetails({ ...userDetails, birthtime: e.target.value })}
              className="pill-input"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-white/45 pl-4 uppercase tracking-[0.18em]">Birth city <span className="text-white/25 normal-case">(unlocks true Rising)</span></label>
          <CityPicker
            value={userDetails.birthCity}
            onSelect={c => setUserDetails({ ...userDetails, birthCity: c.name, birthLat: String(c.lat), birthLon: String(c.lon) })}
          />
        </div>
        <details className="text-xs text-white/30">
          <summary className="cursor-pointer pl-4 select-none hover:text-white/50">Not listed? Enter coordinates manually</summary>
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <input
              type="number"
              step="any"
              placeholder="Latitude, e.g. 40.7128"
              value={userDetails.birthLat}
              onChange={e => setUserDetails({ ...userDetails, birthLat: e.target.value, birthCity: '' })}
              className="pill-input flex-1"
            />
            <input
              type="number"
              step="any"
              placeholder="Longitude, e.g. -74.0060"
              value={userDetails.birthLon}
              onChange={e => setUserDetails({ ...userDetails, birthLon: e.target.value, birthCity: '' })}
              className="pill-input flex-1"
            />
          </div>
        </details>
      </div>

      {!sign && (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4 text-center">
          <p className="text-sm text-white/50">Enter your date of birth to reveal your Sun sign.</p>
        </div>
      )}

      {sign && (
        <>
          {/* Sun sign header */}
          <div
            className="rounded-2xl border p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center"
            style={{ borderColor: `${elementColor}30`, background: `${elementColor}08` }}
          >
            <div className="flex items-center gap-4">
              <span className="text-5xl" style={{ textShadow: `0 0 24px ${elementColor}80` }}>{sign.symbol}</span>
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/35 mb-0.5">Your Sun sign</p>
                <p className="text-xl font-semibold text-white">{sign.name}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Chip color={elementColor}>{sign.element}</Chip>
                  <Chip color="#cbd5e1">{sign.modality}</Chip>
                  <Chip color={sign.rulingPlanetColor}>{sign.rulingPlanetSymbol} {sign.rulingPlanet}{sign.traditionalRuler ? ` (trad. ${sign.traditionalRuler})` : ''}</Chip>
                  <span className="text-xs text-white/35">{sign.displayRange}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Big Three */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center space-y-0.5">
              <p className="text-[9px] uppercase tracking-[0.2em] text-white/35">Sun</p>
              <p className="text-2xl">{sign.symbol}</p>
              <p className="text-xs font-medium text-white/80">{sign.name}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center space-y-0.5">
              <p className="text-[9px] uppercase tracking-[0.2em] text-white/35">Moon</p>
              <p className="text-2xl">{moonSign ? moonSign.symbol : '☽'}</p>
              <p className="text-xs font-medium text-white/80">{moonSign ? moonSign.name : '—'}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center space-y-0.5">
              <p className="text-[9px] uppercase tracking-[0.2em] text-white/35">Rising</p>
              <p className="text-2xl">{risingSign ? risingSign.symbol : '↗'}</p>
              <p className="text-xs font-medium text-white/80">{risingSign ? risingSign.name : 'Add birth time'}</p>
            </div>
          </div>

          {/* Short-term forecast */}
          {todayCompat && (
            <div
              className="rounded-xl px-4 py-3 space-y-2"
              style={{ background: `${ELEMENT_HEX[todayCompat.elements[1]]}10`, borderLeft: `2px solid ${ELEMENT_HEX[todayCompat.elements[1]]}80` }}
            >
              <p className="eyebrow">Today, for you</p>
              <p className="text-sm text-white/75 leading-relaxed">
                Today's Moon is in <span className="font-medium" style={{ color: ELEMENT_HEX[todayMoonSign.element] }}>{todayMoonSign.symbol} {todayMoonSign.name}</span>, meeting your {sign.name} Sun as <strong className="text-white/85">{todayCompat.label}</strong>: {todayCompat.blurb}
              </p>
              {rulingRetro && (
                <p className="text-xs text-white/60 leading-relaxed border-t border-white/10 pt-2">
                  <span className="font-medium" style={{ color: rulingRetro.color }}>{rulingRetro.symbol} {rulingRetro.planet} is retrograde right now</span> — and it rules your {sign.name} Sun, so expect this transit to land closer to home than usual. {rulingRetro.advice}
                </p>
              )}
            </div>
          )}

          <div className="stack-card space-y-3">
            <p className="text-sm text-white/75 leading-relaxed">{sign.overview}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-1.5">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Strengths</p>
                <TraitTags items={sign.strengths} tone={elementColor} />
              </div>
              <div className="flex-1 space-y-1.5">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Watch for</p>
                <TraitTags items={sign.challenges} />
              </div>
            </div>
          </div>

          {/* Natal moon */}
          {moonSign && (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 flex items-start gap-3">
              <span className="text-2xl">☽</span>
              <div className="space-y-1">
                <p className="text-sm text-white/75">
                  When you were born, the Moon was passing through <span className={`font-medium`} style={{ color: ELEMENT_HEX[moonSign.element] }}>{moonSign.symbol} {moonSign.name}</span> — your inner, emotional world runs on {moonSign.element.toLowerCase()} energy ({moonSign.keywords}), even where your {sign.name} Sun runs on {sign.element.toLowerCase()}.
                </p>
                <p className="text-[10px] text-white/30 leading-relaxed">
                  {hasCoords
                    ? "Calculated from your exact birth coordinates and time, converted to the precise UTC instant — accurate to well under a degree."
                    : userDetails.birthtime
                      ? 'Sharpened with your birth time. Add your birth coordinates above for the most precise read —'
                      : 'Add your birth time and coordinates above for the most precise read —'} {!hasCoords && 'still not a substitute for a full natal chart with exact birth location.'}
                </p>
              </div>
            </div>
          )}

          {/* Natal rising */}
          {risingSign ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 flex items-start gap-3">
              <span className="text-2xl">↗</span>
              <div className="space-y-1">
                <p className="text-sm text-white/75">
                  At {userDetails.birthtime}, <span className="font-medium" style={{ color: ELEMENT_HEX[risingSign.element] }}>{risingSign.symbol} {risingSign.name}</span> was climbing the eastern horizon — your Rising sign, the mask the world meets before it ever gets to your {sign.name} Sun.
                </p>
                <p className="text-[10px] text-white/30 leading-relaxed">
                  {hasCoords
                    ? 'True Ascendant: computed from your exact birth coordinates and time via Greenwich sidereal time, the obliquity of the ecliptic, and your birth latitude — the same method astrology software uses.'
                    : 'Quick-read estimate: the Ascendant advances roughly one sign every two hours from sunrise. A true Ascendant also needs your birth latitude — add your birth coordinates above for the real placement instead of this hint.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-center">
              <p className="text-xs text-white/40">Add your time of birth above to reveal an estimated Rising sign.</p>
            </div>
          )}

          {natalChart && <NatalChart chart={natalChart} />}

          {/* Threads across practices */}
          <div className="space-y-2">
            <p className="eyebrow">Threads to your practice</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {tarotCard && (
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-1.5">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Tarot correspondence</p>
                  <p className="text-sm font-semibold text-white/85">{tarotCard.name}</p>
                  <p className="text-xs text-white/50 leading-relaxed">{tarotCard.meaning}</p>
                </div>
              )}
              {chakra && (
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-1.5">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Chakra correspondence</p>
                  <p className="text-sm font-semibold text-white/85">{chakra.name}</p>
                  <p className="text-xs text-white/50 leading-relaxed">{chakra.guidance}</p>
                </div>
              )}
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-1.5">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Crystal &amp; color</p>
                <p className="text-sm font-semibold text-white/85">{sign.crystal}</p>
                <p className="text-xs text-white/50 leading-relaxed">{sign.color} · lucky numbers {sign.luckyNumbers.join(' & ')}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-1.5">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Body rulership</p>
                <p className="text-sm font-semibold text-white/85">{sign.bodyPart}</p>
                <p className="text-xs text-white/50 leading-relaxed">
                  Classical medical astrology's anatomical correspondence for {sign.name} — its own thread alongside the chakra and life path number above, the same way numbers rule a chakra's region of the body.
                </p>
              </div>
            </div>
          </div>

          {/* Numerology blend */}
          {lifePath && (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--accent)]/60 mb-1.5">Numerology meets your stars</p>
              <p className="text-sm text-white/70 leading-relaxed">
                Your Sun in {sign.name} moves through life in a {sign.modality.toLowerCase()}, {sign.element.toLowerCase()} way. Layered with a Life Path {lifePath.number} built on "{lifePath.keyword.toLowerCase()}", the two threads weave together: the sign shows <em>how</em> you move, the number shows <em>why</em> you're here.
              </p>
            </div>
          )}

          {/* Compatibility checker */}
          <div className="stack-card space-y-3">
            <div>
              <p className="eyebrow">Compatibility check</p>
              <p className="text-xs text-white/40 mt-1">Tap another sign to see how it meets yours, element to element.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {getAllSigns().map(s => (
                <button
                  key={s.name}
                  onClick={() => setCompareSign(s.name)}
                  className={`w-10 h-10 rounded-full border flex items-center justify-center text-lg transition-colors ${
                    compareSign === s.name ? 'border-[var(--accent)] bg-[var(--accent)]/15' : 'border-white/15 hover:bg-white/5'
                  }`}
                  title={s.name}
                >
                  {s.symbol}
                </button>
              ))}
            </div>
            {compatibility && (
              <div
                className="rounded-lg px-3 py-2.5 mt-1"
                style={{ background: `${ELEMENT_HEX[compatibility.elements[1]]}18`, borderLeft: `2px solid ${ELEMENT_HEX[compatibility.elements[1]]}80` }}
              >
                <p className="text-xs font-semibold text-white/80">
                  {sign.name} + {compareSign}: {compatibility.label}
                </p>
                {compatibility.sameSign && (
                  <p className="text-[10px] text-white/40 italic mt-0.5">Same sign — you're looking in a mirror: all the gifts, amplified, and all the blind spots too.</p>
                )}
                <p className="text-xs text-white/60 leading-relaxed mt-1">{compatibility.blurb}</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
