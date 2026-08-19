import React, { useMemo, useState } from 'react';
import TarotCard from './TarotCard';
import tarotData from '../../data/tarotDeck';
import { useAuth } from '../../contexts/AuthContext';
import { useUI } from '../../contexts/UIContext';
import { useUser } from '../../contexts/UserContext';
import { saveReading } from '../../services/profileService';
import { getZodiacSign, getSignByTarotCard } from '../../services/astrologyService';
import { calculateLifePathNumber, reduceWithMasterNumbers } from '../../services/numerologyService';

const SPREADS = {
  single: {
    label: 'Daily Card',
    count: 1,
    positions: ['Your message for today'],
  },
  three: {
    label: 'Past · Present · Future',
    count: 3,
    positions: ['Past', 'Present', 'Future'],
  },
  five: {
    label: 'Five-Card Cross',
    count: 5,
    positions: ['Foundation', 'Challenge', 'Subconscious', 'Advice', 'Outcome'],
  },
};

const POSITION_PROMPTS = {
  'Your message for today': 'What is this card asking you to sit with today?',
  'Past':          'What from your past does this card illuminate?',
  'Present':       'How does this card reflect your current moment?',
  'Future':        'What direction is this card pointing you toward?',
  'Foundation':    'What underlying energy is shaping this situation?',
  'Challenge':     'What obstacle does this card bring to light?',
  'Subconscious':  'What hidden feeling is this card surfacing?',
  'Advice':        'What wisdom is this card extending to you right now?',
  'Outcome':       'What does this card suggest about where you are headed?',
};

function meaning(card) {
  return card.reversed ? card.reversedMeaning : card.meaning;
}

function orientation(card) {
  return card.reversed ? 'reversed' : 'upright';
}

// Deterministic per-draw pick so the same reading doesn't reshuffle its own
// phrasing on re-render, but a fresh draw gets different wrapping language.
function pickVariant(seed, variants) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return variants[Math.abs(hash) % variants.length];
}

const SINGLE_CLOSERS = [
  `The cards draw a single thread today and hand it directly to you. Notice where in your life this energy is already alive. Let it be your quiet lantern for the hours ahead.`,
  `One card, one nudge. Carry this energy into your day rather than setting it aside — it tends to show up in small, unglamorous moments once you start looking for it.`,
  `A single draw is rarely an accident. Sit with this one a little longer than feels necessary; today, that's exactly where the message is.`,
];

const THREE_TEMPLATES = {
  past: [
    (n, m, s) => `Your story opens in ${n}'s energy — ${m}. This is the ground you have walked. It shaped what you carry into the present, whether you named it clearly or not. ${s}`,
    (n, m, s) => `Trace the root of this moment back to ${n}. ${m}. Nothing in the present arrived out of nowhere — this card marks the soil it grew from. ${s}`,
    (n, m, s) => `Before the present took shape, ${n} was already moving underneath it. ${m}. Consider this less a memory and more a current that never fully stopped. ${s}`,
  ],
  present: [
    (n, m) => `From that ground you arrive at ${n}. ${m}. This is the lens through which everything is currently being filtered — the feeling you wake with, the undercurrent in every room you enter. The past handed you a current, and this is the one you are swimming in now.`,
    (n, m) => `Right now, ${n} is the air you're breathing. ${m}. It colors the small decisions you barely notice making, not just the big ones you're consciously weighing.`,
    (n, m) => `${n} sits at the center of this moment. ${m}. Whatever else is happening around you, this is the energy quietly setting the tone underneath it.`,
  ],
  future: [
    (n, m) => `What stirs at the horizon carries the energy of ${n}. ${m}. The future in a reading is not a sentence — it is a current the cards can see gathering. You still choose how you meet it.`,
    (n, m) => `Ahead of you, ${n} is already taking shape. ${m}. Treat this less as a prediction and more as a weather report — useful for knowing what to bring with you.`,
    (n, m) => `The path bends toward ${n}. ${m}. Nothing here is fixed; it's the direction things lean if nothing changes between now and then.`,
  ],
};

