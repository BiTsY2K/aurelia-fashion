import type { CartItem } from '@/types';

// Prices are listed inclusive of GST, as is standard for Indian retail.
export const FREE_SHIPPING_AT = 5000;
const SHIPPING_FLAT = 150;
const TAX_RATE = 0; // set e.g. 0.05 if you list prices exclusive of GST

export function computeTotals(items: Pick<CartItem, 'price' | 'quantity'>[]) {
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_AT ? 0 : SHIPPING_FLAT;
  const tax = +(subtotal * TAX_RATE).toFixed(2);
  const total = +(subtotal + shipping + tax).toFixed(2);
  return { subtotal, shipping, tax, total };
}

/** Razorpay expects the smallest currency unit (paise / cents). */
export const toMinorUnit = (amount: number) => Math.round(amount * 100);
