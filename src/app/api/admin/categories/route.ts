import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { adminDb } from '@/lib/firebase-admin';
import { DEFAULT_CATEGORIES } from '@/lib/catalog';
import { slugify } from '@/lib/utils';
import type { Category } from '@/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** Full tree including inactive branches. Falls back to the defaults until seeded. */
export async function GET(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const snap = await adminDb()!.collection('categories').get();
  const seeded = !snap.empty;
  const categories = seeded ? snap.docs.map((d) => ({ id: d.id, ...d.data() })) : DEFAULT_CATEGORIES;
  return NextResponse.json({ categories, seeded });
}

/**
 * Create or update a category. Pass `id` to update.
 * `{ action: 'seed' }` writes the default Women / Kids / Men tree.
 */
export async function POST(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const db = adminDb()!;
  const body = await req.json().catch(() => ({}));

  if (body.action === 'seed') {
    const batch = db.batch();
    for (const { id, ...data } of DEFAULT_CATEGORIES) {
      batch.set(db.collection('categories').doc(id), data, { merge: true });
    }
    await batch.commit();
    return NextResponse.json({ ok: true });
  }

  const { id, ...data } = body as Partial<Category>;
  const name = data.name?.trim();
  if (!name) return NextResponse.json({ error: 'Category name is required.' }, { status: 400 });

  const slug = slugify(data.slug?.trim() || name);
  if (!slug) return NextResponse.json({ error: 'Choose a name with letters or numbers.' }, { status: 400 });

  const all = await db.collection('categories').get();
  if (all.docs.some((d) => d.id !== id && d.data().slug === slug)) {
    return NextResponse.json({ error: `Another category already uses “${slug}”.` }, { status: 409 });
  }

  const parentId = data.parentId || null;
  if (parentId && parentId === id) {
    return NextResponse.json({ error: 'A category can’t be its own parent.' }, { status: 400 });
  }

  const payload = {
    name,
    slug,
    parentId,
    description: data.description?.trim() ?? '',
    image: data.image?.trim() ?? '',
    ...(data.sizeSet ? { sizeSet: data.sizeSet } : {}),
    order: Number.isFinite(data.order) ? Number(data.order) : 99,
    active: data.active !== false,
    updatedAt: Date.now(),
  };

  // New categories use their slug as the id so URLs and product references stay readable.
  const docId = id || slug;
  const previousSlug = id ? all.docs.find((d) => d.id === id)?.data().slug : undefined;
  await db.collection('categories').doc(docId).set(payload, { merge: true });

  // Products reference categories by slug, so carry a rename through to them.
  if (previousSlug && previousSlug !== slug) {
    const [asDept, asSub] = await Promise.all([
      db.collection('products').where('category', '==', previousSlug).get(),
      db.collection('products').where('subcategory', '==', previousSlug).get(),
    ]);
    const docs = [...asDept.docs.map((d) => [d, 'category'] as const), ...asSub.docs.map((d) => [d, 'subcategory'] as const)];
    for (let i = 0; i < docs.length; i += 400) {
      const batch = db.batch();
      docs.slice(i, i + 400).forEach(([d, field]) => batch.update(d.ref, { [field]: slug }));
      await batch.commit();
    }
  }
  return NextResponse.json({ ok: true, id: docId });
}

export async function DELETE(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing category id.' }, { status: 400 });

  const db = adminDb()!;
  const [children, cat] = await Promise.all([
    db.collection('categories').where('parentId', '==', id).limit(1).get(),
    db.collection('categories').doc(id).get(),
  ]);
  if (!children.empty) {
    return NextResponse.json({ error: 'Move or delete its sub-categories first.' }, { status: 409 });
  }

  const slug = cat.data()?.slug ?? id;
  const [inCategory, inSub] = await Promise.all([
    db.collection('products').where('category', '==', slug).limit(1).get(),
    db.collection('products').where('subcategory', '==', slug).limit(1).get(),
  ]);
  if (!inCategory.empty || !inSub.empty) {
    return NextResponse.json(
      { error: 'Products still use this category. Reassign them, or switch the category off instead.' },
      { status: 409 },
    );
  }

  await db.collection('categories').doc(id).delete();
  return NextResponse.json({ ok: true });
}
