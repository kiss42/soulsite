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
    <div className="space-y-6 p-5 max-w-xl mx-auto font-spiritual">
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Enter Your Name"
          value={userDetails.name}
          onChange={e => setUserDetails({ ...userDetails, name: e.target.value })}
          className="input-base"
        />
        <input
          type="date"
          placeholder="Enter Your Birthdate"
          value={userDetails.birthdate}
          onChange={e => setUserDetails({ ...userDetails, birthdate: e.target.value })}
          className="input-base"
        />
        <button
          onClick={handleCalculate}
          className="w-full button-base button-primary hover:scale-105 transition-transform duration-300 ease-in-out"
        >
          Calculate
        </button>
      </div>

      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Numerology Results">
          <div className="fade-in show scrollable-content mt-6 space-y-3 bg-black text-white p-4 rounded-lg">
            <h3 className="text-xl font-bold">Numerology Results for {userDetails.name}:</h3>
            {Object.entries(results).map(([key, value]) => (
              <p key={key} className="font-semibold">
                <span className="font-bold">{key}:</span> Number {value.number}, Meaning: {value.meaning}
              </p>
            ))}
            <h4 className="text-lg font-bold">Chakra Recommendations:</h4>
            {chakraRecommendations.map((recommendation, index) => (
              <p key={index}>
                {recommendation.name}: {recommendation.guidance}
              </p>
            ))}
            <button onClick={handleReset} className="w-full button-base button-danger hover:scale-105 transition-transform duration-300 ease-in-out mt-4">
              Reset
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default NumerologyCalculator;
