import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { adminDb } from '@/lib/firebase-admin';
import { slugify } from '@/lib/utils';
import { DEMO_PRODUCTS } from '@/lib/products';
import type { ProductStatus } from '@/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const STATUSES: ProductStatus[] = ['active', 'draft', 'archived'];

const generateSku = (subcategory: string) =>
  `AUR-${subcategory.replace(/[^a-z]/gi, '').slice(0, 3).toUpperCase() || 'GEN'}-${Date.now().toString(36).slice(-5).toUpperCase()}`;

/** List every product (admin view includes zero-stock items). */
export async function GET(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const snap = await adminDb()!.collection('products').get();
  return NextResponse.json({ products: snap.docs.map((d) => ({ id: d.id, ...d.data() })) });
}

/** Create or update a product. Pass `id` to update, omit to create. */
export async function POST(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  try {
    const body = await req.json();

    // One-click starter catalog so a fresh store isn't empty.
    if (body.action === 'seed-demo') {
      const db = adminDb()!;
      const batch = db.batch();
      for (const { id: demoId, ...demo } of DEMO_PRODUCTS) {
        batch.set(db.collection('products').doc(demoId), { ...demo, status: 'active', createdAt: Date.now(), updatedAt: Date.now() });
      }
      await batch.commit();
      return NextResponse.json({ ok: true, count: DEMO_PRODUCTS.length });
    }

    const { id, ...data } = body;

    if (!data.name?.trim()) return NextResponse.json({ error: 'Product name is required.' }, { status: 400 });
    if (typeof data.price !== 'number' || data.price < 0) {
      return NextResponse.json({ error: 'Enter a valid price.' }, { status: 400 });
    }

    if (!data.category || !data.subcategory) {
      return NextResponse.json({ error: 'Choose a department and sub-category.' }, { status: 400 });
    }

    // Derive a URL-safe slug and guarantee it's unique.
    const slug = slugify(data.slug?.trim() || data.name);
    // SKUs are what customers quote on WhatsApp, so generate one if the admin left it blank.
    const sku = (data.sku?.trim() || generateSku(data.subcategory)).toUpperCase();

    const db = adminDb()!;
    const [slugClash, skuClash] = await Promise.all([
      db.collection('products').where('slug', '==', slug).get(),
      db.collection('products').where('sku', '==', sku).get(),
    ]);
    if (slugClash.docs.some((d) => d.id !== id)) {
      return NextResponse.json({ error: 'Another product already uses that name.' }, { status: 409 });
    }
    if (skuClash.docs.some((d) => d.id !== id)) {
      return NextResponse.json({ error: `SKU ${sku} is already taken.` }, { status: 409 });
    }

    const payload = { ...data, slug, sku, status: data.status ?? 'active', updatedAt: Date.now() };
    if (id) {
      // Full replace, not merge: a merge would keep colours/sizes the admin just removed.
      // The editor always sends the whole document, createdAt included.
      await db.collection('products').doc(id).set({ ...payload, createdAt: data.createdAt ?? Date.now() });
      return NextResponse.json({ ok: true, id });
    }
    const ref = await db.collection('products').add({ ...payload, createdAt: Date.now() });
    return NextResponse.json({ ok: true, id: ref.id });
  } catch (err) {
    console.error('admin/products POST', err);
    return NextResponse.json({ error: 'Could not save the product.' }, { status: 500 });
  }
}

/** Quick status change — archive or restore without re-saving the whole product. */
export async function PATCH(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const { id, status } = await req.json().catch(() => ({}));
  if (!id || !STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Choose a valid status.' }, { status: 400 });
  }
  await adminDb()!.collection('products').doc(id).update({ status, updatedAt: Date.now() });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing product id.' }, { status: 400 });

  await adminDb()!.collection('products').doc(id).delete();
  return NextResponse.json({ ok: true });
}
