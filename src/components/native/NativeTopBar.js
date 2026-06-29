import React from 'react';

export default function NativeTopBar({ title, theme, onToggleTheme, user, onOpenProfile, onOpenLogin }) {
  return (
    <header
      className="shrink-0 z-20 flex items-center justify-between gap-3 px-4 pb-3 backdrop-blur-xl bg-slate-950/60 border-b border-white/10"
      style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)' }}
    >
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)] truncate">{title}</p>

      <div className="flex items-center gap-2 shrink-0">
        <button onClick={onToggleTheme} className="text-base leading-none" aria-label="Toggle theme">
          {theme === 'dark' ? '🌞' : '🌙'}
        </button>

        {user ? (
          <button onClick={onOpenProfile} aria-label="Your profile">
            {user.photoURL ? (
              <img src={user.photoURL} alt="avatar" className="w-7 h-7 rounded-full object-cover" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[var(--accent)]/20 border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)] text-[10px] font-bold">
                {(user.displayName?.[0] ?? user.email?.[0] ?? '✺').toUpperCase()}
              </div>
            )}
          </button>
        ) : (
          <button
            onClick={onOpenLogin}
            className="text-[10px] uppercase tracking-[0.18em] text-white/70 border border-white/15 rounded-full px-3 py-1.5"
          >
            Sign in
          </button>
        )}
      </div>
    </header>
  );
}
