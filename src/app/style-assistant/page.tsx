import type { Metadata } from 'next';
import StyleAssistant from '@/components/ai/StyleAssistant';
import { getProducts } from '@/lib/products';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'AI Style Assistant',
  description: 'Get outfit suggestions by occasion, colour and weather — for you or your little girl — and preview virtual try-on.',
  alternates: { canonical: '/style-assistant' },
};

export default async function StyleAssistantPage() {
  return <StyleAssistant products={await getProducts()} />;
}
