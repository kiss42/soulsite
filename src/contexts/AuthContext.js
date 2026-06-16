import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) { setLoading(false); return; }
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const signInWithGoogle = ()            => auth ? signInWithPopup(auth, googleProvider) : Promise.reject(new Error('Auth not configured'));
  const signIn           = (email, pass) => auth ? signInWithEmailAndPassword(auth, email, pass) : Promise.reject(new Error('Auth not configured'));
  const signUp           = (email, pass) => auth ? createUserWithEmailAndPassword(auth, email, pass) : Promise.reject(new Error('Auth not configured'));
  const signOut          = ()            => auth ? fbSignOut(auth) : Promise.resolve();

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signIn, signUp, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
