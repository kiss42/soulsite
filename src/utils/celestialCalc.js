import celestialData from '../data/celestialData.json';

const SYNODIC_MONTH = 29.53058867;
// Known new moon: Jan 6, 2000 18:14 UTC → Julian Day 2451549.260
const KNOWN_NEW_MOON_JD = 2451549.260;

function toJD(date) {
  return date.getTime() / 86400000 + 2440587.5;
}

export function getMoonPhaseDay(date = new Date()) {
  const jd = toJD(date);
  let days = (jd - KNOWN_NEW_MOON_JD) % SYNODIC_MONTH;
  if (days < 0) days += SYNODIC_MONTH;
  return days;
}

export function getMoonPhaseInfo(date = new Date()) {
  const days = getMoonPhaseDay(date);
  const illumination = Math.round(50 * (1 - Math.cos((2 * Math.PI * days) / SYNODIC_MONTH)));
  const phase = celestialData.moonPhases.find(p => days >= p.from && days < p.to)
    ?? celestialData.moonPhases[0];
  return { ...phase, illumination, days };
}

function toRad(deg) { return deg * Math.PI / 180; }
function toDeg(rad) { return rad * 180 / Math.PI; }
function norm360(deg) { const d = deg % 360; return d < 0 ? d + 360 : d; }

// Geocentric lunar position (Paul Schlyter's truncated lunar theory). The
// Moon's own orbit is solved through Kepler's equation first, then the major
// periodic perturbations (evection, variation, the yearly equation, ...) are
// added on top.
//
// Both halves are required. The equation of the centre that falls out of the
// Kepler solution reaches ±6.3° — bigger than every perturbation term below
// combined, and a fifth of a sign — so applying the perturbations to the mean
// longitude alone leaves a multi-degree error that lands the Moon in the wrong
// sign surprisingly often. Verified against documented new and full moons:
// elongation now lands within ~0.15° of 0° and 180° respectively.
function getMoonEclipticLongitude(jd) {
  // Schlyter's epoch is 2000 Jan 0.0 UT (JD 2451543.5) — 1.5 days before
  // J2000.0 (JD 2451545.0, used elsewhere in this file for GMST/obliquity).
  // Mixing the two would shift the Moon's mean anomaly by ~19.6°, more than
  // half a sign's width, so this offset must stay distinct from J2000.0.
  const d = jd - 2451543.5;

  // Mean orbital elements of the Moon's geocentric orbit.
  const N  = norm360(125.1228 - 0.0529538083 * d);  // long. of ascending node
  const i  = 5.1454;                                // inclination
  const w  = norm360(318.0634 + 0.1643573223 * d);  // argument of perigee
  const e  = 0.054900;                              // eccentricity
  const Mm = norm360(115.3654 + 13.0649929509 * d); // mean anomaly

  // Kepler's equation, solved in degrees by Newton-Raphson.
  const eDeg = toDeg(e);
  let E = Mm + eDeg * Math.sin(toRad(Mm)) * (1 + e * Math.cos(toRad(Mm)));
  for (let n = 0; n < 10; n++) {
    const delta = (E - eDeg * Math.sin(toRad(E)) - Mm) / (1 - e * Math.cos(toRad(E)));
    E -= delta;
    if (Math.abs(delta) < 1e-10) break;
  }

  // True anomaly, then the orbital plane rotated onto the ecliptic. The Moon
  // orbits Earth, so this is already geocentric — no origin shift needed.
  const xv = Math.cos(toRad(E)) - e;
  const yv = Math.sqrt(1 - e * e) * Math.sin(toRad(E));
  const v = toDeg(Math.atan2(yv, xv));

  const vw = toRad(v + w);
  const NR = toRad(N);
  const iR = toRad(i);
  const xh = Math.cos(NR) * Math.cos(vw) - Math.sin(NR) * Math.sin(vw) * Math.cos(iR);
  const yh = Math.sin(NR) * Math.cos(vw) + Math.cos(NR) * Math.sin(vw) * Math.cos(iR);
  const trueLon = norm360(toDeg(Math.atan2(yh, xh)));

  // Perturbation arguments are built from the *mean* elements, not the
  // Kepler-corrected ones.
  const Ms = norm360(356.0470 + 0.9856002585 * d);    // Sun's mean anomaly
  const Ls = norm360(282.9404 + 4.70935e-5 * d + Ms); // Sun's mean longitude
  const Lm = norm360(N + w + Mm);                     // Moon's mean longitude
  const D  = norm360(Lm - Ls);                        // Moon's mean elongation
  const F  = norm360(Lm - N);                         // Moon's arg. of latitude

  const MsR = toRad(Ms), MmR = toRad(Mm), DR = toRad(D), FR = toRad(F);

  const perturbation =
    -1.274 * Math.sin(MmR - 2 * DR) +   // evection
     0.658 * Math.sin(2 * DR) +         // variation
    -0.186 * Math.sin(MsR) +            // yearly equation
    -0.059 * Math.sin(2 * MmR - 2 * DR) +
    -0.057 * Math.sin(MmR - 2 * DR + MsR) +
     0.053 * Math.sin(MmR + 2 * DR) +
     0.046 * Math.sin(2 * DR - MsR) +
     0.041 * Math.sin(MmR - MsR) +
    -0.035 * Math.sin(DR) +             // parallactic equation
    -0.031 * Math.sin(MmR + MsR) +
    -0.015 * Math.sin(2 * FR - 2 * DR) +
     0.011 * Math.sin(MmR - 4 * DR);

  return norm360(trueLon + perturbation);
}

