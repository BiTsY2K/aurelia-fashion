'use client';

import { useEffect, useRef } from 'react';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '@/context/auth-provider';
import { useCart } from '@/context/cart-store';
import { getDb, isFirebaseConfigured } from '@/lib/firebase';

/**
 * Mirrors a signed-in shopper's cart to Firestore.
 * This is what the abandoned-cart job reads: a cart doc whose `updatedAt`
 * has gone stale without a matching order. Debounced so typing quantities
 * doesn't hammer the database.
 */
export default function CartSync() {
  const { user } = useAuth();
  const items = useCart((s) => s.items);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user || !isFirebaseConfigured) return;

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const ref = doc(getDb(), 'carts', user.uid);

      if (items.length === 0) {
        deleteDoc(ref).catch(() => {});
        return;
      }

      setDoc(ref, {
        uid: user.uid,
        email: user.email ?? '',
        phone: '', // populated at checkout when the shopper enters one
        items,
        subtotal: items.reduce((s, i) => s + i.price * i.quantity, 0),
        updatedAt: Date.now(),
        reminderSentAt: null,
      }, { merge: true }).catch(() => {});
    }, 1500);

    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [user, items]);

  return null;
}
