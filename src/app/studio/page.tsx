import type { Metadata } from 'next';
import OutfitStudio from '@/components/studio/OutfitStudio';
import { getProducts } from '@/lib/products';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'The Studio — build your look',
  description: 'Layer a lehenga, saree or gown with drapes, capes and jackets on an interactive canvas.',
  alternates: { canonical: '/studio' },
};

export default async function StudioPage() {
  // Layering a cape over a lehenga is a women's-wear idea; kids' pieces live in their own edit.
  const products = await getProducts({ category: 'women' });
  return <OutfitStudio products={products} />;
}
