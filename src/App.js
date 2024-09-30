import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import NumerologyCalculator from './components/NumerologyCalculator';
import KarmicLessonsComponent from './components/KarmicLessonsComponent';
import AngelNumberSearch from './components/AngelNumberSearch';
import TarotReading from './components/Tarots/TarotReading';
import Navbar from './components/Navbar';
import ShadowWorksJournal from './components/ShadowWorksJournal';
import './index.css';

const App = () => {
  return (
    <UserProvider>
      <Router>
        <div className="relative min-h-screen flex flex-col bg-spiritual-image text-white">
          <Navbar />

          {/* Main Content */}
          <div className="flex-grow flex flex-col justify-center items-center p-4">
            {/* Components Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <section id="numerology">
                <NumerologyCalculator />
              </section>
              <section id="chakra">
                <KarmicLessonsComponent />
              </section>
              <section id="journal">
                <ShadowWorksJournal />
              </section>
              <section id="angel-number">
                <AngelNumberSearch />
              </section>
            </div>
          </div>

          {/* Tarot Reading Section at the Bottom */}
          <div className="pb-8 bg-black w-full mt-4 flex justify-center">
            <section id="tarot">
              <TarotReading />
            </section>
          </div>
        </div>
      </Router>
    </UserProvider>
  );
};

export default App;
