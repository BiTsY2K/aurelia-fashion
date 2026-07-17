import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { adminDb } from '@/lib/firebase-admin';
import { queueEmail, orderShippedEmail, orderDeliveredEmail } from '@/lib/email';
import { sendWhatsApp, dispatchMessage, isWhatsAppConfigured } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const VALID_STATUS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const;
type Status = (typeof VALID_STATUS)[number];

export async function GET(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const snap = await adminDb()!.collection('orders').orderBy('createdAt', 'desc').limit(200).get();
  return NextResponse.json({ orders: snap.docs.map((d) => ({ id: d.id, ...d.data() })) });
}

/** Move an order along its lifecycle and fire the matching customer email. */
export async function PATCH(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  try {
    const { id, status, trackingUrl } = await req.json();
    if (!id) return NextResponse.json({ error: 'Missing order id.' }, { status: 400 });
    if (!VALID_STATUS.includes(status)) {
      return NextResponse.json({ error: 'Unknown order status.' }, { status: 400 });
    }

    const db = adminDb()!;
    const ref = db.collection('orders').doc(id);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });

    await ref.update({
      status: status as Status,
      ...(trackingUrl ? { trackingUrl } : {}),
      updatedAt: Date.now(),
    });

    // Notify the customer on the two moments that matter.
    const email = snap.data()?.address?.email ?? snap.data()?.email ?? '';
    const phone = snap.data()?.address?.phone ?? '';

    if (status === 'shipped') {
      await queueEmail(db, email, 'Your Aurelia order has shipped', orderShippedEmail(id, trackingUrl));
      if (isWhatsAppConfigured() && phone) await sendWhatsApp(phone, dispatchMessage(id, trackingUrl));
    }
    if (status === 'delivered') await queueEmail(db, email, 'Your Aurelia order was delivered', orderDeliveredEmail(id));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('admin/orders PATCH', err);
    return NextResponse.json({ error: 'Could not update the order.' }, { status: 500 });
  }
}
