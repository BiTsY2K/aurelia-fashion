import { NextResponse } from 'next/server';
import { adminDb, isAdminConfigured } from '@/lib/firebase-admin';
import { sendWhatsApp, deliveryFeedbackMessage, isWhatsAppConfigured } from '@/lib/whatsapp';
import { queueEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return (req.headers.get('authorization') ?? '') === `Bearer ${secret}`;
}

/** Asks how the fit was, three days after delivery. Runs once daily. */
export async function GET(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: 'Server credentials are not configured.' }, { status: 503 });
  }

  const db = adminDb()!;
  const now = Date.now();

  const snap = await db.collection('orders')
    .where('status', '==', 'delivered')
    .limit(100)
    .get();

  let sent = 0;
  for (const docSnap of snap.docs) {
    const order = docSnap.data();
    if (order.feedbackSentAt) continue;

    const deliveredAt = order.updatedAt ?? 0;
    if (!deliveredAt || now - deliveredAt < THREE_DAYS) continue;

    const message = deliveryFeedbackMessage(docSnap.id);
    let ok = false;

    if (isWhatsAppConfigured() && order.address?.phone) {
      ok = await sendWhatsApp(order.address.phone, message);
    }
    if (!ok && order.address?.email) {
      await queueEmail(db, order.address.email, 'How did it fit?', `<p>${message}</p>`);
      ok = true;
    }

    if (ok) {
      await docSnap.ref.update({ feedbackSentAt: now });
      sent += 1;
    }
  }

  return NextResponse.json({ ok: true, scanned: snap.size, sent });
}
