import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

/** True only when real keys are present. Until then the UI runs on demo data. */
export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

// Initialize lazily so importing this module never throws before keys exist.
let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _storage: FirebaseStorage | null = null;

function app(): FirebaseApp {
  if (!_app) _app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return _app;
}

export function getFirebaseAuth(): Auth {
  if (!isFirebaseConfigured) throw new Error('Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* env vars.');
  if (!_auth) _auth = getAuth(app());
  return _auth;
}

export function getDb(): Firestore {
  if (!isFirebaseConfigured) throw new Error('Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* env vars.');
  if (!_db) _db = getFirestore(app());
  return _db;
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!isFirebaseConfigured) throw new Error('Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* env vars.');
  if (!_storage) _storage = getStorage(app());
  return _storage;
}
