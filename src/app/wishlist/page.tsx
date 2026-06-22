import type { Metadata } from 'next';
import WishlistView from '@/components/product/WishlistView';
import { getProducts } from '@/lib/products';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Wishlist',
  description: 'Pieces you’ve saved for later.',
  robots: { index: false, follow: true },
};

export default async function WishlistPage() {
  const products = await getProducts();
  return <WishlistView products={products} />;
}
