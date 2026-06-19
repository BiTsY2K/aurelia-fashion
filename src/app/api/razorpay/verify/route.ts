import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { queueEmail, orderConfirmationEmail } from '@/lib/email';
import { consumesStock, priceCart } from '@/lib/pricing-server';
import { toMinorUnit } from '@/lib/checkout';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const ADDRESS_FIELDS = ['fullName', 'email', 'phone', 'line1', 'line2', 'city', 'state', 'postalCode', 'country'];

/**
 * Verifies the Razorpay signature, confirms the amount actually paid matches a
 * server-side re-pricing of the cart, then atomically writes the order and
 * deducts stock. The Razorpay order id doubles as the document id, so a
 * replayed callback can't create a second order.
 */
export async function POST(req: Request) {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !secret) return NextResponse.json({ error: 'Payment gateway not configured.' }, { status: 503 });

  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order } = body;

    // 1. Verify signature (constant-time compare)
    const expected = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    const given = String(razorpay_signature ?? '');
    if (given.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(given), Buffer.from(expected))) {
      return NextResponse.json({ error: 'Signature verification failed.' }, { status: 400 });
    }

    // 2. Re-price the cart and compare with what Razorpay says was charged.
    const priced = await priceCart(order?.items);
    const { default: Razorpay } = await import('razorpay');
    const rzpOrder = await new Razorpay({ key_id: keyId, key_secret: secret }).orders.fetch(razorpay_order_id);
    if (Number(rzpOrder.amount) !== toMinorUnit(priced.total)) {
      console.error('razorpay/verify amount mismatch', rzpOrder.amount, priced.total);
      return NextResponse.json({ error: 'Payment amount did not match the order. Please contact us.' }, { status: 400 });
    }

    const address = Object.fromEntries(
      ADDRESS_FIELDS.map((k) => [k, String(order?.address?.[k] ?? '').slice(0, 200)]),
    );

    const db = adminDb();
    if (!db) {
      // Payment is valid but persistence isn't configured yet — still confirm to the customer.
      return NextResponse.json({ ok: true, persisted: false, orderId: razorpay_payment_id });
    }

    // 3. Atomically deduct inventory + create the order document
    const orderRef = db.collection('orders').doc(razorpay_order_id);
    const created = await db.runTransaction(async (tx) => {
      if ((await tx.get(orderRef)).exists) return false; // already recorded

      const productRefs = priced.items.map((i) => db.collection('products').doc(i.productId));
      const snaps = await Promise.all(productRefs.map((r) => tx.get(r)));

      // Accumulate per product so two lines of the same piece deduct correctly.
      const updates = new Map<number, Record<string, number>>();
      snaps.forEach((snap, idx) => {
        const item = priced.items[idx];
        const data = snap.data();
        if (!data) throw new Error(`Product ${item.name} is no longer available`);
        if (!consumesStock(data, item)) return;

        const key = `sizesStock.${item.color}.${item.size}`;
        const productIdx = productRefs.findIndex((r) => r.id === item.productId);
        const pending = updates.get(productIdx) ?? {};
        const current = pending[key] ?? data.sizesStock?.[item.color]?.[item.size] ?? 0;
        if (current < item.quantity) throw new Error(`Insufficient stock for ${item.name}`);
        pending[key] = current - item.quantity;
        updates.set(productIdx, pending);
      });
      updates.forEach((fields, idx) => tx.update(productRefs[idx], fields));

      tx.set(orderRef, {
        uid: typeof order?.uid === 'string' ? order.uid : null,
        items: priced.items,
        subtotal: priced.subtotal,
        shipping: priced.shipping,
        tax: priced.tax,
        total: priced.total,
        currency: priced.currency,
        address,
        email: address.email,
        status: 'processing',
        paymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        createdAt: FieldValue.serverTimestamp(),
      });
      return true;
    });

    // Confirmation email (no-op if the Trigger Email extension isn't installed).
    if (created) {
      await queueEmail(
        db,
        address.email,
        'Your Aurelia order is confirmed',
        orderConfirmationEmail(orderRef.id, `${priced.total}`),
      );
    }

    return NextResponse.json({ ok: true, persisted: true, orderId: orderRef.id });
  } catch (err) {
    console.error('razorpay/verify', err);
    return NextResponse.json({ error: (err as Error).message || 'Verification error.' }, { status: 500 });
  }
}
