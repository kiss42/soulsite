import { Capacitor } from '@capacitor/core';
import {
  doc, setDoc, getDoc,
  collection, addDoc, getDocs, deleteDoc,
  serverTimestamp, query, orderBy,
} from 'firebase/firestore';
import {
  FirebaseFirestore as NativeFirestore,
  FieldValue as NativeFieldValue,
  Timestamp as NativeTimestamp,
} from '@capacitor-firebase/firestore';
import { db } from '../firebase';

// The Firestore JS SDK's browser transport can't sustain a write inside the
// Android WebView (channel keeps reopening, write never gets acknowledged —
// see android-app-capacitor session notes). Route native through the
// Capacitor plugin, which talks to Firestore via the native Android SDK
// instead of WebView fetch/XHR. Web keeps the original JS SDK calls.
const isNative = () => Capacitor.isNativePlatform();

// The native plugin returns Firestore Timestamps as plain marker objects
// instead of class instances — rehydrate so callers can still call `.toDate()`.
function hydrateTimestamp(value) {
  return value && value.__type__ === 'timestamp'
    ? new NativeTimestamp(value.seconds, value.nanoseconds)
    : value;
}

async function setDocument(path, data, merge) {
  if (isNative()) return NativeFirestore.setDocument({ reference: path, data, merge });
  return setDoc(doc(db, path), data, { merge });
}

async function getDocument(path) {
  if (isNative()) {
    const { snapshot } = await NativeFirestore.getDocument({ reference: path });
    return snapshot.data;
  }
  const snap = await getDoc(doc(db, path));
  return snap.exists() ? snap.data() : null;
}

async function addDocument(path, data) {
  if (isNative()) {
    return NativeFirestore.addDocument({
      reference: path,
      data: { ...data, savedAt: NativeFieldValue.serverTimestamp() },
    });
  }
  return addDoc(collection(db, path), { ...data, savedAt: serverTimestamp() });
}

async function getOrderedCollection(path) {
  if (isNative()) {
    const { snapshots } = await NativeFirestore.getCollection({
      reference: path,
      queryConstraints: [{ type: 'orderBy', fieldPath: 'savedAt', directionStr: 'desc' }],
    });
    return snapshots.map(s => ({ id: s.id, ...s.data, savedAt: hydrateTimestamp(s.data.savedAt) }));
  }
  const snap = await getDocs(query(collection(db, path), orderBy('savedAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function deleteDocument(path) {
  if (isNative()) return NativeFirestore.deleteDocument({ reference: path });
  return deleteDoc(doc(db, path));
}

export async function saveProfile(uid, data) {
  await setDocument(`users/${uid}`, data, true);
}

export async function getProfile(uid) {
  return getDocument(`users/${uid}`);
}

// ── Readings ──────────────────────────────────────────────────────────────
export const saveReading        = (uid, reading) => addDocument(`users/${uid}/readings`, reading);
export const getReadings        = (uid)          => getOrderedCollection(`users/${uid}/readings`);
export const deleteReading      = (uid, id)      => deleteDocument(`users/${uid}/readings/${id}`);

// ── Journal ───────────────────────────────────────────────────────────────
export const saveJournalEntry   = (uid, entry)   => addDocument(`users/${uid}/journal`, entry);
export const getJournalEntries  = (uid)          => getOrderedCollection(`users/${uid}/journal`);
export const deleteJournalEntry = (uid, id)      => deleteDocument(`users/${uid}/journal/${id}`);

// ── Angel number favorites ────────────────────────────────────────────────
export const saveFavorite       = (uid, item)    => addDocument(`users/${uid}/favorites`, item);
export const getFavorites       = (uid)          => getOrderedCollection(`users/${uid}/favorites`);
export const deleteFavorite     = (uid, id)      => deleteDocument(`users/${uid}/favorites/${id}`);

// ── Dreams ────────────────────────────────────────────────────────────────
export const saveDream          = (uid, dream)   => addDocument(`users/${uid}/dreams`, dream);
export const getDreams          = (uid)          => getOrderedCollection(`users/${uid}/dreams`);
export const deleteDream        = (uid, id)      => deleteDocument(`users/${uid}/dreams/${id}`);
