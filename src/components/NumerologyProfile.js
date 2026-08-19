import React, { useState } from 'react';
import meanings from '../data/numerologyMeanings.json';
import { buildChakraProfile } from '../services/chakraService';

const MASTER = [11, 22, 33];

function NumberBadge({ value, tone = '#e9d8a6' }) {
  const isMaster = MASTER.includes(value);
  return (
    <span
      className="shrink-0 inline-flex items-center justify-center rounded-full text-sm font-semibold"
      style={{
        width: isMaster ? '2.4rem' : '2rem', height: '2rem',
        background: `${tone}18`, border: `1px solid ${tone}55`, color: tone,
      }}
    >
      {value}
    </span>
  );
}

// Every core number shows its arithmetic. The math here was wrong until
// recently, so the derivation is worth putting on screen — it makes the result
// checkable instead of something the app just asserts.
function CoreRow({ label, value, derivation, meaning, tone, open, onToggle }) {
  if (value == null) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
      <button onClick={onToggle} className="w-full px-3 py-2.5 flex items-center gap-3 text-left hover:bg-white/[0.04] transition-colors">
        <NumberBadge value={value} tone={tone} />
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-medium text-white/80">{label}</span>
          {derivation && <span className="block text-[10px] text-white/30 truncate">{derivation}</span>}
        </span>
        {MASTER.includes(value) && (
          <span className="shrink-0 text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full border border-[var(--accent)]/40 text-[var(--accent)]/80">
            master
          </span>
        )}
        <span className={`text-white/25 text-xs transition-transform shrink-0 ${open ? 'rotate-90' : ''}`}>›</span>
      </button>
      {open && meaning && (
        <div className="px-3 pb-3 pt-2 border-t border-white/10">
          <p className="text-xs text-white/65 leading-relaxed">{meaning}</p>
        </div>
      )}
    </div>
  );
}

