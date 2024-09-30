import React from 'react';
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
      <div className="relative min-h-screen flex flex-col bg-spiritual-image text-white">
        <Navbar />
        <div className="flex-grow flex flex-col justify-center items-center p-4">
          <div className="flex flex-wrap justify-center items-center space-x-4 mb-4">
            <NumerologyCalculator />
            <KarmicLessonsComponent />
            <ShadowWorksJournal/>
            <AngelNumberSearch />
          </div>
        </div>
        <div className="pb-4">
          <TarotReading />
        </div>
      </div>
    </UserProvider>
  );
};

export default App;
