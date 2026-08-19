import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useUser } from '../../contexts/UserContext';
import BirthdateField from '../BirthdateField';
import CityPicker from '../CityPicker';
import {
  saveProfile, getProfile,
  getReadings, deleteReading,
  getJournalEntries, deleteJournalEntry,
  getFavorites, deleteFavorite,
  getDreams, deleteDream,
  deleteAllUserData,
} from '../../services/profileService';
import { getAllThemes } from '../../services/shadowWorkService';
import { getAllSymbols } from '../../services/dreamService';
import angelNumbersData from '../../data/angelNumbers.json';

const TABS = ['Profile', 'Readings', 'Journal', 'Dreams', 'Favorites'];
const SHADOW_THEME_BY_KEY = Object.fromEntries(getAllThemes().map(t => [t.key, t]));
const DREAM_SYMBOL_BY_KEY = Object.fromEntries(getAllSymbols().map(s => [s.key, s]));

// Shared "you keep coming back to this" pattern: count occurrences of some key
// across a list of saved items, return the top one if it repeats at least twice.
function findRecurring(items, extractKeys) {
  if (!items?.length) return null;
  const counts = {};
  items.forEach(item => extractKeys(item).forEach(key => { counts[key] = (counts[key] || 0) + 1; }));
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return top && top[1] >= 2 ? { key: top[0], count: top[1] } : null;
}

function EmptyState({ emoji, text }) {
  return (
    <div className="text-center py-10 space-y-2">
      <div className="text-3xl opacity-40">{emoji}</div>
      <p className="text-xs text-white/30">{text}</p>
    </div>
  );
}

function ReadingItem({ item, onDelete }) {
  const [open, setOpen] = useState(false);
  const date = item.savedAt?.toDate?.()?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) ?? '—';

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-left"
        onClick={() => setOpen(v => !v)}
      >
        <div>
          <p className="text-sm font-medium text-white/80">{item.spreadLabel}</p>
          {item.intention && <p className="text-[10px] text-white/35 italic mt-0.5">"{item.intention}"</p>}
          <p className="text-[10px] text-white/25 mt-0.5">{date}</p>
        </div>
        <span className="text-white/30 text-xs ml-4">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/8">
          {item.cards?.map((c, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-[10px] text-[var(--accent)]/50 uppercase tracking-widest mt-0.5 shrink-0 w-24">{c.positionLabel}</span>
              <div>
                <p className="text-xs font-semibold text-white/75">{c.name}{c.reversed ? ' · reversed' : ''}</p>
                <p className="text-[10px] text-white/45 leading-relaxed mt-0.5">{c.reversed ? c.reversedMeaning : c.meaning}</p>
              </div>
            </div>
          ))}
          <button
            onClick={() => onDelete(item.id)}
            className="text-[10px] text-red-400/50 hover:text-red-400 transition-colors mt-2"
          >
            Delete reading
          </button>
        </div>
      )}
    </div>
  );
}

function JournalItem({ item, onDelete }) {
  const [open, setOpen] = useState(false);
  const date = item.savedAt?.toDate?.()?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) ?? '—';
  const theme = item.themeKey ? SHADOW_THEME_BY_KEY[item.themeKey] : null;

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-left"
        onClick={() => setOpen(v => !v)}
      >
        <div className="min-w-0 mr-4">
          {theme && (
            <span
              className="inline-flex items-center gap-1 text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded-full mb-1"
              style={{ color: theme.color, background: `${theme.color}18` }}
            >
              {theme.symbol} {theme.label}
            </span>
          )}
          <p className="text-xs text-white/60 leading-snug truncate">{item.prompt}</p>
          <p className="text-[10px] text-white/25 mt-0.5">{date}</p>
        </div>
        <span className="text-white/30 text-xs shrink-0">{open ? '▲' : '▼'}</span>
      </button>

      {open && item.reflection && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/8">
          <p className="text-sm text-white/70 leading-relaxed mt-3">{item.reflection}</p>
          {item.followUpReflection && (
            <div className="space-y-1 pt-2 border-t border-white/5">
              <p className="text-[10px] text-white/35 italic leading-relaxed">{item.followUp}</p>
              <p className="text-sm text-white/70 leading-relaxed">{item.followUpReflection}</p>
            </div>
          )}
          {item.integrationReflection && (
            <div className="space-y-1 pt-2 border-t border-white/5">
              <p className="text-[10px] text-white/35 italic leading-relaxed">{item.integrationPrompt}</p>
              <p className="text-sm text-white/70 leading-relaxed">{item.integrationReflection}</p>
            </div>
          )}
          <button
            onClick={() => onDelete(item.id)}
            className="text-[10px] text-red-400/50 hover:text-red-400 transition-colors"
          >
            Delete entry
          </button>
        </div>
      )}
    </div>
  );
}

