import {
  doc, setDoc, getDoc,
  collection, addDoc, getDocs, deleteDoc,
  serverTimestamp, query, orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';

export async function saveProfile(uid, data) {
  await setDoc(doc(db, 'users', uid), data, { merge: true });
}

export async function getProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

// ── Readings ──────────────────────────────────────────────────────────────
export async function saveReading(uid, reading) {
  return addDoc(collection(db, 'users', uid, 'readings'), {
    ...reading, savedAt: serverTimestamp(),
  });
}

export async function getReadings(uid) {
  const snap = await getDocs(
    query(collection(db, 'users', uid, 'readings'), orderBy('savedAt', 'desc'))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function deleteReading(uid, id) {
  await deleteDoc(doc(db, 'users', uid, 'readings', id));
}

// ── Journal ───────────────────────────────────────────────────────────────
export async function saveJournalEntry(uid, entry) {
  return addDoc(collection(db, 'users', uid, 'journal'), {
    ...entry, savedAt: serverTimestamp(),
  });
}

export async function getJournalEntries(uid) {
  const snap = await getDocs(
    query(collection(db, 'users', uid, 'journal'), orderBy('savedAt', 'desc'))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function deleteJournalEntry(uid, id) {
  await deleteDoc(doc(db, 'users', uid, 'journal', id));
}

// ── Angel number favorites ────────────────────────────────────────────────
export async function saveFavorite(uid, item) {
  return addDoc(collection(db, 'users', uid, 'favorites'), {
    ...item, savedAt: serverTimestamp(),
  });
}

export async function getFavorites(uid) {
  const snap = await getDocs(
    query(collection(db, 'users', uid, 'favorites'), orderBy('savedAt', 'desc'))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function deleteFavorite(uid, id) {
  await deleteDoc(doc(db, 'users', uid, 'favorites', id));
}