export default function NumerologyProfile({ profile, showCycles = true }) {
  const [open, setOpen] = useState(null);
  if (!profile || (!profile.hasName && !profile.hasBirthdate)) return null;

  const toggle = key => setOpen(open === key ? null : key);
  const chakraMap = buildChakraProfile(profile);
  const lp = profile.lifePathParts;

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <p className="eyebrow">Core numbers</p>
        <CoreRow
          label="Life Path" value={profile.lifePath?.number} tone="#fbbf24"
          derivation={lp && `month ${lp.month} + day ${lp.day} + year ${lp.year} = ${profile.lifePath.total}`}
          meaning={meanings.lifePath[profile.lifePath?.number]}
          open={open === 'lifePath'} onToggle={() => toggle('lifePath')}
        />
        <CoreRow
          label="Expression" value={profile.expression?.number} tone="#38bdf8"
          derivation={profile.expression && `all letters = ${profile.expression.total}`}
          meaning={meanings.expression[profile.expression?.number]}
          open={open === 'expression'} onToggle={() => toggle('expression')}
        />
        <CoreRow
          label="Soul Urge" value={profile.soulUrge?.number} tone="#f472b6"
          derivation={profile.soulUrge && `vowels = ${profile.soulUrge.total}`}
          meaning={meanings.soulUrge[profile.soulUrge?.number]}
          open={open === 'soulUrge'} onToggle={() => toggle('soulUrge')}
        />
        <CoreRow
          label="Personality" value={profile.personality?.number} tone="#4ade80"
          derivation={profile.personality && `consonants = ${profile.personality.total}`}
          meaning={meanings.personality[profile.personality?.number]}
          open={open === 'personality'} onToggle={() => toggle('personality')}
        />
        <CoreRow
          label="Birthday" value={profile.birthday} tone="#c084fc"
          derivation="day of the month, read unreduced"
          meaning={meanings.birthday[profile.birthday]}
          open={open === 'birthday'} onToggle={() => toggle('birthday')}
        />
        <CoreRow
          label="Maturity" value={profile.maturity?.number} tone="#a8a29e"
          derivation={profile.maturity && `Life Path ${profile.lifePath.number} + Expression ${profile.expression.number} = ${profile.maturity.total}`}
          meaning={meanings.maturity[profile.maturity?.number]}
          open={open === 'maturity'} onToggle={() => toggle('maturity')}
        />
      </div>

      {profile.hiddenPassion.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Hidden passion</p>
            {profile.hiddenPassion.map(n => <NumberBadge key={n} value={n} tone="#fb923c" />)}
          </div>
          {profile.hiddenPassion.map(n => (
            <p key={n} className="text-xs text-white/60 leading-relaxed">{meanings.hiddenPassion[n]}</p>
          ))}
          {profile.hiddenPassion.length > 1 && (
            <p className="text-[10px] text-white/30 leading-relaxed">
              Two numbers appear equally often in your name, so both count — a genuine tie, not a rounding choice.
            </p>
          )}
        </div>
      )}

      {profile.karmicDebts.length > 0 && (
        <div className="rounded-xl border border-amber-300/25 bg-amber-300/[0.06] px-3 py-3 space-y-2">
          <p className="text-[10px] uppercase tracking-[0.18em] text-amber-200/70">Karmic debt</p>
          {profile.karmicDebts.map(debt => (
            <div key={`${debt.source}-${debt.total}`} className="space-y-1">
              <p className="text-xs font-medium text-white/80">
                {debt.total} in your {debt.source} <span className="text-white/40">— reduces to {debt.reducesTo}</span>
              </p>
              <p className="text-[11px] text-white/55 leading-relaxed">{meanings.karmicDebt[debt.total]}</p>
            </div>
          ))}
          <p className="text-[10px] text-white/30 leading-relaxed">
            Debts are read on the total <em>before</em> it's reduced — once 13 becomes a 4 it's invisible, which is why the
            raw sums are kept.
          </p>
        </div>
      )}

      {showCycles && profile.cycles && (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 space-y-2">
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Where you are right now</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[['Year', profile.cycles.year], ['Month', profile.cycles.month], ['Day', profile.cycles.day]].map(([label, n]) => (
              <div key={label} className="rounded-lg border border-white/10 py-2">
                <p className="text-[9px] uppercase tracking-[0.16em] text-white/35">Personal {label}</p>
                <p className="text-lg font-semibold text-white/85">{n}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-white/60 leading-relaxed">{meanings.personalYear[profile.cycles.year]}</p>
          <p className="text-[10px] text-white/25 leading-relaxed">
            These cycles reduce to 1–9 and never carry master numbers — they're timing, not identity.
          </p>
        </div>
      )}

      {chakraMap && chakraMap.chakras.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 space-y-2">
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Your chakra map</p>
          <div className="space-y-1.5">
            {chakraMap.chakras.map(c => (
              <div key={c.key} className="flex items-start gap-2.5">
                <span className="mt-1.5 w-2 h-2 rounded-full shrink-0" style={{ background: c.color }} />
                <div className="min-w-0">
                  <p className="text-xs font-medium" style={{ color: c.color }}>{c.sanskrit} <span className="text-white/45 font-normal">· {c.theme}</span></p>
                  <p className="text-[11px] text-white/45 leading-relaxed">
                    {c.drivers.length > 0 && <>Fed by {c.drivers.map(d => `${d.source} ${d.number}`).join(', ')}. </>}
                    {c.lessons.length > 0 && <span className="text-amber-200/70">Karmic lesson {c.lessons.join(' & ')} sits here too.</span>}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {chakraMap.untouched.length > 0 && (
            <p className="text-[10px] text-white/25 leading-relaxed">
              Untouched by your numbers: {chakraMap.untouched.map(c => c.sanskrit).join(', ')}.
            </p>
          )}
        </div>
      )}

      <p className="text-[10px] text-white/25 leading-relaxed">
        Pythagorean values (A–I 1–9, J–R 1–9, S–Z 1–8), with Y counted as a consonant throughout. Life Path reduces
        month, day and year separately before adding — the standard method, which doesn't manufacture the master
        numbers that summing all the digits at once does.
      </p>
    </div>
  );
}
