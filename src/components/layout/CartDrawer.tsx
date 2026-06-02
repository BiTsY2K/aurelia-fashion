'use client';

import Link from 'next/link';
import { useCart, cartSubtotal } from '@/context/cart-store';
import { formatPrice } from '@/lib/utils';

const FREE_SHIPPING_AT = 100;

export default function CartDrawer() {
  const { items, isOpen, close, remove, setQty } = useCart();
  const subtotal = cartSubtotal(items);
  const remaining = Math.max(0, FREE_SHIPPING_AT - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_AT) * 100);

  return (
    <>
      {/* Scrim */}
      <div
        onClick={close}
        aria-hidden
        className={`fixed inset-0 z-50 bg-carbon/30 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <aside
        role="dialog"
        aria-label="Shopping cart"
        aria-modal="true"
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-ivory shadow-lift transition-transform duration-300 ease-brand ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <p className="font-display text-xl">Your Cart</p>
          <button onClick={close} className="rounded-pill p-2 hover:bg-ivory-dim" aria-label="Close cart">
            <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" fill="none">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-carbon-muted">Your cart is empty.</p>
            <button onClick={close} className="btn-pill-ghost">Continue shopping</button>
          </div>
        ) : (
          <>
            <div className="border-b border-line px-5 py-3">
              <p className="mb-2 text-xs text-carbon-muted">
                {remaining > 0
                  ? `You're ${formatPrice(remaining)} away from free shipping`
                  : 'You’ve unlocked free shipping ✦'}
              </p>
              <div className="h-1.5 overflow-hidden rounded-pill bg-ivory-dim">
                <div className="h-full rounded-pill bg-champagne transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
              {items.map((i) => (
                <li key={`${i.productId}-${i.size}-${i.color}`} className="flex gap-3 py-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={i.image} alt={i.name} className="h-20 w-16 rounded-lg object-cover" />
                  <div className="flex flex-1 flex-col">
                    <p className="text-sm font-medium">{i.name}</p>
                    <p className="text-xs text-carbon-muted">{i.color} · {i.size}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <button onClick={() => setQty(i.productId, i.size, i.color, i.quantity - 1)} className="h-6 w-6 rounded-full border border-line">−</button>
                        <span>{i.quantity}</span>
                        <button onClick={() => setQty(i.productId, i.size, i.color, i.quantity + 1)} className="h-6 w-6 rounded-full border border-line">+</button>
                      </div>
                      <button onClick={() => remove(i.productId, i.size, i.color)} className="text-xs text-carbon-muted underline">Remove</button>
                    </div>
                  </div>
                  <p className="text-sm font-medium">{formatPrice(i.price * i.quantity)}</p>
                </li>
              ))}
            </ul>

            <div className="border-t border-line px-5 py-4">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="text-carbon-muted">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <Link href="/checkout" onClick={close} className="btn-pill w-full justify-center">Checkout</Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
