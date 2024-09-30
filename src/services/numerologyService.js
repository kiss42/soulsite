export const calculateLifePathNumber = (birthdate) => {
    // Ensure birthdate is in the format "YYYY-MM-DD"
    const digits = birthdate.replaceAll('-', '').split('').map(Number);
    let sum = digits.reduce((acc, curr) => acc + curr, 0);
  
    while (sum > 22) {
      sum = sum.toString().split('').reduce((acc, curr) => acc + parseInt(curr, 10), 0);
    }
  
    if (sum !== 11 && sum > 9) {
      sum = sum.toString().split('').reduce((acc, curr) => acc + parseInt(curr, 10), 0);
    }
  
    return sum;
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
  
  // Helper function to reduce a number to a single digit
  function reduceToSingleDigit(number) {
    let sum = number;
    while (sum > 9) {
      sum = sum.toString().split('').reduce((acc, curr) => acc + parseInt(curr, 10), 0);
    }
    return sum;
  }

  export const calculateKarmicLessonNumbers = (name) => {
    const allNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]; // All possible single-digit numbers
    const nameNumbers = name.toUpperCase().replace(/[^A-Z]/g, '') // Remove non-alphabet characters
      .split('')
      .map(letter => (letter.charCodeAt(0) - 65) % 9 + 1) // Convert letters to numbers
      .sort();
  
    const uniqueNumbers = [...new Set(nameNumbers)]; // Get unique numbers from name
    const karmicLessonNumbers = allNumbers.filter(num => !uniqueNumbers.includes(num)); // Find missing numbers
    
    return karmicLessonNumbers.length > 0 ? karmicLessonNumbers : ["No Karmic Lessons"];
  };
  