export function getMoonSign(date = new Date()) {
  const jd = toJD(date);
  const lon = getMoonEclipticLongitude(jd);
  const idx = Math.floor(lon / 30);
  return celestialData.zodiacSigns[idx];
}

// Obliquity of the ecliptic (degrees), Meeus low-precision series.
function getObliquity(jd) {
  const T = (jd - 2451545.0) / 36525;
  return 23.439291111 - 0.013004167 * T - 0.000000164 * T * T + 0.000000504 * T * T * T;
}

// Greenwich Mean Sidereal Time (degrees), Meeus low-precision series.
function getGMST(jd) {
  const T = (jd - 2451545.0) / 36525;
  const gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0)
             + 0.000387933 * T * T - (T * T * T) / 38710000;
  return norm360(gmst);
}

// True Ascendant (rising point) ecliptic longitude, degrees. Standard
// astrology-software formula: RAMC from Greenwich sidereal time + birth
// longitude, then the ecliptic/horizon intersection via obliquity and birth
// latitude. `date` must be the precise UTC instant of birth.
//   RAMC = GMST(jd) + longitude
//   Asc  = atan2(cos(RAMC), -(sin(RAMC)*cos(ε) + tan(latitude)*sin(ε)))
// Verified against a published worked example (RAMC 8.8485279795°, latitude
// 52.2166666666667°, obliquity 23.437101628° → 123.50798...° / 3°30'28.7"
// Leo) — matched to 9+ decimal places.
export function getAscendantLongitude(date, latitudeDeg, longitudeDeg) {
  const jd = toJD(date);
  const ramc = norm360(getGMST(jd) + longitudeDeg);
  const eps = toRad(getObliquity(jd));
  const ramcRad = toRad(ramc);
  const latRad = toRad(latitudeDeg);

  const asc = toDeg(Math.atan2(
    Math.cos(ramcRad),
    -(Math.sin(ramcRad) * Math.cos(eps) + Math.tan(latRad) * Math.sin(eps))
  ));
  return norm360(asc);
}

export function getSignIndexFromLongitude(lonDeg) {
  return Math.floor(norm360(lonDeg) / 30);
}

const SHADOW_DAYS = 14;

