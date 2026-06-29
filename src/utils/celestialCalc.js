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

// Low-precision lunar position (Paul Schlyter / Meeus-style truncated lunar
// theory) — mean longitude plus the major periodic perturbation terms
// (evection, variation, annual equation, etc). Accurate to well under 1°,
// versus several degrees of error for mean motion alone — meaningful here
// because the Moon crosses a sign roughly every 2.2 days, so a multi-degree
// error can land it in the wrong sign for births near a cusp.
function getMoonEclipticLongitude(jd) {
  // Schlyter's epoch is 2000 Jan 0.0 UT (JD 2451543.5) — 1.5 days before
  // J2000.0 (JD 2451545.0, used elsewhere in this file for GMST/obliquity).
  // Mixing the two would shift the Moon's mean anomaly by ~19.6°, more than
  // half a sign's width, so this offset must stay distinct from J2000.0.
  const d = jd - 2451543.5;

  const Ms = norm360(356.0470 + 0.9856002585 * d); // Sun's mean anomaly
  const Mm = norm360(115.3654 + 13.0649929509 * d); // Moon's mean anomaly
  const N  = norm360(125.1228 - 0.0529538083 * d);  // Moon's long. of asc. node
  const w  = norm360(318.0634 + 0.1643573223 * d);  // Moon's arg. of perigee
  const Lm = norm360(N + w + Mm);                   // Moon's mean longitude
  const Ls = norm360(282.9404 + 4.70935e-5 * d + Ms); // Sun's mean longitude
  const D  = norm360(Lm - Ls);                       // Moon's mean elongation
  const F  = norm360(Lm - N);                        // Moon's argument of latitude

  const MsR = toRad(Ms), MmR = toRad(Mm), DR = toRad(D), FR = toRad(F);

  const perturbation =
    -1.274 * Math.sin(MmR - 2 * DR) +
     0.658 * Math.sin(2 * DR) +
    -0.186 * Math.sin(MsR) +
    -0.059 * Math.sin(2 * MmR - 2 * DR) +
    -0.057 * Math.sin(MmR - 2 * DR + MsR) +
     0.053 * Math.sin(MmR + 2 * DR) +
     0.046 * Math.sin(2 * DR - MsR) +
     0.041 * Math.sin(MmR - MsR) +
    -0.035 * Math.sin(DR) +
    -0.031 * Math.sin(MmR + MsR) +
    -0.015 * Math.sin(2 * FR - 2 * DR) +
     0.011 * Math.sin(MmR - 4 * DR);

  return norm360(Lm + perturbation);
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
      const start = new Date(period.start).getTime();
      const end   = new Date(period.end).getTime();
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

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
