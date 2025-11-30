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
    <div className="space-y-4">
      <div className="stack-card space-y-3">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/70">
          <span className="text-lg">🜂</span>
          <span>Chakra alignment</span>
        </div>
        <input
          type="text"
          value={userDetails.name}
          onChange={e => setUserDetails({ ...userDetails, name: e.target.value })}
          placeholder="Enter your full name"
          className="pill-input"
        />
        <button
          onClick={handleCalculate}
          className="primary-btn w-full"
        >
          Get Your Karmic Lessons
        </button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Karmic Lessons for ${userDetails.name}`}>
        <div className="modal-surface text-white scroll-smooth">
          <div className="flex justify-between items-center mb-4 gap-4">
            <h3 className="text-xl font-bold leading-tight">{`Karmic Lessons for ${userDetails.name}`}</h3>
            <button
              onClick={() => setIsModalOpen(false)}
              className="text-red-500 text-xl font-bold hover:text-red-700"
            >
              X
            </button>
          </div>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto scroll-smooth">
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
            className="ghost-btn w-full mt-6"
          >
            Reset
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default KarmicLessonsComponent;
