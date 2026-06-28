import type { Metadata } from 'next';
import QuizResults from '@/components/quiz/QuizResults';
import { getProducts } from '@/lib/products';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Your personal edit',
  description: 'A selection curated around your silhouette, palette, and size.',
  robots: { index: false, follow: true }, // personal results shouldn't be indexed
};

export default async function QuizResultsPage() {
  const products = await getProducts();
  return <QuizResults products={products} />;
}
