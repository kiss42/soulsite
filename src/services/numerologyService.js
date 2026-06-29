// Reduces a number to a single digit, UNLESS it lands on a master number
// (11, 22, 33) at some stage of the reduction — those are preserved rather
// than reduced further. Used for Life Path and for tarot card-number echoes.
export function reduceWithMasterNumbers(number) {
  let sum = number;
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = sum.toString().split('').reduce((acc, curr) => acc + parseInt(curr, 10), 0);
  }
  return sum;
}

// Always reduces fully to a single digit 1-9, no master-number exception.
// Used for Personality/Soul Urge/Hidden Passion and Personal Year/Month,
// per standard numerology convention for those specific calculations.
function reduceToSingleDigit(number) {
  let sum = number;
  while (sum > 9) {
    sum = sum.toString().split('').reduce((acc, curr) => acc + parseInt(curr, 10), 0);
  }
  return sum;
}

export const calculateLifePathNumber = (birthdate) => {
  // Ensure birthdate is in the format "YYYY-MM-DD"
  const digits = birthdate.replaceAll('-', '').split('').map(Number);
  const sum = digits.reduce((acc, curr) => acc + curr, 0);
  return reduceWithMasterNumbers(sum);
};

export const calculatePersonalityNumber = (name) => {
  // Exclude non-alphabet characters and vowels, focusing on consonants
  const consonantValueSum = name.toUpperCase().replace(/[^BCDFGHJKLMNPQRSTVWXYZ]/g, '')
    .split('')
    .map(consonant => (consonant.charCodeAt(0) - 65) % 9 + 1)
    .reduce((acc, curr) => acc + curr, 0);

  return reduceToSingleDigit(consonantValueSum);
};

export const calculateSoulUrgeNumber = (name) => {
  const sum = name.toUpperCase().replace(/[^AEIOU]/g, '')
    .split('')
    .map(vowel => (vowel.charCodeAt(0) - 65) % 9 + 1)
    .reduce((acc, curr) => acc + curr, 0);

  return reduceToSingleDigit(sum);
};

export const calculateHiddenPassionNumber = (name) => {
  // Calculate Hidden Passion Number by finding the most frequently occurring letter in the name,
  // and reduce to a single digit if necessary.
  const letterCounts = name.toUpperCase().replace(/[^A-Z]/g, '').split('').reduce((acc, letter) => {
    acc[letter] = (acc[letter] || 0) + 1;
    return acc;
  }, {});

  const maxCount = Math.max(...Object.values(letterCounts));
  const mostFrequentLetters = Object.keys(letterCounts).filter(letter => letterCounts[letter] === maxCount);

  // Simplification: return the numeric value of the first most frequent letter
  const numericValue = (mostFrequentLetters[0].charCodeAt(0) - 65) % 9 + 1;

  return numericValue;
};

// Personal Year: reduces (birth month + birth day + current year) to 1-9.
// Distinct from Life Path — this is the year-long cycle you're currently in,
// not a fixed birth-chart trait, and by mainstream numerology convention it
// does not preserve master numbers the way Life Path does.
export const calculatePersonalYearNumber = (birthdateStr, today = new Date()) => {
  const [, monthStr, dayStr] = birthdateStr.split('-');
  const digits = `${monthStr}${dayStr}${today.getFullYear()}`.split('').map(Number);
  const sum = digits.reduce((acc, curr) => acc + curr, 0);
  return reduceToSingleDigit(sum);
};

// Personal Month: reduces (Personal Year + current calendar month) to 1-9.
// The shorter-term complement to Personal Year — this is what's active right now.
export const calculatePersonalMonthNumber = (personalYearNumber, today = new Date()) => {
  const sum = personalYearNumber + (today.getMonth() + 1);
  return reduceToSingleDigit(sum);
};
