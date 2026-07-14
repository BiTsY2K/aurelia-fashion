import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const DAY = 86_400_000;

interface OrderDoc {
  total?: number;
  status?: string;
  createdAt?: number | { toMillis?: () => number };
  items?: { productId: string; name: string; quantity: number }[];
}

const toMillis = (v: OrderDoc['createdAt']): number => {
  if (typeof v === 'number') return v;
  if (v && typeof v.toMillis === 'function') return v.toMillis();
  return 0;
};

export async function GET(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const db = adminDb()!;
  const since = Date.now() - 30 * DAY;

  const sinceKey = new Date(since).toISOString().slice(0, 10);
  const [ordersSnap, cartsSnap, dailySnap, productStatsSnap, inquiriesSnap] = await Promise.all([
    db.collection('orders').get(),
    db.collection('carts').get().catch(() => null), // optional collection
    db.collection('analytics_daily').where('date', '>=', sinceKey).get().catch(() => null),
    db.collection('product_stats').get().catch(() => null),
    db.collection('inquiries').where('createdAt', '>=', since).get().catch(() => null),
  ]);

  const orders = ordersSnap.docs.map((d) => d.data() as OrderDoc);
  const paid = orders.filter((o) => o.status && o.status !== 'cancelled');

  // Revenue + order count for the trailing 30 days, bucketed by day.
  const byDay = new Map<string, { revenue: number; orders: number }>();
  for (let i = 29; i >= 0; i--) {
    const key = new Date(Date.now() - i * DAY).toISOString().slice(0, 10);
    byDay.set(key, { revenue: 0, orders: 0 });
  }

  let revenue30 = 0;
  for (const o of paid) {
    const ms = toMillis(o.createdAt);
    if (ms < since) continue;
    const key = new Date(ms).toISOString().slice(0, 10);
    const bucket = byDay.get(key);
    if (!bucket) continue;
    bucket.revenue += o.total ?? 0;
    bucket.orders += 1;
    revenue30 += o.total ?? 0;
  }

  // Top converting products by units sold.
  const unitsByProduct = new Map<string, { name: string; units: number }>();
  for (const o of paid) {
    for (const item of o.items ?? []) {
      const entry = unitsByProduct.get(item.productId) ?? { name: item.name, units: 0 };
      entry.units += item.quantity;
      unitsByProduct.set(item.productId, entry);
    }
  }
  const topProducts = [...unitsByProduct.values()].sort((a, b) => b.units - a.units).slice(0, 5);

  // Abandonment = saved carts that never became an order.
  const totalCarts = cartsSnap?.size ?? 0;
  const abandonmentRate = totalCarts > 0
    ? Math.round(((totalCarts - paid.length) / totalCarts) * 100)
    : null;

  const statusCounts = orders.reduce<Record<string, number>>((acc, o) => {
    const s = o.status ?? 'pending';
    acc[s] = (acc[s] ?? 0) + 1;
    return acc;
  }, {});

  // ── Traffic + enquiries ──
  const traffic = new Map<string, { views: number; inquiries: number; whatsapp: number }>();
  for (const key of byDay.keys()) traffic.set(key, { views: 0, inquiries: 0, whatsapp: 0 });
  for (const doc of dailySnap?.docs ?? []) {
    const d = doc.data();
    const bucket = traffic.get(d.date);
    if (!bucket) continue;
    bucket.views = d.pageViews ?? 0;
    bucket.inquiries = d.inquiries ?? 0;
    bucket.whatsapp = d.whatsappClicks ?? 0;
  }
  const trafficDaily = [...traffic.entries()].map(([date, v]) => ({ date, ...v }));
  const sum = (k: 'views' | 'inquiries' | 'whatsapp') => trafficDaily.reduce((s, d) => s + d[k], 0);

  interface StatDoc { productId: string; name?: string; sku?: string; views?: number; inquiries?: number }
  const productStats = (productStatsSnap?.docs ?? []).map((d) => d.data() as StatDoc);
  const mostViewed = [...productStats]
    .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
    .slice(0, 5)
    .map((p) => ({ name: p.name ?? p.productId, sku: p.sku, views: p.views ?? 0, inquiries: p.inquiries ?? 0 }));
  const mostEnquired = [...productStats]
    .filter((p) => (p.inquiries ?? 0) > 0)
    .sort((a, b) => (b.inquiries ?? 0) - (a.inquiries ?? 0))
    .slice(0, 5)
    .map((p) => ({ name: p.name ?? p.productId, sku: p.sku, views: p.views ?? 0, inquiries: p.inquiries ?? 0 }));

  const inquiryDocs = (inquiriesSnap?.docs ?? []).map((d) => d.data());
  const countBy = (key: string) =>
    inquiryDocs.reduce<Record<string, number>>((acc, d) => {
      const k = String(d[key] ?? 'unknown');
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {});

  return NextResponse.json({
    pageViews30: sum('views'),
    inquiries30: sum('inquiries'),
    whatsappClicks30: sum('whatsapp'),
    newInquiries: inquiryDocs.filter((d) => d.status === 'new').length,
    inquiriesByType: countBy('type'),
    inquiriesByStatus: countBy('status'),
    trafficDaily,
    mostViewed,
    mostEnquired,
    totalOrders: orders.length,
    revenue30: +revenue30.toFixed(2),
    avgOrderValue: paid.length ? +(paid.reduce((s, o) => s + (o.total ?? 0), 0) / paid.length).toFixed(2) : 0,
    abandonmentRate,
    statusCounts,
    topProducts,
    daily: [...byDay.entries()].map(([date, v]) => ({ date, ...v })),
  });
}
