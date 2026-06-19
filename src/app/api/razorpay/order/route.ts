import { NextResponse } from 'next/server';
import { priceCart } from '@/lib/pricing-server';
import { toMinorUnit } from '@/lib/checkout';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Creates a Razorpay order for a cart. The amount is computed here from catalog
 * prices — the client sends only the items it wants.
 */
export async function POST(req: Request) {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return NextResponse.json({ error: 'Payment gateway not configured.' }, { status: 503 });
  }

  let priced;
  try {
    const { items } = await req.json();
    priced = await priceCart(items);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || 'Invalid cart.' }, { status: 400 });
  }

  try {
    const { default: Razorpay } = await import('razorpay');
    const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const order = await rzp.orders.create({
      amount: toMinorUnit(priced.total),
      currency: priced.currency,
      receipt: `rcpt_${Date.now()}`,
    });

    return NextResponse.json({ id: order.id, amount: order.amount, currency: order.currency, totals: priced });
  } catch (err) {
    console.error('razorpay/order', err);
    return NextResponse.json({ error: 'Could not create order.' }, { status: 500 });
  }
}
