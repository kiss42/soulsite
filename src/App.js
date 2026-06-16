import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import NumerologyCalculator from './components/NumerologyCalculator';
import KarmicLessonsComponent from './components/KarmicLessonsComponent';
import AngelNumberSearch from './components/AngelNumberSearch';
import TarotReading from './components/Tarots/TarotReading';
import Navbar from './components/Navbar';
import ShadowWorksJournal from './components/ShadowWorksJournal';
import CelestialStatus from './components/CelestialStatus';
import './index.css';

const App = () => {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    document.body.classList.remove('theme-dark', 'theme-light');
    document.body.classList.add(`theme-${theme}`);
  }, [theme]);

  return (
    <UserProvider>
      <Router>
        <div className="relative min-h-screen overflow-hidden text-white">
          <div className="starfield--far" aria-hidden />
          <div className="starfield" aria-hidden />
          <div className="starfield--near" aria-hidden />
          <Navbar theme={theme} onToggleTheme={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')} />

          <main className="relative z-10">
            <section className="container mx-auto px-4 pt-10 pb-10 md:pt-14">
              <div className="flex flex-col items-center text-center gap-8">
                <div className="space-y-5 max-w-3xl">
                  <div className="eyebrow justify-center">Soul OS · lunar mode</div>
                  <h1 className="text-4xl md:text-5xl font-semibold leading-tight" style={{ fontFamily: "'Cinzel Decorative', serif" }}>
                    Psychic &amp; Tarot Readings
                  </h1>
                  <p className="text-gray-300 md:text-lg">
                    A quiet altar for numerology, tarot, chakras, and shadow work. Enter, pull a thread of meaning, and slip back into your evening.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <a href="#numerology" className="primary-btn px-6 w-auto">Start your reading</a>
                    <a href="#tarot" className="ghost-btn px-6 w-auto">Draw a card</a>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 text-sm">
                    <div className="stat-chip">4 practices · one desk</div>
                    <div className="stat-chip">Night-bloom palette</div>
                    <div className="stat-chip">Tarot-first flow</div>
                  </div>
                </div>

                <div className="trim-card w-full max-w-3xl">
                  <div className="ribbon mb-4">Moonlit sequence</div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-white/80">
                      <span>Ground</span>
                      <span className="text-white">2 min</span>
                    </div>
                    <p className="text-lg font-semibold">Breathe, pull a card, name the tension.</p>
                    <div className="flex justify-between text-sm text-white/80">
                      <span>Decode</span>
                      <span className="text-white">3 min</span>
                    </div>
                    <p className="text-lg font-semibold">Run the number, trace the pattern.</p>
                    <div className="flex justify-between text-sm text-white/80">
                      <span>Integrate</span>
                      <span className="text-white">5 min</span>
                    </div>
                    <p className="text-lg font-semibold">Journal the prompt, log the angel sign.</p>
                    <div className="mt-6 flex items-center gap-3 text-sm text-white/70">
                      <span className="h-px flex-1 bg-white/20" />
                      <span>Keep it light, keep it lunar.</span>
                      <span className="h-px flex-1 bg-white/20" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="container mx-auto px-4 pb-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section id="numerology" className="stack-card h-full flex flex-col gap-3">
                  <div>
                    <div className="eyebrow">Numbers</div>
                    <h3 className="section-title">Numerology blueprint</h3>
                    <p className="section-subtitle">
                      Life path, soul urge, personality, and hidden passions in one sweep.
                    </p>
                  </div>
                  <NumerologyCalculator />
                </section>

                <section id="chakra" className="stack-card h-full flex flex-col gap-3">
                  <div>
                    <div className="eyebrow">Chakra</div>
                    <h3 className="section-title">Karmic lessons</h3>
                    <p className="section-subtitle">
                      Surface name-based lessons and pair them with gentle chakra nudges.
                    </p>
                  </div>
                  <KarmicLessonsComponent />
                </section>

                <section id="journal" className="stack-card h-full flex flex-col gap-3">
                  <div>
                    <div className="eyebrow">Integration</div>
                    <h3 className="section-title">Shadow work journal</h3>
                    <p className="section-subtitle">
                      One button prompt, quick reflection, export if it resonates.
                    </p>
                  </div>
                  <ShadowWorksJournal />
                </section>

                <section id="angel-number" className="stack-card h-full flex flex-col gap-3">
                  <div>
                    <div className="eyebrow">Synchronicity</div>
                    <h3 className="section-title">Angel number decoder</h3>
                    <p className="section-subtitle">
                      Look up repeating numbers and leave with one action to anchor it.
                    </p>
                  </div>
                  <AngelNumberSearch />
                </section>
              </div>
            </section>

            <section className="container mx-auto px-4 pb-10">
              <div className="stack-card flex flex-col gap-4">
                <div>
                  <div className="eyebrow">Celestial</div>
                  <h3 className="section-title">Moon &amp; Planetary Weather</h3>
                  <p className="section-subtitle">
                    Live moon phase, current sign, and every active retrograde — with what each one is asking of you.
                  </p>
                </div>
                <CelestialStatus />
              </div>
            </section>

            <section className="container mx-auto px-4 pb-16">
              <div id="tarot" className="stack-card flex flex-col gap-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <div className="eyebrow">Tarot</div>
                    <h3 className="section-title">Pull a spread</h3>
                    <p className="section-subtitle">Minimal draw with upright art; tap to reveal the story.</p>
                  </div>
                  <div className="ghost-btn px-4 w-auto">Tap a card to reveal its story</div>
                </div>
                <TarotReading />
              </div>
            </section>
          </main>
        </div>
      </Router>
    </UserProvider>
  );
};

export default App;
