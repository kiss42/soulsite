import React, { createContext, useContext, useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
  OAuthProvider,
  signOut as fbSignOut,
  deleteUser as fbDeleteUser,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// The native plugin's user shape (photoUrl) differs from the Firebase JS SDK's
// (photoURL) — normalize so the rest of the app can read user.photoURL either way.
function normalizeNativeUser(u) {
  return u ? { ...u, photoURL: u.photoUrl } : null;
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) { setLoading(false); return; }

    // The Firebase JS SDK's onAuthStateChanged never fires inside Capacitor's
    // WKWebView (same family of issue as the Firestore web-transport problem
    // fixed in profileService.js) — it hangs the whole app on a permanent
    // loading screen. The native plugin's own listener talks to the real
    // native Firebase Auth SDK and isn't affected.
    if (Capacitor.isNativePlatform()) {
      let handle;
      FirebaseAuthentication.getCurrentUser().then(({ user }) => {
        setUser(normalizeNativeUser(user));
        setLoading(false);
      });
      FirebaseAuthentication.addListener('authStateChange', ({ user }) => {
        setUser(normalizeNativeUser(user));
        setLoading(false);
      }).then(h => { handle = h; });
      return () => handle?.remove();
    }

    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  // Google's OAuth screen rejects Android's embedded WebView, so on native we use the
  // device's native Google Sign-In and then hand the resulting token to the Firebase JS
  // SDK — Firestore reads in this app go through that same SDK instance, not the native one.
  const signInWithGoogle = async () => {
    if (!auth) throw new Error('Auth not configured');
    if (!Capacitor.isNativePlatform()) return signInWithPopup(auth, googleProvider);
    const { credential } = await FirebaseAuthentication.signInWithGoogle();
    return signInWithCredential(auth, GoogleAuthProvider.credential(credential?.idToken));
  };
  // Same shape as Google above, but Apple's ID token is bound to a one-time
  // nonce (anti-replay) that has to be forwarded as `rawNonce`, or the JS SDK
  // rejects the credential — the native plugin exposes it as `credential.nonce`.
  const signInWithApple = async () => {
    if (!auth) throw new Error('Auth not configured');
    const appleProvider = new OAuthProvider('apple.com');
    if (!Capacitor.isNativePlatform()) return signInWithPopup(auth, appleProvider);
    const { credential } = await FirebaseAuthentication.signInWithApple();
    return signInWithCredential(auth, appleProvider.credential({
      idToken: credential?.idToken,
      rawNonce: credential?.nonce,
    }));
  };
  const signIn           = (email, pass) => auth ? signInWithEmailAndPassword(auth, email, pass) : Promise.reject(new Error('Auth not configured'));
  const signUp           = (email, pass) => auth ? createUserWithEmailAndPassword(auth, email, pass) : Promise.reject(new Error('Auth not configured'));
  const signOut          = async () => {
    if (!auth) return;
    if (Capacitor.isNativePlatform()) await FirebaseAuthentication.signOut();
    return fbSignOut(auth);
  };
  // Deletes the Auth account itself — callers must delete the user's
  // Firestore data first (deleteAllUserData), since this invalidates the
  // session those deletes are authorized under. Throws auth/requires-recent-login
  // if the session is stale; the caller should prompt a fresh sign-in and retry.
  const deleteAccount    = async () => {
    if (!auth) return;
    if (Capacitor.isNativePlatform()) return FirebaseAuthentication.deleteUser();
    return fbDeleteUser(auth.currentUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInWithApple, signIn, signUp, signOut, deleteAccount }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
