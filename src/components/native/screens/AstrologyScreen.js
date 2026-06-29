import React from 'react';
import AstrologyProfile from '../../AstrologyProfile';
import CelestialStatus from '../../CelestialStatus';

export default function AstrologyScreen() {
  return (
    <div className="px-4 pt-5 pb-8 space-y-7">
      <section className="space-y-3">
        <div>
          <div className="eyebrow">Astrology</div>
          <h3 className="section-title">Your Sun, Moon &amp; Rising</h3>
          <p className="section-subtitle">Add a birth time to unlock your Rising sign alongside your Sun and Moon.</p>
        </div>
        <AstrologyProfile />
      </section>

      <section className="space-y-3">
        <div>
          <div className="eyebrow">Celestial</div>
          <h3 className="section-title">Moon &amp; Planetary Weather</h3>
          <p className="section-subtitle">Live moon phase, current sign, and every active retrograde.</p>
        </div>
        <CelestialStatus />
      </section>
    </div>
  );
}
