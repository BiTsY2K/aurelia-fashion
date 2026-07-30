import Hero from '@/components/home/Hero';
import CollectionGrid from '@/components/home/CollectionGrid';
import { BespokeProcess, CategoryTiles, StyleAssistantBand, Testimonials, WhatsAppCta } from '@/components/home/Sections';
import { buildTree } from '@/lib/catalog';
import { getCategories, getProducts } from '@/lib/products';

// Re-render at most once an hour; product list stays fresh without per-request cost.
export const revalidate = 3600;

export default async function HomePage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const tree = buildTree(categories);

  return (
    <>
      <Hero />
      <CategoryTiles tree={tree} />
      <CollectionGrid products={products} tree={tree} />
      <BespokeProcess />
      <StyleAssistantBand />
      <Testimonials />
      <WhatsAppCta />
    </>
  );
}