function DreamItem({ item, onDelete }) {
  const [open, setOpen] = useState(false);
  const date = item.savedAt?.toDate?.()?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) ?? '—';
  const symbols = (item.symbols ?? []).map(key => DREAM_SYMBOL_BY_KEY[key]).filter(Boolean);

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-left"
        onClick={() => setOpen(v => !v)}
      >
        <div className="min-w-0 mr-4">
          <p className="text-xs text-white/60 leading-snug truncate">{item.dreamText}</p>
          <p className="text-[10px] text-white/25 mt-0.5">
            {date}{symbols.length > 0 && ` · ${symbols.length} symbol${symbols.length > 1 ? 's' : ''}`}
          </p>
        </div>
        <span className="text-white/30 text-xs shrink-0">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/8">
          <p className="text-sm text-white/70 leading-relaxed mt-3">{item.dreamText}</p>
          {symbols.map(s => (
            <div key={s.key} className="space-y-1 pt-2 border-t border-white/5">
              <p className="text-xs font-medium text-white/75">{s.emoji} {s.label}</p>
              <p className="text-[11px] text-white/45 leading-relaxed">{s.meaning}</p>
            </div>
          ))}
          <button
            onClick={() => onDelete(item.id)}
            className="text-[10px] text-red-400/50 hover:text-red-400 transition-colors"
          >
            Delete entry
          </button>
        </div>
      )}
    </div>
  );
}

function FavoriteItem({ item, onDelete }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-base font-bold text-[var(--accent)]">{item.number}</p>
        <p className="text-[10px] text-white/45 leading-snug truncate">{item.majorMessage}</p>
      </div>
      <button
        onClick={() => onDelete(item.id)}
        className="text-white/20 hover:text-red-400 transition-colors text-sm shrink-0"
        aria-label="Remove"
      >✖</button>
    </div>
  );
}

