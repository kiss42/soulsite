import React from 'react';
import NumerologyCalculator from '../../NumerologyCalculator';
import KarmicLessonsComponent from '../../KarmicLessonsComponent';

export default function NumerologyScreen() {
  return (
    <div className="px-4 pt-5 pb-8 space-y-7">
      <section className="space-y-3">
        <div>
          <div className="eyebrow">Numbers</div>
          <h3 className="section-title">Numerology blueprint</h3>
          <p className="section-subtitle">Life path, soul urge, personality, and hidden passions in one sweep.</p>
        </div>
        <NumerologyCalculator />
      </section>

      <section className="space-y-3">
        <div>
          <div className="eyebrow">Chakra</div>
          <h3 className="section-title">Karmic lessons</h3>
          <p className="section-subtitle">Surface name-based lessons and pair them with gentle chakra nudges.</p>
        </div>
        <KarmicLessonsComponent />
      </section>
    </div>
  );
}
