import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const snap = await adminDb()!.collection('reviews').orderBy('createdAt', 'desc').limit(200).get();
  return NextResponse.json({ reviews: snap.docs.map((d) => ({ id: d.id, ...d.data() })) });
}

/** Approve or reject a submitted review. */
export async function PATCH(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const { id, approved } = await req.json();
  if (!id) return NextResponse.json({ error: 'Missing review id.' }, { status: 400 });

  await adminDb()!.collection('reviews').doc(id).update({ approved: Boolean(approved), moderatedAt: Date.now() });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing review id.' }, { status: 400 });

  await adminDb()!.collection('reviews').doc(id).delete();
  return NextResponse.json({ ok: true });
}
