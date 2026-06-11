import type { Category, CategoryNode, Product, SizeSetId } from '@/types';

// ── Category tree ───────────────────────────────────────────────
// The storefront reads categories from Firestore; this is the fallback (and the
// seed). Launching Men's Wear later is one department row plus its children —
// flip `active` to true and every menu, filter and admin picker picks it up.

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'women', name: 'Women', slug: 'women', parentId: null, sizeSet: 'women', order: 1, active: true,
    description: 'Couture sarees, lehengas, gowns and Indo-Western silhouettes, made to your measure.' },
  { id: 'sarees', name: 'Sarees', slug: 'sarees', parentId: 'women', order: 1, active: true,
    description: 'Handwoven silks, georgettes and organzas, finished with a custom blouse.' },
  { id: 'lehengas', name: 'Lehengas', slug: 'lehengas', parentId: 'women', order: 2, active: true,
    description: 'Bridal and festive lehengas, hand-embroidered in our atelier.' },
  { id: 'gowns', name: 'Gowns', slug: 'gowns', parentId: 'women', order: 3, active: true,
    description: 'Reception and cocktail gowns with couture finishing.' },
  { id: 'indo-western', name: 'Indo-Western', slug: 'indo-western', parentId: 'women', order: 4, active: true,
    description: 'Cape sets, draped skirts and jacket co-ords that bridge two wardrobes.' },

  { id: 'kids', name: 'Kids', slug: 'kids', parentId: null, sizeSet: 'kids', order: 2, active: true,
    description: 'Ethnic and designer wear for little girls — soft linings, room to twirl.' },
  { id: 'girls-ethnic', name: "Girls' Ethnic", slug: 'girls-ethnic', parentId: 'kids', order: 1, active: true,
    description: 'Pattu pavadais, lehenga cholis and anarkalis in child-friendly fabrics.' },
  { id: 'frocks', name: 'Frocks', slug: 'frocks', parentId: 'kids', order: 2, active: true,
    description: 'Everyday and occasion frocks with hand-finished details.' },
  { id: 'party-wear', name: 'Party Wear', slug: 'party-wear', parentId: 'kids', order: 3, active: true,
    description: 'Birthday, wedding and celebration looks for girls.' },

  // Ready for Phase 2 — switch on from Admin → Categories when the line launches.
  { id: 'men', name: 'Men', slug: 'men', parentId: null, sizeSet: 'men', order: 3, active: false,
    description: 'Sherwanis, bandhgalas and kurta sets.' },
];

export function buildTree(categories: Category[], { includeInactive = false } = {}): CategoryNode[] {
  const visible = includeInactive ? categories : categories.filter((c) => c.active);
  const byParent = new Map<string | null, Category[]>();
  for (const c of visible) {
    const list = byParent.get(c.parentId) ?? [];
    list.push(c);
    byParent.set(c.parentId, list);
  }
  const grow = (parentId: string | null): CategoryNode[] =>
    (byParent.get(parentId) ?? [])
      .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
      .map((c) => ({ ...c, children: grow(c.id) }));
  return grow(null);
}

export function findCategory(categories: Category[], slug?: string | null) {
  return slug ? categories.find((c) => c.slug === slug) : undefined;
}

/** Walks up to the department so sub-categories inherit its size set. */
export function departmentOf(categories: Category[], category: Category): Category {
  let current = category;
  const seen = new Set<string>();
  while (current.parentId && !seen.has(current.id)) {
    seen.add(current.id);
    const parent = categories.find((c) => c.id === current.parentId);
    if (!parent) break;
    current = parent;
  }
  return current;
}

// ── Sizes ───────────────────────────────────────────────────────

export const SIZE_SETS: Record<SizeSetId, string[]> = {
  women: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  kids: ['1-2Y', '3-4Y', '5-6Y', '7-8Y', '9-10Y', '11-12Y'],
  men: ['36', '38', '40', '42', '44', '46'],
};

/** Size label used for made-to-measure lines. */
export const CUSTOM_SIZE = 'Custom';

export function sizeSetFor(product: Pick<Product, 'sizeSet' | 'category'>): SizeSetId {
  if (product.sizeSet) return product.sizeSet;
  return (['women', 'kids', 'men'] as SizeSetId[]).includes(product.category as SizeSetId)
    ? (product.category as SizeSetId)
    : 'women';
}

export const sizesFor = (product: Pick<Product, 'sizeSet' | 'category'>) => SIZE_SETS[sizeSetFor(product)];

// ── Custom measurements ─────────────────────────────────────────