const THREE_CLOSERS = [
  `Three cards, one arc. The past set the scene, the present holds the tension, and the future offers a way through. The story is yours to finish.`,
  `Read top to bottom and the arc is plain: what built this, what it feels like from inside, and where it's leaning next. The ending isn't written yet.`,
  `These three rarely argue with each other — they're describing one continuous motion. Trust the thread between them more than any single card.`,
];

const FIVE_TEMPLATES = {
  foundation: [
    (n, m) => `Every reading has an unseen floor, and yours is ${n}. ${m}. This is the energy field you have been living inside — often unnoticed, always present beneath the surface of your choices and your restlessness.`,
    (n, m) => `${n} is the floor this whole situation is standing on. ${m}. You may not think about it often, but it's been quietly shaping the terms of everything else in this spread.`,
  ],
  challenge: [
    (n, m) => `Rising from that floor, ${n} stands across your path. ${m}. Challenges in a reading are rarely warnings — they are doors that look like walls from one angle. This card is asking: what would shift if you stopped pushing and started listening?`,
    (n, m) => `${n} is the friction point — the part of this that hasn't been easy. ${m}. Resistance like this usually isn't there to stop you; it's there to make you slow down enough to actually see it.`,
  ],
  subconscious: [
    (n, m) => `Beneath what you have been saying out loud, ${n} stirs quietly. ${m}. The cards see what you have not yet put into words. This is the quiet driver behind much of what you have been feeling without being able to name it.`,
    (n, m) => `Underneath the surface, ${n} has been doing most of the real work. ${m}. It rarely announces itself directly — it shows up sideways, in the mood you can't quite explain.`,
  ],
  advice: [
    (n, m) => `Into this moment, ${n} arrives with a clear instruction: ${m}. Not a command — more like something a clear-eyed friend would say when they see the situation more plainly than you can from inside it. This is the pivot the reading is pointing toward.`,
    (n, m) => `If the reading has a single piece of advice, it's ${n}. ${m}. Take it as a nudge in a specific direction, not a demand — but a nudge worth following.`,
  ],
  outcome: [
    (n, m) => `Follow that thread, and ${n} waits. ${m}. This is the current the reading is pointing toward. Tend to what the advice card is asking of you, and you move closer to this resolution — one honest step at a time.`,
    (n, m) => `If things continue on this path, ${n} is where they land. ${m}. Outcomes in a reading describe momentum, not destiny — there's still time to adjust the angle.`,
  ],
};

const FIVE_CLOSERS = [
  `Five positions, one story. Foundation to outcome is rarely a straight line — but there is a line. Trace it slowly and you find the shape of what you are moving through right now.`,
  `Read this less like five separate fortunes and more like five frames of the same scene. Step back and the throughline is usually obvious.`,
];

