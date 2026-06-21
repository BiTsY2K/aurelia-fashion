import { collection, getDocs, query, where, limit as fbLimit } from 'firebase/firestore';
import { getDb, isFirebaseConfigured } from '@/lib/firebase';
import type { Product } from '@/types';

// Stable Unsplash sources keep Phase 1 visual + swap out once you seed Firestore.
const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=70`;

export const DEMO_PRODUCTS: Product[] = [
  {
    id: 'p1', name: 'Structured Wool Blazer', slug: 'structured-wool-blazer',
    price: 40, currency: 'USD', description: 'A tailored grey blazer with a relaxed drape.',
    category: 'women', collection: 'exclusive', tags: ['blazer', 'tailored'],
    fabricCare: 'Dry clean only. Steam to refresh.',
    variants: [{ name: 'Charcoal', hex: '#3A3A3A', images: [img('1591047139829-d91aecb6caea')] }],
    sizesStock: { Charcoal: { S: 4, M: 6, L: 2 } }, rating: 4.8, featured: true,
  },
  {
    id: 'p2', name: 'Soft Knit & Denim Set', slug: 'soft-knit-denim-set',
    price: 67, currency: 'USD', description: 'Easy knit paired with high-rise denim.',
    category: 'women', collection: 'women', tags: ['knit', 'denim'],
    fabricCare: 'Machine wash cold. Lay flat to dry.',
    variants: [{ name: 'Blush', hex: '#E8C9C1', images: [img('1515886657613-9f3515b0c78f')] }],
    sizesStock: { Blush: { XS: 3, S: 5, M: 4 } }, rating: 4.7,
  },
  {
    id: 'p3', name: 'Camel Trench Coat', slug: 'camel-trench-coat',
    price: 59, currency: 'USD', description: 'A timeless camel trench with a clean line.',
    category: 'women', collection: 'exclusive', tags: ['coat', 'trench'],
    fabricCare: 'Dry clean recommended.',
    variants: [{ name: 'Camel', hex: '#C8A96A', images: [img('1539109136881-3be0616acf4b')] }],
    sizesStock: { Camel: { S: 2, M: 3, L: 3 } }, rating: 4.9, featured: true,
  },
  {
    id: 'p4', name: 'Pastel Tailored Suit', slug: 'pastel-tailored-suit',
    price: 49, currency: 'USD', description: 'A soft pastel suit for relaxed formality.',
    category: 'women', collection: 'bayes', tags: ['suit'],
    fabricCare: 'Dry clean only.',
    variants: [{ name: 'Sage', hex: '#C7D0BE', images: [img('1485968579580-b6d095142e6e')] }],
    sizesStock: { Sage: { S: 4, M: 4 } }, rating: 4.6,
  },
  {
    id: 'p5', name: 'Ivory Linen Co-ord', slug: 'ivory-linen-coord',
    price: 69, currency: 'USD', description: 'Breathable ivory linen, cut for movement.',
    category: 'women', collection: 'exclusive', tags: ['linen', 'co-ord'],
    fabricCare: 'Hand wash cold. Iron while damp.',
    variants: [{ name: 'Ivory', hex: '#FAF7F2', images: [img('1490481651871-ab68de25d43d')] }],
    sizesStock: { Ivory: { XS: 2, S: 3, M: 5, L: 1 } }, rating: 4.8, featured: true,
  },
  {
    id: 'p6', name: 'Evening Black Set', slug: 'evening-black-set',
    price: 80, currency: 'USD', description: 'A sharp all-black look for evenings.',
    category: 'women', collection: 'black', tags: ['evening', 'black'],
    fabricCare: 'Dry clean only.',
    variants: [{ name: 'Black', hex: '#1A1A1A', images: [img('1483985988355-763728e1935b')] }],
    sizesStock: { Black: { S: 3, M: 4, L: 2 } }, rating: 5.0, featured: true,
  },
];

/** Fetch products — real Firestore when configured, demo data otherwise. */
export async function getProducts(opts?: { collection?: string; max?: number }): Promise<Product[]> {
  if (!isFirebaseConfigured) {
    let list = DEMO_PRODUCTS;
    if (opts?.collection && opts.collection !== 'exclusive') {
      list = list.filter((p) => p.collection === opts.collection);
    }
    return opts?.max ? list.slice(0, opts.max) : list;
  }
  const constraints = [];
  if (opts?.collection && opts.collection !== 'exclusive') {
    constraints.push(where('collection', '==', opts.collection));
  }
  if (opts?.max) constraints.push(fbLimit(opts.max));
  const snap = await getDocs(query(collection(getDb(), 'products'), ...constraints));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Product);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!isFirebaseConfigured) return DEMO_PRODUCTS.find((p) => p.slug === slug) ?? null;
  const snap = await getDocs(query(collection(getDb(), 'products'), where('slug', '==', slug), fbLimit(1)));
  return snap.empty ? null : ({ id: snap.docs[0].id, ...snap.docs[0].data() } as Product);
}
