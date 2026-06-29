import dreamSymbolsData from '../data/dreamSymbols.json';

const { symbols } = dreamSymbolsData;

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function keywordIndex(keyword, text) {
  const match = new RegExp(`\\b${escapeRegex(keyword)}\\b`, 'i').exec(text);
  return match ? match.index : -1;
}

export function getAllSymbols() {
  return symbols;
}

export function getSymbolByKey(key) {
  return symbols.find(s => s.key === key) ?? null;
}

export function pickRandomSymbol() {
  return symbols[Math.floor(Math.random() * symbols.length)];
}

// Scans free-form dream text for known symbols, returning matches ordered by
// where they first appear in the text so the reading follows the dream's own
// narrative rather than an arbitrary dictionary order.
export function interpretDreamText(text) {
  const lower = text.toLowerCase();
  const matches = [];

  for (const symbol of symbols) {
    let earliestIndex = Infinity;
    for (const keyword of symbol.keywords) {
      const index = keywordIndex(keyword, lower);
      if (index !== -1 && index < earliestIndex) earliestIndex = index;
    }
    if (earliestIndex !== Infinity) matches.push({ symbol, index: earliestIndex });
  }

  return matches.sort((a, b) => a.index - b.index).map(m => m.symbol);
}
