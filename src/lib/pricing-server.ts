import 'server-only';
import { adminDb } from '@/lib/firebase-admin';
import { computeTotals } from '@/lib/checkout';
import { CUSTOM_SIZE } from '@/lib/catalog';
import { DEMO_PRODUCTS } from '@/lib/products';
import type { CartItem, Product } from '@/types';

export interface PricedCart {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
}

/**
 * Re-prices a cart from the catalog. The client only tells us *what* it wants —
 * never what it costs — so a tampered cart can't pay ₹1 for a lehenga.
 */
export async function priceCart(raw: unknown): Promise<PricedCart> {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > 50) throw new Error('Your cart is empty.');

  const db = adminDb();
  const ids = [...new Set(raw.map((i) => String((i as CartItem).productId)))];
  const products = new Map<string, Product>();

  if (db) {
    const snaps = await db.getAll(...ids.map((id) => db.collection('products').doc(id)));
    snaps.forEach((s) => s.exists && products.set(s.id, { id: s.id, ...s.data() } as Product));
  } else {
    DEMO_PRODUCTS.forEach((p) => products.set(p.id, p));
  }

  const items: CartItem[] = raw.map((r) => {
    const line = r as CartItem;
    const product = products.get(String(line.productId));
    if (!product || (product.status ?? 'active') !== 'active') {
      throw new Error(`${line.name ?? 'An item'} is no longer available.`);
    }
    const quantity = Math.floor(Number(line.quantity));
    if (!Number.isFinite(quantity) || quantity < 1 || quantity > 20) throw new Error('Invalid quantity.');
    if (!product.variants.some((v) => v.name === line.color)) throw new Error(`Choose a colour for ${product.name}.`);

    return {
      productId: product.id,
      slug: product.slug,
      name: product.name,
      sku: product.sku,
      image: product.variants.find((v) => v.name === line.color)?.images[0] ?? '',
      color: line.color,
      size: String(line.size),
      price: product.price,
      quantity,
      ...(line.measurements ? { measurements: line.measurements } : {}),
    };
  });

  const currency = products.get(items[0].productId)?.currency ?? 'INR';
  return { items, currency, ...computeTotals(items) };
}

/** Made-to-measure lines are stitched on order, so they never draw down stock. */
export const consumesStock = (product: Pick<Product, 'madeToOrder'>, item: Pick<CartItem, 'size'>) =>
  !product.madeToOrder && item.size !== CUSTOM_SIZE;
