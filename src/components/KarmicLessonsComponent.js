import React, { useState } from 'react';
import calculateKarmicLessonNumbers from '../services/calculateKarmicLessonNumbers';
import karmicLessonsData from '../data/karmicLessons.json';
import { getChakraForNumber } from '../services/chakraService';
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
    setUserDetails({ name: '', birthdate: '', birthtime: '', birthplace: '', birthCity: '', birthLat: '', birthLon: '' });
    setKarmicLessons([]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="stack-card space-y-3">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/70">
          <span className="text-lg">🜂</span>
          <span>Karmic lessons &amp; chakra nudges</span>
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
        <div className="text-white scroll-smooth">
          <div className="space-y-4 max-h-[60vh] overflow-y-auto scroll-smooth">
            {karmicLessons.length > 0 ? (
              karmicLessons.map((lesson) => {
                const chakra = getChakraForNumber(lesson);
                return (
                  <div key={lesson} className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 space-y-2">
                    <p className="text-sm text-gray-100">
                      <span className="font-semibold text-[var(--accent)]">Lesson {lesson}:</span> {karmicLessonsData[lesson]}
                    </p>
                    {chakra && (
                      <div className="pt-2 border-t border-white/10 space-y-1">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">
                          Chakra nudge — {chakra.name}
                        </p>
                        <p className="text-xs text-white/60 leading-relaxed">{chakra.guidance}</p>
                      </div>
                    )}
                  </div>
                );
              })
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
