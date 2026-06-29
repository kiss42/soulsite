import React from 'react';
import AngelNumberSearch from '../../AngelNumberSearch';
import ShadowWorksJournal from '../../ShadowWorksJournal';
import DreamInterpreter from '../../DreamInterpreter';

export default function MoreScreen() {
  return (
    <div className="px-4 pt-5 pb-8 space-y-7">
      <section className="space-y-3">
        <div>
          <div className="eyebrow">Synchronicity</div>
          <h3 className="section-title">Angel number decoder</h3>
          <p className="section-subtitle">Look up repeating numbers and leave with one action to anchor it.</p>
        </div>
        <AngelNumberSearch />
      </section>

      <section className="space-y-3">
        <div>
          <div className="eyebrow">Integration</div>
          <h3 className="section-title">Shadow work journal</h3>
          <p className="section-subtitle">One button prompt, quick reflection, export if it resonates.</p>
        </div>
        <ShadowWorksJournal />
      </section>

      <section className="space-y-3">
        <div>
          <div className="eyebrow">Subconscious</div>
          <h3 className="section-title">Dream interpreter</h3>
          <p className="section-subtitle">Describe your dream and uncover the symbols hiding inside it.</p>
        </div>
        <DreamInterpreter />
      </section>
    </div>
  );
}
