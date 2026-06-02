import Hero from '@/components/home/Hero';
import CollectionGrid from '@/components/home/CollectionGrid';
import { Curated, Testimonials, OwnYourStyle } from '@/components/home/Sections';
import { getProducts } from '@/lib/products';

// Re-render at most once an hour; product list stays fresh without per-request cost.
export const revalidate = 3600;

export default async function HomePage() {
  const products = await getProducts({ max: 6 });

  return (
    <>
      <Hero />
      <CollectionGrid products={products} />
      <Curated />
      <Testimonials />
      <OwnYourStyle />
    </>
  );
}
