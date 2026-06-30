import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export let auth           = null;
export let db             = null;
export let googleProvider = null;

if (process.env.REACT_APP_FIREBASE_API_KEY) {
  const app    = initializeApp({

  
    apiKey:            process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain:        process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId:         process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket:     process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId:             process.env.REACT_APP_FIREBASE_APP_ID,
  });
  auth           = getAuth(app);
  // Firestore on native goes through the @capacitor-firebase/firestore plugin
  // instead (see profileService.js) — the WebView can't sustain the JS SDK's
  // transport for writes. This `db` instance is only ever used on web now.
  db             = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
}
