import React, { createContext, useContext, useState } from 'react';

const UIContext = createContext();
export const useUI = () => useContext(UIContext);

export function UIProvider({ children }) {
  const [loginOpen,   setLoginOpen]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <UIContext.Provider value={{
      loginOpen,   setLoginOpen,
      profileOpen, setProfileOpen,
      openLogin:   () => setLoginOpen(true),
      openProfile: () => setProfileOpen(true),
    }}>
      {children}
    </UIContext.Provider>
  );
}
