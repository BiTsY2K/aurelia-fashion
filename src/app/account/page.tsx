'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-provider';
import { signOutUser } from '@/lib/auth';
import { getUserOrders } from '@/lib/orders';
import { doc, getDoc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import { formatPrice } from '@/lib/utils';
import type { Order } from '@/types';

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending', processing: 'Processing', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled',
};

export default function AccountPage() {
  const router = useRouter();
  const { user, loading, configured } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!loading && configured && !user) router.replace('/sign-in');
  }, [loading, configured, user, router]);

  useEffect(() => {
    if (!user) return;
    getUserOrders(user.uid).then(setOrders).catch(() => setOrders([]));
    getDoc(doc(getDb(), 'users', user.uid))
      .then((snap) => setIsAdmin(snap.data()?.role === 'admin'))
      .catch(() => setIsAdmin(false));
  }, [user]);

  if (!configured) {
    return (
      <section className="container-page grid min-h-[60vh] place-items-center text-center">
        <div>
          <h1 className="text-display-md">Accounts are almost ready</h1>
          <p className="mt-3 text-sm text-carbon-muted">Add your Firebase keys to enable customer accounts.</p>
          <Link href="/" className="btn-pill mt-6">Back to home</Link>
        </div>
      </section>
    );
  }

  if (loading || !user) {
    return <section className="container-page grid min-h-[60vh] place-items-center text-sm text-carbon-muted">Loading…</section>;
  }

  return (
    <section className="container-page py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">My account</p>
          <h1 className="mt-2 text-display-md">{user.displayName || 'Welcome'}</h1>
          <p className="mt-1 text-sm text-carbon-muted">{user.email}</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && <Link href="/admin" className="btn-pill">Admin dashboard</Link>}
          <button onClick={() => signOutUser().then(() => router.push('/'))} className="btn-pill-ghost">Sign out</button>
        </div>
      </div>

      <div className="mt-12 grid gap-10 md:grid-cols-[1fr_1.6fr]">
        <div>
          <h2 className="font-display text-xl">Shipping addresses</h2>
          <p className="mt-2 text-sm text-carbon-muted">
            Saved addresses speed up checkout. Address management ships with the checkout flow.
          </p>
        </div>

        <div>
          <h2 className="font-display text-xl">Order history</h2>
          {orders.length === 0 ? (
            <p className="mt-3 text-sm text-carbon-muted">No orders yet — your purchases will appear here.</p>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {orders.map((o) => (
                <li key={o.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <p className="font-medium">#{o.id.slice(0, 8)}</p>
                    <p className="text-xs text-carbon-muted">{o.items.length} item(s)</p>
                  </div>
                  <span className="rounded-pill bg-ivory-dim px-3 py-1 text-xs">{STATUS_LABEL[o.status]}</span>
                  <span className="font-medium">{formatPrice(o.total)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
