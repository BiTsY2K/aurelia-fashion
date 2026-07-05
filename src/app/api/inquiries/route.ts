import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { clientKey, rateLimited, recordInquiry } from '@/lib/analytics-server';
import type { InquiryChannel, InquiryType } from '@/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const TYPES: InquiryType[] = ['enquiry', 'order', 'bespoke', 'contact'];
const CHANNELS: InquiryChannel[] = ['whatsapp', 'form'];

const str = (v: unknown, max = 200) =>
  typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : undefined;

/**
 * Public: logs a WhatsApp click-through or an on-site form submission.
 * Anyone can create; only admins can read (via /api/admin/inquiries).
 */
export async function POST(req: Request) {
  if (rateLimited(`inq:${clientKey(req)}`, 20)) {
    return NextResponse.json({ error: 'Too many requests. Please try again shortly.' }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const type = body.type as InquiryType;
  const channel = body.channel as InquiryChannel;
  if (!TYPES.includes(type) || !CHANNELS.includes(channel)) {
    return NextResponse.json({ error: 'Invalid inquiry type.' }, { status: 400 });
  }

  // Form submissions must carry a way to reply; WhatsApp clicks already have one.
  const phone = str(body.phone, 30);
  const email = str(body.email, 120);
  if (channel === 'form' && !phone && !email) {
    return NextResponse.json({ error: 'Add a phone number or email so we can reply.' }, { status: 400 });
  }

  const measurements: Record<string, string> = {};
  if (body.measurements && typeof body.measurements === 'object') {
    for (const [k, v] of Object.entries(body.measurements as Record<string, unknown>).slice(0, 20)) {
      const value = str(v, 20);
      if (value) measurements[k.slice(0, 30)] = value;
    }
  }

  const inquiry = Object.fromEntries(
    Object.entries({
      type,
      channel,
      status: 'new',
      productId: str(body.productId, 100),
      productName: str(body.productName),
      sku: str(body.sku, 60),
      color: str(body.color, 60),
      size: str(body.size, 30),
      measurements: Object.keys(measurements).length ? measurements : undefined,
      name: str(body.name, 100),
      phone,
      email,
      city: str(body.city, 100),
      occasionDate: str(body.occasionDate, 40),
      message: str(body.message, 2000),
      pageUrl: str(body.pageUrl, 500),
      createdAt: Date.now(),
    }).filter(([, v]) => v !== undefined),
  );

  const db = adminDb();
  if (!db) {
    // Not configured yet — the WhatsApp chat still opens; we just can't log it.
    return NextResponse.json({ ok: true, stored: false }, { status: 202 });
  }

  try {
    const ref = await db.collection('inquiries').add(inquiry);
    await recordInquiry(db, channel, {
      id: inquiry.productId as string | undefined,
      name: inquiry.productName as string | undefined,
      sku: inquiry.sku as string | undefined,
    });
    return NextResponse.json({ ok: true, stored: true, id: ref.id });
  } catch (err) {
    console.error('inquiries POST', err);
    return NextResponse.json({ error: 'Could not save your enquiry.' }, { status: 500 });
  }
}
