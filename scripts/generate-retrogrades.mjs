/**
 * Regenerates the retrograde calendar in src/data/celestialData.json from the
 * planetary math in src/utils/celestialCalc.js.
 *
 * The table used to be maintained by hand and had drifted badly — roughly 16 of
 * its 37 periods disagreed with the real sky by more than three days, and the
 * Mercury entries for 2025–2027 were out by 35–54 days (they looked like 2022's
 * dates). Generating it removes a whole class of silent staleness.
 *
 * Run:  node scripts/generate-retrogrades.mjs
 *
 * Only the `periods` array of each planet is rewritten. Every other field —
 * symbol, colour, rules, meaning, advice — is hand-written editorial copy and
 * is preserved exactly.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA = path.join(ROOT, 'src/data/celestialData.json');
const CALC = path.join(ROOT, 'src/utils/celestialCalc.js');

const FROM_YEAR = 2024;
const TO_YEAR = 2041;

// celestialCalc.js opens with a JSON import, which bare Node won't load without
// import attributes. None of the planetary functions touch that data, so the
// import is stripped and the module evaluated directly rather than adding a
// bundler just to run this script.
async function loadCalc() {
  const source = fs.readFileSync(CALC, 'utf8');
  const stripped = source.replace(/^import celestialData .*$/m, 'const celestialData = { zodiacSigns: [] };');
  if (stripped === source) throw new Error('expected a celestialData import to strip — has celestialCalc.js changed?');
  const tmp = path.join(ROOT, 'node_modules', '.retrograde-calc.mjs');
  fs.writeFileSync(tmp, stripped);
  try {
    return await import(`file://${tmp}?v=${Date.now()}`);
  } finally {
    fs.rmSync(tmp, { force: true });
  }
}

const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
               'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

const DAY = 86400000;
const isoDay = date => date.toISOString().slice(0, 10);

// Narrows a sign change in apparent motion down to the hour, so a station lands
// on the right calendar day instead of wherever the coarse scan happened to step.
function bisectStation(calc, planet, before, after) {
  let lo = before;
  let hi = after;
  const retroAt = t => calc.getPlanetMotion(planet, new Date(t)).retrograde;
  const target = retroAt(hi);
  while (hi - lo > 3600000) {
    const mid = Math.floor((lo + hi) / 2);
    if (retroAt(mid) === target) hi = mid; else lo = mid;
  }
  return new Date(hi);
}

function findPeriods(calc, planet) {
  // Scanned wider than the output window so a period straddling either edge is
  // seen whole and can be discarded cleanly rather than truncated.
  const scanStart = Date.UTC(FROM_YEAR - 2, 0, 1);
  const scanEnd = Date.UTC(TO_YEAR + 2, 0, 1);
  const step = 6 * 3600000;

  const periods = [];
  let previous = calc.getPlanetMotion(planet, new Date(scanStart)).retrograde;
  let openedAt = null;

  for (let t = scanStart + step; t <= scanEnd; t += step) {
    const retro = calc.getPlanetMotion(planet, new Date(t)).retrograde;
    if (retro === previous) continue;

    const station = bisectStation(calc, planet, t - step, t);
    if (retro) {
      openedAt = station;
    } else if (openedAt) {
      periods.push({ startDate: openedAt, endDate: station });
      openedAt = null;
    }
    previous = retro;
  }

  return periods
    .filter(p => p.startDate.getUTCFullYear() >= FROM_YEAR && p.startDate.getUTCFullYear() < TO_YEAR)
    .map(({ startDate, endDate }) => {
      const signAt = d => SIGNS[calc.getSignIndexFromLongitude(calc.getPlanetLongitude(planet, d))];
      const sign = signAt(startDate);
      const endSign = signAt(endDate);
      return {
        start: isoDay(startDate),
        end: isoDay(endDate),
        // Sign the planet stations in — the convention the existing UI reads.
        sign,
        // A long retrograde can walk back into the previous sign (Mars stationed
        // in Leo in Dec 2024 and finished in Cancer), so record it when it moves.
        ...(endSign !== sign ? { endSign } : {}),
      };
    });
}

const calc = await loadCalc();
const data = JSON.parse(fs.readFileSync(DATA, 'utf8'));

let total = 0;
for (const planet of data.retrogrades) {
  const periods = findPeriods(calc, planet.planet);
  planet.periods = periods;
  total += periods.length;
  const span = periods.length ? `${periods[0].start} … ${periods[periods.length - 1].end}` : 'none';
  console.log(`${planet.planet.padEnd(8)} ${String(periods.length).padStart(3)} periods   ${span}`);
}

fs.writeFileSync(DATA, `${JSON.stringify(data, null, 2)}\n`);
console.log(`\nWrote ${total} periods (${FROM_YEAR}–${TO_YEAR}) to ${path.relative(ROOT, DATA)}`);
