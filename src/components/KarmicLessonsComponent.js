import React, { useState } from 'react';
import calculateKarmicLessonNumbers from '../services/calculateKarmicLessonNumbers';
import karmicLessonsData from '../data/karmicLessons.json';
import { useUser } from '../contexts/UserContext';
import Modal from '../utilities/modal'; // Import the Modal component

const KarmicLessonsComponent = () => {
  const { userDetails, setUserDetails } = useUser(); // Access user details from context
  const [karmicLessons, setKarmicLessons] = useState([]); // State for karmic lessons
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state

  // Calculate karmic lessons and open the modal
  const handleCalculate = () => {
    const lessons = calculateKarmicLessonNumbers(userDetails.name);
    setKarmicLessons(lessons);
    setIsModalOpen(true);
  };

  // Reset form and close modal
  const handleReset = () => {
    setUserDetails({ name: '', birthdate: '', birthtime: '', birthplace: '' });
    setKarmicLessons([]);
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-md mx-auto text-white p-6 font-spiritual">
      {/* Input for the user's full name */}
      <input
        type="text"
        value={userDetails.name}
        onChange={e => setUserDetails({ ...userDetails, name: e.target.value })}
        placeholder="Enter your full name"
        className="mt-1 block w-full px-3 py-2 bg-indigo-800 border border-purple-300 rounded-full text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500"
      />

      {/* Button to trigger karmic lessons calculation */}
      <button
        onClick={handleCalculate}
        className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out mt-4"
      >
        Get Your Karmic Lessons
      </button>

      {/* Modal for displaying karmic lessons */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Karmic Lessons for ${userDetails.name}`}
      >
        <div className="mt-4 space-y-2">
          {/* Display karmic lessons */}
          {karmicLessons.length > 0 ? (
            <ul className="list-disc pl-5 text-purple-300">
              {karmicLessons.map((lesson, index) => (
                <li key={index}>
                  Lesson {lesson}: {karmicLessonsData[lesson]}
                </li>
              ))}
            </ul>
          ) : (
            <p>No karmic lessons found.</p>
          )}

          {/* Reset button to clear form and lessons */}
          <button
            onClick={handleReset}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out mt-4"
          >
            Reset
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default KarmicLessonsComponent;
