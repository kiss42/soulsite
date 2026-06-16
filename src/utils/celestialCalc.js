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

export function getMoonSign(date = new Date()) {
  const jd = toJD(date);
  const D = jd - 2451545.0;
  // Mean lunar longitude (ecliptic), degrees
  let lon = (218.316 + 13.176396 * D) % 360;
  if (lon < 0) lon += 360;
  const idx = Math.floor(lon / 30);
  return celestialData.zodiacSigns[idx];
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
