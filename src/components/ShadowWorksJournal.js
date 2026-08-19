import React, { useState, useEffect, useMemo } from 'react';
import { generatePDF } from '../services/pdfService';
import Popup from '../utilities/popUP';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';
import { useUser } from '../contexts/UserContext';
import { saveJournalEntry } from '../services/profileService';
import {
  chooseShadowTheme, pickPromptFromTheme, pickIntegrationPrompt,
  getDepths, getDepth, DEFAULT_DEPTH,
} from '../services/shadowWorkService';

const STORAGE_KEY = 'shadowDailyPick';
const DEPTH_KEY = 'shadowDepth';

function readDepth() {
  const stored = Number(localStorage.getItem(DEPTH_KEY));
  return getDepths().some(d => d.level === stored) ? stored : DEFAULT_DEPTH;
}

// The prompt is sticky for the day so the same question is waiting when you come
// back to it — but the cache is keyed by depth as well as theme, so choosing a
// harder tier gives you a new question instead of yesterday's gentle one.
function loadDailyPick(theme, depth) {
  const today = new Date().toDateString();
  try {
    const cached = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (cached?.date === today && cached?.themeKey === theme.key && cached?.depth === depth) {
      const prompt = theme.prompts.find(p => p.id === cached.promptId);
      if (prompt) return { prompt, integration: cached.integration };
    }
  } catch {
    // ignore malformed cache, fall through to a fresh pick
  }
  return storePick(theme, depth, pickPromptFromTheme(theme, depth));
}

function storePick(theme, depth, prompt) {
  const integration = pickIntegrationPrompt(depth);
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    date: new Date().toDateString(), themeKey: theme.key, depth, promptId: prompt.id, integration,
  }));
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

  const [depth, setDepth] = useState(readDepth);
  const [dailyPick, setDailyPick] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [entrySaved, setEntrySaved] = useState(false);
  const [reflection, setReflection] = useState('');
  const [followUpReflection, setFollowUpReflection] = useState('');
  const [integrationReflection, setIntegrationReflection] = useState('');
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [showIntegration, setShowIntegration] = useState(false);

  useEffect(() => {
    localStorage.setItem(DEPTH_KEY, String(depth));
    setDailyPick(loadDailyPick(theme, depth));
    setReflection('');
    setFollowUpReflection('');
    setIntegrationReflection('');
    setShowFollowUp(false);
    setShowIntegration(false);
  }, [theme, depth]);

  const handleAnother = () => {
    setDailyPick(storePick(theme, depth, pickPromptFromTheme(theme, depth, dailyPick?.prompt.id)));
    setReflection('');
    setFollowUpReflection('');
    setIntegrationReflection('');
    setShowFollowUp(false);
    setShowIntegration(false);
  };

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
      depth,
      depthLabel: getDepth(depth).label,
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

        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">How deep today</p>
          <div className="grid grid-cols-3 gap-1.5">
            {getDepths().map(d => (
              <button
                key={d.level}
                onClick={() => setDepth(d.level)}
                className={`rounded-xl border px-2 py-2 text-[11px] uppercase tracking-[0.12em] transition-colors ${
                  depth === d.level
                    ? 'border-[var(--accent)]/60 bg-[var(--accent)]/10 text-[var(--accent)]'
                    : 'border-white/12 text-white/45 hover:bg-white/5'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-white/35 leading-relaxed">{getDepth(depth).blurb}</p>
        </div>

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

          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--accent)]/70">
              {getDepth(depth).label}
            </span>
            <button
              onClick={handleAnother}
              className="text-[10px] uppercase tracking-[0.14em] text-white/35 hover:text-white/70 transition-colors ml-auto"
            >
              Another question ↻
            </button>
          </div>

          <p className="font-bold text-lg text-white mb-3">{dailyPick.prompt.prompt}</p>

          {depth === 3 && (
            <p className="text-[11px] text-white/35 leading-relaxed mb-3 border-l-2 border-white/15 pl-3">
              This one is meant to be sat with rather than answered quickly. There's no version of this you can
              fail — and stopping partway through is itself an answer worth noticing.
            </p>
          )}
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
