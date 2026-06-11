import { collection, getDocs } from 'firebase/firestore';
import { getDb, isFirebaseConfigured } from '@/lib/firebase';
import { DEFAULT_CATEGORIES, isActive } from '@/lib/catalog';
import { img } from '@/lib/media';
import type { Category, Product } from '@/types';


export const DEMO_PRODUCTS: Product[] = [
  // ── Women · Sarees ──
  {
    id: 'p1', sku: 'AUR-SAR-001', name: 'Rani Kanjivaram Bridal Saree', slug: 'rani-kanjivaram-bridal-saree',
    price: 38500, compareAtPrice: 42000, currency: 'INR',
    description: 'A temple-border Kanjivaram in rani pink and vermilion, woven with real zari and paired with a hand-embroidered bridal blouse.',
    designStory: 'Woven over 21 days by a master weaver in Kanchipuram. The korvai border is joined to the body by hand — the seam you can’t see is the one that took the longest.',
    fabric: 'Pure mulberry silk with silver-gold zari · Blouse: raw silk with zardozi',
    category: 'women', subcategory: 'sarees', collection: 'bridal',
    tags: ['saree', 'silk', 'kanjivaram', 'bridal', 'red', 'jewel'], occasions: ['wedding', 'festive'],
    fabricCare: 'Dry clean only. Store folded in muslin; refold every 3 months.',
    variants: [{ name: 'Rani Pink', hex: '#C2185B', images: [img('1617627143750-d86bc21e42bb'), img('1618901185975-d59f7091bcfe')] }],
    sizesStock: { 'Rani Pink': { S: 2, M: 3, L: 2, XL: 1 } },
    customizable: true, leadTimeDays: 10, rating: 4.9, featured: true,
  },
  {
    id: 'p2', sku: 'AUR-SAR-002', name: 'Amethyst Banarasi Silk Saree', slug: 'amethyst-banarasi-silk-saree',
    price: 24900, currency: 'INR',
    description: 'A Banarasi katan silk with a gold kadhua border, finished with a contrast blouse piece.',
    designStory: 'Our take on the 1950s Banarasi revival — a lighter drape, but the same kadhua technique where every motif is woven separately.',
    fabric: 'Katan silk with antique-gold zari',
    category: 'women', subcategory: 'sarees', collection: 'festive',
    tags: ['saree', 'silk', 'banarasi', 'purple', 'jewel'], occasions: ['festive', 'wedding'],
    fabricCare: 'Dry clean only.',
    variants: [
      { name: 'Amethyst', hex: '#5B2A86', images: [img('1610030469983-98e550d6193c')] },
      { name: 'Violet', hex: '#7B3FA0', images: [img('1641699862936-be9f49b1c38d')] },
    ],
    sizesStock: { Amethyst: { S: 3, M: 4, L: 3 }, Violet: { M: 2, L: 2, XL: 1 } },
    customizable: true, leadTimeDays: 7, rating: 4.8, featured: true,
  },
  {
    id: 'p3', sku: 'AUR-SAR-003', name: 'Sage Tissue Organza Saree', slug: 'sage-tissue-organza-saree',
    price: 16500, currency: 'INR',
    description: 'Feather-light tissue organza in sage with a scalloped zari edge — made for day functions.',
    designStory: 'Designed for the mehendi that runs from noon to sunset: sheer enough to breathe, structured enough to photograph.',
    fabric: 'Tissue organza with gota-patti scallops',
    category: 'women', subcategory: 'sarees', collection: 'festive',
    tags: ['saree', 'organza', 'pastel', 'sage', 'light'], occasions: ['festive', 'day'],
    fabricCare: 'Dry clean only. Steam, never iron directly.',
    variants: [{ name: 'Sage', hex: '#A8B89A', images: [img('1609748340041-f5d61e061ebc')] }],
    sizesStock: { Sage: { XS: 2, S: 3, M: 3, L: 2 } },
    customizable: true, leadTimeDays: 7, rating: 4.7,
  },
  {
    id: 'p4', sku: 'AUR-SAR-004', name: 'Noir Zari Georgette Saree', slug: 'noir-zari-georgette-saree',
    price: 14200, currency: 'INR',
    description: 'A black georgette with a fine silver zari stripe, cut for cocktail evenings.',
    fabric: 'Pure georgette with silver zari',
    category: 'women', subcategory: 'sarees', collection: 'new',
    tags: ['saree', 'georgette', 'black', 'evening'], occasions: ['cocktail', 'reception'],
    fabricCare: 'Dry clean only.',
    variants: [{ name: 'Noir', hex: '#1A1A1A', images: [img('1610030469668-8e9f641aaf27')] }],
    sizesStock: { Noir: { S: 2, M: 2, L: 3 } },
    customizable: true, leadTimeDays: 5, rating: 4.8,
  },

  // ── Women · Lehengas ──
  {
    id: 'p5', sku: 'AUR-LEH-001', name: 'Sindoor Bridal Lehenga', slug: 'sindoor-bridal-lehenga',
    price: 125000, currency: 'INR',
    description: 'A twelve-kali bridal lehenga in sindoor red with zardozi, dabka and pearl work, with a double dupatta.',
    designStory: 'Every Sindoor lehenga is made for one bride. We start with a sketch call, sample the embroidery on your chosen shade, and fit it twice before it leaves the atelier.',
    fabric: 'Raw silk lehenga · Net and velvet dupattas · Cotton-silk lining',
    category: 'women', subcategory: 'lehengas', collection: 'bridal',
    tags: ['lehenga', 'bridal', 'red', 'zardozi', 'heavy', 'jewel', 'flared'], occasions: ['wedding'],
    fabricCare: 'Dry clean only. Store flat with tissue between the folds.',
    variants: [{ name: 'Sindoor', hex: '#B71C1C', images: [img('1610173827043-9db50e0d8ef9')] }],
    sizesStock: { Sindoor: {} },
    customizable: true, madeToOrder: true, leadTimeDays: 45, rating: 5.0, featured: true,
  },
  {
    id: 'p6', sku: 'AUR-LEH-002', name: 'Ivory Chikankari Anarkali Lehenga', slug: 'ivory-chikankari-anarkali-lehenga',
    price: 32000, currency: 'INR',
    description: 'A flared anarkali-lehenga in ivory georgette with Lucknowi chikankari and a mukaish dupatta.',
    designStory: 'Hand-embroidered by a collective of 14 karigars in Lucknow — roughly 300 hours of shadow-work per piece.',
    fabric: 'Georgette with chikankari and mukaish',
    category: 'women', subcategory: 'lehengas', collection: 'festive',
    tags: ['lehenga', 'anarkali', 'ivory', 'chikankari', 'pastel', 'flared'], occasions: ['festive', 'day', 'wedding'],
    fabricCare: 'Dry clean only.',
    variants: [{ name: 'Ivory', hex: '#F4EFE6', images: [img('1583391733956-3750e0ff4e8b')] }],
    sizesStock: { Ivory: { S: 2, M: 3, L: 2, XL: 1 } },
    customizable: true, leadTimeDays: 14, rating: 4.9, featured: true,
  },

  // ── Women · Gowns ──
  {
    id: 'p7', sku: 'AUR-GWN-001', name: 'Aubergine Off-Shoulder Gown', slug: 'aubergine-off-shoulder-gown',
    price: 18900, currency: 'INR',
    description: 'A sculpted off-shoulder gown in aubergine crepe with a soft trail.',
    fabric: 'Stretch crepe, fully lined',
    category: 'women', subcategory: 'gowns', collection: 'new',
    tags: ['gown', 'evening', 'purple', 'jewel', 'flowing'], occasions: ['reception', 'cocktail'],
    fabricCare: 'Dry clean only.',
    variants: [{ name: 'Aubergine', hex: '#4A1942', images: [img('1566174053879-31528523f8ae')] }],
    sizesStock: { Aubergine: { XS: 1, S: 2, M: 2, L: 1 } },
    customizable: true, leadTimeDays: 10, rating: 4.7,
  },
  {
    id: 'p8', sku: 'AUR-GWN-002', name: 'Scarlet Flow Reception Gown', slug: 'scarlet-flow-reception-gown',
    price: 21500, currency: 'INR',
    description: 'A full-circle chiffon gown in scarlet that moves with every step.',
    designStory: 'Six metres of chiffon in the skirt alone — cut on the bias so the hem pools rather than flares.',
    fabric: 'Silk chiffon with satin lining',
    category: 'women', subcategory: 'gowns', collection: 'festive',
    tags: ['gown', 'red', 'flowing', 'evening'], occasions: ['reception', 'cocktail'],
    fabricCare: 'Dry clean only.',
    variants: [{ name: 'Scarlet', hex: '#D32F2F', images: [img('1595777457583-95e059d581b8')] }],
    sizesStock: { Scarlet: { S: 2, M: 3, L: 2 } },
    customizable: true, leadTimeDays: 10, rating: 4.8, featured: true,
  },
  {
    id: 'p9', sku: 'AUR-GWN-003', name: 'Teal Chiffon Drape Gown', slug: 'teal-chiffon-drape-gown',
    price: 15800, currency: 'INR',
    description: 'A wrap-front chiffon gown in deep teal with a tiered skirt.',
    fabric: 'Chiffon with crepe lining',
    category: 'women', subcategory: 'gowns',
    tags: ['gown', 'teal', 'flowing', 'pastel', 'light'], occasions: ['cocktail', 'day'],
    fabricCare: 'Dry clean recommended.',
    variants: [{ name: 'Teal', hex: '#2E6F6A', images: [img('1609357605129-26f69add5d6e')] }],
    sizesStock: { Teal: { XS: 2, S: 2, M: 3, L: 2, XL: 1 } },
    customizable: true, leadTimeDays: 7, rating: 4.6,
  },

  // ── Women · Indo-Western ──
  {
    id: 'p10', sku: 'AUR-IW-001', name: 'Emerald Mirror-work Jacket Set', slug: 'emerald-mirror-work-jacket-set',
    price: 12400, currency: 'INR',
    description: 'A printed kurta and palazzo set layered with an emerald mirror-work jacket.',
    fabric: 'Cotton-silk with hand-set mirror work',
    category: 'women', subcategory: 'indo-western',
    tags: ['indo-western', 'jacket', 'green', 'jewel', 'fusion', 'kurta'], occasions: ['festive', 'day'],
    fabricCare: 'Dry clean only.',
    variants: [{ name: 'Emerald', hex: '#1B7A4A', images: [img('1597983073493-88cd35cf93b0')] }],
    sizesStock: { Emerald: { S: 3, M: 4, L: 3, XL: 2 } },
    customizable: true, leadTimeDays: 7, rating: 4.7,
  },
  {
    id: 'p11', sku: 'AUR-IW-002', name: 'Marigold Kaftan Co-ord', slug: 'marigold-kaftan-coord',
    price: 9800, currency: 'INR',
    description: 'A hand-embroidered kaftan with straight pants, in marigold modal silk.',
    fabric: 'Modal silk with thread-work',
    category: 'women', subcategory: 'indo-western', collection: 'new',
    tags: ['indo-western', 'kaftan', 'yellow', 'fusion', 'light'], occasions: ['day', 'festive'],
    fabricCare: 'Gentle hand wash cold, or dry clean.',
    variants: [{ name: 'Marigold', hex: '#E6A015', images: [img('1605763240000-7e93b172d754')] }],
    sizesStock: { Marigold: { XS: 2, S: 3, M: 4, L: 3, XL: 2, XXL: 1 } },
    leadTimeDays: 5, rating: 4.6,
  },
  {
    id: 'p12', sku: 'AUR-IW-003', name: 'Bloom Drape Cape Set', slug: 'bloom-drape-cape-set',
    price: 13600, currency: 'INR',
    description: 'A floral pre-draped skirt and bustier finished with a sheer printed cape.',
    designStory: 'For the bride’s sister who wants to dance all night: no pleats to fix, no pins to lose.',
    fabric: 'Crepe and organza, digitally printed',
    category: 'women', subcategory: 'indo-western',
    tags: ['indo-western', 'cape', 'drape', 'pink', 'fusion', 'pastel'], occasions: ['cocktail', 'festive'],
    fabricCare: 'Dry clean only.',
    variants: [{ name: 'Bloom', hex: '#D98BA1', images: [img('1622122201714-77da0ca8e5d2')] }],
    sizesStock: { Bloom: { S: 2, M: 2, L: 2 } },
    customizable: true, leadTimeDays: 10, rating: 4.8, featured: true,
  },

  // ── Kids ──
  {
    id: 'p13', sku: 'AUR-KID-001', name: 'Gold Tissue Pattu Pavadai', slug: 'gold-tissue-pattu-pavadai',
    price: 6400, currency: 'INR',
    description: 'A traditional pattu pavadai in gold tissue with a contrast blouse and soft cotton lining.',
    designStory: 'Lined in breathable cotton so the zari never touches her skin — festive, but still comfortable through a long ceremony.',
    fabric: 'Tissue silk with cotton lining',
    category: 'kids', subcategory: 'girls-ethnic', collection: 'festive',
    tags: ['kids', 'ethnic', 'pavadai', 'gold', 'silk'], occasions: ['festive', 'wedding'],
    fabricCare: 'Dry clean only.',
    variants: [{ name: 'Gold', hex: '#C8A96A', images: [img('1623609163859-ca93c959b98a')] }],
    sizesStock: { Gold: { '3-4Y': 2, '5-6Y': 3, '7-8Y': 2, '9-10Y': 1 } },
    customizable: true, leadTimeDays: 7, rating: 4.9, featured: true,
  },
  {
    id: 'p14', sku: 'AUR-KID-002', name: 'Polka Petal Frock', slug: 'polka-petal-frock',
    price: 3200, currency: 'INR',
    description: 'A twirl-ready polka frock with puff sleeves and a hidden back zip.',
    fabric: 'Cotton poplin, cotton lining',
    category: 'kids', subcategory: 'frocks',
    tags: ['kids', 'frock', 'cotton', 'white'], occasions: ['day', 'party'],
    fabricCare: 'Machine wash cold, inside out.',
    variants: [{ name: 'Ivory Polka', hex: '#F4EFE6', images: [img('1518831959646-742c3a14ebf7')] }],
    sizesStock: { 'Ivory Polka': { '1-2Y': 3, '3-4Y': 4, '5-6Y': 3, '7-8Y': 2 } },
    leadTimeDays: 3, rating: 4.7,
  },
  {
    id: 'p15', sku: 'AUR-KID-003', name: 'Plum Velvet Party Dress', slug: 'plum-velvet-party-dress',
    price: 4800, currency: 'INR',
    description: 'A soft velvet party dress with a tulle underskirt and satin sash.',
    fabric: 'Micro-velvet with tulle and satin',
    category: 'kids', subcategory: 'party-wear', collection: 'new',
    tags: ['kids', 'party', 'velvet', 'purple'], occasions: ['party', 'festive'],
    fabricCare: 'Hand wash cold or dry clean.',
    variants: [{ name: 'Plum', hex: '#6A2C5A', images: [img('1476234251651-f353703a034d')] }],
    sizesStock: { Plum: { '3-4Y': 2, '5-6Y': 3, '7-8Y': 3, '9-10Y': 2, '11-12Y': 1 } },
    customizable: true, leadTimeDays: 5, rating: 4.8,
  },
];

