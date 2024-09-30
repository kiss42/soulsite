import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom'; // Import BrowserRouter
import { UserProvider } from './contexts/UserContext';
import NumerologyCalculator from './components/NumerologyCalculator';
import KarmicLessonsComponent from './components/KarmicLessonsComponent';
import AngelNumberSearch from './components/AngelNumberSearch';
import TarotReading from './components/Tarots/TarotReading';
import Navbar from './components/Navbar';
import './index.css';
import ShadowWorksJournal from './components/ShadowWorksJournal';

const App = () => {
  return (
    <UserProvider>
      <Router> {/* Wrap the app in Router */}
        <div className="relative min-h-screen flex flex-col bg-spiritual-image text-white">
          <Navbar />
          {/* Main Content */}
          <div className="flex-grow flex flex-col justify-center items-center p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <NumerologyCalculator />
              <KarmicLessonsComponent />
              <ShadowWorksJournal />
              <AngelNumberSearch />
            </div>
          </div>
          {/* Tarot Reading Section */}
          <div className="pb-8 bg-black w-full mt-4 flex justify-center">
            <TarotReading />
          </div>
        </div>
      </Router>
    </UserProvider>
  );
};

export default App;
