import React, { useMemo, useState } from 'react';
import karmicLessonsData from '../data/karmicLessons.json';
import { calculateKarmicLessonNumbers, calculateHiddenPassionNumbers } from '../services/numerologyService';
import { getChakraForNumber } from '../services/chakraService';
import { useUser } from '../contexts/UserContext';
import Modal from '../utilities/modal';

const KarmicLessonsComponent = () => {
  const { userDetails, setUserDetails } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { name } = userDetails;

  const { lessons, hiddenPassion, hasName } = useMemo(() => ({
    lessons: calculateKarmicLessonNumbers(name),
    hiddenPassion: calculateHiddenPassionNumbers(name),
    hasName: Boolean((name || '').replace(/[^A-Za-z]/g, '').length),
  }), [name]);

  return (
    <div className="space-y-4">
      <div className="stack-card space-y-3">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/70">
          <span className="text-lg">🜂</span>
          <span>Karmic lessons &amp; chakra nudges</span>
        </div>
        <input
          type="text"
          value={name}
          onChange={e => setUserDetails({ ...userDetails, name: e.target.value })}
          placeholder="Your full birth name"
          className="pill-input"
        />
        <p className="text-[10px] text-white/25 leading-relaxed pl-4">
          A karmic lesson is a number from 1–9 that never appears in your name's letters — a capacity your name
          doesn't supply, so life keeps setting up the lesson.
        </p>
        <button
          onClick={() => setIsModalOpen(true)}
          disabled={!hasName}
          className="primary-btn w-full disabled:opacity-40"
        >
          Get Your Karmic Lessons
        </button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={name ? `Karmic Lessons for ${name}` : 'Karmic Lessons'}
      >
        <div className="space-y-3">
          {lessons.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4 space-y-1.5">
              <p className="text-sm text-white/70">No karmic lessons — every number from 1 to 9 appears in your name.</p>
              <p className="text-[11px] text-white/40 leading-relaxed">
                That's genuinely uncommon, and it isn't a free pass: a full set means no single capacity is missing, so
                nothing is handed to you by default either.
              </p>
            </div>
          ) : (
            lessons.map(lesson => {
              const chakra = getChakraForNumber(lesson);
              return (
                <div key={lesson} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 space-y-2">
                  <p className="text-sm text-white/75 leading-relaxed">
                    <span className="font-semibold text-[var(--accent)]">Lesson {lesson}:</span> {karmicLessonsData[lesson]}
                  </p>
                  {chakra && (
                    <div className="pt-2 border-t border-white/10 space-y-1">
                      <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: chakra.color }}>
                        {chakra.name} — {chakra.theme}
                      </p>
                      <p className="text-xs text-white/55 leading-relaxed">{chakra.guidance}</p>
                      <p className="text-[11px] text-white/35 leading-relaxed">
                        Out of balance, this reads as: {chakra.blocked}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}

          {hiddenPassion.length > 0 && (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 space-y-1">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">The other side of the ledger</p>
              <p className="text-xs text-white/60 leading-relaxed">
                Your name leans hardest on {hiddenPassion.length > 1 ? 'numbers' : 'number'}{' '}
                <span className="text-[var(--accent)]">{hiddenPassion.join(' and ')}</span> — the Hidden Passion, the
                strength that comes so easily it can crowd out whatever's missing above.
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default KarmicLessonsComponent;
