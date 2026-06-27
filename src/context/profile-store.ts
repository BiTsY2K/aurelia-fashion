'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { doc, setDoc } from 'firebase/firestore';
import { getDb, isFirebaseConfigured } from '@/lib/firebase';
import type { StyleProfile } from '@/lib/quiz';

interface ProfileState {
  profile: StyleProfile | null;
  setProfile: (p: StyleProfile) => void;
  clearProfile: () => void;
}

export const useStyleProfile = create<ProfileState>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),
      clearProfile: () => set({ profile: null }),
    }),
    { name: 'aurelia-style-profile' },
  ),
);

/** Mirrors the profile onto the user's Firestore doc so it follows them across devices. */
export async function syncProfileToAccount(uid: string, profile: StyleProfile) {
  if (!isFirebaseConfigured) return;
  try {
    await setDoc(doc(getDb(), 'users', uid), { styleProfile: profile }, { merge: true });
  } catch (err) {
    console.error('syncProfileToAccount', err);
  }
}
