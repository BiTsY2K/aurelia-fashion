import 'server-only';
import { FieldValue, type Firestore } from 'firebase-admin/firestore';

// Analytics layout (all server-written, never client-readable):
//   analytics_daily/{YYYY-MM-DD}  { date, pageViews, productViews, inquiries, whatsappClicks }
//   product_stats/{productId}     { productId, name, sku, views, inquiries, whatsappClicks, updatedAt }
//
// One small doc per day keeps a month of dashboard data at ~30 reads, well inside
// the Firestore free tier (50k reads / 20k writes per day).

export const today = () => new Date().toISOString().slice(0, 10);

export async function recordPageView(db: Firestore, productId?: string, name?: string) {
  const batch = db.batch();
  batch.set(
    db.collection('analytics_daily').doc(today()),
    {
      date: today(),
      pageViews: FieldValue.increment(1),
      ...(productId ? { productViews: FieldValue.increment(1) } : {}),
    },
    { merge: true },
  );
  if (productId) {
    batch.set(
      db.collection('product_stats').doc(productId),
      { productId, ...(name ? { name } : {}), views: FieldValue.increment(1), updatedAt: Date.now() },
      { merge: true },
    );
  }
  await batch.commit();
}

export async function recordInquiry(
  db: Firestore,
  channel: 'whatsapp' | 'form',
  product?: { id?: string; name?: string; sku?: string },
) {
  const batch = db.batch();
  const whatsapp = channel === 'whatsapp' ? { whatsappClicks: FieldValue.increment(1) } : {};
  batch.set(
    db.collection('analytics_daily').doc(today()),
    { date: today(), inquiries: FieldValue.increment(1), ...whatsapp },
    { merge: true },
  );
  if (product?.id) {
    batch.set(
      db.collection('product_stats').doc(product.id),
      {
        productId: product.id,
        ...(product.name ? { name: product.name } : {}),
        ...(product.sku ? { sku: product.sku } : {}),
        inquiries: FieldValue.increment(1),
        ...whatsapp,
        updatedAt: Date.now(),
      },
      { merge: true },
    );
  }
  await batch.commit();
}

/**
 * Tiny per-instance rate limiter for public endpoints. Serverless instances are
 * short-lived so this is a speed bump, not a wall — enough to stop a stuck
 * client from hammering the free-tier write quota.
 */
const hits = new Map<string, { count: number; reset: number }>();

export function rateLimited(key: string, max = 30, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.reset < now) {
    hits.set(key, { count: 1, reset: now + windowMs });
    if (hits.size > 5000) hits.clear();
    return false;
  }
  entry.count += 1;
  return entry.count > max;
}

export const clientKey = (req: Request) =>
  (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown';