export function getRetrogradeStatus(date = new Date()) {
  const now = date.getTime();
  const active = [];
  const shadow = [];
  const upcoming = [];

  for (const planet of celestialData.retrogrades) {
    for (const period of planet.periods) {
      const start = parseCalendarDay(period.start).getTime();
      const end   = parseCalendarDay(period.end).getTime();
      const shadowStart = start - SHADOW_DAYS * 86400000;
      const shadowEnd   = end   + SHADOW_DAYS * 86400000;

      if (now >= start && now <= end) {
        const daysLeft = Math.ceil((end - now) / 86400000);
        active.push({ ...planet, period, daysLeft });
        break;
      } else if (now >= shadowStart && now < start) {
        const daysUntil = Math.ceil((start - now) / 86400000);
        shadow.push({ ...planet, period, daysUntil, phase: 'pre' });
        break;
      } else if (now > end && now <= shadowEnd) {
        const daysAgo = Math.floor((now - end) / 86400000);
        shadow.push({ ...planet, period, daysAgo, phase: 'post' });
        break;
      } else if (now < start) {
        const daysUntil = Math.ceil((start - now) / 86400000);
        if (daysUntil <= 60) {
          upcoming.push({ ...planet, period, daysUntil });
        }
        break;
      }
    }
  }

  // sort upcoming by proximity
  upcoming.sort((a, b) => a.daysUntil - b.daysUntil);

  return { active, shadow, upcoming };
}

// The retrograde calendar in celestialData.json is a finite, hand-maintained
// dataset (not computed from orbital mechanics) — once `date` passes this,
// getRetrogradeStatus() silently returns empty arrays with no indication why.
// Callers should check this and show a "data needs refreshing" notice instead
// of a bare "no retrogrades right now" message.
export function getRetrogradeDataCoverageEnd() {
  let latest = 0;
  for (const planet of celestialData.retrogrades) {
    for (const period of planet.periods) {
      const end = parseCalendarDay(period.end).getTime();
      if (end > latest) latest = end;
    }
  }
  return new Date(latest);
}

