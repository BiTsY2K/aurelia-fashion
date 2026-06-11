'use client';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getFirebaseAuth, getDb } from '@/lib/firebase';
import type { UserProfile } from '@/types';

/** Create the Firestore /users doc on first sign-in (idempotent). */
export async function ensureUserDoc(user: User): Promise<void> {
  const ref = doc(getDb(), 'users', user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return;
  const profile: Omit<UserProfile, 'createdAt'> & { createdAt: unknown } = {
    uid: user.uid,
    email: user.email ?? '',
    displayName: user.displayName ?? '',
    photoURL: user.photoURL ?? '',
    role: 'customer',
    addresses: [],
    wishlist: [],
    createdAt: serverTimestamp(),
  };
  await setDoc(ref, profile);
}

/**
 * Attempts to create the Firestore user doc but never blocks sign-in if Firestore
 * is unavailable. The doc is idempotent — it will be created on the next successful request.
 */
async function tryEnsureUserDoc(user: User): Promise<void> {
  try {
    await ensureUserDoc(user);
  } catch (e) {
    console.warn('[auth] ensureUserDoc failed (non-fatal):', (e as { code?: string }).code, e);
  }
}

export async function signUpWithEmail(name: string, email: string, password: string) {
  const auth = getFirebaseAuth();
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (name) await updateProfile(cred.user, { displayName: name });
  await tryEnsureUserDoc(cred.user);
  return cred.user;
}

export async function signInWithEmail(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
  await tryEnsureUserDoc(cred.user);
  return cred.user;
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(getFirebaseAuth(), provider);
  await tryEnsureUserDoc(cred.user);
  return cred.user;
}

export async function signInWithApple() {
  const provider = new OAuthProvider('apple.com');
  provider.addScope('email');
  provider.addScope('name');
  const cred = await signInWithPopup(getFirebaseAuth(), provider);
  await tryEnsureUserDoc(cred.user);
  return cred.user;
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(getFirebaseAuth(), email);
}

export async function signOutUser() {
  await signOut(getFirebaseAuth());
}

/** Map Firebase error codes to friendly copy (per design skill: errors are specific, not vague). */
export function authErrorMessage(code: string): string {
  const map: Record<string, string> = {
    "auth/invalid-email": "That email address doesn’t look right.",
    "auth/user-not-found": "No account found with that email.",
    "auth/wrong-password": "Incorrect password. Try again or reset it.",
    "auth/invalid-credential": "Email or password is incorrect.",
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/weak-password": "Use at least 6 characters for your password.",
    "auth/popup-closed-by-user": "Sign-in was cancelled.",
    "auth/too-many-requests": "Too many attempts. Please wait a moment.",
    "auth/operation-not-allowed": "This sign-in method is not enabled. Please contact support.",
    "auth/popup-blocked": "Pop-up was blocked by your browser. Allow pop-ups and try again.",
    "auth/cancelled-popup-request": "Sign-in was cancelled.",
    "auth/network-request-failed": "Network error. Check your connection and try again.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/requires-recent-login": "Please sign in again to continue.",
  };
  if (process.env.NODE_ENV === "development" && !map[code]) {
    console.error("[auth] Unhandled Firebase error code:", code);
  }
  return map[code] ?? "Something went wrong. Please try again.";
}
