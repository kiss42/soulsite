// services/calculateKarmicLessonNumbers.js
const calculateKarmicLessonNumbers = (name) => {
    const allNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const nameNumbers = name.toUpperCase().replace(/[^A-Z]/g, '')
      .split('')
      .map(letter => (letter.charCodeAt(0) - 65) % 9 + 1)
      .sort();
  
    const uniqueNumbers = [...new Set(nameNumbers)];
    const karmicLessonNumbers = allNumbers.filter(num => !uniqueNumbers.includes(num));
  
    return karmicLessonNumbers.length > 0 ? karmicLessonNumbers : ["No Karmic Lessons"];
  };
  
  export default calculateKarmicLessonNumbers;
  