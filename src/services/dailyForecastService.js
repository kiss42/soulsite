import tarotData from '../data/tarotDeck.json';
import angelNumbersData from '../data/angelNumbers.json';
import {
  reduceWithMasterNumbers,
  calculatePersonalYearNumber,
  calculatePersonalMonthNumber,
  calculatePersonalDayNumber,
} from './numerologyService';
import { getSignByTarotCard } from './astrologyService';
import { getMoonPhaseInfo, getMoonSign } from '../utils/celestialCalc';

function dateSeed(date) {
  const key = date.toISOString().slice(0, 10); // YYYY-MM-DD — stable for the whole day
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return hash;
}

export function getCardOfTheDay(date = new Date()) {
  const deck = tarotData.tarotDeck;
  return deck[dateSeed(date) % deck.length];
}

export function getAngelNumberOfTheDay(personalDayNumber) {
  if (personalDayNumber == null) return null;
  return angelNumbersData[String(personalDayNumber)] ?? null;
}

// Looks for a real, checkable rhyme between today's independent threads
// rather than forcing one — the card's own number echoing the Personal Day
// number (same convention as TarotReading.js's natal echo check), or the
// card's zodiac correspondence sharing today's transiting Moon's element.
// Either, both, or neither can fire.
export function getConvergence({ card, personalDayNumber, moonSign }) {
  const echoes = [];

  if (card?.number != null && personalDayNumber != null) {
    if (reduceWithMasterNumbers(card.number) === personalDayNumber) {
      echoes.push(`${card.name}'s number echoes your Personal Day ${personalDayNumber} — two independent threads agree today.`);
    }
  }

  if (card && moonSign) {
    const cardSign = getSignByTarotCard(card.name);
    if (cardSign && cardSign.element === moonSign.element) {
      echoes.push(`${card.name} carries ${cardSign.element.toLowerCase()} energy — the same element the Moon is moving through right now.`);
    }
  }

  return echoes.length ? echoes : null;
}

export function getDailyForecast(birthdate, date = new Date()) {
  const moon = getMoonPhaseInfo(date);
  const moonSign = getMoonSign(date);
  const card = getCardOfTheDay(date);

  let personalDayNumber = null;
  if (birthdate) {
    const personalYear = calculatePersonalYearNumber(birthdate, date);
    const personalMonth = calculatePersonalMonthNumber(personalYear, date);
    personalDayNumber = calculatePersonalDayNumber(personalMonth, date);
  }

  const angelNumber = getAngelNumberOfTheDay(personalDayNumber);
  const convergence = getConvergence({ card, personalDayNumber, moonSign });

  return { moon, moonSign, card, personalDayNumber, angelNumber, convergence };
}
