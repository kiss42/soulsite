import React, { useMemo, useState } from 'react';
import numerologyMeanings from '../data/numerologyMeanings.json';
import {
  calculateLifePathNumber, calculatePersonalityNumber, calculateSoulUrgeNumber, calculateHiddenPassionNumber,
  calculatePersonalYearNumber, calculatePersonalMonthNumber,
} from '../services/numerologyService';
import { useUser } from '../contexts/UserContext';
import { getChakraRecommendation } from '../services/chakraService';
import Modal from '../utilities/modal';
import BirthdateField from './BirthdateField';

const NumerologyCalculator = () => {
  const { userDetails, setUserDetails } = useUser();
  const [results, setResults] = useState({});
  const [chakraRecommendations, setChakraRecommendations] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Personal Year/Month don't need the name field or a "Calculate" click —
  // they're derived from birthdate + today's date, so show them immediately.
  const phase = useMemo(() => {
    if (!userDetails.birthdate) return null;
    const year = calculatePersonalYearNumber(userDetails.birthdate);
    const month = calculatePersonalMonthNumber(year);
    return {
      year,
      month,
      yearMeaning: numerologyMeanings.personalYear[year.toString()],
      monthMeaning: numerologyMeanings.personalYear[month.toString()],
    };
  }, [userDetails.birthdate]);

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
    setUserDetails({ name: '', birthdate: '', birthtime: '', birthplace: '', birthCity: '', birthLat: '', birthLon: '' });
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
        <div className="flex flex-col gap-1">
          <label className="text-xs text-white/45 pl-4 uppercase tracking-[0.18em]">Date of birth</label>
          <BirthdateField
            value={userDetails.birthdate}
            onChange={birthdate => setUserDetails({ ...userDetails, birthdate })}
          />
        </div>
        <button
          onClick={handleCalculate}
          className="primary-btn w-full hover:scale-[1.01] transition-transform duration-300 ease-in-out"
        >
          Calculate
        </button>
      </div>

      {phase && (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
          <p className="eyebrow">What phase you're in right now</p>
          <div className="space-y-1.5">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Personal Year {phase.year}</p>
            <p className="text-sm text-white/75 leading-relaxed">{phase.yearMeaning}</p>
          </div>
          <div className="h-px bg-white/10" />
          <div className="space-y-1.5">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Personal Month {phase.month}</p>
            <p className="text-sm text-white/75 leading-relaxed">{phase.monthMeaning}</p>
          </div>
          <p className="text-[10px] text-white/25 leading-relaxed">
            Life Path is fixed at birth — Personal Year and Month are the cycle you're moving through right now, recalculated from today's date.
          </p>
        </div>
      )}

      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Numerology Results for ${userDetails.name}`}>
          <div className="space-y-3 text-white">
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
                  <span className="font-bold">{recommendation.name}</span> rules the {recommendation.bodyPart}: {recommendation.guidance}
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
