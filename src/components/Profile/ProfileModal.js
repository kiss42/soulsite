import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useUser } from '../../contexts/UserContext';
import {
  saveProfile, getProfile,
  getReadings, deleteReading,
  getJournalEntries, deleteJournalEntry,
  getFavorites, deleteFavorite,
} from '../../services/profileService';

const TABS = ['Profile', 'Readings', 'Journal', 'Favorites'];

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

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-left"
        onClick={() => setOpen(v => !v)}
      >
        <div className="min-w-0 mr-4">
          <p className="text-xs text-white/60 leading-snug truncate">{item.prompt}</p>
          <p className="text-[10px] text-white/25 mt-0.5">{date}</p>
        </div>
        <span className="text-white/30 text-xs shrink-0">{open ? '▲' : '▼'}</span>
      </button>

      {open && item.reflection && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/8">
          <p className="text-sm text-white/70 leading-relaxed mt-3">{item.reflection}</p>
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
  const { user, signOut } = useAuth();
  const { userDetails, setUserDetails } = useUser();

  const [tab, setTab]           = useState('Profile');
  const [name, setName]         = useState(userDetails.name || '');
  const [birthdate, setBirthdate] = useState(userDetails.birthdate || '');
  const [saved, setSaved]       = useState(false);
  const [saving, setSaving]     = useState(false);

  const [readings,  setReadings]  = useState(null);
  const [journal,   setJournal]   = useState(null);
  const [favorites, setFavorites] = useState(null);

  // Load profile on mount
  useEffect(() => {
    if (!user) return;
    getProfile(user.uid).then(p => {
      if (p) {
        setName(p.name || '');
        setBirthdate(p.birthdate || '');
      }
    });
  }, [user]);

  // Lazy-load sub-collections on tab change
  useEffect(() => {
    if (!user) return;
    if (tab === 'Readings'  && readings  === null) getReadings(user.uid).then(setReadings);
    if (tab === 'Journal'   && journal   === null) getJournalEntries(user.uid).then(setJournal);
    if (tab === 'Favorites' && favorites === null) getFavorites(user.uid).then(setFavorites);
  }, [tab, user, readings, journal, favorites]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    await saveProfile(user.uid, {
      name,
      birthdate,
      email: user.email,
      photoURL: user.photoURL ?? null,
    });
    setUserDetails(prev => ({ ...prev, name, birthdate }));
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDeleteReading = useCallback(async (id) => {
    await deleteReading(user.uid, id);
    setReadings(r => r.filter(x => x.id !== id));
  }, [user]);

  const handleDeleteJournal = useCallback(async (id) => {
    await deleteJournalEntry(user.uid, id);
    setJournal(j => j.filter(x => x.id !== id));
  }, [user]);

  const handleDeleteFavorite = useCallback(async (id) => {
    await deleteFavorite(user.uid, id);
    setFavorites(f => f.filter(x => x.id !== id));
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    onClose();
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
      className="fixed inset-0 bg-black/80 flex justify-center items-start p-4 pt-16 z-50 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="modal-surface w-full max-w-md space-y-5 relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3">
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
        <div className="flex gap-1 border-b border-white/10 pb-0">
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
              <label className="text-xs text-white/45 pl-4 uppercase tracking-[0.18em]">Date of birth <span className="text-white/25 normal-case">(fills numerology)</span></label>
              <input
                type="date"
                value={birthdate}
                onChange={e => setBirthdate(e.target.value)}
                className="pill-input text-sm"
              />
            </div>
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="primary-btn w-full disabled:opacity-60"
            >
              {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save profile'}
            </button>
            <div className="pt-2 border-t border-white/10">
              <button
                onClick={handleSignOut}
                className="text-xs text-white/30 hover:text-red-400 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        )}

        {/* ── Readings tab ── */}
        {tab === 'Readings' && (
          <div className="space-y-3">
            {readings === null && <p className="text-xs text-white/30 text-center py-6">Loading…</p>}
            {readings?.length === 0 && <EmptyState emoji="🃏" text="No saved readings yet — draw a spread and save it." />}
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
            {journal?.map(j => (
              <JournalItem key={j.id} item={j} onDelete={handleDeleteJournal} />
            ))}
          </div>
        )}

        {/* ── Favorites tab ── */}
        {tab === 'Favorites' && (
          <div className="space-y-3">
            {favorites === null && <p className="text-xs text-white/30 text-center py-6">Loading…</p>}
            {favorites?.length === 0 && <EmptyState emoji="✨" text="No favorite numbers yet — bookmark angel numbers you resonate with." />}
            {favorites?.map(f => (
              <FavoriteItem key={f.id} item={f} onDelete={handleDeleteFavorite} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
