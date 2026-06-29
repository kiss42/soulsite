import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useUI } from '../../contexts/UIContext';
import { useProfilePrefill } from '../../hooks/useProfilePrefill';
import LoginModal from '../Auth/LoginModal';
import ProfileModal from '../Profile/ProfileModal';
import NativeTopBar from './NativeTopBar';
import TabBar from './TabBar';
import HomeScreen from './screens/HomeScreen';
import TarotScreen from './screens/TarotScreen';
import NumerologyScreen from './screens/NumerologyScreen';
import AstrologyScreen from './screens/AstrologyScreen';
import MoreScreen from './screens/MoreScreen';

const SCREENS = {
  home: { title: 'SoulSite', Component: HomeScreen },
  tarot: { title: 'Tarot', Component: TarotScreen },
  numerology: { title: 'Numerology', Component: NumerologyScreen },
  astrology: { title: 'Astrology', Component: AstrologyScreen },
  more: { title: 'More', Component: MoreScreen },
};

export default function NativeApp({ theme, setTheme }) {
  const { user } = useAuth();
  const { loginOpen, setLoginOpen, profileOpen, setProfileOpen } = useUI();
  const [tab, setTab] = useState('home');
  useProfilePrefill();

  const { title, Component } = SCREENS[tab];

  return (
    <div className="relative h-screen overflow-hidden text-white flex flex-col">
      <div className="starfield--far" aria-hidden />
      <div className="starfield" aria-hidden />
      <div className="starfield--near" aria-hidden />

      <NativeTopBar
        title={title}
        theme={theme}
        onToggleTheme={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
        user={user}
        onOpenProfile={() => setProfileOpen(true)}
        onOpenLogin={() => setLoginOpen(true)}
      />

      <main className="relative z-10 flex-1 overflow-y-auto">
        <Component onNavigate={setTab} />
      </main>

      <TabBar active={tab} onChange={setTab} />

      {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} />}
      {profileOpen && <ProfileModal onClose={() => setProfileOpen(false)} />}
    </div>
  );
}
