import zodiacData from '../data/zodiacData.json';
import natalData from '../data/natalChartData.json';
import {
  PLANET_ORDER, getPlanetMotion, getAscendantLongitude, getMidheavenLongitude,
  getLunarNodeLongitude, getSignIndexFromLongitude, getPlutoCoverage,
} from '../utils/celestialCalc';
import { resolveBirthUTC, isValidLat, isValidLon } from '../utils/birthTime';

const { signs } = zodiacData;

function norm360(deg) { const d = deg % 360; return d < 0 ? d + 360 : d; }

// 254.7° → { sign: Sagittarius, degree: 14.7, label: "14°42′" }. Astrologers
// read a placement as a degree *within* its sign, never as an absolute
// longitude, so every position gets converted on the way out.
export function describeLongitude(longitude) {
  const lon = norm360(longitude);
  const index = getSignIndexFromLongitude(lon);
  const degree = lon - index * 30;
  const whole = Math.floor(degree);
  const minutes = Math.round((degree - whole) * 60);
  // Rounding minutes can carry to 60; roll it into the degree rather than
  // printing "14°60′".
  const carried = minutes === 60;
  return {
    sign: signs[index],
    signIndex: index,
    longitude: lon,
    degree,
    label: `${carried ? whole + 1 : whole}°${String(carried ? 0 : minutes).padStart(2, '0')}′`,
  };
}

// Whole-sign houses: the Ascendant's whole sign becomes the 1st house and
// each following sign takes the next. It's the oldest system and the easiest
// to state honestly — no interpolated cusps, so a placement's house never
// depends on which of a dozen quadrant systems the app happened to pick.
function houseOf(longitude, ascSignIndex) {
  return ((getSignIndexFromLongitude(longitude) - ascSignIndex + 12) % 12) + 1;
}

function angularSeparation(a, b) {
  const d = Math.abs(norm360(a) - norm360(b)) % 360;
  return d > 180 ? 360 - d : d;
}

// Two bodies are "applying" when the exact aspect is still ahead of them and
// "separating" once it has passed. Measured by nudging both bodies forward an
// hour at their real speeds and seeing whether the orb tightens.
function aspectPhase(aLon, aSpeed, bLon, bSpeed, angle) {
  const now = Math.abs(angularSeparation(aLon, bLon) - angle);
  const later = Math.abs(angularSeparation(aLon + aSpeed / 24, bLon + bSpeed / 24) - angle);
  return later < now ? 'applying' : 'separating';
}

function findAspect(a, b) {
  for (const aspect of natalData.aspects) {
    // Luminaries get a wider orb — a long-standing convention, on the logic
    // that the Sun and Moon dominate a chart and their contacts stay felt
    // further from exact.
    const luminary = a.name === 'Sun' || a.name === 'Moon' || b.name === 'Sun' || b.name === 'Moon';
    const orb = aspect.orb + (luminary ? 2 : 0);
    const separation = angularSeparation(a.longitude, b.longitude);
    const delta = Math.abs(separation - aspect.angle);
    if (delta <= orb) {
      return {
        ...aspect,
        a: a.name,
        b: b.name,
        orb: delta,
        exact: delta < 1,
        phase: aspectPhase(a.longitude, a.speed ?? 0, b.longitude, b.speed ?? 0, aspect.angle),
        generational: Boolean(a.generational && b.generational),
      };
    }
  }
  return null;
}

/**
 * Assembles every placement the app can honestly compute from what the user
 * has entered, and reports exactly which parts are missing and why.
 *
 *   birthdate alone  → planets (Moon approximate), no houses or angles
 *   + birth time     → sharper Moon
 *   + birth city     → true Ascendant, Midheaven, houses, Part of Fortune
 */