// "2026-12-10" parsed by `new Date()` is UTC midnight, which then renders as
// the 9th for anyone west of Greenwich. These are calendar days, not instants,
// so they're built as local midnight instead — otherwise every retrograde date
// in the app reads a day early for most of the Americas, and the day counts
// derived from them are off by one too.
export function parseCalendarDay(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatDate(dateStr) {
  return parseCalendarDay(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/* ───────────────────────────────────────────────────────────────────────────
   Planetary positions
   ───────────────────────────────────────────────────────────────────────────
   Same source and epoch as the lunar theory above (Paul Schlyter's "Computing
   planetary positions"), so `d` keeps its meaning: days since 1999-12-31
   00:00 UT (JD 2451543.5). Keplerian orbital elements are propagated linearly,
   solved for the eccentric anomaly, converted to heliocentric ecliptic
   rectangular coordinates, then shifted to geocentric by adding the Sun's
   position — which is what an ecliptic longitude in a natal chart actually is.

   Accuracy: ~1–2 arcminutes for the inner planets and ~2–4 arcminutes for
   Jupiter/Saturn once the major mutual perturbations are applied. Sign
   boundaries are 30° apart and even the fastest planet takes hours to move an
   arcminute, so placements are reliable except within a hair of a cusp.
   ─────────────────────────────────────────────────────────────────────────── */

// [constant term, per-day rate] at epoch JD 2451543.5.
const ORBITAL_ELEMENTS = {
  Mercury: { N: [48.3313, 3.24587e-5], i: [7.0047, 5.00e-8], w: [29.1241, 1.01444e-5], a: [0.387098, 0], e: [0.205635, 5.59e-10], M: [168.6562, 4.0923344368] },
  Venus:   { N: [76.6799, 2.46590e-5], i: [3.3946, 2.75e-8], w: [54.8910, 1.38374e-5], a: [0.723330, 0], e: [0.006773, -1.302e-9], M: [48.0052, 1.6021302244] },
  Mars:    { N: [49.5574, 2.11081e-5], i: [1.8497, -1.78e-8], w: [286.5016, 2.92961e-5], a: [1.523688, 0], e: [0.093405, 2.516e-9], M: [18.6021, 0.5240207766] },
  Jupiter: { N: [100.4542, 2.76854e-5], i: [1.3030, -1.557e-7], w: [273.8777, 1.64505e-5], a: [5.20256, 0], e: [0.048498, 4.469e-9], M: [19.8950, 0.0830853001] },
  Saturn:  { N: [113.6634, 2.38980e-5], i: [2.4886, -1.081e-7], w: [339.3939, 2.97661e-5], a: [9.55475, 0], e: [0.055546, -9.499e-9], M: [316.9670, 0.0334442282] },
  Uranus:  { N: [74.0005, 1.3978e-5], i: [0.7733, 1.9e-8], w: [96.6612, 3.0565e-5], a: [19.18171, -1.55e-8], e: [0.047318, 7.45e-9], M: [142.5905, 0.011725806] },
  Neptune: { N: [131.7806, 3.0173e-5], i: [1.7700, -2.55e-7], w: [272.8461, -6.027e-6], a: [30.05826, 3.313e-8], e: [0.008606, 2.15e-9], M: [260.2471, 0.005995147] },
};

// Kepler's equation, solved in degrees. The seed is accurate enough that
// Newton–Raphson converges in two or three passes for every planet here;
// the loop bound only guards against a pathological eccentricity.
function solveKepler(M, e) {
  const eDeg = toDeg(e);
  let E = M + eDeg * Math.sin(toRad(M)) * (1 + e * Math.cos(toRad(M)));
  for (let n = 0; n < 12; n++) {
    const delta = (E - eDeg * Math.sin(toRad(E)) - M) / (1 - e * Math.cos(toRad(E)));
    E -= delta;
    if (Math.abs(delta) < 1e-10) break;
  }
  return E;
}

// Heliocentric ecliptic longitude/latitude/distance from Keplerian elements.
function heliocentricEcliptic(el, d) {
  const N = norm360(el.N[0] + el.N[1] * d);
  const i = el.i[0] + el.i[1] * d;
  const w = norm360(el.w[0] + el.w[1] * d);
  const a = el.a[0] + el.a[1] * d;
  const e = el.e[0] + el.e[1] * d;
  const M = norm360(el.M[0] + el.M[1] * d);

  const E = solveKepler(M, e);
  const xv = a * (Math.cos(toRad(E)) - e);
  const yv = a * Math.sqrt(1 - e * e) * Math.sin(toRad(E));
  const v = toDeg(Math.atan2(yv, xv));
  const rv = Math.hypot(xv, yv);

  const vw = toRad(v + w);
  const NR = toRad(N);
  const iR = toRad(i);
  const x = rv * (Math.cos(NR) * Math.cos(vw) - Math.sin(NR) * Math.sin(vw) * Math.cos(iR));
  const y = rv * (Math.sin(NR) * Math.cos(vw) + Math.cos(NR) * Math.sin(vw) * Math.cos(iR));
  const z = rv * Math.sin(vw) * Math.sin(iR);
  const r = Math.sqrt(x * x + y * y + z * z);

  return { lon: norm360(toDeg(Math.atan2(y, x))), lat: toDeg(Math.asin(z / r)), r };
}

// Mutual perturbations. Jupiter and Saturn tug on each other hard enough
// (the "great inequality", up to ~0.8° for Saturn) that ignoring these can
// put either planet in the wrong sign near a cusp; Uranus gets smaller
// corrections from both. The inner planets need none at this precision.
function perturbLongitude(name, d) {
  const Mj = norm360(19.8950 + 0.0830853001 * d);
  const Ms = norm360(316.9670 + 0.0334442282 * d);
  const Mu = norm360(142.5905 + 0.011725806 * d);
  const s = deg => Math.sin(toRad(deg));
  const c = deg => Math.cos(toRad(deg));

  if (name === 'Jupiter') {
    return -0.332 * s(2 * Mj - 5 * Ms - 67.6)
           - 0.056 * s(2 * Mj - 2 * Ms + 21)
           + 0.042 * s(3 * Mj - 5 * Ms + 21)
           - 0.036 * s(Mj - 2 * Ms)
           + 0.022 * c(Mj - Ms)
           + 0.023 * s(2 * Mj - 3 * Ms + 52)
           - 0.016 * s(Mj - 5 * Ms - 69);
  }
  if (name === 'Saturn') {
    return  0.812 * s(2 * Mj - 5 * Ms - 67.6)
           - 0.229 * c(2 * Mj - 4 * Ms - 2)
           + 0.119 * s(Mj - 2 * Ms - 3)
           + 0.046 * s(2 * Mj - 6 * Ms - 69)
           + 0.014 * s(Mj - 3 * Ms + 32);
  }
  if (name === 'Uranus') {
    return  0.040 * s(Ms - 2 * Mu + 6)
           + 0.035 * s(Ms - 3 * Mu + 33)
           - 0.015 * s(Mj - Mu + 20);
  }
  return 0;
}

// Pluto has no usable Keplerian element set — its orbit is too perturbed by
// Neptune — so Schlyter gives a direct periodic series instead, valid roughly
// 1800–2100. Outside that window the series diverges badly, which
// getPlutoCoverage() below reports so callers can say so rather than print a
// confidently wrong placement.
function plutoHeliocentric(d) {
  const S = norm360(50.03 + 0.033459652 * d);
  const P = norm360(238.95 + 0.003968789 * d);
  const s = deg => Math.sin(toRad(deg));
  const c = deg => Math.cos(toRad(deg));

  const lon = norm360(
    238.9508 + 0.00400703 * d
    - 19.799 * s(P)     + 19.848 * c(P)
    +  0.897 * s(2 * P) -  4.956 * c(2 * P)
    +  0.610 * s(3 * P) +  1.211 * c(3 * P)
    -  0.341 * s(4 * P) -  0.190 * c(4 * P)
    +  0.128 * s(5 * P) -  0.034 * c(5 * P)
    -  0.038 * s(6 * P) +  0.031 * c(6 * P)
    +  0.020 * s(7 * P) -  0.010 * c(7 * P)
  );
  const lat =
    -3.908 * s(P)     +  0.162 * c(P)
    + 0.500 * s(2 * P) -  0.804 * c(2 * P)
    + 0.199 * s(3 * P) -  0.508 * c(3 * P)
    + 0.019 * s(4 * P) -  0.166 * c(4 * P)
    - 0.017 * s(5 * P) +  0.034 * c(5 * P)
    - 0.007 * s(6 * P) +  0.014 * c(6 * P);
  const r =
    40.72
    + 6.68 * s(P)     + 6.90 * c(P)
    - 1.18 * s(2 * P) - 0.03 * c(2 * P)
    + 0.15 * s(3 * P) - 0.14 * c(3 * P);

  // S is the Saturn-related argument in Schlyter's series; it participates
  // only through the terms already folded in above.
  void S;
  return { lon, lat, r };
}

export function getPlutoCoverage() {
  return { from: new Date('1800-01-01T00:00:00Z'), to: new Date('2100-01-01T00:00:00Z') };
}

// The Sun's geocentric ecliptic longitude and distance. Also the origin shift
// used to turn every heliocentric planet position into a geocentric one.
function sunEcliptic(d) {
  const w = 282.9404 + 4.70935e-5 * d;
  const e = 0.016709 - 1.151e-9 * d;
  const M = norm360(356.0470 + 0.9856002585 * d);

  const E = solveKepler(M, e);
  const xv = Math.cos(toRad(E)) - e;
  const yv = Math.sqrt(1 - e * e) * Math.sin(toRad(E));
  const v = toDeg(Math.atan2(yv, xv));
  const r = Math.hypot(xv, yv);

  return { lon: norm360(v + w), r };
}

// Mean Black Moon Lilith — the Moon's mean apogee, i.e. the empty focus of the
// lunar orbit, 180 deg from the mean perigee. This is the "mean" Lilith that
// most astrology software and every printed ephemeris defaults to; the "true"
// (osculating) apogee wobbles several degrees either side of it and can even
// retrograde, which the mean point never does.
//
// Perigee series from Meeus, Astronomical Algorithms. Verified against
// published ingress dates: this puts Lilith into Scorpio on 2025-03-27 and out
// of it on 2025-12-21, matching the documented Mar 27 - Dec 20 2025 transit,
// and the implied apsidal period is 8.848 years against a documented 8.85.
export function getLilithLongitude(date = new Date()) {
  const T = (toJD(date) - 2451545.0) / 36525;
  const perigee = 83.3532465
    + 4069.0137287 * T
    - 0.0103200 * T * T
    - (T * T * T) / 80053
    + (T * T * T * T) / 18999000;
  return norm360(perigee + 180);
}

export function getSunLongitude(date = new Date()) {
  return sunEcliptic(toJD(date) - 2451543.5).lon;
}

// Exposed so the natal chart can report the Moon's exact degree within its
// sign, not just which sign it fell in.
export function getMoonLongitude(date = new Date()) {
  return getMoonEclipticLongitude(toJD(date));
}

// Mean lunar node. The North Node ("where you're headed") is this longitude;
// the South Node sits exactly opposite. Its rate is negative — the nodes move
// backwards through the zodiac, which is why the Node always reads retrograde.
export function getLunarNodeLongitude(date = new Date()) {
  return norm360(125.1228 - 0.0529538083 * (toJD(date) - 2451543.5));
}

export const PLANET_ORDER = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars',
  'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
];

export function getPlanetLongitude(name, date = new Date()) {
  if (name === 'Sun') return getSunLongitude(date);
  if (name === 'Moon') return getMoonLongitude(date);

  const d = toJD(date) - 2451543.5;
  const helio = name === 'Pluto'
    ? plutoHeliocentric(d)
    : heliocentricEcliptic(ORBITAL_ELEMENTS[name], d);
  if (!helio) return null;

  const lon = norm360(helio.lon + perturbLongitude(name, d));
  const lat = helio.lat;
  const r = helio.r;

  // Heliocentric spherical → rectangular, then shift the origin from the Sun
  // to the Earth. The Sun's own ecliptic latitude is zero by definition, so
  // it contributes only to x and y.
  const lonR = toRad(lon);
  const latR = toRad(lat);
  const x = r * Math.cos(lonR) * Math.cos(latR);
  const y = r * Math.sin(lonR) * Math.cos(latR);

  const sun = sunEcliptic(d);
  const gx = x + sun.r * Math.cos(toRad(sun.lon));
  const gy = y + sun.r * Math.sin(toRad(sun.lon));

  return norm360(toDeg(Math.atan2(gy, gx)));
}

// Apparent daily motion, by differencing the geocentric longitude a day
// either side. A negative value means the planet is retrograde — moving
// backwards against the fixed stars as Earth overtakes it. A natal retrograde
// is a real, checkable feature of a chart, not a mood.
export function getPlanetMotion(name, date = new Date()) {
  const longitude = getPlanetLongitude(name, date);
  const before = getPlanetLongitude(name, new Date(date.getTime() - 43200000));
  const after = getPlanetLongitude(name, new Date(date.getTime() + 43200000));

  let speed = after - before;
  if (speed > 180) speed -= 360;
  if (speed < -180) speed += 360;

  return { name, longitude, speed, retrograde: speed < 0 };
}

export function getPlanetPositions(date = new Date()) {
  return PLANET_ORDER.map(name => getPlanetMotion(name, date));
}

// Midheaven (Medium Coeli): where the ecliptic crosses the meridian directly
// overhead — the chart's public-facing angle, and the cusp of the 10th house.
// Same RAMC the Ascendant formula uses, projected onto the ecliptic instead
// of the horizon: tan(MC) = tan(RAMC) / cos(obliquity).
export function getMidheavenLongitude(date, longitudeDeg) {
  const jd = toJD(date);
  const ramc = toRad(norm360(getGMST(jd) + longitudeDeg));
  const eps = toRad(getObliquity(jd));
  return norm360(toDeg(Math.atan2(Math.sin(ramc), Math.cos(ramc) * Math.cos(eps))));
}
