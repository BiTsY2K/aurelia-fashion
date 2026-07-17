'use client';

import { useEffect, useMemo, useState } from 'react';
import { adminFetch } from '@/lib/admin-client';
import { formatPrice, cn } from '@/lib/utils';
import type { Order, OrderStatus } from '@/types';

const STATUSES: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const TONE: Record<OrderStatus, string> = {
  pending: 'bg-ivory-dim text-carbon-muted',
  processing: 'bg-champagne/25 text-champagne-deep',
  shipped: 'bg-carbon text-ivory',
  delivered: 'bg-champagne text-carbon',
  cancelled: 'bg-terracotta/15 text-terracotta',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<'all' | OrderStatus>('all');
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  const load = () =>
    adminFetch<{ orders: Order[] }>('/api/admin/orders')
      .then((d) => setOrders(d.orders))
      .catch((e) => setError(e.message));

  useEffect(() => { load(); }, []);

  const visible = useMemo(
    () => (filter === 'all' ? orders : orders.filter((o) => o.status === filter)),
    [orders, filter],
  );

  const update = async (order: Order, status: OrderStatus) => {
    let trackingUrl: string | undefined;
    if (status === 'shipped') {
      trackingUrl = prompt('Tracking link for this shipment (optional):') ?? undefined;
    }
    setBusyId(order.id);
    try {
      await adminFetch('/api/admin/orders', {
        method: 'PATCH',
        body: JSON.stringify({ id: order.id, status, trackingUrl }),
      });
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId('');
    }
  };

  return (
    <div>
      <h1 className="text-display-md">Orders</h1>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {(['all', ...STATUSES] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={cn('rounded-pill px-3.5 py-1.5 text-xs capitalize transition-colors',
              filter === s ? 'bg-carbon text-ivory' : 'bg-ivory-dim text-carbon-muted hover:text-carbon')}>
            {s} {s !== 'all' && `(${orders.filter((o) => o.status === s).length})`}
          </button>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-terracotta">{error}</p>}

      {visible.length === 0 ? (
        <p className="mt-8 text-sm text-carbon-muted">
          {orders.length === 0 ? 'No orders yet — they’ll appear here the moment one comes in.' : 'No orders in this state.'}
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {visible.map((o) => (
            <li key={o.id} className="rounded-card border border-line bg-ivory-soft p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">#{o.id.slice(0, 8)}</p>
                  <p className="text-xs text-carbon-muted">
                    {o.address?.fullName} · {o.address?.city}, {o.address?.state} · {o.address?.phone}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn('rounded-pill px-3 py-1 text-xs capitalize', TONE[o.status])}>{o.status}</span>
                  <span className="font-display text-lg">{formatPrice(o.total)}</span>
                </div>
              </div>

              <ul className="mt-3 space-y-1 text-xs text-carbon-muted">
                {o.items?.map((i) => (
                  <li key={`${i.productId}-${i.size}-${i.color}`}>
                    {i.name} — {i.color} / {i.size} × {i.quantity}
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {STATUSES.filter((s) => s !== o.status).map((s) => (
                  <button key={s} disabled={busyId === o.id} onClick={() => update(o, s)}
                    className="rounded-pill border border-line px-3 py-1.5 text-xs capitalize transition-colors hover:border-carbon disabled:opacity-40">
                    Mark {s}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