export interface MeasurementField {
  id: string;
  label: string;
  hint: string;
}

export const MEASUREMENT_FIELDS: Record<SizeSetId, MeasurementField[]> = {
  women: [
    { id: 'bust', label: 'Bust', hint: 'Around the fullest part' },
    { id: 'waist', label: 'Waist', hint: 'Natural waistline' },
    { id: 'hips', label: 'Hips', hint: 'Around the fullest part' },
    { id: 'shoulder', label: 'Shoulder', hint: 'Seam to seam across the back' },
    { id: 'blouseLength', label: 'Blouse / top length', hint: 'Shoulder to hem' },
    { id: 'sleeveLength', label: 'Sleeve length', hint: 'Shoulder to cuff' },
    { id: 'fullLength', label: 'Full length', hint: 'Waist to floor, with heels' },
    { id: 'height', label: 'Height', hint: 'Without footwear' },
  ],
  kids: [
    { id: 'age', label: 'Age', hint: 'In years' },
    { id: 'height', label: 'Height', hint: 'Without footwear' },
    { id: 'chest', label: 'Chest', hint: 'Under the arms' },
    { id: 'waist', label: 'Waist', hint: 'Around the tummy' },
    { id: 'shoulder', label: 'Shoulder', hint: 'Seam to seam' },
    { id: 'fullLength', label: 'Dress length', hint: 'Shoulder to desired hem' },
  ],
  men: [
    { id: 'chest', label: 'Chest', hint: 'Around the fullest part' },
    { id: 'waist', label: 'Waist', hint: 'Where trousers sit' },
    { id: 'shoulder', label: 'Shoulder', hint: 'Seam to seam' },
    { id: 'sleeveLength', label: 'Sleeve length', hint: 'Shoulder to wrist' },
    { id: 'kurtaLength', label: 'Kurta length', hint: 'Shoulder to hem' },
    { id: 'height', label: 'Height', hint: 'Without footwear' },
  ],
};

// ── Size guides (inches) ────────────────────────────────────────

export interface SizeGuide {
  title: string;
  columns: string[];
  rows: string[][];
  note: string;
}

export const SIZE_GUIDES: Record<SizeSetId, SizeGuide> = {
  women: {
    title: 'Women’s size guide',
    columns: ['Size', 'Bust', 'Waist', 'Hips', 'Shoulder'],
    rows: [
      ['XS', '32', '26', '35', '13.5'],
      ['S', '34', '28', '37', '14'],
      ['M', '36', '30', '39', '14.5'],
      ['L', '38', '32', '41', '15'],
      ['XL', '40', '34', '43', '15.5'],
      ['XXL', '42', '36', '45', '16'],
    ],
    note: 'Between sizes? Choose the larger one, or share your measurements and we’ll tailor it.',
  },
  kids: {
    title: 'Girls’ size guide',
    columns: ['Age', 'Height', 'Chest', 'Waist', 'Length'],
    rows: [
      ['1-2Y', '31–35', '20', '19', '18'],
      ['3-4Y', '37–41', '22', '20', '22'],
      ['5-6Y', '43–47', '24', '21', '26'],
      ['7-8Y', '49–51', '26', '22', '30'],
      ['9-10Y', '53–55', '28', '23', '34'],
      ['11-12Y', '57–59', '30', '24', '38'],
    ],
    note: 'Children grow fast — we leave 1.5" of margin in every seam so a piece can be let out later.',
  },
  men: {
    title: 'Men’s size guide',
    columns: ['Size', 'Chest', 'Waist', 'Shoulder', 'Length'],
    rows: [
      ['36', '36', '30', '17', '40'],
      ['38', '38', '32', '17.5', '41'],
      ['40', '40', '34', '18', '42'],
      ['42', '42', '36', '18.5', '43'],
      ['44', '44', '38', '19', '44'],
      ['46', '46', '40', '19.5', '45'],
    ],
    note: 'Sherwanis are cut with a little extra ease for movement.',
  },
};

export const isActive = (p: Product) => (p.status ?? 'active') === 'active';

export const totalStock = (p: Pick<Product, 'sizesStock'>) =>
  Object.values(p.sizesStock ?? {}).reduce(
    (sum, sizes) => sum + Object.values(sizes ?? {}).reduce((s, n) => s + (n ?? 0), 0),
    0,
  );

/** A made-to-order piece is always available; a stocked one needs units. */
export const isAvailable = (p: Product) => Boolean(p.madeToOrder) || totalStock(p) > 0;
