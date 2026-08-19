import React, { useMemo, useState } from 'react';
import numerologyMeanings from '../data/numerologyMeanings.json';
import {
  buildNumerologyProfile, calculatePersonalYearNumber, calculatePersonalMonthNumber,
} from '../services/numerologyService';
import { useUser } from '../contexts/UserContext';
import NumerologyProfile from './NumerologyProfile';
import Modal from '../utilities/modal';
import BirthdateField from './BirthdateField';

const NumerologyCalculator = () => {
  const { userDetails, setUserDetails } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { name, birthdate } = userDetails;

  // Personal Year/Month don't need the name field or a "Calculate" click —
  // they're derived from birthdate + today's date, so show them immediately.
  const phase = useMemo(() => {
    if (!birthdate) return null;
    const year = calculatePersonalYearNumber(birthdate);
    const month = calculatePersonalMonthNumber(year);
    return {
      year,
      month,
      yearMeaning: numerologyMeanings.personalYear[year.toString()],
      monthMeaning: numerologyMeanings.personalYear[month.toString()],
    };
  }, [birthdate]);

  // Recomputed whenever the inputs change, but only ever shown inside the
  // modal — so the reading stays a deliberate "open it and read it" moment.
  const profile = useMemo(
    () => buildNumerologyProfile({ name, birthdate }),
    [name, birthdate]
  );

  const canCalculate = profile.hasName || profile.hasBirthdate;

  return (
    <div className="space-y-4">
      <div className="stack-card space-y-3">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/70">
          <span className="text-lg">✨</span>
          <span>Numbers ritual</span>
        </div>
        <input
          type="text"
          placeholder="Your full birth name"
          value={name}
          onChange={e => setUserDetails({ ...userDetails, name: e.target.value })}
          className="pill-input"
        />
        <div className="flex flex-col gap-1">
          <label className="text-xs text-white/45 pl-4 uppercase tracking-[0.18em]">Date of birth</label>
          <BirthdateField
            value={birthdate}
            onChange={value => setUserDetails({ ...userDetails, birthdate: value })}
          />
        </div>
        <p className="text-[10px] text-white/25 leading-relaxed pl-4">
          Name-based numbers use your full birth name — the one on the certificate, not a nickname or married name.
        </p>
        <button
          onClick={() => setIsModalOpen(true)}
          disabled={!canCalculate}
          className="primary-btn w-full hover:scale-[1.01] transition-transform duration-300 ease-in-out disabled:opacity-40 disabled:hover:scale-100"
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
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={name ? `Numerology for ${name}` : 'Your numerology'}
        >
          {/* Personal Year/Month already sit on the page above, so the popup
              doesn't repeat them. */}
          <NumerologyProfile profile={profile} showCycles={false} />
        </Modal>
      )}
    </div>
  );
};

export default NumerologyCalculator;
