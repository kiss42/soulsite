import React, { useState, useEffect, useMemo } from 'react';
import { generatePDF } from '../services/pdfService';
import Popup from '../utilities/popUP';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';
import { useUser } from '../contexts/UserContext';
import { saveJournalEntry } from '../services/profileService';
import { chooseShadowTheme, pickPromptFromTheme, pickIntegrationPrompt } from '../services/shadowWorkService';

const STORAGE_KEY = 'shadowDailyPick';

function loadDailyPick(theme) {
  const today = new Date().toDateString();
  try {
    const cached = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (cached?.date === today && cached?.themeKey === theme.key) {
      const prompt = theme.prompts.find(p => p.id === cached.promptId);
      if (prompt) return { prompt, integration: cached.integration };
    }
  } catch {
    // ignore malformed cache, fall through to a fresh pick
  }
  const prompt = pickPromptFromTheme(theme);
  const integration = pickIntegrationPrompt();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, themeKey: theme.key, promptId: prompt.id, integration }));
  return { prompt, integration };
}

function ThemeChip({ theme }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium"
      style={{ borderColor: `${theme.color}55`, color: theme.color, background: `${theme.color}12` }}
    >
      <span>{theme.symbol}</span>
      <span>{theme.label}</span>
    </span>
  );
}

function ShadowWorksJournal() {
  const { user } = useAuth();
  const { openLogin } = useUI();
  const { userDetails } = useUser();

  // Memoized so the random fallback (anonymous users with no birthdate/name)
  // doesn't reshuffle to a different theme on every keystroke re-render.
  const { theme, reason } = useMemo(
    () => chooseShadowTheme({ birthdate: userDetails.birthdate, name: userDetails.name }),
    [userDetails.birthdate, userDetails.name]
  );

  const [dailyPick, setDailyPick] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [entrySaved, setEntrySaved] = useState(false);
  const [reflection, setReflection] = useState('');
  const [followUpReflection, setFollowUpReflection] = useState('');
  const [integrationReflection, setIntegrationReflection] = useState('');
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [showIntegration, setShowIntegration] = useState(false);

  useEffect(() => {
    setDailyPick(loadDailyPick(theme));
    setReflection('');
    setFollowUpReflection('');
    setIntegrationReflection('');
    setShowFollowUp(false);
    setShowIntegration(false);
  }, [theme]);

  const handleOpen = () => {
    setEntrySaved(false);
    setShowPopup(true);
  };

  const handleClosePopup = () => setShowPopup(false);

  const handleSaveAsPDF = () => {
    const parts = [dailyPick.prompt.prompt, reflection];
    if (followUpReflection.trim()) parts.push('', dailyPick.prompt.followUp, followUpReflection);
    if (integrationReflection.trim()) parts.push('', dailyPick.integration, integrationReflection);
    generatePDF(parts.join('\n\n'));
  };

  const handleSaveToProfile = async () => {
    if (!user) { openLogin(); return; }
    await saveJournalEntry(user.uid, {
      theme: theme.label,
      themeKey: theme.key,
      prompt: dailyPick.prompt.prompt,
      reflection,
      followUp: dailyPick.prompt.followUp,
      followUpReflection: followUpReflection.trim() || null,
      integrationPrompt: dailyPick.integration,
      integrationReflection: integrationReflection.trim() || null,
    });
    setEntrySaved(true);
  };

  return (
    <div className="space-y-4">
      <div className="stack-card space-y-3">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/70">
          <span className="text-lg">🌙</span>
          <span>Shadow prompt</span>
        </div>
        <ThemeChip theme={theme} />
        <p className="text-xs text-white/40 italic leading-relaxed">{reason}</p>
        <button
          onClick={handleOpen}
          className="primary-btn w-full"
        >
          Illuminate the Unconscious
        </button>
      </div>

      {showPopup && dailyPick && (
        <Popup isOpen={showPopup} onClose={handleClosePopup} title="Your Daily Shadow Work Prompt">
          <div className="mb-3 space-y-2">
            <ThemeChip theme={theme} />
            <p className="text-xs text-white/40 italic leading-relaxed">{reason}</p>
          </div>

          <p className="font-bold text-lg text-white mb-3">{dailyPick.prompt.prompt}</p>
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="Reflect on the prompt here..."
            className="w-full h-24 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-gray-300 p-4 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />

          {!showFollowUp && (
            <button
              onClick={() => setShowFollowUp(true)}
              className="text-xs text-[var(--accent)] mt-3 hover:underline"
            >
              Go deeper ↓
            </button>
          )}

          {showFollowUp && (
            <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
              <p className="text-sm text-white/80 leading-relaxed">{dailyPick.prompt.followUp}</p>
              <textarea
                value={followUpReflection}
                onChange={(e) => setFollowUpReflection(e.target.value)}
                placeholder="Go a layer deeper..."
                className="w-full h-20 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-gray-300 p-4 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              {!showIntegration && (
                <button
                  onClick={() => setShowIntegration(true)}
                  className="text-xs text-[var(--accent)] hover:underline"
                >
                  Ground it ↓
                </button>
              )}
            </div>
          )}

          {showIntegration && (
            <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
              <p className="text-sm text-white/80 leading-relaxed">{dailyPick.integration}</p>
              <textarea
                value={integrationReflection}
                onChange={(e) => setIntegrationReflection(e.target.value)}
                placeholder="Land it somewhere real..."
                className="w-full h-20 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-gray-300 p-4 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
          )}

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
