'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/cart-store';
import { useAuth } from '@/context/auth-provider';
import { computeTotals } from '@/lib/checkout';
import { formatPrice } from '@/lib/utils';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const GATEWAY_READY = Boolean(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID);
const FIELDS = [
  { name: 'fullName', label: 'Full name', type: 'text' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'phone', label: 'Phone', type: 'tel' },
  { name: 'line1', label: 'Address', type: 'text' },
  { name: 'city', label: 'City', type: 'text' },
  { name: 'state', label: 'State', type: 'text' },
  { name: 'postalCode', label: 'Postal code', type: 'text' },
] as const;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clear } = useCart();
  const { user } = useAuth();
  const [form, setForm] = useState<Record<string, string>>({ country: 'India' });

  // Prefill the email of a signed-in shopper.
  useEffect(() => {
    if (user?.email) setForm((s) => ({ ...s, email: s.email || user.email! }));
  }, [user]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Display-only estimate; the server re-prices the cart before charging.
  const totals = computeTotals(items);

  // Load the Razorpay checkout script once.
  useEffect(() => {
    if (!GATEWAY_READY || document.getElementById('rzp-sdk')) return;
    const s = document.createElement('script');
    s.id = 'rzp-sdk';
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.async = true;
    document.body.appendChild(s);
  }, []);

  const valid = FIELDS.every((f) => form[f.name]?.trim()) && items.length > 0;

  const pay = async () => {
    setError('');
    if (!valid) { setError('Please complete every field.'); return; }
    setBusy(true);
    try {
      // Only what was chosen travels to the server — prices are looked up there.
      const lines = items.map(({ productId, name, color, size, quantity, measurements }) => ({
        productId, name, color, size, quantity, ...(measurements ? { measurements } : {}),
      }));
      const orderPayload = { uid: user?.uid ?? null, items: lines, address: form };

      const res = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: lines }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Could not start payment.');
      const rzpOrder = await res.json();

      const rzp = new window.Razorpay!({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: 'Aurelia',
        description: 'Order payment',
        order_id: rzpOrder.id,
        prefill: { name: form.fullName, contact: form.phone, email: user?.email ?? '' },
        theme: { color: '#1A1A1A' },
        handler: async (resp: Record<string, string>) => {
          const verify = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...resp, order: orderPayload }),
          });
          const out = await verify.json();
          if (out.ok) {
            clear();
            router.push(`/checkout/success?id=${out.orderId}`);
          } else {
            setError(out.error ?? 'Payment could not be verified.');
            setBusy(false);
          }
        },
        modal: { ondismiss: () => setBusy(false) },
      });
      rzp.open();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };

  if (items.length === 0) {
    return (
      <section className="container-page grid min-h-[60vh] place-items-center text-center">
        <div>
          <h1 className="text-display-md">Your cart is empty</h1>
          <Link href="/collections" className="btn-pill mt-6">Browse the collection</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="container-page py-12">
      <h1 className="text-display-md">Checkout</h1>
      <div className="mt-10 grid gap-10 md:grid-cols-[1.3fr_1fr]">
        {/* Address */}
        <div>
          <h2 className="font-display text-xl">Shipping details</h2>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {FIELDS.map((f) => (
              <label key={f.name} className={f.name === 'line1' ? 'col-span-2 block' : 'block'}>
                <span className="mb-1.5 block text-xs font-medium text-carbon-muted">{f.label}</span>
                <input
                  type={f.type}
                  value={form[f.name] ?? ''}
                  onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
                  className="h-11 w-full rounded-xl border border-line bg-ivory px-3.5 text-sm outline-none focus:border-carbon"
                />
              </label>
            ))}
          </div>
          {/* Google Places autocomplete plugs into the Address field in a later pass. */}
        </div>

        {/* Summary */}
        <aside className="h-fit rounded-card bg-ivory-soft p-6">
          <h2 className="font-display text-xl">Order summary</h2>
          <ul className="mt-4 divide-y divide-line">
            {items.map((i) => (
              <li key={`${i.productId}-${i.size}-${i.color}`} className="flex items-center gap-3 py-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={i.image} alt={i.name} className="h-14 w-11 rounded object-cover" />
                <div className="flex-1 text-sm">
                  <p className="font-medium">{i.name}</p>
                  <p className="text-xs text-carbon-muted">{i.color} · {i.size === 'Custom' ? 'Made to measure' : i.size} · ×{i.quantity}</p>
                </div>
                <span className="text-sm">{formatPrice(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-carbon-muted">Subtotal</dt><dd>{formatPrice(totals.subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-carbon-muted">Shipping</dt><dd>{totals.shipping === 0 ? 'Free' : formatPrice(totals.shipping)}</dd></div>
            {totals.tax > 0
              ? <div className="flex justify-between"><dt className="text-carbon-muted">Tax</dt><dd>{formatPrice(totals.tax)}</dd></div>
              : <p className="text-xs text-carbon-muted">Prices include GST.</p>}
            <div className="flex justify-between border-t border-line pt-2 font-display text-lg"><dt>Total</dt><dd>{formatPrice(totals.total)}</dd></div>
          </dl>

          {!GATEWAY_READY && (
            <p className="mt-4 rounded-lg border border-line bg-ivory p-3 text-xs text-carbon-muted">
              Add your Razorpay keys to <code>.env.local</code> to take live payments.
            </p>
          )}
          {error && <p className="mt-3 text-xs text-terracotta">{error}</p>}

          <button onClick={pay} disabled={busy || !valid || !GATEWAY_READY} className="btn-pill mt-5 w-full justify-center disabled:opacity-40">
            {busy ? 'Processing…' : `Pay ${formatPrice(totals.total)}`}
          </button>
          <p className="mt-3 text-center text-xs text-carbon-muted">Secured by Razorpay · 256-bit encryption</p>
        </aside>
      </div>
    </section>
  );
}
