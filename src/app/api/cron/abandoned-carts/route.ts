import { NextResponse } from 'next/server';
import { adminDb, isAdminConfigured } from '@/lib/firebase-admin';
import { sendWhatsApp, abandonedCartMessage, isWhatsAppConfigured } from '@/lib/whatsapp';
import { queueEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const TWO_HOURS = 2 * 60 * 60 * 1000;
const COOLDOWN = 24 * 60 * 60 * 1000; // never nag the same cart twice a day

/** Rejects anything without the shared cron secret. */
function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get('authorization') ?? '';
  return header === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: 'Server credentials are not configured.' }, { status: 503 });
  }

  const db = adminDb()!;
  const now = Date.now();
  const cutoff = now - TWO_HOURS;

  // Carts untouched for over two hours.
  const snap = await db.collection('carts').where('updatedAt', '<', cutoff).limit(50).get();

  let notified = 0;
  let skipped = 0;

  for (const docSnap of snap.docs) {
    const cart = docSnap.data();

    // Skip if we already reminded them recently.
    if (cart.reminderSentAt && now - cart.reminderSentAt < COOLDOWN) { skipped += 1; continue; }
    if (!cart.items?.length) { skipped += 1; continue; }

    // Skip if an order was placed since the cart was last touched.
    const recentOrder = await db.collection('orders')
      .where('uid', '==', cart.uid)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get()
      .catch(() => null);

    if (recentOrder && !recentOrder.empty) {
      const orderTime = recentOrder.docs[0].data().createdAt;
      const ms = typeof orderTime === 'number' ? orderTime : orderTime?.toMillis?.() ?? 0;
      if (ms >= cart.updatedAt) { skipped += 1; continue; }
    }

    const code = 'COMEBACK5';
    const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/checkout`;
    const message = abandonedCartMessage(cart.name ?? '', cart.items[0].name, code, url);

    let sent = false;
    if (isWhatsAppConfigured() && cart.phone) {
      sent = await sendWhatsApp(cart.phone, message);
    }
    // Email is the fallback when there's no WhatsApp number on file.
    if (!sent && cart.email) {
      await queueEmail(db, cart.email, 'You left something behind', `<p>${message}</p>`);
      sent = true;
    }

    if (sent) {
      await docSnap.ref.update({ reminderSentAt: now, discountCode: code });
      notified += 1;
    } else {
      skipped += 1;
    }
  }

  return NextResponse.json({ ok: true, scanned: snap.size, notified, skipped });
}
