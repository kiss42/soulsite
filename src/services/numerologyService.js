/* Pythagorean numerology.
 *
 * Letter values follow the standard Pythagorean square: A–I are 1–9, J–R
 * repeat 1–9, and S–Z run 1–8. `(charCode - 65) % 9 + 1` reproduces that table
 * exactly.
 *
 * Y is treated as a consonant throughout. Some schools count it as a vowel
 * when it carries the vowel sound of a syllable ("Lynn", "Bryn"), but that
 * needs pronunciation, not spelling — so this app makes the one consistent
 * choice and says so, rather than guessing per name. Whatever the rule, Y must
 * land in exactly one of the two buckets: Soul Urge reads the vowels and
 * Personality the consonants, and a letter counted in both, or neither, would
 * make the pair disagree with the Expression number built from all the letters.
 */

const MASTER_NUMBERS = [11, 22, 33];

// Totals that carry a karmic debt. These are read on the *unreduced* total,
// which is why every calculation below reports its raw sum alongside the
// reduced result — once you reduce 13 to 4 the debt is invisible.
const KARMIC_DEBT_NUMBERS = [13, 14, 16, 19];

function digitSum(number) {
  return String(number).split('').reduce((acc, d) => acc + Number(d), 0);
}

// Reduces to a single digit, stopping early on a master number (11, 22, 33).
export function reduceWithMasterNumbers(number) {
  let sum = number;
  while (sum > 9 && !MASTER_NUMBERS.includes(sum)) sum = digitSum(sum);
  return sum;
}

// Always reduces to 1–9. The Personal Year/Month/Day cycles use this: they're
// short-term timing numbers, and by convention they don't carry master numbers.
export function reduceToSingleDigit(number) {
  let sum = number;
  while (sum > 9) sum = digitSum(sum);
  return sum;
}

const letterValue = letter => ((letter.charCodeAt(0) - 65) % 9) + 1;
const lettersOf = name => (name || '').toUpperCase().replace(/[^A-Z]/g, '').split('');
const VOWELS = 'AEIOU';

function sumLetters(letters) {
  return letters.reduce((acc, l) => acc + letterValue(l), 0);
}

// Every name-based number shares this shape: pick a subset of the letters, sum
// their values, then reduce. Returning the raw total too is what makes karmic
// debt detectable further down.
function nameNumber(name, filter) {
  const letters = lettersOf(name).filter(filter);
  if (letters.length === 0) return null;
  const total = sumLetters(letters);
  return { total, number: reduceWithMasterNumbers(total) };
}

/* ── Core numbers ─────────────────────────────────────────────────────────── */

/**
 * Life Path. Month, day and year are each reduced first, then added and
 * reduced again — the standard method.
 *
 * Summing all eight digits straight across is the common shortcut and it is
 * NOT equivalent: it invents master numbers that the real method doesn't
 * produce. 1975-10-28 sums to 33 across the digits, but reduces properly to
 * 6 (month 10→1, day 28→1, year 1975→22; 1+1+22 = 24 → 6). Master Life Paths
 * are supposed to be rare, and the shortcut makes them look common.
 */
export const calculateLifePathNumber = (birthdate) => {
  const parts = parseBirthdate(birthdate);
  if (!parts) return null;
  return parts.lifePath.number;
};

// Shared by Life Path and karmic-debt detection, so the two can't drift apart.
function parseBirthdate(birthdate) {
  if (!birthdate) return null;
  const [y, m, d] = birthdate.split('-').map(Number);
  if (!y || !m || !d) return null;

  const month = reduceWithMasterNumbers(m);
  const day = reduceWithMasterNumbers(d);
  const year = reduceWithMasterNumbers(digitSum(y));

  const total = month + day + year;
  return {
    year: y, month: m, day: d,
    parts: { month, day, year },
    lifePath: { total, number: reduceWithMasterNumbers(total) },
  };
};

// Expression (a.k.a. Destiny): every letter of the full birth name. This is one
// of the core four and was missing entirely — Soul Urge and Personality are
// its vowel and consonant halves, so without it they had nothing to add up to.
export const calculateExpressionNumber = name => nameNumber(name, () => true);

// Soul Urge (Heart's Desire): the vowels — what you actually want.
export const calculateSoulUrgeNumber = name => nameNumber(name, l => VOWELS.includes(l));

// Personality: the consonants — the part of you people meet first.
export const calculatePersonalityNumber = name => nameNumber(name, l => !VOWELS.includes(l));

/**
 * Hidden Passion: the number that appears most often across the name's letters.
 *
 * Note it counts *numbers*, not letters. Counting the most frequent letter
 * gives a different (wrong) answer, because several letters share a value —
 * in "ROBERT" both R's make 9 while O and B and T contribute 6, 2 and 2, so
 * the real answer is a 2/9 tie, not the single 9 a letter count produces.
 * Ties are genuine and all of them are returned.
 */
