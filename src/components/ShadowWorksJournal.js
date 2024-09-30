import React, { useState, useEffect } from 'react';
import shadowPrompts from '../data/prompts.json';
import { generatePDF } from '../services/pdfService';
import Popup from '../utilities/popUP'; // Make sure the import matches your component's name

function ShadowWorksJournal() {
  const [selectedPrompt, setSelectedPrompt] = useState({});
  const [journalEntry, setJournalEntry] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  // Load stored prompt and date from localStorage on component mount
  useEffect(() => {
    const storedPrompt = JSON.parse(localStorage.getItem('dailyPrompt'));
    const storedDate = localStorage.getItem('promptDate');
    const currentDate = new Date().toDateString();

    // Load the prompt from localStorage but do NOT display the popup automatically
    if (storedDate === currentDate && storedPrompt) {
      setSelectedPrompt(storedPrompt); // Set the prompt from localStorage
    }
  }, []);

  // Handle selecting a new prompt when the button is clicked
  const handleSelectPrompt = () => {
    const currentDate = new Date().toDateString();
    const storedDate = localStorage.getItem('promptDate');

    // Generate a new prompt if the current date is different
    if (storedDate !== currentDate) {
      const promptIndex = Math.floor(Math.random() * shadowPrompts.length);
      const newPrompt = shadowPrompts[promptIndex];
      setSelectedPrompt(newPrompt);
      localStorage.setItem('dailyPrompt', JSON.stringify(newPrompt));
      localStorage.setItem('promptDate', currentDate);
    }
    setShowPopup(true); // Show the popup when the button is clicked
  };

  // Handle saving the journal entry and prompt as a PDF
  const handleSaveAsPDF = () => {
    generatePDF(selectedPrompt.prompt + "\n\n" + journalEntry);
  };

  // Handle closing the popup
  const handleClosePopup = () => {
    setShowPopup(false);
  };

  return (
    <div className="space-y-6 p-5 max-w-xl mx-auto font-spiritual">
      {/* Button to illuminate the unconscious and generate a new prompt */}
      <button
        onClick={handleSelectPrompt}
        className="hover:bg-purple-700 text-white font-spiritual font-bold py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out"
      >
        Illuminate the Unconscious
      </button>

      {/* Popup for displaying the selected prompt and journal entry */}
      {showPopup && (
        <Popup isOpen={showPopup} onClose={handleClosePopup} title="Your Daily Shadow Work Prompt">
          <p className="font-bold text-lg mb-3">{selectedPrompt.prompt}</p>
          
          {/* Textarea for journaling */}
          <textarea
            value={journalEntry}
            onChange={(e) => setJournalEntry(e.target.value)}
            placeholder="Reflect on the prompt here..."
            className="border-2 border-purple-500 p-3 rounded-lg w-full h-28 text-black focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          
          {/* Save as PDF button */}
          <button
            onClick={handleSaveAsPDF}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full mt-4 transition duration-300 ease-in-out"
          >
            Save as PDF
          </button>
        </Popup>
      )}
    </div>
  );
}

export default ShadowWorksJournal;
