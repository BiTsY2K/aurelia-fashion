'use client';

import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-client';
import { cn } from '@/lib/utils';

interface Review {
  id: string;
  productId: string;
  productName?: string;
  author: string;
  rating: number;
  body: string;
  approved?: boolean;
  createdAt?: number;
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [tab, setTab] = useState<'pending' | 'approved'>('pending');
  const [error, setError] = useState('');

  const load = () =>
    adminFetch<{ reviews: Review[] }>('/api/admin/reviews')
      .then((d) => setReviews(d.reviews))
      .catch((e) => setError(e.message));

  useEffect(() => { load(); }, []);

  const visible = reviews.filter((r) => (tab === 'approved' ? r.approved : !r.approved));

  const moderate = async (id: string, approved: boolean) => {
    try {
      await adminFetch('/api/admin/reviews', { method: 'PATCH', body: JSON.stringify({ id, approved }) });
      load();
    } catch (e) { setError((e as Error).message); }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this review permanently?')) return;
    try {
      await adminFetch(`/api/admin/reviews?id=${id}`, { method: 'DELETE' });
      load();
    } catch (e) { setError((e as Error).message); }
  };

  return (
    <div>
      <h1 className="text-display-md">Reviews</h1>

      <div className="mt-5 flex gap-1.5">
        {(['pending', 'approved'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={cn('rounded-pill px-3.5 py-1.5 text-xs capitalize transition-colors',
              tab === t ? 'bg-carbon text-ivory' : 'bg-ivory-dim text-carbon-muted hover:text-carbon')}>
            {t} ({reviews.filter((r) => (t === 'approved' ? r.approved : !r.approved)).length})
          </button>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-terracotta">{error}</p>}

      {visible.length === 0 ? (
        <p className="mt-8 text-sm text-carbon-muted">
          {tab === 'pending' ? 'Nothing waiting for review.' : 'No approved reviews yet.'}
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {visible.map((r) => (
            <li key={r.id} className="rounded-card border border-line bg-ivory-soft p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{r.author}</p>
                  <p className="text-xs text-carbon-muted">{r.productName ?? r.productId}</p>
                </div>
                <span className="text-champagne">{'★'.repeat(r.rating)}<span className="text-line">{'★'.repeat(5 - r.rating)}</span></span>
              </div>
              <p className="mt-3 text-sm">{r.body}</p>
              <div className="mt-4 flex gap-2">
                {!r.approved && (
                  <button onClick={() => moderate(r.id, true)} className="btn-pill px-4 py-1.5 text-xs">Approve</button>
                )}
                {r.approved && (
                  <button onClick={() => moderate(r.id, false)} className="btn-pill-ghost px-4 py-1.5 text-xs">Unpublish</button>
                )}
                <button onClick={() => remove(r.id)} className="rounded-pill border border-line px-4 py-1.5 text-xs text-terracotta hover:border-terracotta">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
