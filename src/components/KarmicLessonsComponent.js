import React, { useState } from 'react';
import calculateKarmicLessonNumbers from '../services/calculateKarmicLessonNumbers';
import karmicLessonsData from '../data/karmicLessons.json';
import { useUser } from '../contexts/UserContext';

const KarmicLessonsComponent = () => {
  const { userDetails, setUserDetails } = useUser();
  const [karmicLessons, setKarmicLessons] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const handleCalculate = () => {
    const lessons = calculateKarmicLessonNumbers(userDetails.name);
    setKarmicLessons(lessons);
    setIsFormVisible(true); // Show results after calculation
  };

  const handleReset = () => {
    setUserDetails({ name: '', birthdate: '', birthtime: '', birthplace: '' });
    setKarmicLessons([]);
    setIsFormVisible(false); // Hide form and reset state
  };

  return (
    <div className="max-w-md mx-auto text-white p-6 font-spiritual">
      {!isFormVisible ? (
        <button
          onClick={() => setIsFormVisible(true)}
          className="w-full  hover:bg-purple-800 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out shadow-spiritual"
        >
          Get Your Karmic Lessons
        </button>
      ) : (
        <div>
          <input
            type="text"
            value={userDetails.name}
            onChange={e => setUserDetails({ ...userDetails, name: e.target.value })}
            placeholder="Enter your full name"
            className="mt-1 block w-full px-3 py-2 bg-indigo-800 border border-purple-300 rounded-full text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500"
          />
          <button
            onClick={handleCalculate}
            className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
          >
            Calculate
          </button>
          {karmicLessons.length > 0 && (
            <div className="mt-4 space-y-2">
              <h3 className="text-lg font-bold">{`Karmic Lessons for ${userDetails.name}:`}</h3>
              <ul className="list-disc pl-5 text-purple-300">
                {karmicLessons.map((lesson, index) => (
                  <li key={index}>
                    Lesson {lesson}: {karmicLessonsData[lesson]}
                  </li>
                ))}
              </ul>
              <button
                onClick={handleReset}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
              >
                Reset
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KarmicLessonsComponent;