export default function ProfileModal({ onClose }) {
  const { user, signOut, deleteAccount } = useAuth();
  const { userDetails, setUserDetails } = useUser();

  const [tab, setTab]           = useState('Profile');
  const [name, setName]         = useState(userDetails.name || '');
  const [birthdate, setBirthdate] = useState(userDetails.birthdate || '');
  const [birthtime, setBirthtime] = useState(userDetails.birthtime || '');
  const [birthCity, setBirthCity] = useState(userDetails.birthCity || '');
  const [birthLat, setBirthLat]   = useState(userDetails.birthLat || '');
  const [birthLon, setBirthLon]   = useState(userDetails.birthLon || '');
  const [saved, setSaved]       = useState(false);
  const [saving, setSaving]     = useState(false);
  const [saveError, setSaveError] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const [readings,  setReadings]  = useState(null);
  const [journal,   setJournal]   = useState(null);
  const [dreams,    setDreams]    = useState(null);
  const [favorites, setFavorites] = useState(null);

  const recurringTheme = useMemo(() => {
    const top = findRecurring(journal, j => j.themeKey ? [j.themeKey] : []);
    if (!top) return null;
    const theme = SHADOW_THEME_BY_KEY[top.key];
    return theme ? { theme, count: top.count } : null;
  }, [journal]);

  const recurringCard = useMemo(
    () => findRecurring(readings, r => (r.cards || []).map(c => c.name)),
    [readings]
  );

  const recurringSymbol = useMemo(() => {
    const top = findRecurring(dreams, d => d.symbols || []);
    if (!top) return null;
    const symbol = DREAM_SYMBOL_BY_KEY[top.key];
    return symbol ? { symbol, count: top.count } : null;
  }, [dreams]);

  const recurringDigit = useMemo(() => {
    const top = findRecurring(favorites, f => (f.number || '').split('').filter(ch => /[0-9]/.test(ch)));
    if (!top) return null;
    const entry = angelNumbersData[top.key];
    return entry ? { digit: top.key, majorMessage: entry.majorMessage, count: top.count } : null;
  }, [favorites]);

  // Load profile on mount
  useEffect(() => {
    if (!user) return;
    getProfile(user.uid).then(p => {
      if (p) {
        setName(p.name || '');
        setBirthdate(p.birthdate || '');
        setBirthtime(p.birthtime || '');
        setBirthCity(p.birthCity || '');
        setBirthLat(p.birthLat || '');
        setBirthLon(p.birthLon || '');
      }
    }).catch(() => {});
  }, [user]);

  // Lazy-load sub-collections on tab change
  useEffect(() => {
    if (!user) return;
    if (tab === 'Readings'  && readings  === null) getReadings(user.uid).then(setReadings).catch(() => setReadings([]));
    if (tab === 'Journal'   && journal   === null) getJournalEntries(user.uid).then(setJournal).catch(() => setJournal([]));
    if (tab === 'Dreams'    && dreams    === null) getDreams(user.uid).then(setDreams).catch(() => setDreams([]));
    if (tab === 'Favorites' && favorites === null) getFavorites(user.uid).then(setFavorites).catch(() => setFavorites([]));
  }, [tab, user, readings, journal, dreams, favorites]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    setSaveError('');
    try {
      await saveProfile(user.uid, {
        name,
        birthdate,
        birthtime,
        birthCity,
        birthLat,
        birthLon,
        email: user.email,
        photoURL: user.photoURL ?? null,
      });
      setUserDetails(prev => ({ ...prev, name, birthdate, birthtime, birthCity, birthLat, birthLon }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setSaveError(err.message.replace('Firebase: ', ''));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteReading = useCallback(async (id) => {
    await deleteReading(user.uid, id);
    setReadings(r => r.filter(x => x.id !== id));
  }, [user]);

  const handleDeleteJournal = useCallback(async (id) => {
    await deleteJournalEntry(user.uid, id);
    setJournal(j => j.filter(x => x.id !== id));
  }, [user]);

  const handleDeleteDream = useCallback(async (id) => {
    await deleteDream(user.uid, id);
    setDreams(d => d.filter(x => x.id !== id));
  }, [user]);

  const handleDeleteFavorite = useCallback(async (id) => {
    await deleteFavorite(user.uid, id);
    setFavorites(f => f.filter(x => x.id !== id));
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      // Firestore data must go first — deleting the Auth account invalidates
      // the session these deletes are authorized under.
      await deleteAllUserData(user.uid);
      await deleteAccount();
      onClose();
    } catch (err) {
      if (err.code === 'auth/requires-recent-login') {
        setDeleteError('For security, please sign out and sign back in, then try deleting your account again.');
      } else {
        setDeleteError(err.message.replace('Firebase: ', '').replace(/ \(auth\/.*\)\.?/, ''));
      }
    } finally {
      setDeleting(false);
    }
  };

  const avatar = user?.photoURL
    ? <img src={user.photoURL} alt="avatar" className="w-12 h-12 rounded-full object-cover ring-2 ring-[var(--accent)]/30" />
    : (
      <div className="w-12 h-12 rounded-full bg-[var(--accent)]/20 border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)] font-bold text-lg">
        {(user?.displayName?.[0] ?? user?.email?.[0] ?? '✺').toUpperCase()}
      </div>
    );

  return (
    <div
      className="fixed inset-0 bg-black/80 flex justify-center items-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="modal-surface w-full max-w-md relative flex flex-col gap-5 max-h-[calc(100dvh-2rem)]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 shrink-0">
          {avatar}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white/90 truncate">{user?.displayName || user?.email}</p>
            {user?.displayName && <p className="text-xs text-white/35 truncate">{user?.email}</p>}
          </div>
          <button
            onClick={onClose}
            className="ml-auto text-white/30 hover:text-white/60 transition-colors text-lg shrink-0"
            aria-label="Close"
          >✖</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-white/10 pb-0 shrink-0 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-2 text-xs uppercase tracking-[0.18em] transition-colors border-b-2 -mb-px ${
                tab === t
                  ? 'border-[var(--accent)] text-[var(--accent)]'
                  : 'border-transparent text-white/40 hover:text-white/65'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Only this region scrolls; the negative margin keeps the scrollbar
            off the content instead of inset from the panel edge. */}
        <div className="flex-1 min-h-0 overflow-y-auto -mr-2 pr-2">
        {/* ── Profile tab ── */}
        {tab === 'Profile' && (
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-white/45 pl-4 uppercase tracking-[0.18em]">Display name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                className="pill-input text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-white/45 pl-4 uppercase tracking-[0.18em]">Date of birth <span className="text-white/25 normal-case">(fills numerology &amp; astrology)</span></label>
              <BirthdateField
                value={birthdate}
                onChange={setBirthdate}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-white/45 pl-4 uppercase tracking-[0.18em]">Time of birth <span className="text-white/25 normal-case">(unlocks Rising sign)</span></label>
              <input
                type="time"
                value={birthtime}
                onChange={e => setBirthtime(e.target.value)}
                className="pill-input text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-white/45 pl-4 uppercase tracking-[0.18em]">Birth city <span className="text-white/25 normal-case">(sharpens Moon &amp; Rising)</span></label>
              <CityPicker
                value={birthCity}
                onSelect={c => { setBirthCity(c.name); setBirthLat(String(c.lat)); setBirthLon(String(c.lon)); }}
              />
              <p className="text-[10px] text-white/25 pl-4 pt-0.5">Not listed? Enter coordinates manually below.</p>
              <div className="flex gap-2 mt-1">
                <input
                  type="number"
                  step="any"
                  value={birthLat}
                  onChange={e => { setBirthLat(e.target.value); setBirthCity(''); }}
                  placeholder="Latitude"
                  className="pill-input text-sm"
                />
                <input
                  type="number"
                  step="any"
                  value={birthLon}
                  onChange={e => { setBirthLon(e.target.value); setBirthCity(''); }}
                  placeholder="Longitude"
                  className="pill-input text-sm"
                />
              </div>
            </div>
            {saveError && (
              <p className="text-xs text-red-300/80 px-1">{saveError}</p>
            )}
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="primary-btn w-full disabled:opacity-60"
            >
              {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save profile'}
            </button>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={handleSignOut}
                className="text-xs text-white/30 hover:text-red-400 transition-colors"
              >
                Sign out
              </button>
              <a
                href="privacy-policy.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-white/30 hover:text-white/60 transition-colors"
              >
                Privacy Policy
              </a>
            </div>

            <div className="pt-3 border-t border-white/10 space-y-2">
              {!confirmingDelete ? (
                <button
                  onClick={() => setConfirmingDelete(true)}
                  className="text-[10px] text-red-400/40 hover:text-red-400 transition-colors"
                >
                  Delete account
                </button>
              ) : (
                <div className="rounded-lg border border-red-400/30 bg-red-500/5 p-3 space-y-2">
                  <p className="text-xs text-red-300/80 leading-relaxed">
                    This permanently deletes your account and every saved reading, journal entry, dream, and favorite. This cannot be undone.
                  </p>
                  {deleteError && <p className="text-xs text-red-300/80">{deleteError}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setConfirmingDelete(false); setDeleteError(''); }}
                      className="ghost-btn flex-1 text-xs py-2"
                      disabled={deleting}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleting}
                      className="flex-1 text-xs py-2 rounded-xl border border-red-400/50 text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                    >
                      {deleting ? 'Deleting…' : 'Yes, delete everything'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Readings tab ── */}
        {tab === 'Readings' && (
          <div className="space-y-3">
            {readings === null && <p className="text-xs text-white/30 text-center py-6">Loading…</p>}
            {readings?.length === 0 && <EmptyState emoji="🃏" text="No saved readings yet — draw a spread and save it." />}
            {recurringCard && (
              <div className="rounded-xl px-3 py-2.5 bg-[var(--accent)]/10 border-l-2 border-[var(--accent)]/60">
                <p className="text-xs text-white/60">
                  You keep drawing <span className="font-medium text-[var(--accent)]">{recurringCard.key}</span> — {recurringCard.count} times so far.
                </p>
              </div>
            )}
            {readings?.map(r => (
              <ReadingItem key={r.id} item={r} onDelete={handleDeleteReading} />
            ))}
          </div>
        )}

        {/* ── Journal tab ── */}
        {tab === 'Journal' && (
          <div className="space-y-3">
            {journal === null && <p className="text-xs text-white/30 text-center py-6">Loading…</p>}
            {journal?.length === 0 && <EmptyState emoji="🌙" text="No journal entries yet — write a reflection and save it." />}
            {recurringTheme && (
              <div
                className="rounded-xl px-3 py-2.5 flex items-center gap-2"
                style={{ background: `${recurringTheme.theme.color}12`, borderLeft: `2px solid ${recurringTheme.theme.color}80` }}
              >
                <span className="text-base" style={{ color: recurringTheme.theme.color }}>{recurringTheme.theme.symbol}</span>
                <p className="text-xs text-white/60">
                  <span className="font-medium" style={{ color: recurringTheme.theme.color }}>{recurringTheme.theme.label}</span> keeps resurfacing — {recurringTheme.count} entries so far.
                </p>
              </div>
            )}
            {journal?.map(j => (
              <JournalItem key={j.id} item={j} onDelete={handleDeleteJournal} />
            ))}
          </div>
        )}

        {/* ── Dreams tab ── */}
        {tab === 'Dreams' && (
          <div className="space-y-3">
            {dreams === null && <p className="text-xs text-white/30 text-center py-6">Loading…</p>}
            {dreams?.length === 0 && <EmptyState emoji="💭" text="No dreams saved yet — describe one and interpret it." />}
            {recurringSymbol && (
              <div className="rounded-xl px-3 py-2.5 bg-white/[0.03] border-l-2 border-white/30 flex items-center gap-2">
                <span className="text-base">{recurringSymbol.symbol.emoji}</span>
                <p className="text-xs text-white/60">
                  <span className="font-medium text-white/80">{recurringSymbol.symbol.label}</span> keeps appearing in your dreams — {recurringSymbol.count} times so far.
                </p>
              </div>
            )}
            {dreams?.map(d => (
              <DreamItem key={d.id} item={d} onDelete={handleDeleteDream} />
            ))}
          </div>
        )}

        {/* ── Favorites tab ── */}
        {tab === 'Favorites' && (
          <div className="space-y-3">
            {favorites === null && <p className="text-xs text-white/30 text-center py-6">Loading…</p>}
            {favorites?.length === 0 && <EmptyState emoji="✨" text="No favorite numbers yet — bookmark angel numbers you resonate with." />}
            {recurringDigit && (
              <div className="rounded-xl px-3 py-2.5 bg-white/[0.03] border-l-2 border-white/30">
                <p className="text-xs text-white/60">
                  <span className="font-medium text-white/80">'{recurringDigit.digit}' energy</span> shows up across {recurringDigit.count} of your saved numbers — {recurringDigit.majorMessage}
                </p>
              </div>
            )}
            {favorites?.map(f => (
              <FavoriteItem key={f.id} item={f} onDelete={handleDeleteFavorite} />
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
