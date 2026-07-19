import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { adminDb } from '@/lib/firebase-admin';
import type { InquiryStatus } from '@/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const STATUSES: InquiryStatus[] = ['new', 'contacted', 'converted', 'closed'];

/** Latest 300 inquiries, newest first. */
export async function GET(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const snap = await adminDb()!.collection('inquiries').orderBy('createdAt', 'desc').limit(300).get();
  return NextResponse.json({ inquiries: snap.docs.map((d) => ({ id: d.id, ...d.data() })) });
}

/** Move an inquiry through new → contacted → converted / closed. */
export async function PATCH(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const { id, status } = await req.json().catch(() => ({}));
  if (!id || !STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Choose a valid status.' }, { status: 400 });
  }
  await adminDb()!.collection('inquiries').doc(id).update({ status, updatedAt: Date.now() });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing inquiry id.' }, { status: 400 });
  await adminDb()!.collection('inquiries').doc(id).delete();
  return NextResponse.json({ ok: true });
}
