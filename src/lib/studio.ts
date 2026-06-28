import type { Product } from '@/types';

/** The layers an outfit is built from, back to front. */
export type SlotId = 'base' | 'top' | 'layer';

export interface SlotDefinition {
  id: SlotId;
  label: string;
  help: string;
  /** Tags that indicate a product belongs in this layer. */
  match: string[];
}

export const SLOTS: SlotDefinition[] = [
  {
    id: 'base',
    label: 'Outfit',
    help: 'Sarees, lehengas, gowns, kaftans and frocks',
    match: ['saree', 'lehenga', 'anarkali', 'gown', 'kaftan', 'kurta', 'frock', 'pavadai', 'party', 'dress'],
  },
  {
    id: 'top',
    label: 'Drape & blouse',
    help: 'Dupattas, drapes and statement blouses',
    match: ['dupatta', 'drape', 'blouse', 'choli', 'stole'],
  },
  {
    id: 'layer',
    label: 'Jacket & cape',
    help: 'Capes, mirror-work jackets and shrugs',
    match: ['jacket', 'cape', 'shrug', 'koti', 'bolero'],
  },
];

/**
 * Buckets the catalog into outfit layers.
 * A product can appear in more than one layer when its tags genuinely fit both
 * (a co-ord works as a base or a top), which is better than forcing one guess.
 */
export function slotProducts(products: Product[]): Record<SlotId, Product[]> {
  const result: Record<SlotId, Product[]> = { base: [], top: [], layer: [] };

  for (const product of products) {
    const haystack = [...product.tags, product.subcategory, product.category].map((t) => t.toLowerCase());
    let placed = false;

    for (const slot of SLOTS) {
      if (slot.match.some((m) => haystack.some((h) => h.includes(m)))) {
        result[slot.id].push(product);
        placed = true;
      }
    }

    // Never drop a product entirely — an unmatched piece lands in the base layer.
    if (!placed) result.base.push(product);
  }

  return result;
}

export interface PlacedItem {
  productId: string;
  /** Position as a percentage of the canvas, so the look survives a resize. */
  x: number;
  y: number;
  scale: number;
}

export type Outfit = Partial<Record<SlotId, PlacedItem>>;

/** Default positions give a sensible stacked look before anything is dragged. */
export const DEFAULT_POSITION: Record<SlotId, { x: number; y: number; scale: number }> = {
  base: { x: 50, y: 68, scale: 1 },
  top: { x: 50, y: 34, scale: 0.78 },
  layer: { x: 72, y: 46, scale: 0.86 },
};

/** Builds the WhatsApp share text for a completed look. */
export function outfitShareMessage(
  outfit: Outfit,
  products: Product[],
  siteUrl: string,
): string {
  const names = (Object.keys(outfit) as SlotId[])
    .map((slot) => products.find((p) => p.id === outfit[slot]?.productId)?.name)
    .filter(Boolean);

  if (names.length === 0) return `Take a look at Aurelia: ${siteUrl}`;

  const total = (Object.keys(outfit) as SlotId[]).reduce((sum, slot) => {
    const product = products.find((p) => p.id === outfit[slot]?.productId);
    return sum + (product?.price ?? 0);
  }, 0);

  return [
    'I built this look on Aurelia:',
    ...names.map((n) => `• ${n}`),
    ``,
    `Total: ${total}`,
    `${siteUrl}/studio`,
  ].join('\n');
}
