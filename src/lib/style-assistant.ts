import { isAvailable } from '@/lib/catalog';
import type { Product } from '@/types';

// ── Outfit generator / style matcher ────────────────────────────
// A transparent, rules-based matcher that runs entirely in the browser today.
// Phase 2 swaps `matchOutfits` for an LLM call (see /api/ai/chat) that reasons
// over the same inputs — the UI and the StyleRequest shape stay the same.

export interface StyleRequest {
  audience: 'women' | 'kids';
  occasion: string;
  colour: string;
  weather: string;
}

export const OCCASIONS = [
  { value: 'wedding', label: 'Wedding', tags: ['bridal', 'heavy', 'lehenga', 'silk', 'kanjivaram'] },
  { value: 'festive', label: 'Festival / puja', tags: ['festive', 'silk', 'saree', 'pavadai', 'ethnic'] },
  { value: 'reception', label: 'Reception / cocktail', tags: ['evening', 'gown', 'georgette', 'cape'] },
  { value: 'day', label: 'Mehendi / day event', tags: ['light', 'organza', 'pastel', 'kaftan', 'frock'] },
  { value: 'party', label: 'Birthday / party', tags: ['party', 'velvet', 'frock', 'gown'] },
];

export const COLOURS = [
  { value: 'red', label: 'Reds & pinks', hex: '#C2185B', tags: ['red', 'pink', 'jewel'] },
  { value: 'jewel', label: 'Jewel tones', hex: '#5B2A86', tags: ['purple', 'green', 'teal', 'jewel'] },
  { value: 'pastel', label: 'Pastels', hex: '#D98BA1', tags: ['pastel', 'sage', 'pink', 'light'] },
  { value: 'ivory', label: 'Ivory & gold', hex: '#E8D9B5', tags: ['ivory', 'gold', 'white', 'chikankari'] },
  { value: 'dark', label: 'Black & deep', hex: '#1A1A1A', tags: ['black', 'evening'] },
  { value: 'sunny', label: 'Marigold & sunny', hex: '#E6A015', tags: ['yellow', 'gold'] },
];

export const WEATHER = [
  { value: 'hot', label: 'Hot & humid', tags: ['light', 'organza', 'cotton', 'chiffon', 'georgette', 'kaftan'], avoid: ['velvet', 'heavy'] },
  { value: 'mild', label: 'Pleasant', tags: [], avoid: [] },
  { value: 'cool', label: 'Cool evening', tags: ['velvet', 'silk', 'jacket', 'cape', 'heavy'], avoid: [] },
  { value: 'rain', label: 'Monsoon', tags: ['georgette', 'chiffon', 'light'], avoid: ['velvet', 'tissue'] },
];

export interface StyleMatch {
  product: Product;
  score: number;
  reasons: string[];
}

const haystack = (p: Product) =>
  [...p.tags, ...(p.occasions ?? []), p.subcategory, p.fabric ?? '', ...p.variants.map((v) => v.name)]
    .join(' ')
    .toLowerCase();

export function matchOutfits(products: Product[], req: StyleRequest, limit = 6): StyleMatch[] {
  const occasion = OCCASIONS.find((o) => o.value === req.occasion);
  const colour = COLOURS.find((c) => c.value === req.colour);
  const weather = WEATHER.find((w) => w.value === req.weather);

  return products
    .filter((p) => p.category === req.audience)
    .map((product) => {
      const text = haystack(product);
      const reasons: string[] = [];
      let score = 0;

      if (occasion && ((product.occasions ?? []).includes(occasion.value) || occasion.tags.some((t) => text.includes(t)))) {
        score += 5;
        reasons.push(`Made for ${occasion.label.toLowerCase()}`);
      }
      if (colour && colour.tags.some((t) => text.includes(t))) {
        score += 3;
        reasons.push(`In your ${colour.label.toLowerCase()}`);
      }
      if (weather) {
        if (weather.tags.some((t) => text.includes(t))) {
          score += 2;
          reasons.push(`Comfortable when it’s ${weather.label.toLowerCase()}`);
        }
        if (weather.avoid.some((t) => text.includes(t))) score -= 3;
      }
      if (product.customizable || product.madeToOrder) reasons.push('Can be tailored to you');
      if (isAvailable(product)) score += 1;
      if (product.featured) score += 1;

      return { product, score, reasons };
    })
    .filter((m) => m.score > 1)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
