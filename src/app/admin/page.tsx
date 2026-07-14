'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminFetch } from '@/lib/admin-client';
import { formatPrice } from '@/lib/utils';

interface ProductRow { name: string; sku?: string; views: number; inquiries: number }

interface Stats {
  totalOrders: number;
  revenue30: number;
  avgOrderValue: number;
  abandonmentRate: number | null;
  statusCounts: Record<string, number>;
  topProducts: { name: string; units: number }[];
  daily: { date: string; revenue: number; orders: number }[];
  pageViews30: number;
  inquiries30: number;
  whatsappClicks30: number;
  newInquiries: number;
  inquiriesByType: Record<string, number>;
  inquiriesByStatus: Record<string, number>;
  trafficDaily: { date: string; views: number; inquiries: number; whatsapp: number }[];
  mostViewed: ProductRow[];
  mostEnquired: ProductRow[];
}

function Metric({ label, value, hint, href }: { label: string; value: string; hint?: string; href?: string }) {
  const body = (
    <>
      <p className="text-xs uppercase tracking-wide text-carbon-muted">{label}</p>
      <p className="mt-2 font-display text-3xl">{value}</p>
      {hint && <p className="mt-1 text-xs text-carbon-muted">{hint}</p>}
    </>
  );
  return href
    ? <Link href={href} className="block rounded-card bg-ivory-soft p-5 transition-shadow hover:shadow-soft">{body}</Link>
    : <div className="rounded-card bg-ivory-soft p-5">{body}</div>;
}

/** Simple bar chart over the trailing 30 days. */
function BarChart<T extends { date: string }>({
  title, data, value, format, tone = 'bg-champagne',
}: {
  title: string; data: T[]; value: (d: T) => number; format: (n: number) => string; tone?: string;
}) {
  const max = Math.max(1, ...data.map(value));
  return (
    <div className="rounded-card bg-ivory-soft p-5">
      <p className="text-xs uppercase tracking-wide text-carbon-muted">{title}</p>
      <div className="mt-5 flex h-32 items-end gap-1" role="img" aria-label={`${title} chart`}>
        {data.map((d) => (
          <div key={d.date} title={`${d.date}: ${format(value(d))}`}
            className={`flex-1 rounded-t ${tone} transition-all hover:bg-carbon`}
            style={{ height: `${Math.max(2, (value(d) / max) * 100)}%` }} />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-carbon-muted">
        <span>{data[0]?.date.slice(5)}</span>
        <span>{data.at(-1)?.date.slice(5)}</span>
      </div>
    </div>
  );
}

function ProductTable({ title, rows, empty, metric }: { title: string; rows: ProductRow[]; empty: string; metric: 'views' | 'inquiries' }) {
  return (
    <div className="rounded-card bg-ivory-soft p-5">
      <p className="text-xs uppercase tracking-wide text-carbon-muted">{title}</p>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-carbon-muted">{empty}</p>
      ) : (
        <ol className="mt-4 space-y-2.5">
          {rows.map((p, i) => (
            <li key={p.name + i} className="flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate">
                <span className="mr-2 text-carbon-muted">{i + 1}</span>{p.name}
                {p.sku && <span className="ml-2 text-[11px] text-carbon-muted">{p.sku}</span>}
              </span>
              <span className="shrink-0 text-carbon-muted">
                {metric === 'views' ? `${p.views} views` : `${p.inquiries} enquiries`}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminFetch<Stats>('/api/admin/stats').then(setStats).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="text-sm text-terracotta">{error}</p>;
  if (!stats) return <p className="text-sm text-carbon-muted">Loading your numbers…</p>;

  const conversion = stats.pageViews30 ? ((stats.inquiries30 / stats.pageViews30) * 100).toFixed(1) : null;

  return (
    <div>
      <h1 className="text-display-md">Overview</h1>
      <p className="mt-1 text-sm text-carbon-muted">Last 30 days</p>

      {/* Enquiry funnel — the boutique's primary sales channel */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Page views" value={stats.pageViews30.toLocaleString('en-IN')} />
        <Metric label="WhatsApp clicks" value={stats.whatsappClicks30.toLocaleString('en-IN')} />
        <Metric label="Inquiries" value={stats.inquiries30.toLocaleString('en-IN')}
          hint={conversion ? `${conversion}% of page views` : undefined} />
        <Metric label="Awaiting reply" value={String(stats.newInquiries)} hint="New inquiries" href="/admin/inquiries" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <BarChart title="Page views" data={stats.trafficDaily} value={(d) => d.views} format={(n) => `${n} views`} />
        <BarChart title="Inquiries" data={stats.trafficDaily} value={(d) => d.inquiries} format={(n) => `${n} inquiries`} tone="bg-rose" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <ProductTable title="Most viewed" rows={stats.mostViewed} metric="views" empty="Views appear here as shoppers browse." />
        <ProductTable title="Most enquired" rows={stats.mostEnquired} metric="inquiries" empty="No enquiries yet." />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {Object.entries(stats.inquiriesByType).map(([type, count]) => (
          <span key={type} className="rounded-pill bg-blush-soft px-3 py-1.5 text-xs capitalize">
            {type}: <strong>{count}</strong>
          </span>
        ))}
      </div>

      {/* Online orders */}
      <h2 className="mt-12 font-display text-2xl">Online orders</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Revenue (30d)" value={formatPrice(stats.revenue30)} />
        <Metric label="Total orders" value={String(stats.totalOrders)} href="/admin/orders" />
        <Metric label="Avg order value" value={formatPrice(stats.avgOrderValue)} />
        <Metric
          label="Cart abandonment"
          value={stats.abandonmentRate === null ? '—' : `${stats.abandonmentRate}%`}
          hint={stats.abandonmentRate === null ? 'Starts tracking once carts sync' : undefined}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <BarChart title="Revenue" data={stats.daily} value={(d) => d.revenue} format={(n) => formatPrice(n)} />
        <div className="rounded-card bg-ivory-soft p-5">
          <p className="text-xs uppercase tracking-wide text-carbon-muted">Top sellers</p>
          {stats.topProducts.length === 0 ? (
            <p className="mt-4 text-sm text-carbon-muted">No sales yet.</p>
          ) : (
            <ol className="mt-4 space-y-2.5">
              {stats.topProducts.map((p, i) => (
                <li key={p.name} className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="truncate"><span className="mr-2 text-carbon-muted">{i + 1}</span>{p.name}</span>
                  <span className="shrink-0 text-carbon-muted">{p.units} sold</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {Object.entries(stats.statusCounts).map(([status, count]) => (
          <span key={status} className="rounded-pill bg-ivory-dim px-3 py-1.5 text-xs capitalize">
            {status}: <strong>{count}</strong>
          </span>
        ))}
      </div>
    </div>
  );
}
