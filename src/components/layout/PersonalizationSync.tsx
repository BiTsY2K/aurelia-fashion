'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/auth-provider';
import { useWishlist, mergeWishlistWithAccount } from '@/context/wishlist-store';
import { useStyleProfile, syncProfileToAccount } from '@/context/profile-store';

/**
 * On sign-in, folds anything saved as a guest into the user's account
 * so nothing is lost when they finally create one. Runs once per session.
 */
export default function PersonalizationSync() {
  const { user } = useAuth();
  const { ids, setAll } = useWishlist();
  const { profile } = useStyleProfile();
  const syncedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!user || syncedFor.current === user.uid) return;
    syncedFor.current = user.uid;

    mergeWishlistWithAccount(user.uid, ids).then(setAll);
    if (profile) syncProfileToAccount(user.uid, profile);
  }, [user, ids, profile, setAll]);

  return null;
}