function buildStory(cards, spreadType, intention, drawId) {
  const intentionClose = intention?.trim()
    ? `You came to this reading holding the question: "${intention.trim()}". Read the arc of these cards as the answer forming — not a prescription, but a map of the energy already in motion around that question.`
    : null;

  if (spreadType === 'single') {
    const c = cards[0];
    return [
      {
        label: `${c.name} · ${orientation(c)}`,
        body: `${meaning(c)} — ${c.story}`,
      },
      {
        body: intentionClose ?? pickVariant(`${drawId}-single`, SINGLE_CLOSERS),
      },
    ];
  }

  if (spreadType === 'three') {
    const [past, present, future] = cards;
    return [
      {
        label: `Past · ${past.name}${past.reversed ? ' · reversed' : ''}`,
        body: pickVariant(`${drawId}-past`, THREE_TEMPLATES.past)(past.name, meaning(past), past.story),
      },
      {
        label: `Present · ${present.name}${present.reversed ? ' · reversed' : ''}`,
        body: pickVariant(`${drawId}-present`, THREE_TEMPLATES.present)(present.name, meaning(present)),
      },
      {
        label: `Future · ${future.name}${future.reversed ? ' · reversed' : ''}`,
        body: pickVariant(`${drawId}-future`, THREE_TEMPLATES.future)(future.name, meaning(future)),
      },
      {
        body: intentionClose ?? pickVariant(`${drawId}-three-close`, THREE_CLOSERS),
      },
    ];
  }

  if (spreadType === 'five') {
    const [foundation, challenge, subconscious, advice, outcome] = cards;
    return [
      {
        label: `Foundation · ${foundation.name}${foundation.reversed ? ' · reversed' : ''}`,
        body: pickVariant(`${drawId}-foundation`, FIVE_TEMPLATES.foundation)(foundation.name, meaning(foundation)),
      },
      {
        label: `Challenge · ${challenge.name}${challenge.reversed ? ' · reversed' : ''}`,
        body: pickVariant(`${drawId}-challenge`, FIVE_TEMPLATES.challenge)(challenge.name, meaning(challenge)),
      },
      {
        label: `Subconscious · ${subconscious.name}${subconscious.reversed ? ' · reversed' : ''}`,
        body: pickVariant(`${drawId}-subconscious`, FIVE_TEMPLATES.subconscious)(subconscious.name, meaning(subconscious)),
      },
      {
        label: `Advice · ${advice.name}${advice.reversed ? ' · reversed' : ''}`,
        body: pickVariant(`${drawId}-advice`, FIVE_TEMPLATES.advice)(advice.name, meaning(advice)),
      },
      {
        label: `Outcome · ${outcome.name}${outcome.reversed ? ' · reversed' : ''}`,
        body: pickVariant(`${drawId}-outcome`, FIVE_TEMPLATES.outcome)(outcome.name, meaning(outcome)),
      },
      {
        body: intentionClose ?? pickVariant(`${drawId}-five-close`, FIVE_CLOSERS),
      },
    ];
  }

  return [];
}

function drawCards(count) {
  const deck = [...tarotData.tarotDeck];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck.slice(0, count).map(card => ({
    ...card,
    reversed: Math.random() < 0.3,
  }));
}

// Real, checkable correspondences between a drawn card and the querent's own
// birth data — surfaced only when one genuinely exists, never a generic
// filler line. Two independent checks, either or both can fire.
function getChartEchoes(card, sunSign, lifePathNumber) {
  if (!card) return null;
  const echoes = [];

  if (sunSign && getSignByTarotCard(card.name)?.name === sunSign.name) {
    echoes.push(`${card.name} is your ${sunSign.name} Sun's own card — when it shows up, it's not background noise.`);
  }

  if (lifePathNumber != null && card.number != null) {
    const cardNumber = reduceWithMasterNumbers(card.number);
    if (cardNumber === lifePathNumber) {
      echoes.push(`This card's number (${card.number}) echoes your Life Path ${lifePathNumber}.`);
    }
  }

  return echoes.length ? echoes : null;
}