export function buildNatalChart({ birthdate, birthtime, birthLat, birthLon }) {
  if (!birthdate) return null;

  const hasTime = Boolean(birthtime);
  const hasCoords = isValidLat(birthLat) && isValidLon(birthLon);
  const time = birthtime || '12:00';

  const lat = hasCoords ? Number(birthLat) : null;
  const lon = hasCoords ? Number(birthLon) : null;
  const date = hasCoords
    ? resolveBirthUTC(birthdate, time, lat, lon)
    : new Date(`${birthdate}T${time}:00`);

  if (Number.isNaN(date.getTime())) return null;

  // Angles first — the Ascendant defines the house frame everything else
  // gets placed into.
  const ascLongitude = hasCoords && hasTime ? getAscendantLongitude(date, lat, lon) : null;
  const mcLongitude = hasCoords && hasTime ? getMidheavenLongitude(date, lon) : null;
  const ascSignIndex = ascLongitude != null ? getSignIndexFromLongitude(ascLongitude) : null;
  const hasHouses = ascSignIndex != null;

  const placements = PLANET_ORDER.map(name => {
    const meta = natalData.planets[name];
    const motion = getPlanetMotion(name, date);
    const position = describeLongitude(motion.longitude);
    return {
      name,
      ...meta,
      ...position,
      speed: motion.speed,
      retrograde: motion.retrograde,
      generational: meta.kind === 'generational',
      // The Sun's twelve sign readings already exist as each sign's overview;
      // reusing them keeps one voice instead of a second, thinner copy.
      blurb: meta.signs[position.sign.name] || position.sign.overview,
      house: hasHouses ? houseOf(motion.longitude, ascSignIndex) : null,
    };
  });

  const bySign = name => placements.find(p => p.name === name);
  const sun = bySign('Sun');
  const moon = bySign('Moon');

  const points = [];

  if (ascLongitude != null) {
    points.push({
      name: 'Ascendant', ...natalData.points.Ascendant, ...describeLongitude(ascLongitude),
      house: 1, retrograde: false,
    });
  }
  if (mcLongitude != null) {
    points.push({
      name: 'Midheaven', ...natalData.points.Midheaven, ...describeLongitude(mcLongitude),
      house: hasHouses ? houseOf(mcLongitude, ascSignIndex) : null, retrograde: false,
    });
  }

  const nodeLongitude = getLunarNodeLongitude(date);
  points.push({
    name: 'North Node', ...natalData.points['North Node'], ...describeLongitude(nodeLongitude),
    house: hasHouses ? houseOf(nodeLongitude, ascSignIndex) : null,
    retrograde: true, // the nodes always move backwards through the zodiac
  });
  points.push({
    name: 'South Node', ...natalData.points['South Node'], ...describeLongitude(nodeLongitude + 180),
    house: hasHouses ? houseOf(nodeLongitude + 180, ascSignIndex) : null,
    retrograde: true,
  });

  // Part of Fortune. Houses 1–6 sit below the horizon, so a Sun more than
  // 180° ahead of the Ascendant is a daytime birth — and the day and night
  // formulas are mirror images of each other.
  let isDayBirth = null;
  if (ascLongitude != null) {
    isDayBirth = norm360(sun.longitude - ascLongitude) >= 180;
    const fortune = isDayBirth
      ? ascLongitude + moon.longitude - sun.longitude
      : ascLongitude + sun.longitude - moon.longitude;
    points.push({
      name: 'Part of Fortune', ...natalData.points['Part of Fortune'], ...describeLongitude(fortune),
      house: houseOf(fortune, ascSignIndex), retrograde: false,
    });
  }

  // Aspects across planets plus the two angles and the North Node. The
  // Ascendant and Midheaven are left unaspected to each other — the angle
  // between them is a product of latitude and sidereal time, not a
  // relationship between two moving bodies.
  const aspectBodies = [
    ...placements,
    ...points.filter(p => ['Ascendant', 'Midheaven', 'North Node'].includes(p.name)),
  ];
  const aspects = [];
  for (let i = 0; i < aspectBodies.length; i++) {
    for (let j = i + 1; j < aspectBodies.length; j++) {
      const a = aspectBodies[i];
      const b = aspectBodies[j];
      const pair = [a.name, b.name];
      if (pair.includes('Ascendant') && pair.includes('Midheaven')) continue;
      const hit = findAspect(a, b);
      if (hit) aspects.push(hit);
    }
  }
  aspects.sort((x, y) => x.orb - y.orb);

  // Element and modality balance across the ten planets, plus the Ascendant
  // when we have one. Counting only what's actually on screen keeps the
  // tallies checkable against the placement list above them.
  const counted = [...placements, ...points.filter(p => p.name === 'Ascendant')];
  const tally = key => counted.reduce((acc, p) => {
    const value = p.sign[key];
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});

  const houses = hasHouses
    ? natalData.houses.map((h, i) => ({ ...h, sign: signs[(ascSignIndex + i) % 12] }))
    : null;

  const chartRuler = hasHouses
    ? placements.find(p => p.name === signs[ascSignIndex].rulingPlanet) || null
    : null;

  const plutoCoverage = getPlutoCoverage();
  const plutoOutOfRange = date < plutoCoverage.from || date > plutoCoverage.to;

  return {
    date,
    hasTime,
    hasCoords,
    hasHouses,
    isDayBirth,
    placements,
    points,
    houses,
    aspects,
    chartRuler,
    elements: tally('element'),
    modalities: tally('modality'),
    countedBodies: counted.length,
    plutoOutOfRange,
  };
}

export function getHouseMeanings() {
  return natalData.houses;
}