const normalise = (p: Product): Product => ({
  ...p,
  sku: p.sku ?? p.id.toUpperCase(),
  subcategory: p.subcategory ?? '',
  tags: p.tags ?? [],
  variants: p.variants?.length ? p.variants : [{ name: 'Default', hex: '#C8A96A', images: [] }],
  sizesStock: p.sizesStock ?? {},
});

export interface ProductQuery {
  /** Department or sub-category slug. */
  category?: string;
  collection?: string;
  max?: number;
  /** Admin views pass true to include drafts and archived pieces. */
  includeInactive?: boolean;
}

/**
 * Fetch products — Firestore when configured, demo data otherwise.
 * Filtering happens in memory: a boutique catalog is small, and it avoids a
 * composite index per filter combination on the free tier.
 */
export async function getProducts(opts: ProductQuery = {}): Promise<Product[]> {
  let list: Product[];
  if (!isFirebaseConfigured) {
    list = DEMO_PRODUCTS;
  } else {
    try {
      const snap = await getDocs(collection(getDb(), 'products'));
      list = snap.docs.map((d) => normalise({ id: d.id, ...d.data() } as Product));
      // An empty catalog means "not seeded yet" — show the demo so the site never looks broken.
      if (list.length === 0) list = DEMO_PRODUCTS;
    } catch (err) {
      console.error('getProducts: falling back to demo catalog', err);
      list = DEMO_PRODUCTS;
    }
  }

  if (!opts.includeInactive) list = list.filter(isActive);
  if (opts.category) list = list.filter((p) => p.category === opts.category || p.subcategory === opts.category);
  if (opts.collection) list = list.filter((p) => p.collection === opts.collection);
  return opts.max ? list.slice(0, opts.max) : list;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((p) => p.slug === slug) ?? null;
}

/** Category tree source — Firestore when seeded, the built-in defaults otherwise. */
export async function getCategories(): Promise<Category[]> {
  if (!isFirebaseConfigured) return DEFAULT_CATEGORIES;
  try {
    const snap = await getDocs(collection(getDb(), 'categories'));
    if (snap.empty) return DEFAULT_CATEGORIES;
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Category);
  } catch (err) {
    console.error('getCategories: falling back to defaults', err);
    return DEFAULT_CATEGORIES;
  }
}
