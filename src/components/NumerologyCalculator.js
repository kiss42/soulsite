import React, { useState } from 'react';
import numerologyMeanings from '../data/numerologyMeanings.json';
import { calculateLifePathNumber, calculatePersonalityNumber, calculateSoulUrgeNumber, calculateHiddenPassionNumber } from '../services/numerologyService';
import { useUser } from '../contexts/UserContext';
import { getChakraRecommendation } from '../services/chakraService';
import Modal from '../utilities/modal';

const NumerologyCalculator = () => {
  const { userDetails, setUserDetails } = useUser();
  const [results, setResults] = useState({});
  const [chakraRecommendations, setChakraRecommendations] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCalculate = () => {
    const lifePathNumber = calculateLifePathNumber(userDetails.birthdate);
    const personalityNumber = calculatePersonalityNumber(userDetails.name);
    const soulUrgeNumber = calculateSoulUrgeNumber(userDetails.name);
    const hiddenPassionNumber = calculateHiddenPassionNumber(userDetails.name);

    setResults({
      LifePath: { number: lifePathNumber, meaning: numerologyMeanings.lifePath[lifePathNumber.toString()] },
      Personality: { number: personalityNumber, meaning: numerologyMeanings.personality[personalityNumber.toString()] },
      SoulUrge: { number: soulUrgeNumber, meaning: numerologyMeanings.soulUrge[soulUrgeNumber.toString()] },
      HiddenPassion: { number: hiddenPassionNumber, meaning: numerologyMeanings.hiddenPassion[hiddenPassionNumber.toString()] }
    });

    setChakraRecommendations(getChakraRecommendation({ LifePath: { number: lifePathNumber } }));
    setIsModalOpen(true);
  };

  const handleReset = () => {
    setUserDetails({ name: '', birthdate: '' });
    setResults({});
    setChakraRecommendations([]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="stack-card space-y-3">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/70">
          <span className="text-lg">✨</span>
          <span>Numbers ritual</span>
        </div>
        <input
          type="text"
          placeholder="Enter your name"
          value={userDetails.name}
          onChange={e => setUserDetails({ ...userDetails, name: e.target.value })}
          className="pill-input"
        />
        <input
          type="date"
          placeholder="Enter your birthdate"
          value={userDetails.birthdate}
          onChange={e => setUserDetails({ ...userDetails, birthdate: e.target.value })}
          className="pill-input"
        />
        <button
          onClick={handleCalculate}
          className="primary-btn w-full hover:scale-[1.01] transition-transform duration-300 ease-in-out"
        >
          Calculate
        </button>
      </div>

      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Numerology Results">
          <div className="modal-surface fade-in show scrollable-content space-y-3 text-white">
            <h3 className="text-xl font-bold">Numerology Results for {userDetails.name}:</h3>
            <div className="space-y-2 text-gray-200">
              {Object.entries(results).map(([key, value]) => (
                <p key={key} className="font-semibold">
                  <span className="font-bold">{key}:</span> Number {value.number}, Meaning: {value.meaning}
                </p>
              ))}
            </div>
            <h4 className="text-lg font-bold pt-2">Chakra Recommendations</h4>
            <div className="space-y-1 text-gray-200">
              {chakraRecommendations.map((recommendation, index) => (
                <p key={index}>
                  {recommendation.name}: {recommendation.guidance}
                </p>
              ))}
            </div>
            <button onClick={handleReset} className="ghost-btn w-full mt-4">
              Reset
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default NumerologyCalculator;
