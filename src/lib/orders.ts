'use client';

import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { getDb, isFirebaseConfigured } from '@/lib/firebase';
import type { Order } from '@/types';

export async function getUserOrders(uid: string): Promise<Order[]> {
  if (!isFirebaseConfigured) return [];
  const q = query(
    collection(getDb(), 'orders'),
    where('uid', '==', uid),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Order);
}
