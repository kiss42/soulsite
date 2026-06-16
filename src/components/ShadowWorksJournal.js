import React, { useState, useEffect } from 'react';
import shadowPrompts from '../data/prompts.json';
import { generatePDF } from '../services/pdfService';
import Popup from '../utilities/popUP';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';
import { saveJournalEntry } from '../services/profileService';

function ShadowWorksJournal() {
  const { user } = useAuth();
  const { openLogin } = useUI();

  const [selectedPrompt, setSelectedPrompt] = useState({});
  const [journalEntry, setJournalEntry] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [entrySaved, setEntrySaved] = useState(false);

  useEffect(() => {
    const storedPrompt = JSON.parse(localStorage.getItem('dailyPrompt'));
    const storedDate = localStorage.getItem('promptDate');
    const currentDate = new Date().toDateString();

    if (storedDate === currentDate && storedPrompt) {
      setSelectedPrompt(storedPrompt);
    }
  }, []);

  const handleSelectPrompt = () => {
    const currentDate = new Date().toDateString();
    const storedDate = localStorage.getItem('promptDate');

    if (storedDate !== currentDate) {
      const promptIndex = Math.floor(Math.random() * shadowPrompts.length);
      const newPrompt = shadowPrompts[promptIndex];
      setSelectedPrompt(newPrompt);
      localStorage.setItem('dailyPrompt', JSON.stringify(newPrompt));
      localStorage.setItem('promptDate', currentDate);
    }
    setEntrySaved(false);
    setShowPopup(true);
  };

  const handleSaveAsPDF = () => {
    generatePDF(selectedPrompt.prompt + "\n\n" + journalEntry);
  };

  const handleSaveToProfile = async () => {
    if (!user) { openLogin(); return; }
    await saveJournalEntry(user.uid, {
      prompt: selectedPrompt.prompt,
      reflection: journalEntry,
    });
    setEntrySaved(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  return (
    <div className="space-y-4">
      <div className="stack-card space-y-3">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/70">
          <span className="text-lg">🌙</span>
          <span>Shadow prompt</span>
        </div>
        <button
          onClick={handleSelectPrompt}
          className="primary-btn w-full"
        >
          Illuminate the Unconscious
        </button>
      </div>

      {showPopup && (
        <Popup isOpen={showPopup} onClose={handleClosePopup} title="Your Daily Shadow Work Prompt">
          <p className="font-bold text-lg text-white mb-3">{selectedPrompt.prompt}</p>
          <textarea
            value={journalEntry}
            onChange={(e) => setJournalEntry(e.target.value)}
            placeholder="Reflect on the prompt here..."
            className="w-full h-28 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-gray-300 p-4 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <div className="flex gap-3 mt-4">
            <button onClick={handleSaveAsPDF} className="ghost-btn flex-1 text-sm">
              Save as PDF
            </button>
            <button
              onClick={handleSaveToProfile}
              disabled={entrySaved}
              className={`flex-1 text-sm rounded-xl py-3 px-4 border transition-colors ${
                entrySaved
                  ? 'border-[var(--accent)]/40 text-[var(--accent)]/60'
                  : 'primary-btn'
              }`}
            >
              {entrySaved ? '✓ Saved' : '⊕ Save to profile'}
            </button>
          </div>
        </Popup>
      )}
    </div>
  );
}

export default ShadowWorksJournal;