export const calculateHiddenPassionNumbers = (name) => {
  const letters = lettersOf(name);
  if (letters.length === 0) return [];

  const counts = letters.reduce((acc, l) => {
    const v = letterValue(l);
    acc[v] = (acc[v] || 0) + 1;
    return acc;
  }, {});

  const max = Math.max(...Object.values(counts));
  return Object.keys(counts)
    .filter(k => counts[k] === max)
    .map(Number)
    .sort((a, b) => a - b);
};

// Birthday number: the day of the month itself, left unreduced. 1–31 each
// carry their own reading, so 29 is not simply an 11.
export const calculateBirthdayNumber = (birthdate) => {
  const parts = parseBirthdate(birthdate);
  return parts ? parts.day : null;
};

// Maturity: Life Path + Expression, the number said to come into focus in the
// second half of life.
export const calculateMaturityNumber = (lifePath, expression) => {
  if (!lifePath || !expression) return null;
  const total = lifePath + expression;
  return { total, number: reduceWithMasterNumbers(total) };
};

/**
 * Karmic Lessons: which of 1–9 never appear among the name's letters. A missing
 * number is a capacity the name doesn't supply, so life keeps arranging
 * lessons in it.
 */
export const calculateKarmicLessonNumbers = (name) => {
  const letters = lettersOf(name);
  if (letters.length === 0) return [];
  const present = new Set(letters.map(letterValue));
  return [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(n => !present.has(n));
};

/**
 * Karmic Debt: 13, 14, 16 and 19 are read as debts when they show up as the
 * *total before reduction* of a core number, or as the birth day itself. This
 * is why the calculations above keep their raw totals — a 13 that has already
 * been reduced to a 4 is indistinguishable from a plain 4.
 */
export const findKarmicDebts = ({ birthdate, name }) => {
  const debts = [];
  const add = (source, total) => {
    if (total != null && KARMIC_DEBT_NUMBERS.includes(total)) {
      debts.push({ source, total, reducesTo: reduceToSingleDigit(total) });
    }
  };

  const parts = parseBirthdate(birthdate);
  if (parts) {
    add('Life Path', parts.lifePath.total);
    add('Birthday', parts.day);
  }

  const expression = calculateExpressionNumber(name);
  const soulUrge = calculateSoulUrgeNumber(name);
  const personality = calculatePersonalityNumber(name);
  if (expression) add('Expression', expression.total);
  if (soulUrge) add('Soul Urge', soulUrge.total);
  if (personality) add('Personality', personality.total);

  return debts;
};

/* ── Timing cycles ────────────────────────────────────────────────────────── */

// Personal Year: birth month + birth day + the current calendar year. Reduced
// to 1–9 — these cycles don't carry master numbers.
export const calculatePersonalYearNumber = (birthdateStr, today = new Date()) => {
  if (!birthdateStr) return null;
  const [, monthStr, dayStr] = birthdateStr.split('-');
  return reduceToSingleDigit(digitSum(`${monthStr}${dayStr}${today.getFullYear()}`));
};

export const calculatePersonalMonthNumber = (personalYearNumber, today = new Date()) =>
  reduceToSingleDigit(personalYearNumber + (today.getMonth() + 1));

export const calculatePersonalDayNumber = (personalMonthNumber, today = new Date()) =>
  reduceToSingleDigit(personalMonthNumber + today.getDate());

/* ── Full profile ─────────────────────────────────────────────────────────── */

/**
 * Assembles everything that can be derived from whatever the user has given.
 * Name-based numbers need a name; date-based numbers need a birthdate; each
 * half works without the other.
 */
export const buildNumerologyProfile = ({ name, birthdate }, today = new Date()) => {
  const parts = parseBirthdate(birthdate);
  const expression = calculateExpressionNumber(name);
  const soulUrge = calculateSoulUrgeNumber(name);
  const personality = calculatePersonalityNumber(name);
  const lifePath = parts ? parts.lifePath : null;

  const personalYear = birthdate ? calculatePersonalYearNumber(birthdate, today) : null;
  const personalMonth = personalYear ? calculatePersonalMonthNumber(personalYear, today) : null;
  const personalDay = personalMonth ? calculatePersonalDayNumber(personalMonth, today) : null;

  return {
    hasName: Boolean(lettersOf(name).length),
    hasBirthdate: Boolean(parts),
    lifePath,
    lifePathParts: parts ? parts.parts : null,
    expression,
    soulUrge,
    personality,
    birthday: parts ? parts.day : null,
    maturity: calculateMaturityNumber(lifePath?.number, expression?.number),
    hiddenPassion: calculateHiddenPassionNumbers(name),
    karmicLessons: calculateKarmicLessonNumbers(name),
    karmicDebts: findKarmicDebts({ birthdate, name }),
    cycles: personalYear ? { year: personalYear, month: personalMonth, day: personalDay } : null,
  };
};
