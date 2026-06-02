import type { MetadataRoute } from 'next';
import { getProducts } from '@/lib/products';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const products = await getProducts();
  const productUrls = products.map((p) => ({
    url: `${base}/product/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));
  const staticUrls = ['', '/collections', '/new-arrivals', '/men', '/women', '/sale'].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: path === '' ? 1 : 0.8,
  }));
  return [...staticUrls, ...productUrls];
}
