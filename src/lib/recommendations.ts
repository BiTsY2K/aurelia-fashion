import { isAvailable } from '@/lib/catalog';
import type { Product } from '@/types';

/**
 * Picks pieces to show beside the one being viewed.
 * Stays in the same department (a lehenga page shouldn't push frocks), shares an
 * occasion where possible, and prefers a *different* sub-category so the strip
 * widens the choice rather than repeating four more sarees.
 */
export function completeTheLook(current: Product, all: Product[], limit = 4): Product[] {
  const occasions = new Set((current.occasions ?? []).map((o) => o.toLowerCase()));
  const currentTags = new Set(current.tags.map((t) => t.toLowerCase()));

  const scored = all
    .filter((p) => p.id !== current.id)
    .map((product) => {
      let score = 0;
      if (product.category === current.category) score += 4;
      else score -= 6;

      score += (product.occasions ?? []).filter((o) => occasions.has(o.toLowerCase())).length * 2;
      score += product.subcategory === current.subcategory ? 0 : 2;
      if (product.collection && product.collection === current.collection) score += 1;

      // A little tag overlap reads as the same world; a lot reads as a duplicate.
      const overlap = product.tags.filter((t) => currentTags.has(t.toLowerCase())).length;
      score += overlap >= 1 && overlap <= 2 ? 1 : overlap > 3 ? -2 : 0;

      if (isAvailable(product)) score += 2;
      if (product.featured) score += 1;
      return { product, score };
    });

  return scored
    .sort((a, b) => b.score - a.score || (b.product.rating ?? 0) - (a.product.rating ?? 0))
    .slice(0, limit)
    .map((s) => s.product);
}
