import React, { useState } from 'react';
import calculateKarmicLessonNumbers from '../services/calculateKarmicLessonNumbers';
import karmicLessonsData from '../data/karmicLessons.json';
import { useUser } from '../contexts/UserContext';
import Modal from '../utilities/modal';

const KarmicLessonsComponent = () => {
  const { userDetails, setUserDetails } = useUser();
  const [karmicLessons, setKarmicLessons] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCalculate = () => {
    const lessons = calculateKarmicLessonNumbers(userDetails.name);
    setKarmicLessons(lessons);
    setIsModalOpen(true);
  };

  const handleReset = () => {
    setUserDetails({ name: '', birthdate: '', birthtime: '', birthplace: '' });
    setKarmicLessons([]);
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-md mx-auto text-white p-6 font-spiritual">
      <input
        type="text"
        value={userDetails.name}
        onChange={e => setUserDetails({ ...userDetails, name: e.target.value })}
        placeholder="Enter your full name"
        className="mt-1 block w-full px-3 py-2 bg-indigo-800 border border-purple-300 rounded-full text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500"
      />
      <button
        onClick={handleCalculate}
        className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out mt-4"
      >
        Get Your Karmic Lessons
      </button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Karmic Lessons for ${userDetails.name}`}>
        <div className="mt-4 bg-black p-5 text-white rounded-lg shadow-2xl max-w-lg mx-auto border-none outline-none">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">{`Karmic Lessons for ${userDetails.name}`}</h3>
            <button
              onClick={() => setIsModalOpen(false)}
              className="text-red-500 text-xl font-bold hover:text-red-700"
            >
              X
            </button>
          </div>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {karmicLessons.length > 0 ? (
              <ul className="list-disc pl-5 text-sm text-gray-100">
                {karmicLessons.map((lesson, index) => (
                  <li key={index}>
                    Lesson {lesson}: {karmicLessonsData[lesson]}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No karmic lessons found.</p>
            )}
          </div>
          <button
            onClick={handleReset}
            className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out"
          >
            Reset
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default KarmicLessonsComponent;
