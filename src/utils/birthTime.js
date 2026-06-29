import tzlookup from 'tz-lookup';

function offsetMinutesAt(utcMillis, timeZone) {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  const parts = dtf.formatToParts(new Date(utcMillis)).reduce((acc, p) => {
    acc[p.type] = p.value;
    return acc;
  }, {});
  const asUtc = Date.UTC(
    Number(parts.year), Number(parts.month) - 1, Number(parts.day),
    Number(parts.hour), Number(parts.minute), Number(parts.second)
  );
  return (asUtc - utcMillis) / 60000;
}

// Converts a birth date+time entered as local wall-clock time at (lat, lon)
// into a precise UTC Date. Resolves the IANA zone from coordinates via
// tz-lookup (fully offline, no network), then uses Intl's built-in historical
// timezone database to get the exact UTC offset for that date — correctly
// handles DST and pre-DST-era rules without a moment-timezone/luxon
// dependency. Two passes converge except in the rare ambiguous "DST
// fall-back repeated hour" case, the same limitation every timezone library
// has for that edge case.
export function resolveBirthUTC(dateStr, timeStr, lat, lon) {
  const timeZone = tzlookup(lat, lon);
  const [y, m, d] = dateStr.split('-').map(Number);
  const [hh, mm] = (timeStr || '12:00').split(':').map(Number);
  const naiveUtcMillis = Date.UTC(y, m - 1, d, hh, mm);

  let guess = naiveUtcMillis;
  for (let i = 0; i < 2; i++) {
    guess = naiveUtcMillis - offsetMinutesAt(guess, timeZone) * 60000;
  }
  return new Date(guess);
}

export function isValidLat(v) {
  const n = Number(v);
  return v !== '' && v != null && Number.isFinite(n) && Math.abs(n) <= 90;
}

export function isValidLon(v) {
  const n = Number(v);
  return v !== '' && v != null && Number.isFinite(n) && Math.abs(n) <= 180;
}
