import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductDetail from '@/components/product/ProductDetail';
import CompleteTheLook from '@/components/product/CompleteTheLook';
import { getCategories, getProductBySlug, getProducts } from '@/lib/products';
import { findCategory, isAvailable } from '@/lib/catalog';
import { completeTheLook } from '@/lib/recommendations';
import { formatPrice } from '@/lib/utils';

export const revalidate = 3600;

// Pre-render known product pages at build for instant loads + SEO.
export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Product not found' };
  const image = product.variants[0]?.images[0];
  return {
    title: product.name,
    description: `${product.name} — ${formatPrice(product.price, product.currency)}. ${product.description}`,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: { title: product.name, description: product.description, images: image ? [{ url: image }] : [] },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, categories] = await Promise.all([getProductBySlug(slug), getCategories()]);
  if (!product) notFound();

  const allProducts = await getProducts();
  const pairings = completeTheLook(product, allProducts);

  // Product structured data for rich search results.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.variants.flatMap((v) => v.images),
    sku: product.sku,
    brand: { '@type': 'Brand', name: 'Aurelia' },
    ...(product.fabric ? { material: product.fabric } : {}),
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency,
      availability: product.madeToOrder
        ? 'https://schema.org/PreOrder'
        : isAvailable(product) ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductDetail
        product={product}
        department={findCategory(categories, product.category)}
        subcategory={findCategory(categories, product.subcategory)}
      />
      <CompleteTheLook products={pairings} />
    </>
  );
}
