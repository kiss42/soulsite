import zodiacData from '../data/zodiacData.json';
import tarotData from '../data/tarotDeck.json';
import { getMoonSign, getAscendantLongitude, getSignIndexFromLongitude } from '../utils/celestialCalc';
import { resolveBirthUTC, isValidLat, isValidLon } from '../utils/birthTime';

const { signs, elementCompatibility } = zodiacData;

export function getZodiacSign(birthdateStr) {
  if (!birthdateStr) return null;
  const [, monthStr, dayStr] = birthdateStr.split('-');
  const month = Number(monthStr);
  const day = Number(dayStr);
  if (!month || !day) return null;

  return signs.find(({ dateRange: r }) => {
    if (r.startMonth === r.endMonth) {
      return month === r.startMonth && day >= r.startDay && day <= r.endDay;
    }
    // Wraps across new year (Capricorn: Dec 22 – Jan 19)
    return (month === r.startMonth && day >= r.startDay) || (month === r.endMonth && day <= r.endDay);
  }) ?? null;
}

export function getSignByName(name) {
  return signs.find(s => s.name === name) ?? null;
}

// Reverse of getZodiacTarotCard: which sign (if any) claims this tarot card
// as its own correspondence. Used to flag when a drawn card is literally the
// querent's own Sun sign's card — a real, checkable coincidence rather than
// a generic statement.
export function getSignByTarotCard(cardName) {
  return signs.find(s => s.tarotCard === cardName) ?? null;
}

export function getAllSigns() {
  return signs;
}

export function getNatalMoonSign(birthdateStr, birthtimeStr, lat, lon) {
  if (!birthdateStr) return null;
  const time = birthtimeStr || '12:00';
  // With birth coordinates we can resolve the exact UTC instant (via the
  // birth location's real timezone, not the device's current one) and use
  // the perturbation-corrected lunar longitude. Without coordinates, fall
  // back to treating the input as the device's local time — still useful,
  // just not sharpened to the birth location.
  const utcDate = isValidLat(lat) && isValidLon(lon)
    ? resolveBirthUTC(birthdateStr, time, Number(lat), Number(lon))
    : new Date(`${birthdateStr}T${time}:00`);
  return getMoonSign(utcDate);
}

// Quick-read Rising sign: at sunrise the Ascendant sits in the Sun sign itself, then
// advances roughly one sign every two hours as the sky turns. This ignores birth
// latitude and exact sidereal time, so it's a known approximation, not a true Ascendant.
// Used only as a fallback when birth coordinates aren't available — see
// getTrueRisingSign for the real calculation.
export function getApproxRisingSign(birthtimeStr, sunSignName) {
  if (!birthtimeStr || !sunSignName) return null;
  const [hStr, mStr] = birthtimeStr.split(':');
  const hour = Number(hStr) + Number(mStr) / 60;
  if (Number.isNaN(hour)) return null;

  const sunIndex = signs.findIndex(s => s.name === sunSignName);
  if (sunIndex === -1) return null;

  const signsElapsed = Math.floor((hour - 6) / 2);
  const risingIndex = (((sunIndex + signsElapsed) % 12) + 12) % 12;
  return signs[risingIndex];
}

// True Ascendant: needs exact birth time + birth latitude/longitude. Resolves
// the precise UTC birth instant via the birth location's real (historical)
// timezone, then the standard RAMC/obliquity formula astrology software uses.
export function getTrueRisingSign(birthdateStr, birthtimeStr, lat, lon) {
  if (!birthdateStr || !birthtimeStr) return null;
  if (!isValidLat(lat) || !isValidLon(lon)) return null;
  const latNum = Number(lat);
  const lonNum = Number(lon);
  const utcDate = resolveBirthUTC(birthdateStr, birthtimeStr, latNum, lonNum);
  const ascLon = getAscendantLongitude(utcDate, latNum, lonNum);
  return signs[getSignIndexFromLongitude(ascLon)];
}

export function getElementCompatibility(signNameA, signNameB) {
  const a = getSignByName(signNameA);
  const b = getSignByName(signNameB);
  if (!a || !b) return null;

  const key = [a.element, b.element].sort().join('-');
  const entry = elementCompatibility[key];
  const sameSign = a.name === b.name;

  return {
    ...entry,
    sameSign,
    elements: [a.element, b.element],
  };
}

export function getZodiacTarotCard(signName) {
  const sign = getSignByName(signName);
  if (!sign) return null;
  const card = tarotData.tarotDeck.find(c => c.name === sign.tarotCard);
  return card ? { ...card } : null;
}
