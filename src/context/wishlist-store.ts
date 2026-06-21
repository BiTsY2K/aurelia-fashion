'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getDb, isFirebaseConfigured } from '@/lib/firebase';

interface WishlistState {
  ids: string[];
  toggle: (productId: string) => void;
  has: (productId: string) => boolean;
  setAll: (ids: string[]) => void;
  clear: () => void;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (productId) =>
        set((state) => ({
          ids: state.ids.includes(productId)
            ? state.ids.filter((id) => id !== productId)
            : [...state.ids, productId],
        })),
      has: (productId) => get().ids.includes(productId),
      setAll: (ids) => set({ ids }),
      clear: () => set({ ids: [] }),
    }),
    { name: 'aurelia-wishlist' },
  ),
);

/** Merges the guest wishlist with the saved one on sign-in, then writes it back. */
export async function mergeWishlistWithAccount(uid: string, localIds: string[]): Promise<string[]> {
  if (!isFirebaseConfigured) return localIds;
  try {
    const ref = doc(getDb(), 'users', uid);
    const snap = await getDoc(ref);
    const remote: string[] = snap.data()?.wishlist ?? [];
    const merged = [...new Set([...remote, ...localIds])];
    await setDoc(ref, { wishlist: merged }, { merge: true });
    return merged;
  } catch (err) {
    console.error('mergeWishlistWithAccount', err);
    return localIds;
  }
}

export async function saveWishlist(uid: string, ids: string[]) {
  if (!isFirebaseConfigured) return;
  try {
    await setDoc(doc(getDb(), 'users', uid), { wishlist: ids }, { merge: true });
  } catch (err) {
    console.error('saveWishlist', err);
  }
}
