import React, { useState, useEffect } from 'react';
import shadowPrompts from '../data/prompts.json';
import { generatePDF } from '../services/pdfService';
import Popup from '../utilities/popUP';

function ShadowWorksJournal() {
  const [selectedPrompt, setSelectedPrompt] = useState({});
  const [journalEntry, setJournalEntry] = useState('');
  const [showPopup, setShowPopup] = useState(false);

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
    setShowPopup(true);
  };

  const handleSaveAsPDF = () => {
    generatePDF(selectedPrompt.prompt + "\n\n" + journalEntry);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  return (
    <div className="space-y-6 p-5 max-w-xl mx-auto font-spiritual">
      <button
        onClick={handleSelectPrompt}
        className="hover:bg-purple-700 text-white font-spiritual font-bold py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out w-full"
      >
        Illuminate the Unconscious
      </button>

      {showPopup && (
        <Popup isOpen={showPopup} onClose={handleClosePopup} title="Your Daily Shadow Work Prompt">
          <p className="font-bold text-lg mb-3">{selectedPrompt.prompt}</p>
          <textarea
            value={journalEntry}
            onChange={(e) => setJournalEntry(e.target.value)}
            placeholder="Reflect on the prompt here..."
            className="border-2 border-purple-500 p-3 rounded-lg w-full h-28 text-black focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={handleSaveAsPDF}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full mt-4 transition duration-300 ease-in-out w-full"
          >
            Save as PDF
          </button>
        </Popup>
      )}
    </div>
  );
}

export default ShadowWorksJournal;