const TarotReading = () => {
  const { user } = useAuth();
  const { openLogin } = useUI();
  const { userDetails } = useUser();

  const sunSign = useMemo(() => getZodiacSign(userDetails.birthdate), [userDetails.birthdate]);
  const lifePathNumber = useMemo(
    () => userDetails.birthdate ? calculateLifePathNumber(userDetails.birthdate) : null,
    [userDetails.birthdate]
  );

  const [spreadType, setSpreadType] = useState('three');
  const [intention, setIntention] = useState('');
  const [drawnCards, setDrawnCards] = useState(null);
  const [drawId, setDrawId] = useState(0);
  const [revealAll, setRevealAll] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showStory, setShowStory] = useState(false);
  const [readingSaved, setReadingSaved] = useState(false);

  const spread = SPREADS[spreadType];

  const handleDraw = () => {
    setDrawnCards(drawCards(spread.count));
    setDrawId(id => id + 1);
    setRevealAll(false);
    setSelected(null);
    setShowStory(false);
    setReadingSaved(false);
  };

  const handleSaveReading = async () => {
    if (!user) { openLogin(); return; }
    await saveReading(user.uid, {
      spreadLabel: spread.label,
      spreadType,
      intention: intention.trim(),
      cards: drawnCards.map((c, i) => ({
        name: c.name,
        reversed: c.reversed,
        positionLabel: spread.positions[i],
        meaning: c.meaning,
        reversedMeaning: c.reversedMeaning,
      })),
    });
    setReadingSaved(true);
  };

  const handleSpreadChange = (key) => {
    setSpreadType(key);
    setDrawnCards(null);
    setRevealAll(false);
    setSelected(null);
    setShowStory(false);
  };

  const story = drawnCards ? buildStory(drawnCards, spreadType, intention, drawId) : [];

  return (
    <div className="space-y-5">

      {/* Spread selector */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(SPREADS).map(([key, s]) => (
          <button
            key={key}
            onClick={() => handleSpreadChange(key)}
            className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
              spreadType === key
                ? 'border-[var(--accent)] text-[var(--accent)] bg-white/5'
                : 'border-white/15 text-white/50 hover:border-white/30 hover:text-white/80'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Intention input */}
      <input
        type="text"
        value={intention}
        onChange={e => setIntention(e.target.value)}
        placeholder="Set your intention (optional)"
        className="pill-input text-sm"
      />

      {/* Actions row */}
      <div className="flex gap-3 flex-wrap">
        <button onClick={handleDraw} className="primary-btn w-auto px-6">
          {drawnCards ? 'Reshuffle & draw again' : `Draw ${spread.label}`}
        </button>
        {drawnCards && !revealAll && (
          <button onClick={() => setRevealAll(true)} className="ghost-btn px-4 w-auto text-sm">
            Reveal all
          </button>
        )}
        {drawnCards && (
          <button
            onClick={() => setShowStory(true)}
            className="ghost-btn px-4 w-auto text-sm"
          >
            ✦ Read your story
          </button>
        )}
      </div>

      {!drawnCards && (
        <p className="text-xs text-white/30 text-center">
          Cards are drawn face-down — click each one to reveal it, or use Reveal all.
        </p>
      )}

      {/* Cards */}
      {drawnCards && (
        <div className="flex justify-center flex-wrap gap-5 mt-2">
          {drawnCards.map((card, i) => (
            <TarotCard
              key={`${drawId}-${i}`}
              card={card}
              position={spread.positions[i]}
              dealIndex={i}
              forceFlipped={revealAll}
              onInterpret={(c) => setSelected({ ...c, positionLabel: spread.positions[i] })}
            />
          ))}
        </div>
      )}

      {/* ── Story modal ───────────────────────────────────────────────── */}
      {showStory && (
        <div
          className="fixed inset-0 bg-black/80 flex justify-center items-center p-4 z-50"
          onClick={() => setShowStory(false)}
        >
          <div
            className="modal-surface max-w-lg w-full text-white max-h-[88vh] overflow-y-auto space-y-5"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/35 mb-1">Your reading</p>
                <h3 className="text-xl font-bold text-[var(--accent)]">{spread.label}</h3>
                {intention.trim() && (
                  <p className="text-xs text-white/45 italic mt-1">"{intention.trim()}"</p>
                )}
              </div>
              <button
                onClick={() => setShowStory(false)}
                className="text-xl font-bold text-gray-400 hover:text-red-300 transition ml-4 shrink-0"
                aria-label="Close"
              >✖</button>
            </div>

            <div className="h-px bg-white/10" />

            {/* Story sections */}
            {story.map((section, i) => (
              <div key={i} className="space-y-1.5">
                {section.label && (
                  <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--accent)]/65 font-medium">
                    {section.label}
                  </p>
                )}
                <p className="text-sm text-white/75 leading-[1.75]">{section.body}</p>
              </div>
            ))}

            <div className="h-px bg-white/10" />

            <div className="flex items-center justify-between flex-wrap gap-3">
              <p className="text-[10px] text-white/25 tracking-widest uppercase">
                The cards offer a mirror — the meaning is yours to hold
              </p>
              <button
                onClick={handleSaveReading}
                className={`text-xs border rounded-full px-3 py-1.5 transition-colors ${
                  readingSaved
                    ? 'border-[var(--accent)]/40 text-[var(--accent)]/60 cursor-default'
                    : 'border-white/20 text-white/45 hover:border-[var(--accent)]/50 hover:text-[var(--accent)]'
                }`}
                disabled={readingSaved}
              >
                {readingSaved ? '✓ Saved' : '⊕ Save reading'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Interpretation modal ──────────────────────────────────────── */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/75 flex justify-center items-center p-4 z-50"
          onClick={() => setSelected(null)}
        >
          <div
            className="modal-surface max-w-md w-full text-white max-h-[88vh] overflow-y-auto space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start">
              <div>
                {selected.positionLabel && (
                  <p className="text-[10px] uppercase tracking-[0.22em] text-white/35 mb-0.5">{selected.positionLabel}</p>
                )}
                <p className={`text-[10px] uppercase tracking-[0.22em] font-medium ${selected.reversed ? 'text-red-300/70' : 'text-white/40'}`}>
                  {selected.reversed ? '↕ Reversed' : '↑ Upright'}
                </p>
                <h3 className="text-2xl font-bold text-[var(--accent)]">{selected.name}</h3>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-xl font-bold text-gray-400 hover:text-red-300 transition ml-4 shrink-0"
                aria-label="Close"
              >✖</button>
            </div>

            {intention.trim() && (
              <div className="rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/30 mb-0.5">Your intention</p>
                <p className="text-xs text-white/60 italic">"{intention.trim()}"</p>
              </div>
            )}

            <div className="flex gap-4">
              <div className="shrink-0">
                <img
                  src={selected.imageURL}
                  alt={selected.name}
                  className="w-[72px] h-[116px] object-cover rounded-xl shadow-lg"
                  style={selected.reversed ? { transform: 'rotate(180deg)' } : undefined}
                />
              </div>
              <div className="space-y-3 min-w-0">
                <div className="rounded-xl bg-white/5 border border-white/10 px-3 py-2.5">
                  <p className="text-[var(--accent)] font-semibold text-sm leading-snug">
                    {selected.reversed ? selected.reversedMeaning : selected.meaning}
                  </p>
                </div>
                <p className="text-xs text-white/60 leading-relaxed">{selected.story}</p>
              </div>
            </div>

            {(() => {
              const echoes = getChartEchoes(selected, sunSign, lifePathNumber);
              return echoes && (
                <div className="rounded-xl px-3 py-2.5 border border-[var(--accent)]/40 bg-[var(--accent)]/10 space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--accent)]/70">✦ Echo in your chart</p>
                  {echoes.map((line, i) => (
                    <p key={i} className="text-xs text-white/75 leading-relaxed">{line}</p>
                  ))}
                </div>
              );
            })()}

            {selected.positionLabel && POSITION_PROMPTS[selected.positionLabel] && (
              <div className="border-t border-white/10 pt-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/35 mb-1">Reflect</p>
                <p className="text-sm text-white/70 italic">{POSITION_PROMPTS[selected.positionLabel]}</p>
              </div>
            )}

            {selected.reversed && (
              <div className="border-t border-white/10 pt-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/35 mb-1">Upright meaning</p>
                <p className="text-xs text-white/50">{selected.meaning}</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default TarotReading;
