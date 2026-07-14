'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/context/auth-provider';
import { getDb } from '@/lib/firebase';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/inquiries', label: 'Inquiries' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/reviews', label: 'Reviews' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, configured } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<'checking' | 'admin' | 'denied'>('checking');

  useEffect(() => {
    if (loading) return;
    if (!configured) { setRole('denied'); return; }
    if (!user) { router.replace('/sign-in'); return; }

    getDoc(doc(getDb(), 'users', user.uid))
      .then((snap) => setRole(snap.data()?.role === 'admin' ? 'admin' : 'denied'))
      .catch(() => setRole('denied'));
  }, [user, loading, configured, router]);

  if (loading || role === 'checking') {
    return <div className="container-page grid min-h-[60vh] place-items-center text-sm text-carbon-muted">Checking access…</div>;
  }

  if (role === 'denied') {
    return (
      <div className="container-page grid min-h-[60vh] place-items-center text-center">
        <div>
          <p className="eyebrow">Restricted</p>
          <h1 className="mt-3 text-display-md">Admin access only</h1>
          <p className="mt-3 max-w-sm text-sm text-carbon-muted">
            {configured
              ? 'This account isn’t an admin. Set role to "admin" on your /users document in Firestore.'
              : 'Add your Firebase keys and a service account to enable the dashboard.'}
          </p>
          <Link href="/" className="btn-pill mt-6">Back to store</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page grid gap-8 py-10 md:grid-cols-[180px_1fr]">
      <aside>
        <p className="eyebrow">Boutique admin</p>
        <nav className="mt-4 flex gap-1 overflow-x-auto pb-1 md:flex-col md:overflow-visible" aria-label="Admin sections">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                'shrink-0 rounded-pill px-3.5 py-2 text-sm transition-colors',
                pathname === n.href ? 'bg-carbon text-ivory' : 'text-carbon-muted hover:bg-ivory-dim',
              )}
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
