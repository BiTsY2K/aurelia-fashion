import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { clientKey, rateLimited, recordPageView } from '@/lib/analytics-server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** Public: counts a page view (and a product view on product pages). */
export async function POST(req: Request) {
  if (rateLimited(`trk:${clientKey(req)}`, 60)) return new NextResponse(null, { status: 204 });

  const db = adminDb();
  if (!db) return new NextResponse(null, { status: 204 });

  try {
    const body = await req.json().catch(() => ({}));
    const productId = typeof body.productId === 'string' ? body.productId.slice(0, 100) : undefined;
    const name = typeof body.name === 'string' ? body.name.slice(0, 200) : undefined;
    await recordPageView(db, productId, name);
  } catch (err) {
    console.error('track POST', err);
  }
  return new NextResponse(null, { status: 204 });
}
